import React, { useState } from 'react';
import { TicketReport, TicketStatus } from '../types';

interface AdminReportsViewProps {
  reports: TicketReport[];
  onOpenReportDetails: (report: TicketReport) => void;
  onUpdateReportStatus?: (reportId: string, status: TicketStatus) => void;
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({
  reports,
  onOpenReportDetails,
  onUpdateReportStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === 'all' || r.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesDept = departmentFilter === 'all' || (r.department && r.department.toLowerCase() === departmentFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || (r.priority && r.priority.toLowerCase() === priorityFilter.toLowerCase());

    return matchesQuery && matchesCategory && matchesDept && matchesStatus && matchesPriority;
  });

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono-code text-xs font-bold text-primary uppercase tracking-wider">
            ADMINISTRATIVE OVERSIGHT
          </span>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Manage Reports
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            View, filter, dispatch squads, and resolve student incident tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-surface-card border border-border-subtle font-mono-code text-xs font-bold text-on-surface">
            {filteredReports.length} / {reports.length} Reports
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-card p-3 rounded-2xl border border-border-subtle shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80 flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket ID, student name, title..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-container-low text-xs text-on-surface placeholder:text-outline focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-surface-container-low text-xs text-on-surface border border-transparent font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Hostel">Hostel</option>
            <option value="Transport">Transport</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Food / Canteen">Food / Canteen</option>
            <option value="Student Welfare">Student Welfare</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-surface-container-low text-xs text-on-surface border border-transparent font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-surface-container-low text-xs text-on-surface border border-transparent font-medium cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Reports Table matching reference image */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-subtle font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                <th className="p-3.5">Ticket ID</th>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Issue Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Submitted On</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-3.5 font-mono-code font-bold text-primary">{r.id}</td>
                    <td className="p-3.5 font-semibold text-on-surface">{r.reporterName}</td>
                    <td className="p-3.5 font-medium text-on-surface max-w-xs truncate">{r.title}</td>
                    <td className="p-3.5 text-on-surface-variant">{r.category}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'Resolved' || r.status === 'Closed' ? 'bg-status-resolved-bg text-status-resolved-fg' : 'bg-status-progress-bg text-status-progress-fg'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.priority === 'High' || r.priority === 'Critical' ? 'bg-status-urgent-bg text-status-urgent-fg' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {r.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono-code text-on-surface-variant">{r.reportedDate}</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenReportDetails(r)}
                        className="px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
