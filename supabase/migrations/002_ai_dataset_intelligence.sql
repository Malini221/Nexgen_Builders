-- Safe additive migration for dataset-backed AI intelligence.
do $$
begin
  create type public.impact_level as enum ('INDIVIDUAL', 'DEPARTMENT', 'MULTIPLE', 'CAMPUS');
exception when duplicate_object then null;
end $$;

alter table public.ai_analysis add column if not exists impact public.impact_level;
alter table public.ai_analysis add column if not exists category_confidence double precision;
alter table public.ai_analysis add column if not exists severity_confidence double precision;
alter table public.ai_analysis add column if not exists impact_confidence double precision;
alter table public.ai_analysis add column if not exists recommended_sla text;
alter table public.ai_analysis add column if not exists match_type text;
alter table public.ai_analysis add column if not exists similarity double precision;
alter table public.ai_analysis add column if not exists existing_incident_id uuid references public.incidents(id) on delete set null;
alter table public.ai_analysis add column if not exists incident_id uuid references public.incidents(id) on delete set null;
alter table public.ai_analysis add column if not exists occurrence_count integer;
alter table public.ai_analysis add column if not exists affected_student_count integer;
alter table public.ai_analysis add column if not exists incident_pattern text;
alter table public.ai_analysis add column if not exists recurrence_status text;

-- Keep the existing 384-dimensional pgvector column unchanged.
