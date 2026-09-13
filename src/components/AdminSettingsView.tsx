import React from 'react';

export const AdminSettingsView: React.FC = () => {
  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto gap-6 pb-12">
      <div>
        <span className="font-mono-code text-xs font-bold text-primary uppercase tracking-wider">
          SYSTEM CONFIGURATION
        </span>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          System Settings
        </h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Manage campus platform defaults, timezone formatting, and operational parameters.
        </p>
      </div>

      <div className="bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-xs flex flex-col gap-5 text-xs">
        <h2 className="font-title text-base font-bold text-on-surface border-b border-border-subtle pb-3">
          General Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-on-surface block mb-1">Campus Name</label>
            <input
              type="text"
              readOnly
              value="NexCampus University Portal"
              className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-border-subtle text-on-surface font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-on-surface block mb-1">Primary Timezone</label>
            <input
              type="text"
              readOnly
              value="Asia/Kolkata (IST, UTC+05:30)"
              className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-border-subtle text-primary font-mono-code font-bold"
            />
          </div>
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            All database timestamps across student complaints, dispatch updates, and admin timelines are automatically calculated and converted into <strong>Asia/Kolkata (IST)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
