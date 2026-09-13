export type NavigationTab = 
  | 'dashboard' 
  | 'report-problem' 
  | 'my-reports' 
  | 'notifications' 
  | 'campus-resources' 
  | 'facilities'
  | 'feedback'
  | 'settings'
  | 'admin-dashboard'
  | 'admin-reports'
  | 'admin-report-detail'
  | 'admin-students'
  | 'admin-departments'
  | 'admin-analytics'
  | 'admin-announcements'
  | 'admin-settings';

export type TicketStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'In Progress' 
  | 'Resolved' 
  | 'Awaiting Verification' 
  | 'Closed' 
  | 'Dismissed' 
  | 'Cancelled';

export interface TicketReport {
  id: string;
  backendId?: string;
  title: string;

  category: string;
  subCategory?: string;
  location: string;
  reportedDate: string;
  closedDate?: string;
  status: TicketStatus;
  statusText?: string;
  description: string;
  squad?: string;
  department?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore?: number;
  safetyStatus?: string;
  resolutionAction?: string;
  satisfactionRating?: number;
  reporterName: string;
  reporterId: string;
  reporterEmail?: string;
  reporterProgram?: string;
  reporterYear?: string;
  attachmentName?: string;
  historySteps?: {
    label: string;
    time?: string;
    completed: boolean;
    active?: boolean;
  }[];
  aiAnalysis?: AIAnalysisResult;
}

export interface Facility {
  id: string;
  name: string;
  title: string;
  category: 'academic' | 'living' | 'wellness' | 'operations';
  categoryLabel: string;
  badge: string;
  badgeType: 'resolved' | 'progress' | 'review' | 'default';
  description: string;
  location: string;
  hoursWeekday: string;
  hoursWeekend: string;
  access: string;
  phone: string;
  email: string;
  meshNode: string;
  icon: string;
  services: string[];
}

export interface NotificationItem {
  id: string;
  type: 'reports' | 'alerts';
  title: string;
  description?: string;
  message?: string;
  subCategory?: string;
  timeAgo?: string;
  timestamp?: string;
  isRead?: boolean;
  unread?: boolean;
  ticketId?: string;
  badgeText?: string;
  badgeClass?: string;
  icon?: string;
  iconClass?: string;
  actionRequired?: boolean;
  actionType?: 'verification' | 'clarification' | 'transit' | 'info';
  clarificationResolved?: boolean;
}

export interface UserProfile {
  name: string;
  studentId: string;
  email: string;
  phone?: string;
  department?: string;
  residence?: string;
  program: string;
  year: string;
  campusResidence: string;
  roomKey: string;
  term: string;
  enrolledCredits: string;
  mentor: string;
  mentorDept: string;
}

export interface CategoryInfo {
  key: string;
  name: string;
  number: string;
  icon: string;
  subtitle: string;
  question: string;
  issues: string[];
  privateBadge?: boolean;
}

export interface FeedbackItem {
  id: string;
  category: string;
  facility: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  status: string;
  upvotes: number;
  hasUpvoted?: boolean;
}


export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  audience: string;
  createdOn: string;
  publishedDate?: string;
  status: 'Published' | 'Draft' | 'Scheduled' | 'Unpublished';
  author: string;
}

export interface AIAnalysisResult {
  category: string; category_confidence: number; severity: string; severity_confidence: number;
  impact: string; impact_confidence: number; priority: string; risk_score: number;
  safety_detected: boolean; risk_signals: string[]; match_type: string; similarity: number;
  existing_incident_id: string | null; occurrence_count: number; affected_student_count: number;
  incident_pattern: string; recurrence_status: string; recommended_department: string | null;
  recommended_sla: string; incident_id: string;
}
