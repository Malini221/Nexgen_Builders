NexCampus AI dataset pack

Files:
1. campus_complaints.csv - main classifier dataset (generated separately)
2. complaint_similarity.csv - semantic duplicate/related/unrelated evaluation
3. safety_hazards.csv - safety override/classifier evaluation
4. complaint_test.csv - held-out style test complaints
5. department_mapping.csv - category to responsible department
6. sla_rules.csv - severity/priority to SLA rules
7. incident_history_sample.csv - synthetic schema/examples for recurrence testing

Important:
- These datasets are starter/synthetic development data.
- Do not claim they are real historical campus complaints.
- Real anonymized complaints from the institution should replace/augment them before
  making real-world accuracy claims.
- Department and SLA files are configuration/reference data, not ML training data.
- Incident history should ultimately come from the NexCampus Supabase database.
