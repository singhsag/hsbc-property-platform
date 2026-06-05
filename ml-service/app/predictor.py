import json
import logging
from pathlib import Path

import joblib
import pandas as pd

log = logging.getLogger(__name__)

FEATURES = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]


class Predictor:
    def __init__(self, artifact_dir: str) -> None:
        self._pipeline = None
        self._metrics: dict[str, float] = {}
        self._artifact_dir = Path(artifact_dir)

    def load(self) -> None:
        model_path = self._artifact_dir / "model.joblib"
        metrics_path = self._artifact_dir / "metrics.json"
        self._pipeline = joblib.load(model_path)
        self._metrics = json.loads(metrics_path.read_text())
        log.info("Model loaded from %s", model_path)

    @property
    def is_loaded(self) -> bool:
        return self._pipeline is not None

    def predict(self, inputs: list[dict]) -> list[float]:
        df = pd.DataFrame(inputs, columns=FEATURES)
        return self._pipeline.predict(df).tolist()

    def model_info(self) -> dict:
        lr = self._pipeline.named_steps["model"]
        raw_names = self._pipeline.named_steps["preprocessor"].get_feature_names_out()
        # Strip transformer prefix: "num__square_footage" -> "square_footage"
        clean_names = [n.split("__", 1)[-1] for n in raw_names]
        return {
            "features": FEATURES,
            "coefficients": dict(zip(clean_names, lr.coef_.tolist())),
            "intercept": float(lr.intercept_),
            "metrics": self._metrics,
        }
