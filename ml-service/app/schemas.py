from pydantic import BaseModel, Field


class PropertyInput(BaseModel):
    square_footage: float = Field(..., gt=0, description="Living area in sq ft")
    bedrooms: int = Field(..., ge=1, le=20)
    bathrooms: float = Field(..., ge=0.5, le=20)
    year_built: int = Field(..., ge=1800, le=2030)
    lot_size: float = Field(..., gt=0, description="Lot area in sq ft")
    distance_to_city_center: float = Field(..., ge=0, description="Distance in miles")
    school_rating: float = Field(..., ge=0, le=10)


class PredictionResponse(BaseModel):
    predicted_price: float
    input: PropertyInput


class BatchPredictionRequest(BaseModel):
    items: list[PropertyInput] = Field(..., max_length=100)


class BatchPredictionItem(BaseModel):
    index: int
    predicted_price: float
    input: PropertyInput


class BatchPredictionResponse(BaseModel):
    predictions: list[BatchPredictionItem]


class ModelInfoResponse(BaseModel):
    features: list[str]
    coefficients: dict[str, float]
    intercept: float
    metrics: dict[str, float]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
