import React, { useState } from 'react';
import { TicketReport, TicketStatus } from '../types';
import { formatFullIST, formatTimeIST } from '../utils/dateTimeUtils';

interface AdminReportDetailViewProps {
  report: TicketReport;
  onBack: () => void;
  onUpdateStatus: (reportId: string, newStatus: TicketStatus, note?: string) => void;
}

export const AdminReportDetailView: React.FC<AdminReportDetailViewProps> = ({
  report,
  onBack,
  onUpdateStatus,
}) => {
  const [newStatus, setNewStatus] = useState<TicketStatus>(report.status);
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    onUpdateStatus(report.id, newStatus, note);
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }, 400);
  };

  const timelineSteps = [
    { label: 'Submitted', key: 'Submitted' },
    { label: 'Analysed', key: 'Analysed' },
    { label: 'Assigned', key: 'Assigned' },
    { label: 'Acknowledged', key: 'Acknowledged' },
    { label: 'In Progress', key: 'In Progress' },
    { label: 'Resolved', key: 'Resolved' },
    { label: 'Verification', key: 'Verification' },
    { label: 'Closed', key: 'Closed' },
  ];

  const statusOrder: Record<string, number> = {
    Submitted: 1,
    Analysed: 2,
    Assigned: 3,
    Acknowledged: 4,
    'Under Review': 4,
    'In Progress': 5,
    Resolved: 6,
    'Awaiting Verification': 7,
    Verification: 7,
    Closed: 8,
  };

  const currentStepNum = statusOrder[report.status] || 1;

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto gap-6 pb-12">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-surface-card border border-border-subtle hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Reports</span>
        </button>

        <span className="font-mono-code text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-xl">
          {report.id}
        </span>
      </div>

      {/* Main Grid: Student & Issue Details (8 cols) vs Status Update Actions (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Student & Issue Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Student Information */}
          <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
            <h2 className="font-title text-base font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              <span>Student Information</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-on-surface-variant block text-[11px] font-bold uppercase">Student Name</span>
                <span className="font-semibold text-on-surface text-sm">{report.reporterName}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[11px] font-bold uppercase">Student ID</span>
                <span className="font-mono-code font-bold text-primary">{report.reporterId}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[11px] font-bold uppercase">Campus Email</span>
                <span className="text-on-surface">{report.reporterEmail || 'student@nexcampus.edu'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[11px] font-bold uppercase">Program / Year</span>
                <span className="text-on-surface">{report.reporterProgram || 'B.Tech Computer Science'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Issue Information & AI Analysis */}
          <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="font-mono-code text-xs text-primary font-bold">{report.category}</span>
                <h2 className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">{report.title}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-status-progress-bg text-status-progress-fg font-mono-code text-xs font-bold uppercase">
                {report.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-low p-3.5 rounded-xl border border-border-subtle text-xs">
              <div>
                <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Priority</span>
                <span className="font-bold text-on-surface">{report.priority || 'Medium'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Risk Score</span>
                <span className="font-bold text-status-urgent-fg">{report.riskScore || 0.62}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Department</span>
                <span className="font-semibold text-on-surface">{report.department || 'Infrastructure'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[10px] uppercase font-bold">Submitted Date</span>
                <span className="font-mono-code text-on-surface">{report.reportedDate}</span>
              </div>
            </div>

            <div>
              <span className="font-label-md text-xs font-bold text-on-surface block mb-1">Issue Description</span>
              <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-xl border border-border-subtle">
                {report.description}
              </p>
            </div>
          </div>

          {/* Card 3: Dynamic Timeline */}
          <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
            <h2 className="font-title text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">timeline</span>
              <span>Status Timeline</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center">
              {timelineSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isDone = stepNum <= currentStepNum;
                const isCurrent = stepNum === currentStepNum;
                return (
                  <div key={step.label} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface-container-low">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone ? 'bg-primary text-white' : 'bg-surface-container-highest text-outline'
                    }`}>
                      {isDone ? '✓' : stepNum}
                    </div>
                    <span className={`text-[11px] font-semibold ${isCurrent ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      {step.label}
                    </span>
                    <span className="text-[9px] text-outline font-mono-code">
                      {isDone ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Update Status Action Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
            <h2 className="font-title text-base font-bold text-on-surface mb-1">Update Status</h2>
            <p className="text-xs text-on-surface-variant mb-4">
              Changing report status immediately updates the student's live tracking timeline.
            </p>

            <form onSubmit={handleStatusSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low text-xs text-on-surface font-semibold border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Awaiting Verification">Awaiting Verification</option>
                  <option value="Closed">Closed</option>
                  <option value="Dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">Internal Operational Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain action taken or dispatch squad details..."
                  className="w-full min-h-[90px] p-3 rounded-xl bg-surface-container-low text-xs text-on-surface border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary-container text-white font-title text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isUpdating ? 'Saving Update...' : 'Save & Notify Student'}
              </button>

              {updateSuccess && (
                <p className="text-xs text-status-resolved-fg font-bold text-center">
                  Status updated &amp; synced to database!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
