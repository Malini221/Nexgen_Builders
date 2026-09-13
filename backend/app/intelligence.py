from functools import lru_cache
from pathlib import Path
from typing import Any
import re

from .config import get_settings

DATASET_DIR = Path(__file__).resolve().parents[1] / "dataset"
MODELS_DIR = Path(__file__).resolve().parents[1] / "models"

SAFETY_TERMS = {
    "fire", "smoke", "gas leak", "gas leakage", "sparking", "electrical shock",
    "exposed wire", "exposed wiring", "burning smell", "chemical leak",
    "structural collapse", "ceiling collapse", "life-threatening danger",
}

SEVERITY_ORDER = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}
IMPACT_WEIGHTS = {"INDIVIDUAL": 8, "DEPARTMENT": 18, "MULTIPLE": 28, "CAMPUS": 38}
SEVERITY_WEIGHTS = {"LOW": 10, "MEDIUM": 30, "HIGH": 55, "CRITICAL": 80}


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()


@lru_cache(maxsize=1)
def _classifier_bundle():
    """Load all fine-tuned DistilBERT classifiers once per process."""
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    bundle = {}
    for task in ("category", "severity", "impact"):
        path = MODELS_DIR / f"{task}-model"
        if not (path / "config.json").exists():
            raise RuntimeError(
                f"Trained {task} model is missing at {path}. Run `python train_classifier.py` first."
            )
        tokenizer = AutoTokenizer.from_pretrained(str(path), local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(str(path), local_files_only=True)
        model.eval()
        bundle[task] = (tokenizer, model)
    return bundle


@lru_cache(maxsize=1)
def get_embedder():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(get_settings().embedding_model)


def make_embedding(text: str) -> list[float]:
    vector = get_embedder().encode(text, normalize_embeddings=True)
    values = vector.tolist()
    if len(values) != 384:
        raise RuntimeError(f"Embedding model returned {len(values)} dimensions; expected 384.")
    return values


def _predict(task: str, text: str) -> tuple[str, float]:
    import torch
    tokenizer, model = _classifier_bundle()[task]
    encoded = tokenizer(text, return_tensors="pt", truncation=True, max_length=256)
    with torch.inference_mode():
        probs = torch.softmax(model(**encoded).logits, dim=-1)[0]
    idx = int(torch.argmax(probs).item())
    label = model.config.id2label.get(idx, str(idx))
    return label, float(probs[idx].item())


def classify_category(text: str) -> tuple[str, float]:
    return _predict("category", text)


def classify_severity(text: str) -> tuple[str, float]:
    return _predict("severity", text)


def classify_impact(text: str) -> tuple[str, float]:
    return _predict("impact", text)


def detect_safety(text: str) -> list[str]:
    normalized = _clean(text)
    return sorted(term for term in SAFETY_TERMS if term in normalized)


def calculate_risk(severity: str, impact: str, safety_signals: list[str], occurrence_count: int, affected_student_count: int) -> float:
    score = SEVERITY_WEIGHTS.get(severity, 10) + IMPACT_WEIGHTS.get(impact, 8)
    score += min(10, max(0, occurrence_count - 1) * 3)
    score += min(10, max(0, affected_student_count - 1) * 0.5)
    if safety_signals:
        score += 20 + min(10, (len(safety_signals) - 1) * 5)
    return round(min(100, score), 2)


def calculate_priority(risk_score: float, severity: str, safety_signals: list[str]) -> str:
    if safety_signals or severity == "CRITICAL" or risk_score >= 80:
        return "CRITICAL"
    if severity == "HIGH" or risk_score >= 55:
        return "HIGH"
    if severity == "MEDIUM" or risk_score >= 30:
        return "MEDIUM"
    return "LOW"


def classify_incident_pattern(occurrence_count: int, affected_student_count: int) -> tuple[str, str]:
    if occurrence_count >= 5:
        pattern = "CHRONIC"
    elif occurrence_count >= 3:
        pattern = "RECURRING"
    else:
        pattern = "NORMAL"
    recurrence_status = "HIGH_IMPACT" if affected_student_count > 1 else pattern
    return pattern, recurrence_status


@lru_cache(maxsize=1)
def load_department_mapping() -> dict[str, str]:
    import pandas as pd
    df = pd.read_csv(DATASET_DIR / "department_mapping.csv")
    return dict(zip(df["category"].astype(str), df["department"].astype(str)))


@lru_cache(maxsize=1)
def load_sla_rules() -> dict[tuple[str, str], dict[str, str]]:
    import pandas as pd
    df = pd.read_csv(DATASET_DIR / "sla_rules.csv")
    return {
        (str(r.severity), str(r.priority)): {"sla": str(r.sla), "description": str(r.description)}
        for r in df.itertuples()
    }


def recommend_sla(severity: str, priority: str) -> str:
    rule = load_sla_rules().get((severity, priority))
    if not rule:
        raise RuntimeError(f"No SLA rule configured for {severity}/{priority}.")
    return rule["sla"]


def analyze_text(title: str, description: str, location: str | None = None) -> dict[str, Any]:
    text = "\n".join(x for x in [title, description, location or ""] if x).strip()
    category, category_confidence = classify_category(text)
    severity, severity_confidence = classify_severity(text)
    impact, impact_confidence = classify_impact(text)
    safety = detect_safety(text)

    # Safety is intentionally independent from classifier confidence.
    if safety:
        severity = "CRITICAL"
        severity_confidence = 1.0

    return {
        "category_key": category,
        "category_confidence": category_confidence,
        "severity": severity,
        "severity_confidence": severity_confidence,
        "impact": impact,
        "impact_confidence": impact_confidence,
        "risk_signals": safety,
        "safety_detected": bool(safety),
    }
