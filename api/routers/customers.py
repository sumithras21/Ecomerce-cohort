from fastapi import APIRouter, Depends, Query
from typing import Optional
from cachetools import TTLCache

from api.dependencies import get_filtered_df, app_state
from src.data.data_loader import get_rfm_segments
from api.models.schemas import (
    RfmSegmentsResponse, SegmentCount, ScatterPoint,
    SegmentStatsResponse, SegmentStatRow,
)

router = APIRouter(tags=["Customers"])
_customers_cache: TTLCache = TTLCache(maxsize=32, ttl=900)


def _cache_key(prefix: str, start_date: Optional[str], end_date: Optional[str]) -> str:
    return f"{prefix}:{start_date}:{end_date}"


@router.get("/customers/rfm-segments", response_model=RfmSegmentsResponse)
def get_rfm_segments_endpoint(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    key = _cache_key("rfm", start_date, end_date)
    if key in _customers_cache:
        return _customers_cache[key]

    df = get_filtered_df(start_date, end_date)
    rfm = get_rfm_segments(df)

    segment_counts = (
        rfm["Customer_Segment"].value_counts().reset_index()
    )
    segment_counts.columns = ["segment", "count"]

    scatter_data = [
        ScatterPoint(
            customer_id=float(row["CustomerID"]),
            recency=int(row["Recency"]),
            frequency=int(row["Frequency"]),
            monetary=round(float(row["Monetary"]), 2),
            segment=row["Customer_Segment"],
            rfm_score=float(row["RFM_Score"]),
        )
        for _, row in rfm.iterrows()
    ]

    result = RfmSegmentsResponse(
        segment_counts=[SegmentCount(segment=r["segment"], count=int(r["count"]))
                        for _, r in segment_counts.iterrows()],
        scatter_data=scatter_data,
    )
    _customers_cache[key] = result
    return result


@router.get("/customers/segment-stats", response_model=SegmentStatsResponse)
def get_segment_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    key = _cache_key("stats", start_date, end_date)
    if key in _customers_cache:
        return _customers_cache[key]

    df = get_filtered_df(start_date, end_date)
    rfm = get_rfm_segments(df)

    stats = rfm.groupby("Customer_Segment").agg(
        avg_recency=("Recency", "mean"),
        avg_frequency=("Frequency", "mean"),
        avg_monetary=("Monetary", "mean"),
        total_monetary=("Monetary", "sum"),
        customer_count=("CustomerID", "count"),
    ).reset_index()

    result = SegmentStatsResponse(
        data=[
            SegmentStatRow(
                segment=row["Customer_Segment"],
                avg_recency=round(float(row["avg_recency"]), 1),
                avg_frequency=round(float(row["avg_frequency"]), 1),
                avg_monetary=round(float(row["avg_monetary"]), 2),
                total_monetary=round(float(row["total_monetary"]), 2),
                customer_count=int(row["customer_count"]),
            )
            for _, row in stats.iterrows()
        ]
    )
    _customers_cache[key] = result
    return result
