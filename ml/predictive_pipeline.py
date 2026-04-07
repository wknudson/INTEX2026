import os
from pathlib import Path

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
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
    residents = pd.read_csv(root / "residents.csv")
    incidents = pd.read_csv(root / "incident_reports.csv")
    process = pd.read_csv(root / "process_recordings.csv")

    incident_counts = incidents.groupby("resident_id").size().rename("incident_count")
    concerns = (
        process.groupby("resident_id")["concerns_flagged"]
        .apply(lambda x: (x.astype(str).str.lower() == "true").sum())
        .rename("concern_count")
    )

    frame = residents[["resident_id", "case_category", "current_risk_level", "reintegration_status"]].copy()
    frame = frame.merge(incident_counts, on="resident_id", how="left")
    frame = frame.merge(concerns, on="resident_id", how="left")
    frame = frame.fillna({"incident_count": 0, "concern_count": 0})
    frame["target_high_risk"] = frame["current_risk_level"].isin(["High", "Critical"]).astype(int)

    features = ["case_category", "reintegration_status", "incident_count", "concern_count"]
    X = frame[features]
    y = frame["target_high_risk"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["case_category", "reintegration_status"]),
            ("num", "passthrough", ["incident_count", "concern_count"]),
        ]
    )

    model = Pipeline(
        steps=[
            ("prep", preprocessor),
            ("clf", RandomForestClassifier(n_estimators=200, random_state=42)),
        ]
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    print(classification_report(y_test, predictions, digits=3))


if __name__ == "__main__":
    main()
