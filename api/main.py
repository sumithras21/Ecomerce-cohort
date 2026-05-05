import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.data.data_loader import load_and_clean_data, get_rfm_segments
from api.dependencies import app_state
from api.routers import summary, customers, geographic, forecast, basket, cohort


@asynccontextmanager
async def lifespan(app: FastAPI):
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "OnlineRetail.csv")
    df = load_and_clean_data(data_path)
    rfm_df = get_rfm_segments(df)
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

app.include_router(summary.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(geographic.router, prefix="/api/v1")
app.include_router(forecast.router, prefix="/api/v1")
app.include_router(basket.router, prefix="/api/v1")
app.include_router(cohort.router, prefix="/api/v1")
