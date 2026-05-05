import pandas as pd


def compute_basket_summary(df: pd.DataFrame) -> dict:
    df = df.dropna(subset=["Description"])

    # Top products by frequency and revenue
    top_products = (
        df.groupby("Description")
        .agg(frequency=("InvoiceNo", "count"), revenue=("Revenue", "sum"))
        .nlargest(20, "frequency")
        .reset_index()
    )

    # Build binary basket matrix over top 50 products for co-occurrence
    top_50 = df["Description"].value_counts().head(50).index
    df_filtered = df[df["Description"].isin(top_50)]

    basket = (
        df_filtered.groupby(["InvoiceNo", "Description"])["Quantity"]
        .sum()
        .unstack()
        .fillna(0)
    )
    basket_sets = basket.map(lambda x: 1 if x > 0 else 0)

    # Co-occurrence for top 20 products
    top_20 = list(top_50[:20])
    cooccurrence = {}
    for i, p1 in enumerate(top_20):
        for j, p2 in enumerate(top_20):
            if i >= j:
                continue
            if p1 not in basket_sets.columns or p2 not in basket_sets.columns:
                continue
            count = int(((basket_sets[p1] == 1) & (basket_sets[p2] == 1)).sum())
            if count > 10:
                cooccurrence[(p1, p2)] = count

    # Basket size stats
    basket_sizes = basket_sets.sum(axis=1)
    total = len(basket_sizes)
    single = int((basket_sizes == 1).sum())
    multi = int((basket_sizes > 1).sum())

    return {
        "top_products": [
            {
                "description": row["Description"],
                "frequency": int(row["frequency"]),
                "revenue": round(float(row["revenue"]), 2),
            }
            for _, row in top_products.iterrows()
        ],
        "product_pairs": sorted(
            [
                {"product_a": a, "product_b": b, "cooccurrence": c}
                for (a, b), c in cooccurrence.items()
            ],
            key=lambda x: x["cooccurrence"],
            reverse=True,
        )[:15],
        "basket_stats": {
            "avg_basket_size": round(float(basket_sizes.mean()), 1),
            "single_product_pct": round(single / total * 100, 1) if total else 0.0,
            "multi_product_pct": round(multi / total * 100, 1) if total else 0.0,
            "total_baskets": total,
        },
    }
