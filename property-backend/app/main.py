import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .ml_client import close_client, init_client, predict_batch, predict_single
from .schemas import (
    CompareRequest,
    CompareResponse,
    CompareItem,
    ErrorResponse,
    EstimateResponse,
    HistoryResponse,
    PropertyInput,
)
from .store import HistoryStore

logging.basicConfig(
    level=settings.log_level.upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
log = logging.getLogger(__name__)

history = HistoryStore(max_size=settings.history_max_size)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_client()
    yield
    await close_client()


app = FastAPI(
    title="HSBC Property Backend",
    description="BFF for the Property Value Estimator",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def _ml_503() -> HTTPException:
    # Build inline so timestamp reflects the actual error time, not server start.
    body = ErrorResponse(
        error="service_unavailable",
        detail="ML service is currently unreachable. Please try again shortly.",
        timestamp=datetime.now(timezone.utc),
    )
    return HTTPException(status_code=503, detail=body.model_dump(mode="json"))


@app.get("/health", tags=["ops"])
async def health() -> dict:
    return {"status": "ok"}


@app.post("/estimate", response_model=EstimateResponse, status_code=201, tags=["estimation"])
async def estimate(body: PropertyInput) -> EstimateResponse:
    try:
        price = await predict_single(body.model_dump())
    except (httpx.RequestError, httpx.HTTPStatusError):
        raise _ml_503()
    record = history.add(body, price)
    log.info("Estimate %s: £%.0f", record.estimate_id, price)
    return record


@app.get("/history", response_model=HistoryResponse, tags=["estimation"])
async def get_history(limit: int = Query(default=20, ge=1, le=100)) -> HistoryResponse:
    items = history.recent(limit)
    return HistoryResponse(items=items, total=history.count())


@app.post("/compare", response_model=CompareResponse, tags=["estimation"])
async def compare(body: CompareRequest) -> CompareResponse:
    payloads = [p.model_dump() for p in body.properties]
    try:
        prices = await predict_batch(payloads)
    except (httpx.RequestError, httpx.HTTPStatusError):
        raise _ml_503()
    comparisons = [
        CompareItem(index=i, predicted_price=p, inputs=prop)
        for i, (prop, p) in enumerate(zip(body.properties, prices))
    ]
    return CompareResponse(comparisons=comparisons)
