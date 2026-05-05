import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from contextlib import asynccontextmanager
from collections import defaultdict, deque
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from src.data.data_loader import load_and_clean_data, get_rfm_segments
from api.dependencies import app_state
from api.routers import summary, customers, geographic, forecast, basket, cohort
from src.api.routes import chat
from src.utils.logger import get_logger

logger = get_logger(__name__)
request_limits = defaultdict(deque)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    data_path = os.path.join(PROJECT_ROOT, "data", "OnlineRetail.csv")
    df = load_and_clean_data(data_path)
    if df.empty:
        raise RuntimeError("Loaded dataset is empty after cleaning.")
    rfm_df = get_rfm_segments(df)
    if rfm_df.empty:
        raise RuntimeError("RFM dataset is empty after preprocessing.")
    app_state["df"] = df
    app_state["rfm_df"] = rfm_df
    app_state["date_min"] = df["InvoiceDate"].min().date().isoformat()
    app_state["date_max"] = df["InvoiceDate"].max().date().isoformat()
    app_state["rows"] = len(df)
    yield
    app_state.clear()


app = FastAPI(
    title="Ecommerce Analytics API",
    version="1.0.0",
    description="REST API for the e-commerce analytics dashboard",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid4()))
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response


@app.middleware("http")
async def simple_rate_limit_middleware(request: Request, call_next):
    limited_paths = ("/api/v1/chat", "/api/v1/forecast", "/api/v1/basket")
    if request.url.path.startswith(limited_paths):
        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}:{request.url.path}"
        now = datetime.now(timezone.utc).timestamp()
        window_seconds = 60
        max_requests = 30

        bucket = request_limits[key]
        while bucket and bucket[0] < now - window_seconds:
            bucket.popleft()
        if len(bucket) >= max_requests:
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded. Try again soon."})
        bucket.append(now)

    return await call_next(request)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(
        "HTTP exception raised",
        extra={"request_id": getattr(request.state, "request_id", "-")},
    )
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception: {exc}",
        extra={"request_id": getattr(request.state, "request_id", "-")},
    )
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.include_router(summary.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(geographic.router, prefix="/api/v1")
app.include_router(forecast.router, prefix="/api/v1")
app.include_router(basket.router, prefix="/api/v1")
app.include_router(cohort.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
