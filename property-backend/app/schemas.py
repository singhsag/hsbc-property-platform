from datetime import datetime

from pydantic import BaseModel, Field


class PropertyInput(BaseModel):
    square_footage: float = Field(..., gt=0)
    bedrooms: int = Field(..., ge=1, le=20)
    bathrooms: float = Field(..., ge=0.5, le=20)
    year_built: int = Field(..., ge=1800, le=2030)
    lot_size: float = Field(..., gt=0)
    distance_to_city_center: float = Field(..., ge=0)
    school_rating: float = Field(..., ge=0, le=10)


class EstimateResponse(BaseModel):
    estimate_id: str
    predicted_price: float
    inputs: PropertyInput
    timestamp: datetime


class HistoryResponse(BaseModel):
    items: list[EstimateResponse]
    total: int


class CompareRequest(BaseModel):
    properties: list[PropertyInput] = Field(..., min_length=2, max_length=5)


class CompareItem(BaseModel):
    index: int
    predicted_price: float
    inputs: PropertyInput


class CompareResponse(BaseModel):
    comparisons: list[CompareItem]


class ErrorResponse(BaseModel):
    error: str
    detail: str
    timestamp: datetime
