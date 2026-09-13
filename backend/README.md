# NexCampus local AI intelligence backend

The backend now uses the supplied campus datasets as real training/configuration/evaluation inputs. It does not fabricate AI scores or fall back to keyword risk scoring when trained models are unavailable.

## Dataset layout

```text
backend/dataset/
├── campus_complaints.csv          # DistilBERT training labels
├── complaint_similarity.csv       # semantic duplicate/related evaluation
├── safety_hazards.csv              # deterministic safety validation
├── complaint_test.csv              # unseen classifier evaluation
├── department_mapping.csv          # category → department reference
├── sla_rules.csv                   # severity/priority → SLA configuration
└── incident_history_sample.csv     # recurrence development/testing only
```

The sample incident-history file is explicitly marked as starter/synthetic data in the supplied dataset. It is never treated as real campus history by the live API. Live recurrence counts come from `incidents` + `incident_complaints` in Supabase.

## Architecture

`React → Supabase Auth token → FastAPI → fine-tuned DistilBERT (category/severity/impact) → safety rules → MiniLM 384-d embedding → pgvector → incident link/create → database counts → risk/priority/department/SLA → React`

Models:

- `distilbert-base-uncased` fine-tuned separately for category, severity and impact.
- `sentence-transformers/all-MiniLM-L6-v2` for normalized 384-dimensional embeddings.

Duplicate thresholds are configurable: `>=0.85` duplicate, `0.70–<0.85` related, `<0.70` new/unmatched.

## Setup

From `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Linux/macOS:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set server-only Supabase credentials in `.env`. Never place the service-role key in React or commit `.env`.

## Database

Apply the existing core migration and then:

```text
supabase/migrations/002_ai_dataset_intelligence.sql
```

The second migration is additive only. It creates the `impact_level` enum when needed and adds AI-result fields without dropping tables/columns or changing the existing `vector(384)` embedding dimension.

## Train the models

From `backend/`:

```bash
python train_classifier.py
```

The script validates `campus_complaints.csv`, cleans text, performs a stratified train/validation split, fine-tunes three separate classifiers, calculates accuracy and weighted F1, and saves:

```text
backend/models/
├── category-model/
├── severity-model/
└── impact-model/
```

Model files are generated locally and should not be committed to source control.

The first training run downloads `distilbert-base-uncased` from Hugging Face. Runtime inference then loads the saved local model and does not call an external AI API.

## Evaluation

After training:

```bash
python evaluate_ai.py
```

This uses the unseen `complaint_test.csv`, the supplied semantic-pair dataset, and `safety_hazards.csv`. It reports classifier accuracy/weighted F1, semantic threshold accuracy, and safety detection coverage.

Recurrence development checks:

```bash
python test_incident_intelligence.py
```

## Start the API

```bash
uvicorn app.main:app --reload --port 8000
```

Useful endpoints:

- `GET /health`
- `GET /api/ai/status`
- `GET /api/categories`
- `POST /api/complaints`
- `POST /api/complaints/{complaint_id}/analyze`

`/api/complaints/{id}/analyze` fails clearly if trained models are missing, rather than returning fabricated values.

## Risk / priority / SLA

Risk is backend-owned and combines severity, impact, safety signals, actual occurrence count, and actual affected-student count. Safety signals have the strongest influence and force severity/priority to `CRITICAL`.

SLA values come from `sla_rules.csv`; there is no duplicated frontend SLA table.

Department selection first uses the existing database category → department relationship, with the supplied `department_mapping.csv` as the configuration reference/fallback when the database relationship has no department name.

## Frontend setup

From the project root:

```bash
npm install
```

Copy `.env.example` to `.env.local` and set:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_BACKEND_URL=http://localhost:8000
```

Start:

```bash
npm run dev
```

The report flow authenticates with Supabase, sends the complaint to FastAPI, waits for the real AI result, and displays category, severity, impact, priority, risk, safety warning, duplicate/related status, department and SLA. The frontend does not calculate risk.

## Acceptance test

Submit:

```text
There are sparks coming from an exposed electrical wire near the staircase.
```

The deterministic safety layer must detect the hazard even if the classifier confidence is low, force severity and priority to `CRITICAL`, then continue through embedding, pgvector matching, incident intelligence, risk calculation, department and SLA recommendation.

## Limitations

- DistilBERT performance depends on the supplied 195-row labelled training dataset; no accuracy number is invented before running evaluation.
- The supplied incident-history CSV is starter/synthetic development data and is not used as live campus history.
- Live duplicate/related detection requires the Supabase pgvector migration and populated complaint embeddings.
- The first model download/training can be slow and requires internet access; inference after training is local.
