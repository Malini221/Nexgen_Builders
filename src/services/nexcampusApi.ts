const API_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined) || 'http://localhost:8000';

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {'Content-Type':'application/json', Authorization:`Bearer ${token}`, ...(init?.headers || {})},
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || `Backend request failed (${res.status})`);
    return data as T;
  } catch (err: any) {
    if (err.message && !err.message.includes('Failed to fetch')) throw err;
    throw new Error('Unable to connect to NexCampus AI service. Please verify server status at http://localhost:8000.');
  }
}


export type BackendAnalysis = {
  category: string; category_confidence: number; severity: string; severity_confidence: number;
  impact: string; impact_confidence: number; priority: string; risk_score: number;
  safety_detected: boolean; risk_signals: string[]; match_type: string; similarity: number;
  existing_incident_id: string | null; occurrence_count: number; affected_student_count: number;
  incident_pattern: string; recurrence_status: string; recommended_department_id: string | null;
  recommended_department: string | null; recommended_sla: string;
  incident_id: string; complaint_id?: string; ticket_number?: number; backend_id?: string;
};

export async function getCategories(token: string) { return request<any[]>('/api/categories', token); }

export async function createAndAnalyzeComplaint(token: string, payload: any): Promise<{complaint:any; analysis:BackendAnalysis}> {
  const complaint = await request<any>('/api/complaints', token, {method:'POST', body:JSON.stringify(payload)});
  const analysis = await request<BackendAnalysis>(`/api/complaints/${complaint.id}/analyze`, token, {method:'POST'});
  return {complaint, analysis: {...analysis, complaint_id: complaint.id, ticket_number: complaint.ticket_number}};
}

export async function getMyComplaints(token: string): Promise<any[]> {
  return request<any[]>('/api/complaints/me', token);
}

export async function getAllComplaints(token: string): Promise<any[]> {
  return request<any[]>('/api/complaints', token);
}


export async function updateComplaintStatus(token: string, complaintId: string, status: string, note?: string): Promise<any> {
  return request<any>(`/api/complaints/${complaintId}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

