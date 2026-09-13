import React, { useState } from 'react';
import { TicketReport } from '../types';

interface AdminStudentsViewProps {
  reports: TicketReport[];
}

interface StudentRecord {
  name: string;
  studentId: string;
  email: string;
  program: string;
  year: string;
  totalReports: number;
  openReports: number;
  resolvedReports: number;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({ reports }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique students from actual complaint reports
  const studentMap = reports.reduce((acc: Record<string, StudentRecord>, r) => {
    const id = r.reporterId || '#8842';
    if (!acc[id]) {
      acc[id] = {
        name: r.reporterName || 'Malini S.',
        studentId: id,
        email: r.reporterEmail || `${id.replace('#', '').toLowerCase()}@nexcampus.edu`,
        program: r.reporterProgram || 'Computer Science & Engineering',
        year: r.reporterYear || '3rd Year',
        totalReports: 0,
        openReports: 0,
        resolvedReports: 0,
      };
    }
    acc[id].totalReports += 1;
    if (r.status === 'Resolved' || r.status === 'Closed') {
      acc[id].resolvedReports += 1;
    } else {
      acc[id].openReports += 1;
    }
    return acc;
  }, {} as Record<string, StudentRecord>);

  const allStudents = Object.values(studentMap) as StudentRecord[];
  const totalStudentCount = allStudents.length;

  const studentsList: StudentRecord[] = allStudents.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  // Calculate student program distribution dynamically
  const programCounts = allStudents.reduce((acc: Record<string, number>, s) => {
    acc[s.program] = (acc[s.program] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Student activity ratio
  const activeReportersCount = allStudents.filter((s) => s.totalReports > 0).length;
  const multiReportStudentsCount = allStudents.filter((s) => s.totalReports > 1).length;

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono-code text-xs font-bold text-primary uppercase tracking-wider">
            STUDENT DIRECTORY &amp; ENGAGEMENT
          </span>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Students Management
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            View registered student profiles and their live complaint submission history.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, ID..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-card border border-border-subtle text-xs text-on-surface focus:outline-none"
          />
        </div>
      </div>

      {/* Analytical KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Registered Reporters</span>
            <span className="font-headline-lg text-2xl font-bold text-on-surface mt-1 block">{totalStudentCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Active Database Users</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">groups</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Active Complainants</span>
            <span className="font-headline-lg text-2xl font-bold text-on-surface mt-1 block">{activeReportersCount}</span>
            <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">100% Verified Accounts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">person_raised_hand</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Frequent Reporters</span>
            <span className="font-headline-lg text-2xl font-bold text-on-surface mt-1 block">{multiReportStudentsCount}</span>
            <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">Multiple tickets logged</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">repeat</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Total Student Tickets</span>
            <span className="font-headline-lg text-2xl font-bold text-on-surface mt-1 block">{reports.length}</span>
            <span className="text-[10px] text-purple-600 font-semibold mt-0.5 block">Live DB Total</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Program Distribution & Engagement Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department / Program Distribution Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
          <div className="mb-4">
            <h3 className="font-title text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">school</span>
              <span>Student Registration by Academic Program</span>
            </h3>
            <p className="text-xs text-on-surface-variant">Live breakdown across engineering &amp; academic departments</p>
          </div>

          <div className="flex flex-col gap-3">
            {Object.keys(programCounts).length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">No program data available</p>
            ) : (
              Object.entries(programCounts).map(([program, count]) => {
                const numCount = Number(count);
                const pct = totalStudentCount > 0 ? Math.round((numCount / totalStudentCount) * 100) : 0;
                return (
                  <div key={program} className="p-3 rounded-xl bg-surface-container-low border border-border-subtle">
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface mb-1.5">
                      <span className="truncate pr-2">{program}</span>
                      <span className="font-mono-code font-bold text-primary shrink-0">{numCount} student{numCount > 1 ? 's' : ''} ({pct}%)</span>
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

        {/* Student Resolution Ratio Overview (5 cols) */}
        <div className="lg:col-span-5 bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-title text-sm font-bold text-on-surface flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span>Student Satisfaction &amp; Resolution Rate</span>
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Ratio of resolved complaints for active student reporters</p>

            <div className="space-y-3">
              {allStudents.slice(0, 4).map((s) => {
                const resRate = s.totalReports > 0 ? Math.round((s.resolvedReports / s.totalReports) * 100) : 0;
                return (
                  <div key={s.studentId} className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-on-surface truncate">{s.name}</h4>
                      <span className="text-[11px] font-mono-code text-on-surface-variant">{s.studentId} • {s.totalReports} ticket{s.totalReports > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${resRate}%` }} />
                      </div>
                      <span className="text-xs font-mono-code font-bold text-emerald-600">{resRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">info</span>
            <span>Click any student to view their exact report log.</span>
          </div>
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-subtle font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Student ID</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Year</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5 text-center">Total Reports</th>
                <th className="p-3.5 text-center">Open Reports</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {studentsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                    No registered student records found.
                  </td>
                </tr>
              ) : (
                studentsList.map((s) => (
                  <tr key={s.studentId} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-3.5 font-semibold text-on-surface">{s.name}</td>
                    <td className="p-3.5 font-mono-code font-bold text-primary">{s.studentId}</td>
                    <td className="p-3.5 text-on-surface-variant">{s.program}</td>
                    <td className="p-3.5 text-on-surface-variant">{s.year}</td>
                    <td className="p-3.5 font-mono-code text-on-surface-variant">{s.email}</td>
                    <td className="p-3.5 text-center font-bold text-on-surface">{s.totalReports}</td>
                    <td className="p-3.5 text-center font-bold text-status-progress-fg">{s.openReports}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                        Active User
                      </span>
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
