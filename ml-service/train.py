"""
Standalone training script. Run once to produce artifacts/model.joblib and
artifacts/metrics.json. The FastAPI app loads the baked artifact at startup —
it never trains on request (no training/serving skew, fast startup).
"""
import json
import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "House_Price_Dataset.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"

FEATURES = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]
TARGET = "price"


def train() -> None:
    ARTIFACTS_DIR.mkdir(exist_ok=True)

    # utf-8-sig strips the BOM that Excel-exported CSVs add
    df = pd.read_csv(DATA_PATH, encoding="utf-8-sig")
    log.info("Loaded %d rows from %s", len(df), DATA_PATH)

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    log.info("Train=%d  Test=%d", len(X_train), len(X_test))

    # All features numeric — ColumnTransformer wraps StandardScaler.
    # Using ColumnTransformer intentionally: it makes adding categorical
    # columns (OneHotEncoder) a one-line change if the dataset evolves.
    preprocessor = ColumnTransformer(
        transformers=[("num", StandardScaler(), FEATURES)]
    )
    pipeline = Pipeline(
        steps=[("preprocessor", preprocessor), ("model", LinearRegression())]
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    metrics = {
        "r2": float(r2_score(y_test, y_pred)),
        "mae": float(mean_absolute_error(y_test, y_pred)),
        "rmse": float(np.sqrt(np.mean((y_test.values - y_pred) ** 2))),
    }
    log.info("R²=%.4f  MAE=£%.0f  RMSE=£%.0f", metrics["r2"], metrics["mae"], metrics["rmse"])

    joblib.dump(pipeline, ARTIFACTS_DIR / "model.joblib")
    (ARTIFACTS_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2))
    log.info("Artifacts saved to %s", ARTIFACTS_DIR)


if __name__ == "__main__":
    train()
