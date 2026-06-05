from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    artifact_dir: str = "/app/artifacts"
    log_level: str = "info"

    model_config = {"env_prefix": "ML_"}


settings = Settings()
