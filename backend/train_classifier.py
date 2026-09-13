"""Fine-tune three DistilBERT classifiers from backend/dataset/campus_complaints.csv."""
from pathlib import Path
import json
import random

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from torch.optim import AdamW

ROOT = Path(__file__).resolve().parent
CSV = ROOT / "dataset" / "campus_complaints.csv"
MODELS = ROOT / "models"
BASE_MODEL = "distilbert-base-uncased"
SEED = 42


def seed_everything():
    random.seed(SEED); np.random.seed(SEED); torch.manual_seed(SEED)


class ComplaintDataset(Dataset):
    def __init__(self, texts, labels, tokenizer):
        self.enc = tokenizer(list(texts), truncation=True, padding=True, max_length=256)
        self.labels = list(labels)
    def __len__(self): return len(self.labels)
    def __getitem__(self, i):
        item = {k: torch.tensor(v[i]) for k, v in self.enc.items()}
        item["labels"] = torch.tensor(self.labels[i], dtype=torch.long)
        return item


def train_task(df, task):
    label_col = task
    labels = sorted(df[label_col].astype(str).unique())
    label2id = {x: i for i, x in enumerate(labels)}
    id2label = {i: x for x, i in label2id.items()}
    y = df[label_col].astype(str).map(label2id).to_numpy()
    train_idx, val_idx = train_test_split(np.arange(len(df)), test_size=0.2, random_state=SEED, stratify=y)

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL, num_labels=len(labels), id2label=id2label, label2id=label2id
    )
    train_ds = ComplaintDataset(df.iloc[train_idx].text, y[train_idx], tokenizer)
    val_ds = ComplaintDataset(df.iloc[val_idx].text, y[val_idx], tokenizer)
    train_loader = DataLoader(train_ds, batch_size=8, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=16)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    optimizer = AdamW(model.parameters(), lr=5e-5)

    epochs = 3
    for epoch in range(epochs):
        model.train()
        for batch in train_loader:
            batch = {k: v.to(device) for k, v in batch.items()}
            optimizer.zero_grad()
            loss = model(**batch).loss
            loss.backward()
            optimizer.step()

    model.eval(); preds=[]; actual=[]
    with torch.inference_mode():
        for batch in val_loader:
            labels_batch = batch.pop("labels").numpy().tolist()
            batch = {k: v.to(device) for k, v in batch.items()}
            p = model(**batch).logits.argmax(-1).cpu().numpy().tolist()
            preds.extend(p); actual.extend(labels_batch)
    metrics = {
        "accuracy": accuracy_score(actual, preds),
        "weighted_f1": f1_score(actual, preds, average="weighted", zero_division=0),
        "train_rows": len(train_idx), "validation_rows": len(val_idx),
        "labels": labels,
    }
    out = MODELS / f"{task}-model"
    out.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(out); tokenizer.save_pretrained(out)
    (out / "training_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(task, metrics)


def main():
    seed_everything()
    df = pd.read_csv(CSV)
    required = {"text", "category", "severity", "impact"}
    missing = required - set(df.columns)
    if missing: raise ValueError(f"Missing dataset columns: {sorted(missing)}")
    df = df.dropna(subset=list(required)).copy()
    df["text"] = df["text"].astype(str).str.replace(r"\s+", " ", regex=True).str.strip()
    if len(df) < 30: raise ValueError("campus_complaints.csv is unexpectedly small")
    for task in ("category", "severity", "impact"):
        train_task(df, task)

if __name__ == "__main__": main()
