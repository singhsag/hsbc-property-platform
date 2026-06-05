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

