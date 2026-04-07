# Havyn ML Pipelines

This folder contains two end-to-end ML workflows that align with IS 455 requirements:

- `predictive_pipeline.py`: Predict resident risk pressure from casework and incident features.
- `explanatory_pipeline.py`: Explain donation and safehouse trends using interpretable regression.

## Run

```bash
python predictive_pipeline.py
python explanatory_pipeline.py
```

## Data Path

Scripts expect CSV files at:

`C:\Users\willk\OneDrive\Desktop\INTEX\lighthouse_csv_v7\lighthouse_csv_v7`

Override with env var:

`HAVYN_CSV_ROOT`
