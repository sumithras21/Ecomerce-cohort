from datetime import date
import pandas as pd
from fastapi import HTTPException


# Populated during FastAPI lifespan startup
app_state: dict = {}


def parse_iso_date(value: str | None, field_name: str) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"Invalid {field_name}. Use YYYY-MM-DD format.") from exc


def ensure_data_loaded() -> None:
    if "df" not in app_state:
        raise HTTPException(status_code=503, detail="Dataset is not loaded yet.")


def get_filtered_df(
    start_date: str | None = None,
    end_date: str | None = None,
) -> pd.DataFrame:
    ensure_data_loaded()
    parsed_start = parse_iso_date(start_date, "start_date")
    parsed_end = parse_iso_date(end_date, "end_date")
    if parsed_start and parsed_end and parsed_start > parsed_end:
        raise HTTPException(status_code=422, detail="start_date cannot be after end_date.")

    df: pd.DataFrame = app_state["df"]
    if parsed_start:
        df = df[df["InvoiceDate"].dt.date >= parsed_start]
    if parsed_end:
        df = df[df["InvoiceDate"].dt.date <= parsed_end]
    return df
