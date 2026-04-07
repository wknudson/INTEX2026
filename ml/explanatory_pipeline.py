import os
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


def csv_root() -> Path:
    return Path(
        os.getenv(
            "HAVYN_CSV_ROOT",
            r"C:\Users\willk\OneDrive\Desktop\INTEX\lighthouse_csv_v7\lighthouse_csv_v7",
        )
    )


def main() -> None:
    root = csv_root()
    social = pd.read_csv(root / "social_media_posts.csv")
    donations = pd.read_csv(root / "donations.csv")
    allocs = pd.read_csv(root / "donation_allocations.csv")
    metrics = pd.read_csv(root / "safehouse_monthly_metrics.csv")

    donation_totals = donations.groupby("campaign_name")["amount"].sum(min_count=1).fillna(0).rename("campaign_donation_amount")
    social_totals = social.groupby("campaign_name")[["impressions", "reach", "engagement_rate", "donation_referrals"]].mean()
    campaign_frame = social_totals.join(donation_totals, how="left").fillna(0).reset_index()

    X = campaign_frame[["campaign_name", "impressions", "reach", "engagement_rate", "donation_referrals"]]
    y = campaign_frame["campaign_donation_amount"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["campaign_name"]),
            ("num", "passthrough", ["impressions", "reach", "engagement_rate", "donation_referrals"]),
        ]
    )
    model = Pipeline([("prep", preprocessor), ("reg", LinearRegression())])
    model.fit(X, y)
    preds = model.predict(X)
    print(f"Campaign model R2: {r2_score(y, preds):.3f}")

    # Safehouse explanation frame for operational interpretation.
    alloc_totals = allocs.groupby("safehouse_id")["amount_allocated"].sum().rename("allocated_total")
    metric_latest = metrics.sort_values("month_end").groupby("safehouse_id").tail(1).set_index("safehouse_id")
    explanation = metric_latest.join(alloc_totals, how="left").fillna(0)
    print(explanation[["active_residents", "avg_education_progress", "avg_health_score", "allocated_total"]].head(10))


if __name__ == "__main__":
    main()
