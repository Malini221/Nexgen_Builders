import React from 'react';
import { NavigationTab, UserProfile } from '../types';

export interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  activeTicketsCount: number;
  unreadNotificationsCount: number;
  onOpenSosModal: () => void;
  userProfile: UserProfile;
  userRole?: 'student' | 'admin';
  onToggleUserRole?: (role: 'student' | 'admin') => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeTicketsCount,
  unreadNotificationsCount,
  onOpenSosModal,
  userProfile,
  userRole = 'student',
  onToggleUserRole,
  mobileMenuOpen,
  setMobileMenuOpen,
  onSignOut,
}) => {
  const studentNavItems: Array<{ id: NavigationTab; label: string; icon: string; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'report-problem', label: 'Report Problem', icon: 'add_circle' },
    { id: 'my-reports', label: 'My Reports', icon: 'assignment', badge: activeTicketsCount > 0 ? `${activeTicketsCount} active` : undefined },
    { id: 'facilities', label: 'Campus Facilities', icon: 'domain' },
    { id: 'feedback', label: 'Feedback & Voice', icon: 'rate_review' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const adminNavItems: Array<{ id: NavigationTab; label: string; icon: string; badge?: string }> = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'admin-reports', label: 'Manage Reports', icon: 'assignment_turned_in' },
    { id: 'admin-students', label: 'Students', icon: 'group' },
    { id: 'admin-departments', label: 'Departments', icon: 'apartment' },
    { id: 'admin-analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'admin-announcements', label: 'Announcements', icon: 'campaign' },
    { id: 'admin-settings', label: 'System Settings', icon: 'settings' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : studentNavItems;

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside className={`fixed left-0 top-0 h-full w-64 lg:w-72 bg-surface-card border-r border-border-subtle shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between p-4 transition-transform duration-200 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick(userRole === 'admin' ? 'admin-dashboard' : 'dashboard')}>
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-[0_1px_4px_rgba(0,68,39,0.2)]"><span className="material-symbols-outlined text-[19px]">account_balance</span></div>
              <div className="flex flex-col"><span className="font-headline-sm text-base font-bold text-primary tracking-tight leading-tight">NexCampus</span><span className="font-mono-code text-[10.5px] uppercase tracking-wider text-on-surface-variant font-medium leading-none mt-0.5">{userRole === 'admin' ? 'Admin Panel' : 'Portal 2.4'}</span></div>
            </div>
            <span className={`px-2 py-0.5 rounded-full font-mono-code text-[10px] font-semibold tracking-wider ${userRole === 'admin' ? 'bg-primary-container text-white' : 'bg-surface-container text-on-surface-variant'}`}>
              {userRole === 'admin' ? 'ADMIN' : 'STUDENT'}
            </span>
          </div>
          <nav className="flex flex-col gap-1 mt-4">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return <button key={item.id} onClick={() => handleNavClick(item.id)} type="button" className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${isActive ? 'bg-primary-container text-white font-semibold shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
                <div className="flex items-center gap-2.5"><span className={`material-symbols-outlined text-[19px] ${isActive ? 'text-white' : 'text-on-surface-variant'}`}>{item.icon}</span><span className="text-sm font-medium">{item.label}</span></div>
                {isActive ? <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90" /> : item.badge ? <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono-code text-[10px] font-medium">{item.badge}</span> : null}
              </button>;
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
          {onToggleUserRole && (
            <button
              onClick={() => onToggleUserRole(userRole === 'admin' ? 'student' : 'admin')}
              type="button"
              className="w-full px-3 py-2 rounded-xl text-primary hover:bg-primary/10 transition-colors flex items-center justify-between font-label-md text-xs font-semibold cursor-pointer border border-primary/20"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
                <span>{userRole === 'admin' ? 'Switch to Student View' : 'Switch to Admin View'}</span>
              </div>
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              type="button"
              className="w-full px-3 py-2 rounded-xl text-on-surface-variant hover:bg-status-urgent-bg hover:text-status-urgent-fg transition-colors flex items-center justify-between font-label-md text-xs font-semibold cursor-pointer border border-transparent hover:border-red-200"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sign Out</span>
              </div>
              <span className="font-mono-code text-[10px] uppercase text-outline">Exit</span>
            </button>
          )}

          <div onClick={() => handleNavClick(userRole === 'admin' ? 'admin-settings' : 'settings')} className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between border border-border-subtle cursor-pointer transition-colors">
            <div className="flex items-center gap-2 min-w-0"><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 font-medium text-xs shadow-xs">AD</div><div className="flex flex-col min-w-0"><span className="text-xs font-semibold truncate text-on-surface leading-tight">{userProfile.name}</span><span className="text-[11px] text-on-surface-variant font-mono-code truncate leading-tight mt-0.5">{userRole === 'admin' ? 'Campus Admin' : userProfile.studentId}</span></div></div>
            <span className="w-2 h-2 rounded-full bg-status-resolved-fg shrink-0 mr-1" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
