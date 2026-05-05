from fastapi import APIRouter, Query
from typing import Optional

from api.dependencies import get_filtered_df
from api.services.basket_service import compute_basket_summary
from api.models.schemas import BasketSummaryResponse, TopBasketProduct, ProductPair, BasketStats

router = APIRouter(tags=["Market Basket"])


@router.get("/basket/summary", response_model=BasketSummaryResponse)
def get_basket_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    df = get_filtered_df(start_date, end_date)
    result = compute_basket_summary(df)

    return BasketSummaryResponse(
        top_products=[TopBasketProduct(**p) for p in result["top_products"]],
        product_pairs=[ProductPair(**p) for p in result["product_pairs"]],
        basket_stats=BasketStats(**result["basket_stats"]),
    )
