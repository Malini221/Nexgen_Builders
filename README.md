# NexCampus — Dataset-backed local AI integration

This folder is the modified NexCampus project with the supplied `nexcampus_ai_dataset_pack` integrated into the existing FastAPI + Supabase + pgvector architecture.

## What changed

- Added all seven supplied datasets under `backend/dataset/`.
- Added `backend/train_classifier.py` for three separate fine-tuned DistilBERT models.
- Added `backend/evaluate_ai.py` for unseen complaint, semantic-pair, and safety evaluation.
- Added `backend/test_incident_intelligence.py` for recurrence development checks.
- Replaced the rule-based backend classifier with local fine-tuned DistilBERT inference.
- Switched embeddings to `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions).
- Added deterministic safety override independent of ML confidence.
- Connected department mapping and SLA rules to the backend pipeline.
- Added database-backed incident recurrence/impact/risk calculation.
- Added a safe additive Supabase migration for stored AI result fields.
- Removed frontend keyword-based risk scoring; the UI displays backend results or an explicit unavailable state.
- Wired the main report flow through Supabase Auth → FastAPI → AI → pgvector → incident intelligence.
- Added browser-side Supabase Auth calls without exposing the server service-role key.

## Important

The generated `backend/models/` directory is intentionally absent until the local training command is run. The backend refuses to fabricate results when those models are missing.

Do not copy any real Supabase service-role secret into the frontend. Use `backend/.env` only on the server and `.env.local` for the public browser configuration.

See `backend/README.md` for exact setup, migration, training, evaluation and run commands.
