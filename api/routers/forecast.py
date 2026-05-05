import io
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from typing import Optional
from cachetools import TTLCache

from api.dependencies import get_filtered_df
from src.models.forecasting import generate_forecast
from api.models.schemas import ForecastResponse, HistoricalPoint, ForecastPoint, ForecastSummary

router = APIRouter(tags=["Forecast"])

_forecast_cache: TTLCache = TTLCache(maxsize=32, ttl=3600)


def _cache_key(start_date, end_date, periods):
    return f"{start_date}|{end_date}|{periods}"


@router.get("/forecast/generate", response_model=ForecastResponse)
def get_forecast(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    periods: int = Query(30, ge=7, le=90),
):
    key = _cache_key(start_date, end_date, periods)
    if key in _forecast_cache:
        return _forecast_cache[key]

    df = get_filtered_df(start_date, end_date)
    historical_df, forecast_df = generate_forecast(df, periods=periods)

    result = ForecastResponse(
        historical=[
            HistoricalPoint(date=row["Date"].strftime("%Y-%m-%d"), revenue=round(float(row["Revenue"]), 2))
            for _, row in historical_df.iterrows()
        ],
        forecast=[
            ForecastPoint(date=row["Date"].strftime("%Y-%m-%d"), forecast_revenue=round(float(row["Forecast_Revenue"]), 2))
            for _, row in forecast_df.iterrows()
        ],
        summary=ForecastSummary(
            expected_30_day_total=round(float(forecast_df["Forecast_Revenue"].sum()), 2),
            model="Holt-Winters Exponential Smoothing",
            seasonal_periods=7,
            periods=periods,
        ),
    )
    _forecast_cache[key] = result
    return result


@router.get("/forecast/export-csv")
def export_forecast_csv(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    periods: int = Query(30, ge=7, le=90),
):
    df = get_filtered_df(start_date, end_date)
    _, forecast_df = generate_forecast(df, periods=periods)

    output = io.StringIO()
    forecast_df.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=forecast.csv"},
    )
