import React, { useState } from 'react';
import { TicketReport } from '../types';

interface AdminDepartmentsViewProps {
  reports: TicketReport[];
  onOpenReportDetails?: (report: TicketReport) => void;
}

export const AdminDepartmentsView: React.FC<AdminDepartmentsViewProps> = ({ reports, onOpenReportDetails }) => {
  const [selectedDeptKey, setSelectedDeptKey] = useState<string | null>(null);

  const departments = [
    {
      name: 'Infrastructure & Maintenance',
      key: 'infrastructure',
      icon: 'build',
      lead: 'Dave Miller (Lead Eng)',
      squads: ['ELEC-MAINT-1', 'PLUMB-UNIT-4', 'CIVIL-OPS-A'],
      sla: '12 Hours',
      description: 'Handles electrical grid, plumbing, civil repairs, HVAC, and building structure issues.',
    },
    {
      name: 'IT & NOC Network Operations',
      key: 'it',
      icon: 'wifi',
      lead: 'Sarah Chen (NOC Manager)',
      squads: ['IT-NOC Squad #4', 'NETWORK-OPS-B', 'HARDWARE-DESK'],
      sla: '4 Hours',
      description: 'Manages campus 5G Wi-Fi nodes, lab hardware, audio/visual setups, and portal servers.',
    },
    {
      name: 'Hostel & Residential Services',
      key: 'hostel',
      icon: 'apartment',
      lead: 'Rajesh Kumar (Chief Warden)',
      squads: ['HOSTEL-BLOCK-A', 'RES-CARE-2', 'HOUSING-ALLOC'],
      sla: '24 Hours',
      description: 'Oversees student accommodation, room maintenance, hostel security, and residential quiet hours.',
    },
    {
      name: 'Catering & Food Services',
      key: 'canteen',
      icon: 'restaurant',
      lead: 'Anita Sharma (Food Safety Officer)',
      squads: ['CATER-PLUMB-1', 'HYGIENE-AUDIT', 'MESS-OPS'],
      sla: '6 Hours',
      description: 'Monitors food hygiene, dining hall water quality, mess meal quality, and canteen vending.',
    },
    {
      name: 'Transport & Shuttle Operations',
      key: 'transport',
      icon: 'directions_bus',
      lead: 'Captain Vikram Singh (Fleet Lead)',
      squads: ['TRANS-OPS-B', 'EV-CHARGING-1', 'BUS-DISPATCH'],
      sla: '8 Hours',
      description: 'Coordinates shuttle bus frequencies, route overcrowding, EV charging hubs, and campus parking.',
    },
    {
      name: 'Student Welfare & Campus Security',
      key: 'welfare',
      icon: 'security',
      lead: 'Dr. Aris Thorne (Student Ombudsperson)',
      squads: ['WELFARE-DESK-1', 'CAMPUS-SEC-ZONE-3', 'HEALTH-FIRSTAID'],
      sla: '2 Hours (Critical)',
      description: 'Provides student counseling, emergency health aid, perimeter security, and confidential support.',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono-code text-xs font-bold text-primary uppercase tracking-wider">
            CAMPUS OPERATIONAL TEAMS
          </span>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight leading-tight mt-0.5">
            Departments &amp; Squad Workload
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Real active ticket breakdown, SLA targets, and assigned squads per department unit.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface-card border border-border-subtle shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">groups</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono-code text-[11px] font-bold text-on-surface">6 Active Units</span>
            <span className="text-[10px] text-on-surface-variant font-medium">18 Maintenance Squads</span>
          </div>
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const deptReports = reports.filter(
            (r) =>
              (r.department || '').toLowerCase().includes(dept.key) ||
              (r.squad || '').toLowerCase().includes(dept.key) ||
              (r.category || '').toLowerCase().includes(dept.key) ||
              (r.aiAnalysis?.recommended_department || '').toLowerCase().includes(dept.key)
          );

          const total = deptReports.length;
          const active = deptReports.filter(
            (r) => r.status === 'In Progress' || r.status === 'Submitted' || r.status === 'Under Review' || r.status === 'Awaiting Verification'
          ).length;
          const resolved = deptReports.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;

          const isSelected = selectedDeptKey === dept.key;

          return (
            <div
              key={dept.name}
              className={`bg-surface-card p-5 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-border-subtle hover:border-border-hover'
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Dept Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">{dept.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-title text-base font-bold text-on-surface leading-snug">{dept.name}</h3>
                      <span className="text-[11px] text-on-surface-variant font-medium">{dept.lead}</span>
                    </div>
                  </div>
                </div>

                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  {dept.description}
                </p>

                {/* Workload Metric Bar */}
                <div className="grid grid-cols-3 gap-2 my-1 bg-surface-container-low p-3 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] uppercase text-on-surface-variant block font-bold">Total Assigned</span>
                    <span className="font-headline-sm text-base font-extrabold text-on-surface mt-0.5 block">{total}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-amber-600 block font-bold">Active Tasks</span>
                    <span className="font-headline-sm text-base font-extrabold text-amber-700 mt-0.5 block">{active}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-emerald-600 block font-bold">Resolved</span>
                    <span className="font-headline-sm text-base font-extrabold text-emerald-700 mt-0.5 block">{resolved}</span>
                  </div>
                </div>

                {/* Assigned Squads */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="font-label-sm text-[10px] uppercase text-on-surface-variant font-bold tracking-wider">
                    Assigned Squads ({dept.squads.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.squads.map((sq, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-surface-card border border-border-subtle font-mono-code text-[11px] font-semibold text-on-surface">
                        {sq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Meta & Toggle */}
              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                  <span>SLA: <strong className="text-on-surface font-mono-code">{dept.sla}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDeptKey(isSelected ? null : dept.key)}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle text-primary font-label-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{isSelected ? 'Hide Tickets' : `View Tickets (${deptReports.length})`}</span>
                  <span className="material-symbols-outlined text-[16px]">
                    {isSelected ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>

              {/* Expandable Active Tickets Section */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col gap-2.5">
                  <span className="font-label-sm text-[11px] uppercase font-bold text-on-surface">
                    Tickets assigned to {dept.name}
                  </span>
                  {deptReports.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                      {deptReports.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => onOpenReportDetails && onOpenReportDetails(r)}
                          className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-border-subtle cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono-code text-[11px] font-bold text-primary">{r.id}</span>
                              <span className="font-title text-xs font-bold text-on-surface truncate">{r.title}</span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant truncate">{r.location}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold shrink-0 ${
                            r.status === 'Resolved' || r.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl">
                      No active tickets assigned to this department.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
