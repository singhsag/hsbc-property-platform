import logging

import httpx

from .config import settings

log = logging.getLogger(__name__)

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    if _client is None:
        raise RuntimeError("ML client not initialised")
    return _client


async def init_client() -> None:
    global _client
    _client = httpx.AsyncClient(
        base_url=settings.ml_service_url,
        timeout=httpx.Timeout(settings.ml_timeout_seconds),
        limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
    )
    log.info("ML client initialised → %s", settings.ml_service_url)


async def close_client() -> None:
    global _client
    if _client:
        await _client.aclose()
        _client = None


async def predict_single(payload: dict) -> float:
    try:
        r = await get_client().post("/predict", json=payload)
        r.raise_for_status()
        return r.json()["predicted_price"]
    except httpx.HTTPStatusError as exc:
        log.error("ML service HTTP %d: %s", exc.response.status_code, exc.response.text)
        raise
    except httpx.RequestError as exc:
        log.error("ML service unreachable: %s", exc)
        raise


async def predict_batch(payloads: list[dict]) -> list[float]:
    r = await get_client().post("/predict/batch", json={"items": payloads})
    r.raise_for_status()
    return [item["predicted_price"] for item in r.json()["predictions"]]
