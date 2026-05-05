from fastapi import APIRouter, Query
from typing import Optional

from api.dependencies import get_filtered_df
from api.services.cohort_service import compute_cohort_retention
from api.models.schemas import CohortRetentionResponse, CohortRow, CohortSizeItem

router = APIRouter(tags=["Cohort"])


@router.get("/cohort/retention", response_model=CohortRetentionResponse)
def get_cohort_retention(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    df = get_filtered_df(start_date, end_date)
    result = compute_cohort_retention(df)

    return CohortRetentionResponse(
        cohort_matrix=[CohortRow(cohort=r["cohort"], data=r["data"]) for r in result["cohort_matrix"]],
        cohort_sizes=[CohortSizeItem(**s) for s in result["cohort_sizes"]],
        max_periods=result["max_periods"],
    )
