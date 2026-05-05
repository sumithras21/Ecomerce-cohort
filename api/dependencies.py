from datetime import date
import pandas as pd


# Populated during FastAPI lifespan startup
app_state: dict = {}


def get_filtered_df(
    start_date: str | None = None,
    end_date: str | None = None,
) -> pd.DataFrame:
    df: pd.DataFrame = app_state["df"]
    if start_date:
        df = df[df["InvoiceDate"].dt.date >= date.fromisoformat(start_date)]
    if end_date:
        df = df[df["InvoiceDate"].dt.date <= date.fromisoformat(end_date)]
    return df
