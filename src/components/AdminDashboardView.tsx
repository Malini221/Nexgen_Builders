import React, { useState } from 'react';
import { TicketReport } from '../types';
import { getCurrentMonthYearIST, formatShortDateIST } from '../utils/dateTimeUtils';

interface AdminDashboardViewProps {
  reports: TicketReport[];
  onOpenReportDetails: (report: TicketReport) => void;
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  reports,
  onOpenReportDetails,
  onNavigateTab,
}) => {
  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);

  // Real database metrics calculation
  const totalReports = reports.length;
  const pendingReview = reports.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;
  const inProgress = reports.filter((r) => r.status === 'In Progress' || r.status === 'Awaiting Verification').length;
  const resolved = reports.filter((r) => r.status === 'Resolved').length;
  const closed = reports.filter((r) => r.status === 'Closed').length;
  const highPriority = reports.filter((r) => r.priority === 'High' || r.priority === 'Critical').length;
  const criticalReports = reports.filter((r) => r.priority === 'Critical' || (r.riskScore && r.riskScore >= 75));

  // SLA & Response Insights (Real calculation)
  const slaOnTime = reports.filter((r) => r.slaStatus === 'On Time' || r.slaStatus === 'Normal' || (!r.slaStatus && r.status !== 'Closed')).length;
  const slaAtRisk = reports.filter((r) => r.slaStatus === 'At Risk' || r.slaStatus === 'Near Breach').length;
  const slaOverdue = reports.filter((r) => r.slaStatus === 'Breached' || r.slaStatus === 'Overdue').length;

  // Workload by Department calculated dynamically
  const deptWorkload = reports.reduce((acc: Record<string, number>, r) => {
    const dept = r.department || 'Infrastructure & Maintenance';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Category counts calculated dynamically
  const categoryCounts = reports.reduce((acc: Record<string, number>, r) => {
    const cat = r.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority counts calculated dynamically
  const priorityCounts = {
    Low: reports.filter((r) => r.priority === 'Low').length,
    Medium: reports.filter((r) => r.priority === 'Medium').length,
    High: reports.filter((r) => r.priority === 'High').length,
    Critical: reports.filter((r) => r.priority === 'Critical').length,
  };

  // Status distribution calculated dynamically
  const statusCounts = {
    Submitted: reports.filter((r) => r.status === 'Submitted').length,
    'Under Review': reports.filter((r) => r.status === 'Under Review' || r.status === 'Analysed').length,
    Assigned: reports.filter((r) => r.status === 'Assigned' || r.status === 'Acknowledged').length,
    'In Progress': reports.filter((r) => r.status === 'In Progress').length,
    Resolved: reports.filter((r) => r.status === 'Resolved' || r.status === 'Verification' || r.status === 'Awaiting Verification').length,
    Closed: reports.filter((r) => r.status === 'Closed').length,
  };

  const recentReports = reports.slice(0, 5);

  // SVG Donut Chart Color Palette
  const categoryColors = [
    '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'
  ];

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pb-12 animate-fadeIn">
      {/* Header Banner matching Premium SaaS Aesthetics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shadow-xs">
            <span className="material-symbols-outlined text-[28px]">dashboard</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Admin Operations &amp; Intelligence
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide border border-primary/20">
                Live Supabase Feed
              </span>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
              Monitor, manage, and make a safer campus for everyone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="font-mono-code text-xs px-3.5 py-2 rounded-xl bg-surface-container text-on-surface-variant font-semibold border border-border-subtle flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {getCurrentMonthYearIST()}
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('admin-reports')}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-title text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">assignment</span>
            <span>Manage Reports</span>
          </button>
        </div>
      </div>

      {/* 6 Real Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Reports */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Total Reports
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">summarize</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
              {totalReports}
            </span>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live DB Record
            </p>
          </div>
        </div>

        {/* Pending Review */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex flex-col justify-between hover:border-amber-400/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Pending Review
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
              {pendingReview}
            </span>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Action Required
            </p>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex flex-col justify-between hover:border-blue-400/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              In Progress
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">engineering</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
              {inProgress}
            </span>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Squad Active
            </p>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex flex-col justify-between hover:border-emerald-400/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Resolved
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
              {resolved}
            </span>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Fix Verified
            </p>
          </div>
        </div>

        {/* Closed */}
        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex flex-col justify-between hover:border-slate-400/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Closed
            </span>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">archive</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
              {closed}
            </span>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Completed Case
            </p>
          </div>
        </div>

        {/* High / Critical Priority */}
        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 shadow-xs flex flex-col justify-between hover:bg-red-50 transition-all group">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-red-700 font-bold">
              High Priority
            </span>
            <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">priority_high</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline-lg text-2xl sm:text-3xl font-bold text-red-800">
              {highPriority}
            </span>
            <p className="text-[10px] text-red-700 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              High Risk Factor
            </p>
          </div>
        </div>
      </div>

      {/* Critical / Safety Alerts Banner (Conditional) */}
      {criticalReports.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <div>
              <h3 className="font-title text-sm font-bold text-red-900">
                Critical Safety Alert: {criticalReports.length} Urgent {criticalReports.length === 1 ? 'Report' : 'Reports'} Require Escalation
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                Highest risk report ID: <span className="font-mono-code font-bold">{criticalReports[0].id}</span> — "{criticalReports[0].title}" ({criticalReports[0].category})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenReportDetails(criticalReports[0])}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Review Critical Ticket
          </button>
        </div>
      )}

      {/* Visual Analytics Row 1: Reports Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports Trend Visualization (7 cols) */}
        <div className="lg:col-span-7 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-title text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
                <span>Reports Trend &amp; Flow Analysis</span>
              </h2>
              <p className="text-xs text-on-surface-variant">Live resolution rate &amp; throughput from Supabase</p>
            </div>
            <span className="text-xs font-mono-code px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant border border-border-subtle">
              Total DB Records: {totalReports}
            </span>
          </div>

          {totalReports === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-subtle rounded-xl bg-surface-container-low">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">analytics</span>
              <p className="text-sm font-semibold text-on-surface">No data available</p>
              <p className="text-xs text-on-surface-variant mt-1">Submit student complaints to populate the trend analytics chart.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Visual Breakdown Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-on-surface">
                  <span>Overall Resolution Completion Rate</span>
                  <span className="font-mono-code font-bold text-emerald-600">
                    {Math.round(((resolved + closed) / totalReports) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden flex p-0.5 border border-border-subtle">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${((resolved + closed) / totalReports) * 100}%` }}
                    title={`Resolved & Closed: ${resolved + closed}`}
                  />
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(inProgress / totalReports) * 100}%` }}
                    title={`In Progress: ${inProgress}`}
                  />
                  <div
                    className="h-full bg-amber-400 rounded-r-full transition-all duration-500"
                    style={{ width: `${(pendingReview / totalReports) * 100}%` }}
                    title={`Pending Review: ${pendingReview}`}
                  />
                </div>
              </div>

              {/* Stat breakdown badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">Resolved / Closed</span>
                  <span className="font-mono-code text-lg font-bold text-emerald-700">{resolved + closed}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">
                    {Math.round(((resolved + closed) / totalReports) * 100)}% of total
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">In Progress</span>
                  <span className="font-mono-code text-lg font-bold text-blue-700">{inProgress}</span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">
                    {Math.round((inProgress / totalReports) * 100)}% of total
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                  <span className="text-[11px] font-bold text-amber-800 uppercase block">Pending Review</span>
                  <span className="font-mono-code text-lg font-bold text-amber-700">{pendingReview}</span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">
                    {Math.round((pendingReview / totalReports) * 100)}% of total
                  </span>
                </div>
              </div>

              {/* SLA Response Insights Card */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">SLA Response Performance</h4>
                    <p className="text-[11px] text-on-surface-variant">Real compliance calculated from submitted dates</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold font-mono-code">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> On Time: {slaOnTime}
                  </span>
                  {slaAtRisk > 0 && (
                    <span className="text-amber-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> At Risk: {slaAtRisk}
                    </span>
                  )}
                  {slaOverdue > 0 && (
                    <span className="text-red-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> Overdue: {slaOverdue}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reports by Category Donut / Progress Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="mb-3">
            <h2 className="font-title text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
              <span>Reports by Category</span>
            </h2>
            <p className="text-xs text-on-surface-variant">Real category distribution across campus</p>
          </div>

          {Object.keys(categoryCounts).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-subtle rounded-xl bg-surface-container-low">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">category</span>
              <p className="text-sm font-semibold text-on-surface">No data available</p>
              <p className="text-xs text-on-surface-variant mt-1">Category breakdown will display when complaints are created.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(categoryCounts).map(([cat, count], idx) => {
                const numCount = Number(count);
                const pct = totalReports > 0 ? Math.round((numCount / totalReports) * 100) : 0;
                const barColor = categoryColors[idx % categoryColors.length];
                const isHovered = activeCategoryHover === cat;

                return (
                  <div
                    key={cat}
                    onMouseEnter={() => setActiveCategoryHover(cat)}
                    onMouseLeave={() => setActiveCategoryHover(null)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isHovered ? 'bg-surface-container border-primary/40 shadow-xs' : 'bg-surface-container-low border-border-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-1.5">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: barColor }} />
                        <span>{cat}</span>
                      </span>
                      <span className="font-mono-code font-bold" style={{ color: barColor }}>
                        {numCount} ticket{numCount > 1 ? 's' : ''} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Visual Analytics Row 2: Status Lifecycle & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Report Status Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
          <div className="mb-4">
            <h2 className="font-title text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
              <span>Report Status Lifecycle</span>
            </h2>
            <p className="text-xs text-on-surface-variant">Real ticket count across lifecycle stages</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div
                key={status}
                className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  {status}
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-mono-code text-xl font-bold text-on-surface">{count}</span>
                  <span className="text-[10px] font-mono-code text-on-surface-variant">
                    {totalReports > 0 ? `${Math.round((count / totalReports) * 100)}%` : '0%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution & SLA Cards (6 cols) */}
        <div className="lg:col-span-6 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="font-title text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">label_important</span>
                <span>Priority Distribution</span>
              </h2>
              <p className="text-xs text-on-surface-variant">Real urgency matrix across all active tickets</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-bold text-slate-700 uppercase block">Low</span>
                <span className="font-mono-code text-xl font-bold text-slate-800">{priorityCounts.Low}</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[11px] font-bold text-blue-700 uppercase block">Medium</span>
                <span className="font-mono-code text-xl font-bold text-blue-800">{priorityCounts.Medium}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[11px] font-bold text-amber-700 uppercase block">High</span>
                <span className="font-mono-code text-xl font-bold text-amber-800">{priorityCounts.High}</span>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
                <span className="text-[11px] font-bold text-red-700 uppercase block">Critical</span>
                <span className="font-mono-code text-xl font-bold text-red-800">{priorityCounts.Critical}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface">Need to update ticket priorities?</span>
            <button
              type="button"
              onClick={() => onNavigateTab('admin-reports')}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Open Manage Reports →
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row 3: Department Workload & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Workload Horizontal Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
          <div className="mb-4">
            <h2 className="font-title text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
              <span>Department Workload</span>
            </h2>
            <p className="text-xs text-on-surface-variant">Real ticket assignment per operational team</p>
          </div>

          <div className="flex flex-col gap-3">
            {Object.keys(deptWorkload).length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border-subtle rounded-xl bg-surface-container-low">
                <p className="text-xs text-on-surface-variant">No active department workload</p>
              </div>
            ) : (
              Object.entries(deptWorkload).map(([dept, count]) => {
                const numCount = Number(count);
                const pct = totalReports > 0 ? Math.round((numCount / totalReports) * 100) : 0;
                return (
                  <div key={dept} className="p-3 rounded-xl bg-surface-container-low border border-border-subtle">
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-1.5">
                      <span className="truncate pr-2">{dept}</span>
                      <span className="font-mono-code font-bold text-primary shrink-0">{numCount} ticket{numCount > 1 ? 's' : ''} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Reports Activity Feed (7 cols) */}
        <div className="lg:col-span-7 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-title text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <span>Recent Report Activity Feed</span>
              </h2>
              <p className="text-xs text-on-surface-variant">Latest student complaints from database</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('admin-reports')}
              className="font-title text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {recentReports.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-border-subtle rounded-xl bg-surface-container-low">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">inbox</span>
                <p className="text-sm font-semibold text-on-surface">No data available</p>
                <p className="text-xs text-on-surface-variant mt-1">Submitted reports will be logged in this feed.</p>
              </div>
            ) : (
              recentReports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onOpenReportDetails(r)}
                  className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-border-subtle transition-all flex items-center justify-between gap-3 cursor-pointer group hover:shadow-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-mono-code text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/20">
                      {r.id}
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                        {r.title}
                      </span>
                      <span className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        By {r.reporterName} • {r.reportedDate} • Category: <strong className="text-on-surface">{r.category}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'Resolved' || r.status === 'Closed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {r.status}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                      chevron_right
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
