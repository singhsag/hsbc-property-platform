from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ml_service_url: str = "http://localhost:8000"
    ml_timeout_seconds: float = 10.0
    history_max_size: int = 500
    log_level: str = "info"

    model_config = {"env_prefix": "PROP_"}


settings = Settings()
