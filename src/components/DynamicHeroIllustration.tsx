import React from 'react';

interface DynamicHeroIllustrationProps {
  categoryKey: string;
  issueType?: string | null;
  className?: string;
}

export const DynamicHeroIllustration: React.FC<DynamicHeroIllustrationProps> = ({
  categoryKey,
  issueType,
  className = '',
}) => {
  const normCategory = (categoryKey || '').toLowerCase();
  const normIssue = (issueType || '').toLowerCase();

  // Cleanliness / Overflowing Garbage Bin
  if (normIssue.includes('garbage') || normIssue.includes('bin') || normCategory.includes('cleanliness')) {
    return (
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
        {/* Soft Mint Aura Backdrop */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100/80 via-teal-50 to-emerald-200/50 animate-hero-pulse shadow-inner" />
        
        {/* Floating background leaf 1 */}
        <svg className="absolute top-1 left-2 w-4 h-4 text-emerald-400 opacity-70 animate-hero-float-slow" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,10 59,16 3,21C3,21 7,10 17,8Z" />
        </svg>

        {/* Floating background leaf 2 */}
        <svg className="absolute bottom-2 right-2 w-3.5 h-3.5 text-teal-500 opacity-60 animate-hero-float-delay" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,10 59,16 3,21C3,21 7,10 17,8Z" />
        </svg>

        {/* 2.5D Vector Garbage Bin Container */}
        <div className="relative z-10 animate-hero-float flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soft Shadow Base */}
            <ellipse cx="50" cy="90" rx="30" ry="6" fill="#0f5b43" fillOpacity="0.15" />
            
            {/* Bin Body Depth (3D side) */}
            <path d="M26 38 L31 84 Q32 88 36 88 L64 88 Q68 88 69 84 L74 38 Z" fill="#0f5b43" />
            {/* Bin Body Front Gradient */}
            <path d="M28 38 L32 83 Q33 86 37 86 L63 86 Q67 86 68 83 L72 38 Z" fill="url(#binBodyGrad)" />
            
            {/* Vertical Rib Lines on Bin */}
            <line x1="42" y1="44" x2="43" y2="80" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="44" x2="50" y2="80" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="58" y1="44" x2="57" y2="80" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Recycle Badge Emblem */}
            <circle cx="50" cy="62" r="10" fill="#ffffff" fillOpacity="0.95" />
            <path d="M47 57 L53 57 L50 54 Z M53 60 L56 65 L59 62 Z M44 65 L47 60 L44 58 Z" fill="#0f5b43" />
            <path d="M46 59 Q50 56 54 59 M54 62 Q52 67 47 65 M45 64 Q43 59 47 58" stroke="#0f5b43" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Overfilled Trash / Plant Leaves Top Accent */}
            <path d="M34 36 Q42 24 50 30 Q58 20 66 36 Z" fill="#34d399" />
            <path d="M40 34 Q45 27 50 32 Q55 26 60 34 Z" fill="#a7f3d0" />

            {/* Bin Lid (Angled Open 2.5D Rim) */}
            <path d="M22 34 L78 34 L75 38 L25 38 Z" fill="#0b4533" />
            <rect x="20" y="32" width="60" height="5" rx="2.5" fill="url(#binLidGrad)" />
            {/* Bin Lid Handle */}
            <rect x="42" y="27" width="16" height="5" rx="2.5" fill="#176b52" />

            <defs>
              <linearGradient id="binBodyGrad" x1="28" y1="38" x2="72" y2="86" gradientUnits="userSpaceOnUse">
                <stop stopColor="#176b52" />
                <stop offset="1" stopColor="#0f5b43" />
              </linearGradient>
              <linearGradient id="binLidGrad" x1="20" y1="32" x2="80" y2="37" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Water / Plumbing / Leakage
  if (normIssue.includes('water') || normIssue.includes('leak') || normIssue.includes('plumb') || normIssue.includes('pipe') || normIssue.includes('washroom')) {
    return (
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-100/80 via-blue-50 to-cyan-200/50 animate-hero-pulse shadow-inner" />
        
        {/* Floating water drops */}
        <div className="absolute top-2 right-4 w-2.5 h-3.5 bg-sky-400 rounded-full animate-hero-drift opacity-80" style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }} />
        <div className="absolute bottom-4 left-3 w-2 h-3 bg-cyan-400 rounded-full animate-hero-float-slow opacity-70" />

        <div className="relative z-10 animate-hero-float flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="88" rx="28" ry="5" fill="#0284c7" fillOpacity="0.15" />
            {/* Water Puddle Base */}
            <ellipse cx="50" cy="82" rx="22" ry="6" fill="#7dd3fc" fillOpacity="0.6" />
            <ellipse cx="50" cy="82" rx="14" ry="3.5" fill="#38bdf8" fillOpacity="0.8" />
            
            {/* Metallic Pipe Fixture */}
            <path d="M25 35 L48 35 L48 60 Q48 68 56 68 L75 68" stroke="#0284c7" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M25 35 L48 35 L48 60 Q48 68 56 68 L75 68" stroke="url(#pipeGrad)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Pipe Joint Ring */}
            <rect x="43" y="42" width="10" height="6" rx="2" fill="#0369a1" />

            {/* Glowing Water Drop Falling */}
            <path d="M48 65 Q48 74 53 74 Q58 74 58 65 Q58 58 53 52 Q48 58 48 65 Z" fill="url(#dropGrad)" className="animate-hero-float-slow" />
            
            <defs>
              <linearGradient id="pipeGrad" x1="25" y1="35" x2="75" y2="68" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#bae6fd" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="dropGrad" x1="48" y1="52" x2="58" y2="74" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Transport / Bus
  if (normCategory.includes('transport') || normIssue.includes('bus') || normIssue.includes('shuttle') || normIssue.includes('route')) {
    return (
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100/80 via-indigo-50 to-sky-200/50 animate-hero-pulse shadow-inner" />
        
        {/* Floating speed lines */}
        <div className="absolute top-5 left-2 w-5 h-1 bg-indigo-300 rounded-full opacity-60 animate-hero-shimmer" />
        <div className="absolute bottom-6 left-1 w-7 h-1 bg-blue-300 rounded-full opacity-50 animate-hero-shimmer" />

        <div className="relative z-10 animate-hero-float flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="86" rx="32" ry="5" fill="#1e40af" fillOpacity="0.15" />
            
            {/* Bus Body */}
            <rect x="18" y="32" width="64" height="42" rx="10" fill="url(#busBodyGrad)" />
            {/* Bus Roof Highlight */}
            <path d="M22 32 L78 32 Q82 32 82 36 L18 36 Q18 32 22 32 Z" fill="#60a5fa" />
            
            {/* Windshield & Windows */}
            <rect x="24" y="38" width="16" height="15" rx="3" fill="#dbeafe" />
            <rect x="44" y="38" width="14" height="15" rx="3" fill="#dbeafe" />
            <rect x="62" y="38" width="14" height="15" rx="3" fill="#dbeafe" />
            
            {/* Headlights */}
            <circle cx="24" cy="64" r="3.5" fill="#fef08a" />
            <circle cx="76" cy="64" r="3.5" fill="#fef08a" />
            
            {/* Bumper Bar */}
            <rect x="22" y="68" width="56" height="4" rx="2" fill="#1e3a8a" />

            {/* Wheels */}
            <circle cx="32" cy="74" r="8" fill="#1e293b" />
            <circle cx="32" cy="74" r="3.5" fill="#94a3b8" />
            <circle cx="68" cy="74" r="8" fill="#1e293b" />
            <circle cx="68" cy="74" r="3.5" fill="#94a3b8" />

            {/* Clock Overlay Badge (Delays) */}
            <circle cx="74" cy="28" r="10" fill="#ffffff" />
            <circle cx="74" cy="28" r="8.5" fill="#ef4444" />
            <path d="M74 23 L74 28 L78 28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

            <defs>
              <linearGradient id="busBodyGrad" x1="18" y1="32" x2="82" y2="74" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Safety & Security
  if (normCategory.includes('safety') || normCategory.includes('security') || normIssue.includes('cctv') || normIssue.includes('theft') || normIssue.includes('hazard')) {
    return (
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100/80 via-teal-50 to-green-200/50 animate-hero-pulse shadow-inner" />
        
        <div className="relative z-10 animate-hero-float flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="88" rx="26" ry="5" fill="#065f46" fillOpacity="0.15" />
            
            {/* Outer Shield Glow */}
            <path d="M50 18 L76 28 C76 58 50 78 50 78 C50 78 24 58 24 28 Z" fill="#d1fae5" />
            {/* Main Shield Body */}
            <path d="M50 22 L72 31 C72 55 50 73 50 73 C50 73 28 55 28 31 Z" fill="url(#shieldGrad)" />
            {/* Inner Shield Accent */}
            <path d="M50 27 L66 34 C66 51 50 65 50 65 C50 65 34 51 34 34 Z" fill="#047857" fillOpacity="0.4" />
            
            {/* Keyhole / Checkmark Emblem */}
            <path d="M42 46 L48 52 L59 40" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

            <defs>
              <linearGradient id="shieldGrad" x1="28" y1="22" x2="72" y2="73" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Hostel / Room Maintenance / Bed
  if (normCategory.includes('hostel') || normIssue.includes('room') || normIssue.includes('bed') || normIssue.includes('furniture')) {
    return (
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100/80 via-teal-50 to-emerald-200/50 animate-hero-pulse shadow-inner" />
        
        <div className="relative z-10 animate-hero-float flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="86" rx="30" ry="5" fill="#0f5b43" fillOpacity="0.15" />
            
            {/* Bed Headboard */}
            <rect x="22" y="34" width="10" height="42" rx="3" fill="#176b52" />
            {/* Bed Footboard */}
            <rect x="74" y="48" width="8" height="28" rx="3" fill="#176b52" />
            {/* Bed Frame Base */}
            <rect x="26" y="58" width="52" height="12" rx="3" fill="#0f5b43" />
            
            {/* Mattress */}
            <rect x="30" y="50" width="46" height="10" rx="4" fill="#ecfdf5" />
            {/* Pillow */}
            <rect x="33" y="45" width="14" height="8" rx="3" fill="#a7f3d0" />
            {/* Blanket Cover */}
            <path d="M46 50 L75 50 Q77 50 77 53 L77 60 L46 60 Z" fill="#34d399" />

            {/* Wrench / Maintenance Floating Tool */}
            <circle cx="70" cy="30" r="10" fill="#ffffff" />
            <path d="M66 34 L74 26 M72 24 L76 28" stroke="#0f5b43" strokeWidth="2.5" strokeLinecap="round" />

            <defs>
              <linearGradient id="hostelGrad" x1="22" y1="34" x2="82" y2="76" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Food / Canteen / Dining
  if (normCategory.includes('food') || normCategory.includes('canteen') || normIssue.includes('mess') || normIssue.includes('hygiene')) {
    return (
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-100/80 via-emerald-50 to-amber-200/50 animate-hero-pulse shadow-inner" />
        
        <div className="relative z-10 animate-hero-float flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="86" rx="28" ry="5" fill="#b45309" fillOpacity="0.15" />
            
            {/* Tray Base */}
            <rect x="20" y="58" width="60" height="14" rx="5" fill="#d97706" />
            <rect x="22" y="56" width="56" height="6" rx="3" fill="#fef3c7" />
            
            {/* Meal Cloche Dome */}
            <path d="M28 54 Q28 28 50 28 Q72 28 72 54 Z" fill="url(#foodGrad)" />
            {/* Cloche Handle Knob */}
            <circle cx="50" cy="25" r="4.5" fill="#b45309" />
            <rect x="24" y="52" width="52" height="4" rx="2" fill="#d97706" />

            {/* Steam Trails */}
            <path d="M42 20 Q40 14 44 10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" className="animate-hero-float-slow" fill="none" />
            <path d="M54 20 Q56 14 52 10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" className="animate-hero-float-delay" fill="none" />

            <defs>
              <linearGradient id="foodGrad" x1="28" y1="28" x2="72" y2="54" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Academic / Education
  if (normCategory.includes('academic') || normIssue.includes('exam') || normIssue.includes('grade') || normIssue.includes('course') || normIssue.includes('projector')) {
    return (
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-100/80 via-emerald-50 to-purple-200/50 animate-hero-pulse shadow-inner" />
        
        <div className="relative z-10 animate-hero-float flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="86" rx="28" ry="5" fill="#5b21b6" fillOpacity="0.15" />
            
            {/* Stacked Books Base */}
            <rect x="22" y="64" width="56" height="12" rx="3" fill="#7c3aed" />
            <rect x="26" y="66" width="48" height="8" rx="2" fill="#ede9fe" />
            
            <rect x="26" y="52" width="50" height="12" rx="3" fill="#0f5b43" />
            <rect x="30" y="54" width="42" height="8" rx="2" fill="#d1fae5" />
            
            {/* Graduation Cap Top */}
            <path d="M50 24 L80 36 L50 48 L20 36 Z" fill="url(#acadGrad)" />
            <rect x="38" y="42" width="24" height="10" rx="3" fill="#4c1d95" />
            {/* Tassel */}
            <path d="M72 39 L78 50" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="78" cy="52" r="2.5" fill="#f59e0b" />

            <defs>
              <linearGradient id="acadGrad" x1="20" y1="24" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#6d28d9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Infrastructure / General Electrical / Building
  if (normCategory.includes('infrastructure') || normIssue.includes('power') || normIssue.includes('electr') || normIssue.includes('hvac') || normIssue.includes('elevator')) {
    return (
      <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-100/80 via-emerald-50 to-orange-200/50 animate-hero-pulse shadow-inner" />
        
        <div className="relative z-10 animate-hero-float flex flex-col items-center">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="86" rx="28" ry="5" fill="#c2410c" fillOpacity="0.15" />
            
            {/* Switchbox Panel */}
            <rect x="26" y="24" width="48" height="58" rx="8" fill="url(#infraGrad)" />
            <rect x="30" y="28" width="40" height="50" rx="5" fill="#fff7ed" />
            
            {/* Circuit Breakers */}
            <rect x="36" y="36" width="10" height="20" rx="3" fill="#ea580c" />
            <rect x="54" y="36" width="10" height="20" rx="3" fill="#0f5b43" />
            
            {/* Power Bolt Emblem */}
            <path d="M52 60 L44 70 L49 70 L46 78 L56 67 L50 67 Z" fill="#f59e0b" />

            <defs>
              <linearGradient id="infraGrad" x1="26" y1="24" x2="74" y2="82" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f97316" />
                <stop offset="1" stopColor="#c2410c" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // Generic / Fallback Universal Campus Report Illustration
  return (
    <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center select-none ${className}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-100/80 via-teal-50 to-emerald-200/50 animate-hero-pulse shadow-inner" />
      
      <div className="relative z-10 animate-hero-float flex flex-col items-center">
        <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="86" rx="28" ry="5" fill="#0f5b43" fillOpacity="0.15" />
          
          {/* Clipboard Base */}
          <rect x="25" y="22" width="50" height="60" rx="7" fill="url(#genericGrad)" />
          <rect x="29" y="28" width="42" height="48" rx="4" fill="#ffffff" />
          
          {/* Clip Top */}
          <rect x="40" y="18" width="20" height="8" rx="3" fill="#065f46" />
          <circle cx="50" cy="22" r="2" fill="#ffffff" />

          {/* Form Lines */}
          <rect x="35" y="36" width="30" height="4" rx="2" fill="#a7f3d0" />
          <rect x="35" y="44" width="24" height="3" rx="1.5" fill="#d1fae5" />
          <rect x="35" y="50" width="28" height="3" rx="1.5" fill="#d1fae5" />
          
          {/* Green Check Badge */}
          <circle cx="62" cy="62" r="9" fill="#10b981" />
          <path d="M57 62 L60 65 L67 58" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          <defs>
            <linearGradient id="genericGrad" x1="25" y1="22" x2="75" y2="82" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0f5b43" />
              <stop offset="1" stopColor="#065f46" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
