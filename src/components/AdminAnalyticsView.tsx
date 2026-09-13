import React, { useState, useMemo } from 'react';
import { TicketReport } from '../types';

interface AdminAnalyticsViewProps {
  reports: TicketReport[];
  onOpenReportDetails?: (report: TicketReport) => void;
}

type DateRangeFilter = '7d' | '30d' | '90d' | 'year' | 'all';

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  reports,
  onOpenReportDetails,
}) => {
  // Global Filters
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Active filter count check
  const isFiltered =
    dateRange !== 'all' ||
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all' ||
    selectedDepartment !== 'all';

  const handleClearFilters = () => {
    setDateRange('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedDepartment('all');
  };

  // Helper to extract clean dates
  const parseReportDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return new Date(parsed);
    
    // Relative string parsing heuristic for demo fallback
    const now = new Date();
    const lower = dateStr.toLowerCase();
    if (lower.includes('yesterday')) {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      return d;
    }
    if (lower.includes('today')) return now;
    return null;
  };

  // Filter Reports dynamically based on selected criteria
  const filteredReports = useMemo(() => {
    const now = new Date();

    return reports.filter((r) => {
      // Date Range Filter
      if (dateRange !== 'all') {
        const rDate = parseReportDate(r.reportedDate);
        if (rDate) {
          const diffDays = (now.getTime() - rDate.getTime()) / (1000 * 3600 * 24);
          if (dateRange === '7d' && diffDays > 7) return false;
          if (dateRange === '30d' && diffDays > 30) return false;
          if (dateRange === '90d' && diffDays > 90) return false;
          if (dateRange === 'year' && diffDays > 365) return false;
        }
      }

      // Category Filter
      if (selectedCategory !== 'all') {
        if ((r.category || '').toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Status Filter
      if (selectedStatus !== 'all') {
        if ((r.status || '').toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }

      // Priority Filter
      if (selectedPriority !== 'all') {
        const rPriority = r.priority || r.aiAnalysis?.priority || 'Low';
        if (rPriority.toLowerCase() !== selectedPriority.toLowerCase()) return false;
      }

      // Department Filter
      if (selectedDepartment !== 'all') {
        const dept = r.department || r.squad || r.aiAnalysis?.recommended_department || 'Unassigned';
        if (!dept.toLowerCase().includes(selectedDepartment.toLowerCase())) return false;
      }

      return true;
    });
  }, [reports, dateRange, selectedCategory, selectedStatus, selectedPriority, selectedDepartment]);

  // Derived Key Metrics
  const totalCount = filteredReports.length;

  const pendingCount = filteredReports.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under Review'
  ).length;

  const inProgressCount = filteredReports.filter(
    (r) => r.status === 'In Progress' || r.status === 'Awaiting Verification'
  ).length;

  const resolvedCount = filteredReports.filter((r) => r.status === 'Resolved').length;

  const closedCount = filteredReports.filter((r) => r.status === 'Closed').length;

  const resolutionRate =
    totalCount > 0 ? Math.round(((resolvedCount + closedCount) / totalCount) * 100) : 0;

  // Category Distribution
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReports.forEach((r) => {
      const cat = r.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredReports, totalCount]);

  // Status Distribution
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReports.forEach((r) => {
      const st = r.status || 'Submitted';
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    }));
  }, [filteredReports, totalCount]);

  // Priority Breakdown
  const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    filteredReports.forEach((r) => {
      const p = r.priority || r.aiAnalysis?.priority || 'Low';
      if (counts[p] !== undefined) {
        counts[p] += 1;
      } else {
        counts['Low'] += 1;
      }
    });
    return counts;
  }, [filteredReports]);

  // Department Workload Breakdown
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReports.forEach((r) => {
      const dept = r.department || r.squad || r.aiAnalysis?.recommended_department || 'Unassigned';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredReports]);

  // Severity Breakdown (from AI or Risk score)
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    filteredReports.forEach((r) => {
      const sev = r.aiAnalysis?.severity || (r.riskScore && r.riskScore > 70 ? 'High' : r.riskScore && r.riskScore > 40 ? 'Medium' : 'Low');
      if (counts[sev] !== undefined) {
        counts[sev] += 1;
      } else {
        counts['Low'] += 1;
      }
    });
    return counts;
  }, [filteredReports]);

  // SLA Performance Calculation
  const slaMetrics = useMemo(() => {
    let withinSLA = 0;
    let atRisk = 0;
    let overdue = 0;

    filteredReports.forEach((r) => {
      if (r.status === 'Resolved' || r.status === 'Closed') {
        withinSLA += 1;
      } else if (r.priority === 'Critical' || r.priority === 'High') {
        overdue += 1;
      } else if (r.status === 'In Progress') {
        atRisk += 1;
      } else {
        withinSLA += 1;
      }
    });

    return { withinSLA, atRisk, overdue };
  }, [filteredReports]);

  // Daily Trend Datapoints (Real Data)
  const trendData = useMemo(() => {
    const countsByDate: Record<string, number> = {};
    
    // Sort reports by date
    const sorted = [...filteredReports].sort((a, b) => {
      const dA = parseReportDate(a.reportedDate)?.getTime() || 0;
      const dB = parseReportDate(b.reportedDate)?.getTime() || 0;
      return dA - dB;
    });

    sorted.forEach((r) => {
      const d = parseReportDate(r.reportedDate);
      const label = d ? `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}` : 'Recent';
      countsByDate[label] = (countsByDate[label] || 0) + 1;
    });

    return Object.entries(countsByDate).map(([date, count]) => ({ date, count }));
  }, [filteredReports]);

  // Dynamic AI Key Insights Generator
  const aiInsights = useMemo(() => {
    const insights: { type: 'alert' | 'warning' | 'info' | 'success'; title: string; desc: string; icon: string }[] = [];

    if (totalCount === 0) {
      insights.push({
        type: 'info',
        title: 'No Data Available',
        desc: 'There are currently no reports matching the active filter criteria.',
        icon: 'info',
      });
      return insights;
    }

    // Insight 1: Most Reported Category
    if (categoryCounts.length > 0) {
      const topCat = categoryCounts[0];
      insights.push({
        type: 'info',
        title: 'Most Reported Category',
        desc: `${topCat.name} is currently the top category with ${topCat.count} report${topCat.count > 1 ? 's' : ''} (${topCat.percentage}% of total).`,
        icon: 'analytics',
      });
    }

    // Insight 2: High/Critical Priority Alert
    const criticalCount = (priorityCounts['High'] || 0) + (priorityCounts['Critical'] || 0);
    if (criticalCount > 0) {
      insights.push({
        type: 'warning',
        title: 'Priority Attention Required',
        desc: `${criticalCount} high or critical priority report${criticalCount > 1 ? 's require' : ' requires'} immediate operational dispatch.`,
        icon: 'warning',
      });
    }

    // Insight 3: SLA Status
    if (slaMetrics.overdue > 0) {
      insights.push({
        type: 'alert',
        title: 'SLA Overdue Warning',
        desc: `${slaMetrics.overdue} active issue${slaMetrics.overdue > 1 ? 's have' : ' has'} exceeded target SLA resolution windows.`,
        icon: 'schedule',
      });
    } else if (resolutionRate >= 80) {
      insights.push({
        type: 'success',
        title: 'High Resolution Efficiency',
        desc: `Campus operational resolution rate is running at a strong ${resolutionRate}%.`,
        icon: 'check_circle',
      });
    }

    // Insight 4: Recurring Issues (AI detected)
    const recurringReport = filteredReports.find((r) => r.aiAnalysis?.occurrence_count && r.aiAnalysis.occurrence_count > 1);
    if (recurringReport) {
      insights.push({
        type: 'alert',
        title: 'Recurring Incident Pattern',
        desc: `Incident "${recurringReport.title}" has been flagged by AI as recurring (${recurringReport.aiAnalysis?.occurrence_count} occurrences).`,
        icon: 'repeat',
      });
    }

    return insights;
  }, [totalCount, categoryCounts, priorityCounts, slaMetrics, resolutionRate, filteredReports]);

  // Palette colors for charts
  const categoryColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pb-16">
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono-code text-xs font-bold text-primary uppercase tracking-wider">
            SYSTEM METRICS &amp; INSIGHTS
          </span>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight leading-tight mt-0.5">
            Analytics &amp; Insights
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Live data-driven campus operational and maintenance telemetry.
          </p>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              className="px-3 py-2 rounded-xl bg-surface-card border border-border-subtle text-on-surface font-label-md text-xs font-semibold shadow-xs hover:border-border-hover transition-colors cursor-pointer appearance-none pr-8"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-[18px] text-on-surface-variant pointer-events-none">
              calendar_today
            </span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-card border border-border-subtle text-on-surface font-label-md text-xs font-semibold shadow-xs hover:border-border-hover transition-colors cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="hostel">Hostel</option>
            <option value="student-welfare">Student Welfare</option>
            <option value="transport">Transport</option>
            <option value="college-campus">College / Campus</option>
            <option value="food-canteen">Food / Canteen</option>
            <option value="safety-security">Safety &amp; Security</option>
            <option value="cleanliness-sanitation">Cleanliness &amp; Sanitation</option>
            <option value="infrastructure-maintenance">Infrastructure</option>
            <option value="academic">Academic</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-card border border-border-subtle text-on-surface font-label-md text-xs font-semibold shadow-xs hover:border-border-hover transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under review">Under Review</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface-card border border-border-subtle text-on-surface font-label-md text-xs font-semibold shadow-xs hover:border-border-hover transition-colors cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-label-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Quote Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-surface-card border border-emerald-100/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
          <span className="font-title text-xs italic text-emerald-900 font-semibold">
            "Insights today, a cleaner, safer campus tomorrow."
          </span>
        </div>
        <span className="font-mono-code text-[11px] text-emerald-700 font-bold hidden sm:inline">
          {totalCount} Real Record{totalCount !== 1 ? 's' : ''} Analyzed
        </span>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* TOTAL REPORTS */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
              Total Reports
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">article</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-on-surface">
              {totalCount}
            </span>
            <span className="block text-[10px] text-on-surface-variant mt-0.5">Live Database</span>
          </div>
        </div>

        {/* PENDING */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] uppercase text-amber-600 font-bold tracking-wider">
              Pending
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-amber-700">
              {pendingCount}
            </span>
            <span className="block text-[10px] text-amber-600 mt-0.5">Awaiting Triage</span>
          </div>
        </div>

        {/* IN PROGRESS */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] uppercase text-blue-600 font-bold tracking-wider">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">build</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-blue-700">
              {inProgressCount}
            </span>
            <span className="block text-[10px] text-blue-600 mt-0.5">Squad Assigned</span>
          </div>
        </div>

        {/* RESOLVED */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] uppercase text-emerald-600 font-bold tracking-wider">
              Resolved
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {resolvedCount}
            </span>
            <span className="block text-[10px] text-emerald-600 mt-0.5">Work Completed</span>
          </div>
        </div>

        {/* CLOSED */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] uppercase text-slate-600 font-bold tracking-wider">
              Closed
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">lock</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-slate-700">
              {closedCount}
            </span>
            <span className="block text-[10px] text-slate-500 mt-0.5">Verified &amp; Archived</span>
          </div>
        </div>

        {/* RESOLUTION RATE */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[10px] uppercase text-primary font-bold tracking-wider">
              Resolution Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-primary">
              {resolutionRate}%
            </span>
            <span className="block text-[10px] text-primary mt-0.5">Target &ge;85% SLA</span>
          </div>
        </div>
      </div>

      {/* ROW 1 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Trend Line Chart */}
        <div className="lg:col-span-1 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline-md text-base font-bold text-on-surface">Reports Trend</h3>
              <span className="font-mono-code text-[11px] text-on-surface-variant font-semibold">Live Submissions</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">Reports submitted over time</p>
          </div>

          {trendData.length > 0 ? (
            <div className="mt-6">
              <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2 border-b border-l border-border-subtle relative">
                {/* SVG Area Line background */}
                <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    points={trendData.map((d, idx) => {
                      const x = (idx / Math.max(trendData.length - 1, 1)) * 100;
                      const maxVal = Math.max(...trendData.map((t) => t.count), 1);
                      const y = 100 - (d.count / maxVal) * 80;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                </svg>

                {trendData.map((item, idx) => {
                  const maxVal = Math.max(...trendData.map((t) => t.count), 1);
                  const barHeight = Math.max(Math.round((item.count / maxVal) * 100), 15);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 z-10 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white font-mono-code text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                        {item.date}: {item.count} report{item.count !== 1 ? 's' : ''}
                      </div>
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-full max-w-[18px] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all group-hover:from-emerald-600 group-hover:to-teal-500"
                      />
                      <span className="font-mono-code text-[9px] text-on-surface-variant truncate w-full text-center">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-on-surface-variant py-8">
              <span className="material-symbols-outlined text-[32px] opacity-40">show_chart</span>
              <span className="font-body-sm text-xs mt-1">No report trend data available</span>
            </div>
          )}
        </div>

        {/* Reports by Category Donut */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline-md text-base font-bold text-on-surface">Reports by Category</h3>
              <span className="font-mono-code text-[11px] text-on-surface-variant font-semibold">{categoryCounts.length} Active</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">Distribution across campus categories</p>
          </div>

          {categoryCounts.length > 0 ? (
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              {/* Ring / Donut Visual */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-low"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {categoryCounts.map((cat, idx) => {
                    const prevSum = categoryCounts.slice(0, idx).reduce((acc, c) => acc + c.percentage, 0);
                    const strokeDasharray = `${cat.percentage}, 100`;
                    const strokeDashoffset = -prevSum;
                    return (
                      <path
                        key={idx}
                        stroke={categoryColors[idx % categoryColors.length]}
                        strokeWidth="4"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-headline-lg text-lg font-bold text-on-surface leading-none">{totalCount}</span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant uppercase mt-0.5">Reports</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex flex-col gap-1.5 min-w-0 flex-1 w-full">
                {categoryCounts.slice(0, 5).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: categoryColors[idx % categoryColors.length] }} />
                      <span className="font-medium text-on-surface truncate">{cat.name}</span>
                    </div>
                    <span className="font-mono-code font-bold text-on-surface-variant shrink-0">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-on-surface-variant py-8">
              <span className="material-symbols-outlined text-[32px] opacity-40">pie_chart</span>
              <span className="font-body-sm text-xs mt-1">No category data available</span>
            </div>
          )}
        </div>

        {/* Reports by Status */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline-md text-base font-bold text-on-surface">Reports by Status</h3>
              <span className="font-mono-code text-[11px] text-on-surface-variant font-semibold">{statusCounts.length} Statuses</span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">Current operational status distribution</p>
          </div>

          {statusCounts.length > 0 ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {statusCounts.map((st, idx) => {
                const getStatusColor = (name: string) => {
                  const lower = name.toLowerCase();
                  if (lower.includes('resolved')) return 'bg-emerald-500';
                  if (lower.includes('progress')) return 'bg-blue-500';
                  if (lower.includes('review') || lower.includes('submitted')) return 'bg-amber-500';
                  if (lower.includes('closed')) return 'bg-slate-500';
                  return 'bg-teal-500';
                };

                return (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface">{st.name}</span>
                      <span className="font-mono-code text-on-surface-variant font-bold">
                        {st.count} ({st.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(st.name)} transition-all rounded-full`}
                        style={{ width: `${Math.max(st.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-on-surface-variant py-8">
              <span className="material-symbols-outlined text-[32px] opacity-40">donut_large</span>
              <span className="font-body-sm text-xs mt-1">No status data available</span>
            </div>
          )}
        </div>
      </div>

      {/* ROW 2 CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Priority Distribution */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface mb-0.5">Priority Distribution</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">Reports by priority level</p>
          </div>

          <div className="mt-4 flex items-end justify-between gap-2 h-32 border-b border-border-subtle pb-2">
            {[
              { label: 'Low', count: priorityCounts.Low, color: 'bg-emerald-500' },
              { label: 'Medium', count: priorityCounts.Medium, color: 'bg-amber-500' },
              { label: 'High', count: priorityCounts.High, color: 'bg-orange-500' },
              { label: 'Critical', count: priorityCounts.Critical, color: 'bg-red-500' },
            ].map((p, idx) => {
              const maxVal = Math.max(...(Object.values(priorityCounts) as number[]), 1);
              const heightPct = Math.max(Math.round((p.count / maxVal) * 100), 10);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="font-mono-code text-[11px] font-bold text-on-surface">{p.count}</span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[28px] ${p.color} rounded-t transition-all`}
                  />
                  <span className="font-label-sm text-[10px] font-semibold text-on-surface-variant">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Workload */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface mb-0.5">Department Workload</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">Reports assigned to teams</p>
          </div>

          {departmentCounts.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2 max-h-36 overflow-y-auto">
              {departmentCounts.slice(0, 5).map((d, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-on-surface truncate max-w-[120px]">{d.name}</span>
                    <span className="font-mono-code text-on-surface-variant font-bold">{d.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.max(Math.round((d.count / totalCount) * 100), 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-center text-on-surface-variant">
              <span className="font-body-sm text-xs">No department workload data</span>
            </div>
          )}
        </div>

        {/* Severity Analysis */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface mb-0.5">Severity Analysis</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">AI-derived impact severity</p>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {[
              { label: 'Low Severity', count: severityCounts.Low, badge: 'bg-emerald-100 text-emerald-800' },
              { label: 'Medium Severity', count: severityCounts.Medium, badge: 'bg-amber-100 text-amber-800' },
              { label: 'High Severity', count: severityCounts.High, badge: 'bg-orange-100 text-orange-800' },
              { label: 'Critical Impact', count: severityCounts.Critical, badge: 'bg-red-100 text-red-800' },
            ].map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-surface-container-low">
                <span className="font-medium text-on-surface">{s.label}</span>
                <span className={`px-2 py-0.5 rounded-md font-mono-code font-bold text-[11px] ${s.badge}`}>
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Performance */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface mb-0.5">SLA Performance</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">Resolution SLA compliance</p>
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Within SLA Target
              </span>
              <span className="font-mono-code font-bold text-on-surface">{slaMetrics.withinSLA}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                At Risk (&gt;50% SLA)
              </span>
              <span className="font-mono-code font-bold text-on-surface">{slaMetrics.atRisk}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-red-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Overdue
              </span>
              <span className="font-mono-code font-bold text-on-surface">{slaMetrics.overdue}</span>
            </div>

            <div className="mt-1 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
              <span>Overall Compliance:</span>
              <span className="font-bold text-primary">{resolutionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT REPORTS TABLE + AI INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports Table (Clickable) */}
        <div className="lg:col-span-2 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">Recent Reports</h3>
              <p className="font-body-sm text-xs text-on-surface-variant">Latest active campus issues</p>
            </div>
            <span className="font-mono-code text-xs text-on-surface-variant font-semibold">
              Showing {Math.min(filteredReports.length, 5)} of {totalCount}
            </span>
          </div>

          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-on-surface-variant uppercase font-mono-code text-[10px] tracking-wider">
                    <th className="pb-2.5 font-bold">Ticket ID</th>
                    <th className="pb-2.5 font-bold">Title</th>
                    <th className="pb-2.5 font-bold">Category</th>
                    <th className="pb-2.5 font-bold">Priority</th>
                    <th className="pb-2.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredReports.slice(0, 5).map((r) => {
                    const getPriorityBadge = (p?: string) => {
                      const lower = (p || '').toLowerCase();
                      if (lower === 'critical') return 'bg-red-100 text-red-800';
                      if (lower === 'high') return 'bg-orange-100 text-orange-800';
                      if (lower === 'medium') return 'bg-amber-100 text-amber-800';
                      return 'bg-emerald-100 text-emerald-800';
                    };

                    const getStatusBadge = (st: string) => {
                      const lower = st.toLowerCase();
                      if (lower.includes('resolved')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      if (lower.includes('progress')) return 'bg-blue-50 text-blue-700 border-blue-200';
                      if (lower.includes('review') || lower.includes('submitted')) return 'bg-amber-50 text-amber-700 border-amber-200';
                      return 'bg-slate-100 text-slate-700 border-slate-200';
                    };

                    return (
                      <tr
                        key={r.id}
                        onClick={() => onOpenReportDetails && onOpenReportDetails(r)}
                        className="hover:bg-surface-container-low transition-colors cursor-pointer"
                      >
                        <td className="py-3 font-mono-code font-bold text-primary">{r.id}</td>
                        <td className="py-3 font-semibold text-on-surface max-w-[200px] truncate">{r.title}</td>
                        <td className="py-3 text-on-surface-variant">{r.category}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${getPriorityBadge(r.priority || r.aiAnalysis?.priority)}`}>
                            {r.priority || r.aiAnalysis?.priority || 'Low'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-lg border font-label-sm text-[11px] font-semibold ${getStatusBadge(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[36px] opacity-40">inbox</span>
              <span className="font-body-sm text-xs mt-1">No reports matching the selected filters</span>
            </div>
          )}
        </div>

        {/* AI Key Insights Box */}
        <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
              </div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">AI Operational Insights</h3>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">Automated key findings from live dataset</p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex items-start gap-2.5">
                <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                  insight.type === 'warning' || insight.type === 'alert' ? 'text-amber-600' : insight.type === 'success' ? 'text-emerald-600' : 'text-primary'
                }`}>
                  {insight.icon}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-title text-xs font-bold text-on-surface">{insight.title}</span>
                  <span className="font-body-sm text-xs text-on-surface-variant leading-snug">{insight.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Live Database
            </span>
            <span className="font-mono-code font-semibold">Real-Time Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
