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

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "hostel": ["hostel", "room", "dorm", "bathroom", "washroom", "mit", "warden", "mess"],
    "food-canteen": ["food", "canteen", "mess", "meal", "cafeteria"],
    "transport": ["bus", "transport", "shuttle", "pickup", "drop"],
    "academic": ["class", "lecture", "lab", "exam", "portal", "faculty", "syllabus", "library"],
    "college-campus": ["campus", "building", "gate", "ground", "parking", "corridor", "staircase"],
    "safety-security": ["security", "safety", "cctv", "camera", "guard", "theft", "lighting"],
    "cleanliness-sanitation": ["garbage", "waste", "clean", "dustbin", "sanitation", "overflow", "hygiene", "stink", "rodent"],
    "infrastructure-maintenance": ["ac ", "air conditioner", "lift", "elevator", "paint", "plumbing", "leak", "electrical", "power", "fan", "projector", "wi-fi", "wifi", "internet", "network"],
    "student-welfare": ["harassment", "ragging", "bullying", "counsel", "welfare", "mental", "stress"],
    "substance-concern": ["smoking", "alcohol", "substance", "drug"],
}

SEVERITY_CRITICAL = ["fire", "smoke", "gas leak", "gas leakage", "sparking", "electrical shock",
                     "short circuit", "collapse", "life-threatening", "emergency", "critical"]
SEVERITY_HIGH = ["burning smell", "blood", "injury", "accident", "theft", "broken", "not working",
                 "blocked", "urgent", "security", "high voltage", "exposed wire", "leak"]

SEVERITY_ORDER = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3}
IMPACT_WEIGHTS = {"INDIVIDUAL": 8, "DEPARTMENT": 18, "MULTIPLE": 28, "CAMPUS": 38}
SEVERITY_WEIGHTS = {"LOW": 10, "MEDIUM": 30, "HIGH": 55, "CRITICAL": 80}

IMPACT_MULTIPLE_KEYWORDS = ["student", "students", "classroom", "block", "hostel", "floor",
                            "wing", "campus", "many", "every", "all", "multiple", "batch"]
IMPACT_CAMPUS_KEYWORDS = ["campus", "entire", "whole", "main gate", "college", "university"]


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()


def _models_available() -> bool:
    """True when all fine-tuned classifier model directories are committed."""
    return all((MODELS_DIR / f"{task}-model" / "config.json").exists() for task in ("category", "severity", "impact"))


@lru_cache(maxsize=1)
def _classifier_bundle() -> dict | None:
    """Load all fine-tuned DistilBERT classifiers once per process.

    Returns None when the trained models are not present so callers can fall
    back to rule-based classification instead of crashing.
    """
    if not _models_available():
        return None
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    bundle = {}
    for task in ("category", "severity", "impact"):
        path = MODELS_DIR / f"{task}-model"
        tokenizer = AutoTokenizer.from_pretrained(str(path), local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(str(path), local_files_only=True)
        model.eval()
        bundle[task] = (tokenizer, model)
    return bundle


@lru_cache(maxsize=1)
def get_embedder():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(get_settings().embedding_model)


@lru_cache(maxsize=1)
def _cached_embeddings(text: str) -> list[float]:
    return get_embedder().encode(text, normalize_embeddings=True).tolist()


def make_embedding(text: str) -> list[float]:
    values = _cached_embeddings(text)
    if len(values) != 384:
        raise RuntimeError(f"Embedding model returned {len(values)} dimensions; expected 384.")
    return values


def _predict(task: str, text: str) -> tuple[str, float]:
    bundle = _classifier_bundle()
    if bundle is None:
        return _rule_based(task, text)
    import torch
    tokenizer, model = bundle[task]
    encoded = tokenizer(text, return_tensors="pt", truncation=True, max_length=256)
    with torch.inference_mode():
        probs = torch.softmax(model(**encoded).logits, dim=-1)[0]
    idx = int(torch.argmax(probs).item())
    label = model.config.id2label.get(idx, str(idx))
    return label, float(probs[idx].item())


def _rule_based(task: str, text: str) -> tuple[str, float]:
    """Deterministic keyword classifier used when trained models are absent.

    Uses the same label vocabulary as the trained classifiers so the rest of
    the pipeline (SLA mapping, department routing, risk scoring) keeps working.
    """
    norm = _clean(text)

    if task == "category":
        if any(k in norm for k in SAFETY_TERMS):
            return "safety-security", 0.90
        best_key, best_hits = "other", 0
        for key, keywords in CATEGORY_KEYWORDS.items():
            hits = sum(1 for kw in keywords if kw in norm)
            if hits > best_hits:
                best_key, best_hits = key, hits
        confidence = round(min(0.95, 0.55 + best_hits * 0.15), 2)
        return best_key, confidence

    if task == "severity":
        if any(k in norm for k in SEVERITY_CRITICAL):
            return "CRITICAL", 0.95
        if any(k in norm for k in SEVERITY_HIGH):
            return "HIGH", 0.80
        if any(k in norm for k in ["some", "a few", "occasionally", "intermittent", "smelly"]):
            return "MEDIUM", 0.70
        return "MEDIUM", 0.60

    if task == "impact":
        if any(k in norm for k in IMPACT_CAMPUS_KEYWORDS):
            return "CAMPUS", 0.85
        if any(k in norm for k in IMPACT_MULTIPLE_KEYWORDS):
            return "MULTIPLE", 0.75
        return "INDIVIDUAL", 0.70

    return "other", 0.5


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
