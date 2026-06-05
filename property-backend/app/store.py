"""
In-memory history store backed by a deque.

Deliberate trade-off: sufficient for assessment scope and keeps the
stack free of a database container. Swapping to Postgres is a one-class
change — implement the same HistoryStore interface with asyncpg/SQLAlchemy.
"""
import uuid
from collections import deque
from datetime import datetime, timezone

from .schemas import EstimateResponse, PropertyInput


class HistoryStore:
    def __init__(self, max_size: int = 500) -> None:
        self._store: deque[EstimateResponse] = deque(maxlen=max_size)

    def add(self, inputs: PropertyInput, predicted_price: float) -> EstimateResponse:
        record = EstimateResponse(
            estimate_id=str(uuid.uuid4()),
            predicted_price=predicted_price,
            inputs=inputs,
            timestamp=datetime.now(timezone.utc),
        )
        self._store.appendleft(record)
        return record

    def recent(self, limit: int = 20) -> list[EstimateResponse]:
        limit = min(limit, 100)
        return list(self._store)[:limit]

    def count(self) -> int:
        return len(self._store)
