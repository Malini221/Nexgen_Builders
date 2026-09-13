import React, { useState, useRef } from 'react';
import { TicketReport } from '../types';
import { BackendAnalysis } from '../services/nexcampusApi';
import { DynamicHeroIllustration } from './DynamicHeroIllustration';

interface ReportProblemViewProps {
  reports: TicketReport[];
  onSubmitNewReport: (reportData: Partial<TicketReport>) => void;
  onAnalyzeWithBackend?: (reportData: Partial<TicketReport>) => Promise<BackendAnalysis>;
  preselectedDomain?: string;
}

export const ReportProblemView: React.FC<ReportProblemViewProps> = ({
  reports,
  onSubmitNewReport,
  onAnalyzeWithBackend,
  preselectedDomain,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [activeDomain, setActiveDomain] = useState<string>(preselectedDomain || 'hostel');

  // New report form states
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIssueChip, setFormIssueChip] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formToast, setFormToast] = useState<{ title: string; desc: string } | null>(null);
  const [aiResult, setAiResult] = useState<BackendAnalysis | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const domainList = [
    { id: 'hostel', name: 'Hostel & Dorms', icon: 'apartment' },
    { id: 'campus', name: 'Campus Facilities', icon: 'domain' },
    { id: 'academic', name: 'Academic Labs', icon: 'school' },
    { id: 'food', name: 'Dining & Mess', icon: 'restaurant' },
    { id: 'transport', name: 'Transport Transit', icon: 'directions_bus' },
    { id: 'safety', name: 'Campus Security', icon: 'shield' },
    { id: 'welfare', name: 'Student Welfare', icon: 'favorite' },
    { id: 'cleanliness', name: 'Sanitation', icon: 'cleaning_services' },
    { id: 'infrastructure', name: 'Civil & Infra', icon: 'build' },
    { id: 'substance', name: 'Confidential', icon: 'health_and_safety' },
    { id: 'other', name: 'Other Desk', icon: 'help_outline' },
  ];

  const domainTaxonomy: Record<string, { chips: string[]; locPlaceholder: string; descPlaceholder: string }> = {
    hostel: {
      chips: ['Wi-Fi / Internet', 'Room Maintenance', 'Water Supply', 'Bathroom / Toilet', 'Laundry', 'Noise Disturbance'],
      locPlaceholder: 'Block C, Room 312 / Floor 3',
      descPlaceholder: 'Please describe the fault, timing, recurrence, or affected room fixtures...'
    },
    campus: {
      chips: ['Projector / AV Failure', 'HVAC Malfunction', 'Elevator Down', 'Door Lock Fault', 'Lighting Issue'],
      locPlaceholder: 'Admin Block A, Senate Hall, or Campus Garden',
      descPlaceholder: 'Describe broken seating, AV equipment, or entrance doors...'
    },
    academic: {
      chips: ['Lab Workstation', 'Hardware Testing Equipment', '3D Printer Fault', 'Cleanroom Supply', 'Chemical Fume Hood'],
      locPlaceholder: 'Turing Lab 304 or Lecture Hall C-1',
      descPlaceholder: 'Describe malfunctioning projector, lab workstation, or smart board...'
    },
    food: {
      chips: ['Water Dispenser', 'Food Temperature', 'Hygiene / Cleanliness', 'Billing Discrepancy', 'Dietary Request'],
      locPlaceholder: 'Central Dining Hall or Faculty Bistro',
      descPlaceholder: 'Detail meal session (Breakfast/Lunch/Dinner), food item, or hygiene concern...'
    },
    transport: {
      chips: ['Shuttle Delay', 'Route Overcrowding', 'EV Charger Broken', 'Bicycle Stand Fault', 'Driver Conduct'],
      locPlaceholder: 'North Terminal, Shuttle Route B Stop, or West Lot P3',
      descPlaceholder: 'Mention shuttle vehicle ID, timing of delay, or specific charging bay issue...'
    },
    safety: {
      chips: ['Pathway Lighting', 'CCTV Blindspot', 'Broken Perimeter Gate', 'Lost Property', 'Security Patrol Request'],
      locPlaceholder: 'Perimeter Pathway, Gate 3, or Library Alley',
      descPlaceholder: 'Describe dark unlit walkways, broken card readers, or security personnel absence...'
    },
    welfare: {
      chips: ['Counseling Appointment', 'Medical First Aid', 'Disability Support', 'Emergency Grant', 'Grievance'],
      locPlaceholder: 'Campus Center, Student Lounge, or Online Appointment',
      descPlaceholder: 'Provide context as comfortable. All notes are protected by the campus privacy charter.'
    },
    cleanliness: {
      chips: ['Overflowing Bin', 'Restroom Deep Clean', 'Spill Hazard', 'Mosquito Hazard', 'Sanitary Dispenser'],
      locPlaceholder: 'Building D Restrooms or South Walkway Recycle Bins',
      descPlaceholder: 'Indicate overflow, spillage, or missing sanitation supplies...'
    },
    infrastructure: {
      chips: ['Power Outage', 'Plumbing Leak', 'Ceiling Seepage', 'Structural Crack', 'Window Glass Hazard'],
      locPlaceholder: 'Science Tower Elevator B or East Footbridge',
      descPlaceholder: 'Specify civil defect, crack, lift malfunction, or structural hazard...'
    },
    substance: {
      chips: ['Discreet Triage', 'Safe Wellbeing Request', 'De-addiction Guidance', 'Hostel Zone Violation'],
      locPlaceholder: 'Optional: Quad or vicinity',
      descPlaceholder: 'Share what support is needed. Anonymous support is respected.'
    },
    other: {
      chips: ['Unclassified Problem', 'Special Permit', 'Campus Signage', 'Storage Lockers'],
      locPlaceholder: 'Exact Campus Location or Department Name',
      descPlaceholder: 'Detail your issue thoroughly so central dispatch can route it to the appropriate campus team...'
    }
  };

  const scrollLeft = () => {
    scrollerRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollerRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
  };



  const handleAutoGeo = () => {
    setFormLocation('Hostel Block A, Room 312 (Detected via Wi-Fi AP-04)');
  };

  const handleNewReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim() || submitting) return;
    const chosenDomainObj = domainList.find((d) => d.id === activeDomain);
    const domainName = chosenDomainObj ? chosenDomainObj.name : 'Campus Desk';
    const newReport: Partial<TicketReport> = {
      title: formIssueChip ? `${domainName}: ${formIssueChip}` : `${domainName} Issue`,
      category: domainName, subCategory: formIssueChip || 'Maintenance Dispatch',
      location: formLocation || 'Campus Area', description: formDescription,
      attachmentName: formAttachmentName || undefined, status: 'Submitted', reportedDate: 'Just now',
    };
    setSubmitting(true); setSubmitError(''); setAiResult(null);
    try {
      if (!onAnalyzeWithBackend) throw new Error('AI backend integration is not configured.');
      const result = await onAnalyzeWithBackend(newReport);
      setAiResult(result);
      onSubmitNewReport({ 
        ...newReport, 
        id: result.ticket_number ? `#TK-${result.ticket_number}` : newReport.id, 
        backendId: result.backend_id,
        category: result.category, 
        status: 'In Progress', 
        squad: result.recommended_department || undefined 
      });
      setFormToast({ title: result.ticket_number ? `Report #TK-${result.ticket_number} Submitted` : 'Report Submitted Successfully', desc: 'Your report has been received and routed to the appropriate campus team.' });
      setFormDescription(''); setFormLocation(''); setFormIssueChip(''); setFormAttachmentName('');
      setTimeout(() => setFormToast(null), 5000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit complaint.');
    } finally { setSubmitting(false); }
  };

  const currentTax = domainTaxonomy[activeDomain] || domainTaxonomy.hostel;

  return (
    <div className="flex flex-col w-full gap-4 pb-8 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {formToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-primary text-white shadow-xl flex items-center gap-3 border border-border-hover animate-bounce">
          <span className="material-symbols-outlined text-[22px] text-primary-fixed">verified</span>
          <div className="flex flex-col">
            <span className="font-title text-sm font-semibold">{formToast.title}</span>
            <span className="font-body-sm text-xs opacity-90">{formToast.desc}</span>
          </div>
        </div>
      )}

      {submitError && <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-xs font-medium">{submitError}</div>}


      {/* Page Header & Operational Summary */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono-code text-[11px] font-bold tracking-wide leading-none">
              CAMPUS DESK #TK-OP-24
            </span>
            <span className="w-2 h-2 rounded-full bg-status-resolved-fg" />
            <span className="font-label-sm text-[11px] text-status-resolved-fg font-bold uppercase tracking-wider leading-none">
              Operational Avg Resolution: 4.8h
            </span>
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-neutral-900 tracking-tight leading-tight mt-0.5">
            Report &amp; Track Issues
          </h1>
          <p className="font-body-sm text-xs text-neutral-600 font-medium max-w-2xl leading-relaxed">
            Submit campus facility faults directly to assigned maintenance squads, review triage telemetry, or verify ongoing work.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <DynamicHeroIllustration categoryKey={activeDomain} issueType={formIssueChip} />
          </div>
          <div className="bg-surface-card border border-neutral-200 rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px] font-semibold">
                assignment_turned_in
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-neutral-700 uppercase font-mono-code font-bold leading-none">
                Your Active Tickets
              </span>
              <span className="font-title text-xs font-bold text-neutral-900 leading-tight mt-1">
                {reports.filter((r) => r.status === 'In Progress' || r.status === 'Under Review' || r.status === 'Submitted').length} Active
              </span>
            </div>
          </div>

          <div className="hidden xl:flex bg-surface-card border border-neutral-200 rounded-xl px-3 py-1.5 shadow-xs items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px] font-semibold">
                verified_user
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-neutral-700 uppercase font-mono-code font-bold leading-none">
                Campus SLA
              </span>
              <span className="font-title text-xs font-bold text-neutral-900 leading-tight mt-1">
                99.4% Solved
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. TOP: CATEGORY SELECTOR / TABS */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-xs font-semibold text-on-surface">
              Choose Issue Domain
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">
              • 11 standard departments
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll categories left"
              className="w-7 h-7 rounded-lg bg-surface-card hover:bg-surface-container shadow-xs flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll categories right"
              className="w-7 h-7 rounded-lg bg-surface-card hover:bg-surface-container shadow-xs flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="w-full flex items-center gap-2 overflow-x-auto py-1 scrollbar-none"
        >
          {domainList.map((dom) => {
            const isActive = activeDomain === dom.id;
            return (
              <button
                key={dom.id}
                type="button"
                onClick={() => setActiveDomain(dom.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl shrink-0 transition-all font-medium text-xs cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-surface-card hover:bg-surface-container-low text-neutral-800 border border-neutral-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface-container-low text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{dom.icon}</span>
                </div>
                <span>{dom.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. PROMOTIONAL STUDENT BANNER & IMPACT CARDS */}
      <section className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-6 overflow-hidden relative">
        {/* Background Building Outlines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Hero Section with Illustration & Speech Bubble */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Speech Bubble & Kicker */}
          <div className="flex flex-col items-start gap-4 max-w-lg">
            <div className="bg-white border border-emerald-100 rounded-2xl p-5 sm:p-6 shadow-sm flex items-center gap-4 relative animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Green Shield Icon */}
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[28px] font-bold">verified_user</span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline-md text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight leading-snug">
                  Report today<br />for a better<br /><span className="text-emerald-700">tomorrow</span>
                </h2>
              </div>
              {/* Tail speech arrow */}
              <div className="absolute -bottom-2.5 left-10 w-5 h-5 bg-white border-b border-r border-emerald-100 rotate-45" />
            </div>

            <p className="font-body-md text-xs sm:text-sm text-emerald-900/80 font-medium leading-relaxed pl-1">
              Your reports help maintenance crews fix issues faster, keeping our classrooms, labs, and dorms safe and clean for everyone.
            </p>
          </div>

          {/* Right: Friendly Student Character Illustration Banner */}
          <div className="relative shrink-0 w-full md:w-80 h-52 sm:h-56 rounded-2xl overflow-hidden border border-emerald-200 shadow-md bg-emerald-100/50 flex items-center justify-center">
            <img
              src="/assets/student_report_banner.png"
              alt="Student reporting campus issue on phone"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Bottom 4 Feature Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10 pt-2 border-t border-emerald-200/60">
          {/* Card 1 */}
          <div className="bg-white/80 backdrop-blur-xs border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs hover:bg-white transition-all">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title text-xs font-bold text-neutral-900 leading-tight">Quick Response</span>
              <span className="font-body-sm text-[11px] text-neutral-600 font-medium mt-0.5">We act fast</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-xs border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs hover:bg-white transition-all">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title text-xs font-bold text-neutral-900 leading-tight">Safer Campus</span>
              <span className="font-body-sm text-[11px] text-neutral-600 font-medium mt-0.5">For everyone</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-xs border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs hover:bg-white transition-all">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[20px]">eco</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title text-xs font-bold text-neutral-900 leading-tight">Cleaner Spaces</span>
              <span className="font-body-sm text-[11px] text-neutral-600 font-medium mt-0.5">Healthier tomorrow</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/80 backdrop-blur-xs border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs hover:bg-white transition-all">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-title text-xs font-bold text-neutral-900 leading-tight">Student First</span>
              <span className="font-body-sm text-[11px] text-neutral-600 font-medium mt-0.5">Your voice matters</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW ISSUE SUBMISSION FORM FOR SELECTED DOMAIN */}
      <section className="bg-surface-card rounded-xl shadow-xs p-4 flex flex-col gap-3 border border-border-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
            <h2 className="font-headline-sm text-sm sm:text-base font-bold text-neutral-900">
              New Issue Report — {domainList.find((d) => d.id === activeDomain)?.name || 'Hostel & Dorms'}
            </h2>
          </div>
          <span className="font-mono-code text-[10.5px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded">
            Fast Track Dispatch
          </span>
        </div>

        {/* Issue Type Chips */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-neutral-700">
            Select common issue taxonomy:
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentTax.chips.map((chip) => {
              const isSelected = formIssueChip === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFormIssueChip(isSelected ? '' : chip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary-container text-white border-primary shadow-xs font-semibold'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-border-subtle'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location & Description Form */}
        <form onSubmit={handleNewReportSubmit} className="flex flex-col gap-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 flex flex-col gap-1">
              <label htmlFor="formLoc" className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
                <span>Location</span>
                <button
                  type="button"
                  onClick={handleAutoGeo}
                  className="text-primary hover:underline font-mono-code text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">my_location</span>
                  <span>Detect Location</span>
                </button>
              </label>
              <input
                id="formLoc"
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder={currentTax.locPlaceholder}
                className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-border-subtle text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-4 flex flex-col gap-1">
              <span className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
                <span>Photo / Attachment <span className="font-normal text-on-surface-variant">(Optional)</span></span>
              </span>
              <label className="rounded-lg border-2 border-dashed border-primary/25 hover:border-primary/50 bg-emerald-50/30 hover:bg-emerald-50/60 px-3 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-all group text-xs">
                {formAttachmentName ? (
                  <>
                    <span className="material-symbols-outlined text-primary text-[16px]">description</span>
                    <span className="truncate text-on-surface font-medium">{formAttachmentName}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-primary text-[16px] group-hover:scale-110 transition-transform">cloud_upload</span>
                    <span className="text-on-surface-variant"><span className="text-primary font-medium">Upload</span> or drop</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFormAttachmentName(f.name);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="formDesc" className="text-xs font-semibold text-neutral-800 flex items-center justify-between">
              <span>
                Problem Description <span className="text-status-urgent-fg font-bold">*</span>
              </span>
              <span className="font-mono-code text-[10px] text-outline">Detailed report for crew</span>
            </label>
            <textarea
              id="formDesc"
              required
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={currentTax.descPlaceholder}
              className="w-full p-2.5 rounded-lg bg-surface-container-low border border-border-subtle text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              Directly dispatches assigned department squad
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-title text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">{submitting ? 'hourglass_top' : 'send'}</span>
              <span>{submitting ? 'Submitting…' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* 4. ACTIVE CAMPUS TICKET FEED */}
      <section className="bg-surface-card rounded-xl shadow-xs p-4 flex flex-col gap-3 border border-border-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
            <h2 className="font-headline-sm text-sm sm:text-base font-bold text-neutral-900">
              Active Campus Ticket Feed
            </h2>
          </div>
          <span className="font-mono-code text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-300">
            3 Monitored Events
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reports.slice(0, 3).map((r) => (
            <div key={r.id} className="bg-surface-card border-2 border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2.5 hover:border-primary/50 transition-colors">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-[11px] text-neutral-900 font-bold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                    {r.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[10px] font-bold uppercase border ${
                    r.status === 'Resolved' || r.status === 'Closed' ? 'bg-emerald-100 text-status-resolved-fg border-emerald-300' :
                    r.status === 'In Progress' ? 'bg-sky-100 text-status-progress-fg border-sky-300' :
                    'bg-slate-100 text-status-submitted-fg border-slate-300'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <span className="font-title text-sm font-bold text-neutral-900 leading-snug truncate">
                  {r.title}
                </span>
                <p className="font-body-sm text-xs text-neutral-700 font-medium line-clamp-2 leading-relaxed">
                  {r.description}
                </p>
              </div>
              <div className="flex items-center justify-between font-label-sm text-[11px] text-neutral-700 font-semibold pt-2 border-t border-neutral-200">
                <span className="text-neutral-900 font-bold flex items-center gap-1 truncate max-w-[60%]">
                  <span className="material-symbols-outlined text-[13px] text-neutral-600">location_on</span>
                  <span className="truncate">{r.location || 'Campus'}</span>
                </span>
                <span className="text-neutral-600 font-mono-code shrink-0">{r.reportedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
