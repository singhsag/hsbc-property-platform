import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .predictor import Predictor
from .schemas import (
    BatchPredictionItem,
    BatchPredictionRequest,
    BatchPredictionResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictionResponse,
    PropertyInput,
)

logging.basicConfig(
    level=settings.log_level.upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
log = logging.getLogger(__name__)

predictor = Predictor(settings.artifact_dir)


@asynccontextmanager
async def lifespan(app: FastAPI):
    predictor.load()
    yield


app = FastAPI(
    title="HSBC ML Service",
    description="House price prediction service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["ops"])
async def health() -> HealthResponse:
    return HealthResponse(status="ok", model_loaded=predictor.is_loaded)


@app.get("/model-info", response_model=ModelInfoResponse, tags=["model"])
async def model_info() -> ModelInfoResponse:
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return ModelInfoResponse(**predictor.model_info())


@app.post("/predict", response_model=PredictionResponse, tags=["prediction"])
async def predict(body: PropertyInput) -> PredictionResponse:
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    [price] = predictor.predict([body.model_dump()])
    return PredictionResponse(predicted_price=round(price, 2), input=body)


@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["prediction"])
async def predict_batch(body: BatchPredictionRequest) -> BatchPredictionResponse:
    if not predictor.is_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    inputs = [item.model_dump() for item in body.items]
    prices = predictor.predict(inputs)
    predictions = [
        BatchPredictionItem(index=i, predicted_price=round(p, 2), input=item)
        for i, (item, p) in enumerate(zip(body.items, prices))
    ]
    return BatchPredictionResponse(predictions=predictions)
