"""Evaluate the trained classifiers, Sentence-BERT similarity, and safety rules on supplied datasets."""
from pathlib import Path
import json
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score
from app.intelligence import analyze_text, make_embedding, detect_safety

ROOT = Path(__file__).resolve().parent


def classifier_eval():
    df = pd.read_csv(ROOT / "dataset" / "complaint_test.csv")
    rows=[]
    for r in df.itertuples():
        a=analyze_text(str(r.text), "")
        rows.append(a)
    result={}
    for task, expected in [("category","expected_category"),("severity","expected_severity"),("impact","expected_impact")]:
        pred=[r[task] if task in r else r[f"{task}_key"] for r in rows]
        truth=df[expected].astype(str).tolist()
        result[task]={"accuracy":accuracy_score(truth,pred),"weighted_f1":f1_score(truth,pred,average="weighted",zero_division=0)}
    return result


def similarity_eval():
    df=pd.read_csv(ROOT / "dataset" / "complaint_similarity.csv")
    sims=[]; correct=[]
    for r in df.itertuples():
        a=np.array(make_embedding(str(r.complaint_1))); b=np.array(make_embedding(str(r.complaint_2)))
        sim=float(np.dot(a,b)); sims.append(sim)
        expected = "DUPLICATE" if sim >= 0.85 else "RELATED" if sim >= 0.70 else "UNRELATED"
        correct.append(expected == str(r.label).upper())
    return {"rows":len(df),"accuracy":float(np.mean(correct)),"thresholds":{"duplicate":0.85,"related":0.70},"similarities":sims}


def safety_eval():
    df=pd.read_csv(ROOT / "dataset" / "safety_hazards.csv")
    detected=[bool(detect_safety(str(r.text))) for r in df.itertuples()]
    return {"rows":len(df),"hazards_detected":sum(detected),"all_detected":all(detected)}


if __name__ == "__main__":
    print(json.dumps({"classifier":classifier_eval(),"similarity":similarity_eval(),"safety":safety_eval()},indent=2))
