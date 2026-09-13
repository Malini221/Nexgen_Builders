"""Development checks for recurrence logic using incident_history_sample.csv only."""
from pathlib import Path
import pandas as pd
from app.intelligence import classify_incident_pattern

p=Path(__file__).resolve().parent/'dataset'/'incident_history_sample.csv'
df=pd.read_csv(p)
for r in df.itertuples():
    pattern, recurrence=classify_incident_pattern(int(r.occurrence_count), int(r.affected_student_count))
    print(r.incident_id, r.occurrence_count, r.affected_student_count, '=>', pattern, recurrence)
