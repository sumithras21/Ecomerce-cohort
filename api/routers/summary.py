from fastapi import APIRouter, Depends, Query
from typing import Optional
import pandas as pd

from api.dependencies import get_filtered_df, app_state
from api.models.schemas import (
    HealthResponse, KpiResponse, MonthlySalesResponse,
    MonthlySalesPoint, TopProductsResponse, TopProductItem,
)

router = APIRouter(tags=["Summary"])


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        data_loaded=bool(app_state.get("df") is not None),
        rows=app_state.get("rows", 0),
        date_min=app_state.get("date_min", ""),
        date_max=app_state.get("date_max", ""),
    )


@router.get("/summary/kpis", response_model=KpiResponse)
def get_kpis(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    df = get_filtered_df(start_date, end_date)
    total_revenue = float(df["Revenue"].sum())
    total_orders = int(df["InvoiceNo"].nunique())
    unique_customers = int(df["CustomerID"].nunique())
    avg_order_value = float(df.groupby("InvoiceNo")["Revenue"].sum().mean()) if total_orders > 0 else 0.0
    return KpiResponse(
        total_revenue=round(total_revenue, 2),
        total_orders=total_orders,
        unique_customers=unique_customers,
        avg_order_value=round(avg_order_value, 2),
        date_min=app_state.get("date_min", ""),
        date_max=app_state.get("date_max", ""),
    )


@router.get("/summary/monthly-sales", response_model=MonthlySalesResponse)
def get_monthly_sales(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    df = get_filtered_df(start_date, end_date)
    monthly = df.groupby("YearMonth")["Revenue"].sum().reset_index()
    monthly = monthly.sort_values("YearMonth")
    return MonthlySalesResponse(
        data=[MonthlySalesPoint(year_month=row["YearMonth"], revenue=round(row["Revenue"], 2))
              for _, row in monthly.iterrows()]
    )


@router.get("/summary/top-products", response_model=TopProductsResponse)
def get_top_products(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
):
    df = get_filtered_df(start_date, end_date)
    top = df.groupby("Description")["Revenue"].sum().nlargest(limit).reset_index()
    return TopProductsResponse(
        data=[TopProductItem(description=row["Description"], revenue=round(row["Revenue"], 2))
              for _, row in top.iterrows()]
    )
