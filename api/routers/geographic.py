from fastapi import APIRouter, Query
from typing import Optional
from cachetools import TTLCache

from api.dependencies import get_filtered_df
from api.models.schemas import GeoMapResponse, GeoMapItem, TopCountriesResponse, TopCountryRow

router = APIRouter(tags=["Geographic"])
_geographic_cache: TTLCache = TTLCache(maxsize=32, ttl=900)


def _cache_key(prefix: str, start_date: Optional[str], end_date: Optional[str], limit: Optional[int] = None) -> str:
    return f"{prefix}:{start_date}:{end_date}:{limit}"


@router.get("/geographic/map", response_model=GeoMapResponse)
def get_geo_map(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    key = _cache_key("map", start_date, end_date)
    if key in _geographic_cache:
        return _geographic_cache[key]

    df = get_filtered_df(start_date, end_date)
    by_country = df.groupby("Country")["Revenue"].sum().reset_index()
    result = GeoMapResponse(
        data=[GeoMapItem(country=row["Country"], revenue=round(float(row["Revenue"]), 2))
              for _, row in by_country.iterrows()]
    )
    _geographic_cache[key] = result
    return result


@router.get("/geographic/top-countries", response_model=TopCountriesResponse)
def get_top_countries(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
):
    key = _cache_key("top", start_date, end_date, limit)
    if key in _geographic_cache:
        return _geographic_cache[key]

    df = get_filtered_df(start_date, end_date)
    stats = df.groupby("Country").agg(
        revenue=("Revenue", "sum"),
        unique_customers=("CustomerID", "nunique"),
        orders=("InvoiceNo", "nunique"),
    ).reset_index()
    stats["avg_order_value"] = stats["revenue"] / stats["orders"].replace(0, 1)
    stats = stats.nlargest(limit, "revenue")

    result = TopCountriesResponse(
        data=[
            TopCountryRow(
                country=row["Country"],
                revenue=round(float(row["revenue"]), 2),
                unique_customers=int(row["unique_customers"]),
                orders=int(row["orders"]),
                avg_order_value=round(float(row["avg_order_value"]), 2),
            )
            for _, row in stats.iterrows()
        ]
    )
    _geographic_cache[key] = result
    return result
