import pandas as pd
import numpy as np


def compute_cohort_retention(df: pd.DataFrame) -> dict:
    df = df.copy()
    df["InvoiceMonth"] = df["InvoiceDate"].dt.to_period("M")

    # First purchase month per customer
    first_purchase = df.groupby("CustomerID")["InvoiceMonth"].min().rename("CohortMonth")
    df = df.join(first_purchase, on="CustomerID")

    # Period index = months since first purchase
    df["PeriodIndex"] = (df["InvoiceMonth"] - df["CohortMonth"]).apply(lambda x: x.n)

    cohort_data = df.groupby(["CohortMonth", "PeriodIndex"])["CustomerID"].nunique().reset_index()
    cohort_data.columns = ["CohortMonth", "PeriodIndex", "Customers"]

    # Pivot to matrix
    cohort_pivot = cohort_data.pivot(index="CohortMonth", columns="PeriodIndex", values="Customers")
    cohort_sizes = cohort_pivot[0].rename("initial_customers")

    # Retention rates
    retention = cohort_pivot.divide(cohort_sizes, axis=0).round(4)

    max_periods = int(cohort_pivot.columns.max())

    cohort_matrix = []
    for cohort_month, row in retention.iterrows():
        data = {}
        for period in range(max_periods + 1):
            val = row.get(period)
            data[f"period_{period}"] = float(val) if pd.notna(val) else None
        cohort_matrix.append({"cohort": str(cohort_month), "data": data})

    cohort_sizes_list = [
        {"cohort": str(cohort), "initial_customers": int(size)}
        for cohort, size in cohort_sizes.items()
        if pd.notna(size)
    ]

    return {
        "cohort_matrix": cohort_matrix,
        "cohort_sizes": cohort_sizes_list,
        "max_periods": max_periods,
    }
