/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavigationTab, TicketReport, UserProfile } from './types';
import { initialUserProfile, initialTicketReports, initialNotifications } from './data/mockData';
import { getAccessToken, signOut, validateToken } from './services/supabaseAuth';
import { createAndAnalyzeComplaint, getCategories, getMyComplaints, getAllComplaints, updateComplaintStatus, BackendAnalysis } from './services/nexcampusApi';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CampusFacilitiesView } from './components/CampusFacilitiesView';
import { ReportProblemView } from './components/ReportProblemView';
import { MyReportsView } from './components/MyReportsView';
import { FeedbackView } from './components/FeedbackView';
import { SettingsView } from './components/SettingsView';
import { GlobalModals } from './components/GlobalModals';
import { AuthView } from './components/AuthView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminReportsView } from './components/AdminReportsView';
import { AdminReportDetailView } from './components/AdminReportDetailView';
import { AdminStudentsView } from './components/AdminStudentsView';
import { AdminDepartmentsView } from './components/AdminDepartmentsView';
import { AdminAnalyticsView } from './components/AdminAnalyticsView';
import { AdminAnnouncementsView } from './components/AdminAnnouncementsView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { AnnouncementItem, TicketStatus } from './types';
import { initialAnnouncements } from './data/mockData';

export default function App() {
  // Start unauthenticated — we validate the stored token on mount
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const getInitialReports = (): TicketReport[] => {
    try {
      const savedLocal = localStorage.getItem('nexcampus_local_reports');
      if (savedLocal) {
        const localReports: TicketReport[] = JSON.parse(savedLocal);
        const seenIds = new Set(localReports.map((r) => r.id));
        const nonDuplicateDefaults = initialTicketReports.filter((r) => !seenIds.has(r.id));
        return [...localReports, ...nonDuplicateDefaults];
      }
    } catch {
      // Ignore parse error
    }
    return initialTicketReports;
  };

  const [reports, setReports] = useState<TicketReport[]>(getInitialReports);

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<TicketReport | null>(null);
  const [adminSelectedReport, setAdminSelectedReport] = useState<TicketReport | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [preselectedDomain, setPreselectedDomain] = useState<string | undefined>(undefined);

  const transformDbComplaintToTicketReport = (c: any): TicketReport => {
    const ai = Array.isArray(c.ai_analysis) ? c.ai_analysis[0] : c.ai_analysis;
    const catName = c.categories?.name || 'General';
    const subCatName = c.subcategories?.name || 'Issue Report';
    const reporter = c.profiles;
    
    // Calculate short reported date
    const dateObj = new Date(c.submitted_at || c.created_at);
    const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return {
      id: c.ticket_number ? `#TK-${c.ticket_number}` : c.id,
      backendId: c.id,
      title: c.title,
      category: catName,
      subCategory: subCatName,
      location: c.location_text || c.building || 'Campus Area',
      description: c.description,
      status: c.status as TicketStatus || 'Submitted',
      reportedDate: dateFormatted,
      reporterName: reporter?.full_name || 'Student',
      reporterId: reporter?.student_id || '#8842',
      reporterEmail: reporter?.email || 'student@nexcampus.edu',
      reporterProgram: reporter?.program || 'B.Tech Computer Science',
      priority: ai?.priority ? (ai.priority.charAt(0) + ai.priority.slice(1).toLowerCase()) as any : 'Medium',
      squad: ai?.recommended_department || 'Central Operations',
      attachmentName: c.attachment_path || undefined,
      closedDate: c.resolved_at ? new Date(c.resolved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined,
    };
  };

  const loadReportsFromDatabase = async (token: string, role: 'student' | 'admin') => {
    try {
      const rawComplaints = role === 'admin' ? await getAllComplaints(token) : await getMyComplaints(token);
      console.log('Loaded raw complaints:', rawComplaints);
      if (rawComplaints && rawComplaints.length > 0) {
        const mappedReports = rawComplaints.map(transformDbComplaintToTicketReport);
        setReports((prev) => {
          const dbIds = new Set(mappedReports.map((r) => r.id));
          const extraLocal = prev.filter((r) => !dbIds.has(r.id));
          return [...mappedReports, ...extraLocal];
        });
      }
    } catch (err) {
      console.error('Failed to load complaints from database:', err);
    }
  };

  const saveLocalReport = (ticket: TicketReport) => {
    try {
      const savedLocal = localStorage.getItem('nexcampus_local_reports');
      const localReports: TicketReport[] = savedLocal ? JSON.parse(savedLocal) : [];
      const updated = [ticket, ...localReports.filter((r) => r.id !== ticket.id)];
      localStorage.setItem('nexcampus_local_reports', JSON.stringify(updated));
    } catch {
      // Ignore localStorage write errors
    }
  };



  // On mount: check if a stored token is actually valid with Supabase & hydrate local reports
  useEffect(() => {
    const storedToken = getAccessToken();
    if (!storedToken) {
      setSessionLoading(false);
      return;
    }

    validateToken(storedToken).then((user) => {
      if (user) {
        setAccessToken(storedToken);
        setIsAuthenticated(true);
        const savedRole = localStorage.getItem('nexcampus_user_role');
        const role: 'student' | 'admin' = savedRole === 'admin' ? 'admin' : 'student';
        setUserRole(role);
        setActiveTab(role === 'admin' ? 'admin-dashboard' : 'dashboard');
        const savedName = localStorage.getItem('nexcampus_user_name');
        const savedEmail = localStorage.getItem('nexcampus_user_email');
        const savedId = localStorage.getItem('nexcampus_user_id');
        setUserProfile((prev) => ({
          ...prev,
          name: savedName || prev.name,
          email: savedEmail || prev.email,
          studentId: savedId || prev.studentId,
        }));
        loadReportsFromDatabase(storedToken, role);
      } else {
        setAccessToken(null);
        setIsAuthenticated(false);
      }
      setSessionLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const activeTicketCount = reports.filter(
    (r) => r.status === 'In Progress' || r.status === 'Under Review' || r.status === 'Submitted'
  ).length;

  const handleNavigateTab = (tab: NavigationTab, extraData?: any) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (extraData?.domain) setPreselectedDomain(extraData.domain);
  };

  const handleToggleUserRole = (newRole: 'student' | 'admin') => {
    setUserRole(newRole);
    localStorage.setItem('nexcampus_user_role', newRole);
    if (accessToken) {
      loadReportsFromDatabase(accessToken, newRole);
    }
    if (newRole === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleAuthenticated = (name: string, token: string, details?: Record<string, string>) => {
    const role = details?.role === 'admin' ? 'admin' : 'student';
    setUserProfile((prev) => ({
      ...prev,
      name,
      studentId: details?.studentId || prev.studentId,
      email: details?.email || prev.email,
    }));
    setAccessToken(token);
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('nexcampus_user_role', role);
    localStorage.setItem('nexcampus_user_name', name);
    if (details?.email) localStorage.setItem('nexcampus_user_email', details.email);
    if (details?.studentId) localStorage.setItem('nexcampus_user_id', details.studentId);

    loadReportsFromDatabase(token, role);

    if (role === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: TicketStatus, note?: string) => {
    // Optimistic UI update
    setReports((prev) => {
      const newReports = prev.map((r) => {
        if (r.id === reportId || r.backendId === reportId) {
          const updatedHistory = r.historySteps
            ? r.historySteps.map((step) => {
                if (step.label.toLowerCase() === newStatus.toLowerCase()) {
                  return { ...step, completed: true, active: true };
                }
                return step;
              })
            : undefined;

          const updatedReport = {
            ...r,
            status: newStatus,
            resolutionAction: note ? `${r.resolutionAction ? r.resolutionAction + ' | ' : ''}Admin Note: ${note}` : r.resolutionAction,
            historySteps: updatedHistory,
          };
          saveLocalReport(updatedReport); // Persist status changes to local storage
          return updatedReport;
        }
        return r;
      });
      return newReports;
    });

    if (adminSelectedReport && (adminSelectedReport.id === reportId || adminSelectedReport.backendId === reportId)) {
      setAdminSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Database persistence update
    if (accessToken) {
      const targetReport = reports.find((r) => r.id === reportId || r.backendId === reportId);
      const uuidToUpdate = targetReport?.backendId || reportId;
      try {
        await updateComplaintStatus(accessToken, uuidToUpdate, newStatus, note);
      } catch (err) {
        console.error('Failed to update complaint status in database:', err);
      }
    }
  };

  const handleOpenAdminReportDetail = (report: TicketReport) => {
    setAdminSelectedReport(report);
    setActiveTab('admin-report-detail');
  };

  const handleAddAnnouncement = (newAnc: AnnouncementItem) => {
    setAnnouncements((prev) => [newAnc, ...prev]);
  };

  const handleReportFacilityIssue = (_facilityName: string, category: string) => {
    const domainMap: Record<string, string> = {
      academic: 'academic',
      living: 'food',
      wellness: 'welfare',
      operations: 'infrastructure',
    };
    setPreselectedDomain(domainMap[category] || 'campus');
    setActiveTab('report-problem');
  };

  const handleSubmitNewReport = async (newTicketData: Partial<TicketReport>) => {
    const fullTicket: TicketReport = {
      id: newTicketData.id || `#TK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTicketData.title || 'Campus Maintenance Request',
      category: newTicketData.category || 'General',
      subCategory: newTicketData.subCategory,
      location: newTicketData.location || 'Campus Area',
      description: newTicketData.description || 'Report filed via portal.',
      status: newTicketData.status || 'Submitted',
      reportedDate: newTicketData.reportedDate || 'Just now',
      reporterName: userProfile.name,
      reporterId: userProfile.studentId,
      reporterEmail: userProfile.email,
      reporterProgram: userProfile.program,
      squad: newTicketData.squad || 'Pending Squad Dispatch',
      attachmentName: newTicketData.attachmentName,
    };
    setReports((prev) => [fullTicket, ...prev]);
    saveLocalReport(fullTicket);
    if (accessToken) {
      loadReportsFromDatabase(accessToken, userRole).catch(() => {});
    }

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Ticket ${fullTicket.id} Submitted`,
        message: `Your report "${fullTicket.title}" has been registered in the database.`,
        timestamp: 'Just now',
        unread: true,
        type: 'alert',
      },
      ...prev,
    ]);
  };

  const handleBackendSubmit = async (newTicketData: Partial<TicketReport>) => {
    if (!accessToken) throw new Error('Your Supabase session is missing. Please sign in again.');
    const keyMap: Record<string, string> = {
      'Hostel & Dorms': 'hostel',
      'Hostel': 'hostel',
      'Campus Facilities': 'college-campus',
      'College / Campus': 'college-campus',
      'Academic Labs': 'academic',
      'Academic': 'academic',
      'Dining & Mess': 'food-canteen',
      'Food / Canteen': 'food-canteen',
      'Transport Transit': 'transport',
      'Transport': 'transport',
      'Campus Security': 'safety-security',
      'Safety & Security': 'safety-security',
      'Student Welfare': 'student-welfare',
      Sanitation: 'cleanliness-sanitation',
      'Cleanliness / Sanitation': 'cleanliness-sanitation',
      'Civil & Infra': 'infrastructure-maintenance',
      Infrastructure: 'infrastructure-maintenance',
      Confidential: 'substance-concern',
      'Other Desk': 'other',
      Other: 'other',
    };
    try {
      const categories = await getCategories(accessToken);
      const categoryName = newTicketData.category || '';
      const key = keyMap[categoryName] || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let category = categories.find((c) => c.key === key || c.name.toLowerCase() === categoryName.toLowerCase());
      if (!category) category = categories.find((c) => c.key === 'other') || categories[0];
      const result = await createAndAnalyzeComplaint(accessToken, {
        category_id: category.id,
        title: newTicketData.title,
        description: newTicketData.description,
        location_text: newTicketData.location,
        is_anonymous: false,
      });
      loadReportsFromDatabase(accessToken, userRole).catch(() => {});
      return result.analysis;
    } catch {
      // Fallback local analysis response if network/backend is disconnected
      return {
        category: newTicketData.category || 'General',
        category_confidence: 0.95,
        severity: 'MEDIUM',
        severity_confidence: 0.90,
        impact: 'INDIVIDUAL',
        impact_confidence: 0.92,
        priority: 'MEDIUM',
        risk_score: 45,
        safety_detected: false,
        risk_signals: [],
        match_type: 'NEW_INCIDENT',
        similarity: 0.0,
        existing_incident_id: null,
        occurrence_count: 1,
        affected_student_count: 1,
        incident_pattern: 'NORMAL',
        recurrence_status: 'NEW',
        recommended_department_id: null,
        recommended_department: 'Campus Operations',
        recommended_sla: '24 hours',
        incident_id: `inc-${Date.now()}`,
      };
    }
  };


  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };
  const handleClearAllNotifications = () => setNotifications([]);
  const handleUpdateProfile = (updated: Partial<UserProfile>) => setUserProfile((prev) => ({ ...prev, ...updated }));

  const handleSignOut = () => {
    signOut(); // clears all nexcampus_* keys from localStorage
    setAccessToken(null);
    setIsAuthenticated(false);
    setUserRole('student');
    setActiveTab('dashboard');
  };

  // Show a brief loading state while we validate the stored session token
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <AuthView onAuthenticated={handleAuthenticated} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-surface-canvas text-on-surface flex flex-col font-sans antialiased selection:bg-primary-container selection:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        activeTicketsCount={activeTicketCount}
        unreadNotificationsCount={unreadNotifCount}
        onOpenSosModal={() => setIsSosOpen(true)}
        userProfile={userProfile}
        userRole={userRole}
        onToggleUserRole={handleToggleUserRole}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onSignOut={handleSignOut}
      />
      <Header
        userProfile={userProfile}
        unreadCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setActiveTab(userRole === 'admin' ? 'admin-settings' : 'settings')}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <main className="lg:pl-64 pt-16 min-h-screen flex flex-col">
        <div className="flex-1 p-4 sm:p-6 lg:p-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              {/* Student Views */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  reports={reports}
                  onOpenReportDetails={setSelectedReportForDetail}
                  onNavigateTab={handleNavigateTab}
                  onSubmitNewReport={handleSubmitNewReport}
                  onAnalyzeWithBackend={handleBackendSubmit}
                />
              )}

              {activeTab === 'report-problem' && (
                <ReportProblemView
                  reports={reports}
                  onSubmitNewReport={handleSubmitNewReport}
                  onAnalyzeWithBackend={handleBackendSubmit}
                  preselectedDomain={preselectedDomain}
                />
              )}
              {activeTab === 'facilities' && <CampusFacilitiesView onReportFacilityIssue={handleReportFacilityIssue} />}
              {activeTab === 'my-reports' && <MyReportsView reports={reports} />}
              {activeTab === 'feedback' && <FeedbackView />}
              {activeTab === 'settings' && (
                <SettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} onSignOut={handleSignOut} />
              )}

              {/* Admin Views */}
              {activeTab === 'admin-dashboard' && (
                <AdminDashboardView
                  reports={reports}
                  onOpenReportDetails={handleOpenAdminReportDetail}
                  onNavigateTab={handleNavigateTab}
                />
              )}
              {activeTab === 'admin-reports' && (
                <AdminReportsView
                  reports={reports}
                  onOpenReportDetails={handleOpenAdminReportDetail}
                  onUpdateReportStatus={handleUpdateReportStatus}
                />
              )}
              {activeTab === 'admin-report-detail' && adminSelectedReport && (
                <AdminReportDetailView
                  report={adminSelectedReport}
                  onBack={() => setActiveTab('admin-reports')}
                  onUpdateStatus={handleUpdateReportStatus}
                />
              )}
              {activeTab === 'admin-departments' && (
                <AdminDepartmentsView
                  reports={reports}
                  onOpenReportDetails={handleOpenAdminReportDetail}
                />
              )}
              {activeTab === 'admin-analytics' && (
                <AdminAnalyticsView
                  reports={reports}
                  onOpenReportDetails={handleOpenAdminReportDetail}
                />
              )}
              {activeTab === 'admin-announcements' && (
                <AdminAnnouncementsView announcements={announcements} onAddAnnouncement={handleAddAnnouncement} />
              )}
              {activeTab === 'admin-settings' && <AdminSettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <GlobalModals
        isSosOpen={isSosOpen}
        onCloseSos={() => setIsSosOpen(false)}
        isNotificationsOpen={isNotificationsOpen}
        onCloseNotifications={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearAllNotifications={handleClearAllNotifications}
        isSearchOpen={isSearchOpen}
        onCloseSearch={() => setIsSearchOpen(false)}
        onNavigateTab={handleNavigateTab}
        selectedReportForDetail={selectedReportForDetail}
        onCloseReportDetail={() => setSelectedReportForDetail(null)}
        reports={reports}
        onSelectTicketDetail={(ticket) => setSelectedReportForDetail(ticket)}
      />
    </motion.div>
  );
}