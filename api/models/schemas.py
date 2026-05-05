from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    status: str
    data_loaded: bool
    rows: int
    date_min: str
    date_max: str


# --- Summary ---

class KpiResponse(BaseModel):
    total_revenue: float
    total_orders: int
    unique_customers: int
    avg_order_value: float
    date_min: str
    date_max: str


class MonthlySalesPoint(BaseModel):
    year_month: str
    revenue: float


class MonthlySalesResponse(BaseModel):
    data: list[MonthlySalesPoint]


class TopProductItem(BaseModel):
    description: str
    revenue: float


class TopProductsResponse(BaseModel):
    data: list[TopProductItem]


# --- Customers ---

class SegmentCount(BaseModel):
    segment: str
    count: int


class ScatterPoint(BaseModel):
    customer_id: float
    recency: int
    frequency: int
    monetary: float
    segment: str
    rfm_score: float


class RfmSegmentsResponse(BaseModel):
    segment_counts: list[SegmentCount]
    scatter_data: list[ScatterPoint]


class SegmentStatRow(BaseModel):
    segment: str
    avg_recency: float
    avg_frequency: float
    avg_monetary: float
    total_monetary: float
    customer_count: int


class SegmentStatsResponse(BaseModel):
    data: list[SegmentStatRow]


# --- Geographic ---

class GeoMapItem(BaseModel):
    country: str
    revenue: float


class GeoMapResponse(BaseModel):
    data: list[GeoMapItem]


class TopCountryRow(BaseModel):
    country: str
    revenue: float
    unique_customers: int
    orders: int
    avg_order_value: float


class TopCountriesResponse(BaseModel):
    data: list[TopCountryRow]


# --- Forecast ---

class HistoricalPoint(BaseModel):
    date: str
    revenue: float


class ForecastPoint(BaseModel):
    date: str
    forecast_revenue: float


class ForecastSummary(BaseModel):
    expected_30_day_total: float
    model: str
    seasonal_periods: int
    periods: int


class ForecastResponse(BaseModel):
    historical: list[HistoricalPoint]
    forecast: list[ForecastPoint]
    summary: ForecastSummary


# --- Market Basket ---

class TopBasketProduct(BaseModel):
    description: str
    frequency: int
    revenue: float


class ProductPair(BaseModel):
    product_a: str
    product_b: str
    cooccurrence: int


class BasketStats(BaseModel):
    avg_basket_size: float
    single_product_pct: float
    multi_product_pct: float
    total_baskets: int


class BasketSummaryResponse(BaseModel):
    top_products: list[TopBasketProduct]
    product_pairs: list[ProductPair]
    basket_stats: BasketStats


# --- Cohort ---

class CohortRow(BaseModel):
    cohort: str
    data: dict[str, Optional[float]]


class CohortSizeItem(BaseModel):
    cohort: str
    initial_customers: int


class CohortRetentionResponse(BaseModel):
    cohort_matrix: list[CohortRow]
    cohort_sizes: list[CohortSizeItem]
    max_periods: int
