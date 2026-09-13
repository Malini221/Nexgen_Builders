import React, { useState } from 'react';
import { AnnouncementItem } from '../types';

interface AdminAnnouncementsViewProps {
  announcements: AnnouncementItem[];
  onAddAnnouncement: (announcement: AnnouncementItem) => void;
}

export const AdminAnnouncementsView: React.FC<AdminAnnouncementsViewProps> = ({
  announcements,
  onAddAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('All Students');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalAnnouncements = announcements.length;
  const publishedCount = announcements.filter((a) => a.status === 'Published').length;

  // Audience distribution calculated dynamically
  const audienceCounts = announcements.reduce((acc: Record<string, number>, a) => {
    acc[a.audience] = (acc[a.audience] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAnc: AnnouncementItem = {
      id: `ANC-${Math.floor(104 + Math.random() * 500)}`,
      title: title.trim(),
      content: content.trim() || title.trim(),
      audience,
      createdOn: 'Just now',
      publishedDate: 'Just now',
      status: 'Published',
      author: 'Campus Administration',
    };

    onAddAnnouncement(newAnc);
    setTitle('');
    setContent('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pb-12 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono-code text-xs font-bold text-primary uppercase tracking-wider">
            CAMPUS COMMUNICATIONS &amp; BROADCASTS
          </span>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Announcements &amp; Advisories
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Communicate official notices, facility maintenance alerts, and transit advisories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white font-title text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>+ New Announcement</span>
        </button>
      </div>

      {/* KPI Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Total Announcements</span>
            <span className="font-headline-lg text-2xl font-bold text-on-surface mt-1 block">{totalAnnouncements}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Active Broadcast Database</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">campaign</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Published Advisories</span>
            <span className="font-headline-lg text-2xl font-bold text-on-surface mt-1 block">{publishedCount}</span>
            <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">Visible to Students</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Target Audiences</span>
            <span className="font-headline-lg text-2xl font-bold text-on-surface mt-1 block">{Object.keys(audienceCounts).length}</span>
            <span className="text-[10px] text-purple-600 font-semibold mt-0.5 block">Custom Segments</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">groups</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Target Audience Distribution */}
      <div className="bg-surface-card p-5 rounded-2xl border border-border-subtle shadow-xs">
        <div className="mb-4">
          <h3 className="font-title text-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">pie_chart</span>
            <span>Broadcast Distribution by Audience Segment</span>
          </h3>
          <p className="text-xs text-on-surface-variant">Live breakdown of announcement reach</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(audienceCounts).map(([aud, count]) => {
            const numCount = Number(count);
            const pct = totalAnnouncements > 0 ? Math.round((numCount / totalAnnouncements) * 100) : 0;
            return (
              <div key={aud} className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex flex-col justify-between">
                <div className="flex justify-between text-xs font-semibold text-on-surface mb-1">
                  <span>{aud}</span>
                  <span className="font-mono-code font-bold text-primary">{numCount} ({pct}%)</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl p-5 max-w-md w-full border border-border-subtle shadow-xl">
            <h2 className="font-title text-base font-bold text-on-surface mb-3">Create Official Announcement</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Library Timings Extended"
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-border-subtle text-on-surface focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-border-subtle text-on-surface focus:outline-none"
                >
                  <option value="All Students">All Students</option>
                  <option value="Hostel Students">Hostel Students</option>
                  <option value="Day Scholars">Day Scholars</option>
                  <option value="Final Year Students">Final Year Students</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Message Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full announcement text..."
                  className="w-full min-h-[80px] p-3 rounded-xl bg-surface-container-low border border-border-subtle text-on-surface focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-container text-on-surface-variant font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary text-white font-semibold shadow-xs"
                >
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Announcements Table */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-subtle font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Audience</th>
                <th className="p-3.5">Created On</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Author</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {announcements.map((anc) => (
                <tr key={anc.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-3.5 font-semibold text-on-surface">{anc.title}</td>
                  <td className="p-3.5 text-on-surface-variant">{anc.audience}</td>
                  <td className="p-3.5 font-mono-code text-on-surface-variant">{anc.createdOn}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                      {anc.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono-code text-on-surface-variant">{anc.author}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
