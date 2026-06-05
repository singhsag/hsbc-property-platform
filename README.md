# HSBC Property Platform

ML-powered property valuation and market analysis platform.

## Quick Start

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Portal (UI) | http://localhost:3000 |
| ML Service Swagger | http://localhost:8000/docs |
| Property Backend Swagger | http://localhost:8001/docs |
| Market Backend | http://localhost:8080 |

First build takes ~3–4 minutes (Maven dependency download + `npm ci`). Subsequent builds are fast due to Docker layer caching.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser / Portal :3000                    │
│  Next.js 14 App Router · Tailwind · recharts · TypeScript    │
│                                                               │
│  App 1 (Estimator, History, Compare)                         │
│       └──────► property-backend :8001  (Python FastAPI BFF)  │
│                       └──────► ml-service :8000              │
│                                                               │
│  App 2 (Market Analysis, What-If)                            │
│       └──────► market-backend  :8080  (Java Spring Boot)     │
│                       └──────► ml-service :8000              │
└──────────────────────────────────────────────────────────────┘

All services on Docker bridge network `hsbc-platform`.
Services reach each other by name (e.g. http://ml-service:8000).
Portal SSR calls use internal hostnames; browser calls use localhost ports.
```

---

## Decision Log

### Monorepo layout
All four services live under one repo root. At this scale a monorepo makes `docker-compose up --build` trivial — one clone, one command. A polyrepo would only pay off once teams diverge on release cadences.

### Train/serve split + scikit-learn Pipeline
`train.py` is a standalone script that runs once during Docker build and bakes `model.joblib` into the image. The FastAPI app loads the artifact at startup and never trains on request. This eliminates training/serving skew (the Pipeline bundles preprocessing with the model), keeps startup fast, and makes the artifact auditable. Retraining is a deliberate `docker build` — not an accidental request side-effect.

### Linear Regression choice + limitations
Linear Regression is appropriate for a small (50-row), fully numeric dataset where interpretability matters (coefficients map directly to feature importance). Limitations: it assumes a linear relationship between features and price; it will underfit if the true relationship is non-linear. With more data, Gradient Boosted Trees (XGBoost/LightGBM) would be the natural upgrade — same Pipeline wrapper, swap the final estimator.

### BFF pattern (property-backend)
The Python BFF owns App-1 concerns: input validation, history storage, and fan-out to `/predict/batch` for compare. It insulates the portal from ml-service's prediction API and means the portal never calls ml-service directly. If the prediction interface changes, only the BFF changes.

### In-memory history (+ prod swap)
`HistoryStore` uses a `deque(maxlen=500)` behind a small interface. This is sufficient for assessment scope and avoids a database container. Swapping to Postgres is a one-class change: implement the same `add`/`recent`/`count` interface with asyncpg or SQLAlchemy async, inject via FastAPI dependency injection.

### Caffeine over Redis
The property dataset is static and loaded at startup. Market summary and segment queries are hot (same result every time until restart). Caffeine (in-process, JVM heap) gives microsecond cache hits with zero network hops and zero extra containers. Redis would be correct if results needed to be shared across multiple market-backend replicas — not the case here.

### WebClient over RestTemplate
RestTemplate has been in maintenance mode since Spring 5. WebClient supports both blocking (`.block()`) and reactive patterns and is the Spring-recommended HTTP client for new code.

### Server vs Client Components
Server Components (`page.tsx` files) perform the initial data fetch — no client-side waterfall, data arrives with the HTML. Client Components (`'use client'`) handle interactivity: forms, chart re-renders, filter state. recharts is browser-only and always stays inside `'use client'` boundaries. This gives good initial page performance without over-fetching from the browser.

### Client-side export
CSV and PDF are generated in the browser from already-fetched table data using `Blob` + `jsPDF/autotable`. This is appropriate for the ~50-row dataset in scope. A comment in `ExportButton.tsx` flags that large exports should stream from a server-side endpoint.

---

## Production Hardening

The following would be required before production deployment:

- **Auth**: OAuth2 resource server on each backend (Spring Security + JWT for market-backend; FastAPI dependency for Python services). Portal uses NextAuth.js / Auth.js with PKCE flow.
- **Persistent storage**: Replace `HistoryStore` deque with PostgreSQL (asyncpg + Alembic migrations). Market-backend could store audit logs.
- **Observability**: OpenTelemetry SDK in all four services exporting traces/metrics to a Collector. Prometheus + Grafana for dashboards. Structured JSON logging (already using SLF4J / Python `logging`).
- **Container orchestration**: Kubernetes (EKS) with Deployments + HPA scaling on CPU/RPS. ArgoCD for GitOps-style promotion from staging to production.
- **CI/CD**: GitHub Actions: lint → unit test → build → push to ECR → ArgoCD sync.
- **Queue (conditional)**: Only introduce a queue (SQS/Kafka) if an async workflow appears — e.g. bulk batch prediction jobs or async model retraining triggers. The current synchronous request path does not need one.
- **Model retraining pipeline**: Airflow or Prefect DAG to retrain on new data, evaluate against a holdout set, and promote the artifact only if metrics improve.
