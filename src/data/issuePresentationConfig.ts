/**
 * Issue Presentation Configuration
 * 
 * Dynamic mapping that drives the Problem Details page presentation.
 * Uses existing masterCategories data — does NOT invent new categories or issues.
 * 
 * Fallback chain: Issue-specific config → Category config → Generic default
 */

export interface IssuePresentationConfig {
  /** Material Symbols icon name for the hero illustration */
  heroIcon: string;
  /** Tailwind background color class for the hero circle */
  heroBg: string;
  /** Tailwind text color class for the hero icon */
  heroColor: string;
  /** Secondary decorative icon (smaller, accent) */
  accentIcon: string;
  /** Helper description for the form page */
  helperText: string;
  /** Location field placeholder */
  locPlaceholder: string;
}

/** Category-level presentation — one per masterCategory key */
const categoryPresentation: Record<string, IssuePresentationConfig> = {
  hostel: {
    heroIcon: 'apartment',
    heroBg: 'bg-emerald-100',
    heroColor: 'text-emerald-700',
    accentIcon: 'bed',
    helperText: 'Provide problem details and location to help the hostel maintenance team address this promptly.',
    locPlaceholder: 'Block, Room Number, Floor (e.g. Block C, Room 312)',
  },
  'student-welfare': {
    heroIcon: 'favorite',
    heroBg: 'bg-rose-100',
    heroColor: 'text-rose-600',
    accentIcon: 'support_agent',
    helperText: 'Share what support you need. Your report is handled with care and confidentiality.',
    locPlaceholder: 'Campus Center, Student Lounge, or Online',
  },
  transport: {
    heroIcon: 'directions_bus',
    heroBg: 'bg-blue-100',
    heroColor: 'text-blue-700',
    accentIcon: 'route',
    helperText: 'Help us improve campus transport by reporting route, schedule, or vehicle issues.',
    locPlaceholder: 'Bus Stop, Route Number, Terminal (e.g. North Terminal, Route 7)',
  },
  'college-campus': {
    heroIcon: 'domain',
    heroBg: 'bg-indigo-100',
    heroColor: 'text-indigo-700',
    accentIcon: 'meeting_room',
    helperText: 'Report classroom, lab, or facility issues to help campus operations resolve them quickly.',
    locPlaceholder: 'Building, Room, Floor (e.g. Admin Block A, Senate Hall)',
  },
  'food-canteen': {
    heroIcon: 'restaurant',
    heroBg: 'bg-amber-100',
    heroColor: 'text-amber-700',
    accentIcon: 'local_cafe',
    helperText: 'Report food quality, hygiene, or service issues to improve dining for everyone.',
    locPlaceholder: 'Dining Hall, Counter, Station (e.g. Central Dining Hall, Station 2)',
  },
  'safety-security': {
    heroIcon: 'shield',
    heroBg: 'bg-red-50',
    heroColor: 'text-red-600',
    accentIcon: 'visibility',
    helperText: 'Report safety concerns to keep our campus secure for all students and staff.',
    locPlaceholder: 'Pathway, Gate, Zone (e.g. Perimeter Pathway, Gate 3)',
  },
  'cleanliness-sanitation': {
    heroIcon: 'cleaning_services',
    heroBg: 'bg-teal-100',
    heroColor: 'text-teal-700',
    accentIcon: 'recycling',
    helperText: 'Report sanitation issues to maintain clean and healthy campus spaces.',
    locPlaceholder: 'Building, Restroom, Area (e.g. Building D Restrooms, South Walkway)',
  },
  'infrastructure-maintenance': {
    heroIcon: 'build',
    heroBg: 'bg-orange-100',
    heroColor: 'text-orange-700',
    accentIcon: 'plumbing',
    helperText: 'Report electrical, plumbing, or structural issues for prompt maintenance dispatch.',
    locPlaceholder: 'Building, Floor, Area (e.g. Science Tower, Elevator B)',
  },
  academic: {
    heroIcon: 'school',
    heroBg: 'bg-violet-100',
    heroColor: 'text-violet-700',
    accentIcon: 'auto_stories',
    helperText: 'Report academic or faculty-related issues for administrative resolution.',
    locPlaceholder: 'Department, Classroom, Lab (e.g. CS Dept, Room 204)',
  },
  'substance-concern': {
    heroIcon: 'health_and_safety',
    heroBg: 'bg-slate-100',
    heroColor: 'text-slate-600',
    accentIcon: 'privacy_tip',
    helperText: 'Your report is confidential. Share what support is needed — anonymous support is respected.',
    locPlaceholder: 'Optional: General area or vicinity',
  },
  other: {
    heroIcon: 'help_outline',
    heroBg: 'bg-gray-100',
    heroColor: 'text-gray-600',
    accentIcon: 'lightbulb',
    helperText: 'Describe the issue in detail so the campus team can route it to the right department.',
    locPlaceholder: 'Campus Location or Department Name',
  },
};

/** Issue-specific overrides (only where the icon/theme should differ from category default) */
const issueOverrides: Record<string, Partial<IssuePresentationConfig>> = {
  // Hostel
  'Room Maintenance': { heroIcon: 'handyman', accentIcon: 'home_repair_service' },
  'Water Supply': { heroIcon: 'water_drop', heroBg: 'bg-cyan-100', heroColor: 'text-cyan-700', accentIcon: 'opacity' },
  'Electricity': { heroIcon: 'electrical_services', heroBg: 'bg-yellow-100', heroColor: 'text-yellow-700', accentIcon: 'bolt' },
  'Wi-Fi / Internet': { heroIcon: 'wifi', heroBg: 'bg-blue-100', heroColor: 'text-blue-700', accentIcon: 'router' },
  'Furniture': { heroIcon: 'chair', accentIcon: 'table_restaurant' },
  'Pest / Insect Problem': { heroIcon: 'pest_control', heroBg: 'bg-orange-100', heroColor: 'text-orange-700', accentIcon: 'bug_report' },
  'Laundry': { heroIcon: 'local_laundry_service', accentIcon: 'dry_cleaning' },
  'Noise / Disturbance': { heroIcon: 'volume_off', heroBg: 'bg-rose-100', heroColor: 'text-rose-600', accentIcon: 'hearing_disabled' },

  // Cleanliness & Sanitation
  'Overflowing Garbage Bin': { heroIcon: 'delete', heroBg: 'bg-teal-100', heroColor: 'text-teal-700', accentIcon: 'recycling' },
  'Washroom Deep Cleaning Required': { heroIcon: 'soap', accentIcon: 'wash' },
  'Stagnant Water / Mosquito Hazard': { heroIcon: 'water', heroBg: 'bg-amber-100', heroColor: 'text-amber-700', accentIcon: 'pest_control' },
  'Spill / Slip Hazard': { heroIcon: 'warning', heroBg: 'bg-yellow-100', heroColor: 'text-yellow-700', accentIcon: 'report' },

  // Infrastructure & Maintenance
  'Major Electrical Power Outage': { heroIcon: 'power_off', heroBg: 'bg-red-50', heroColor: 'text-red-600', accentIcon: 'bolt' },
  'Plumbing Leakage / Burst Pipe': { heroIcon: 'plumbing', heroBg: 'bg-cyan-100', heroColor: 'text-cyan-700', accentIcon: 'water_drop' },
  'Ceiling / Wall Seepage': { heroIcon: 'water_damage', heroBg: 'bg-blue-100', heroColor: 'text-blue-700', accentIcon: 'roofing' },
  'Broken Window / Glass Hazard': { heroIcon: 'window', heroBg: 'bg-red-50', heroColor: 'text-red-600', accentIcon: 'dangerous' },
  'Door Lock / Handle Fault': { heroIcon: 'lock', heroBg: 'bg-slate-100', heroColor: 'text-slate-600', accentIcon: 'door_front' },

  // Transport
  'Bus / Shuttle Delays': { heroIcon: 'schedule', heroBg: 'bg-blue-100', heroColor: 'text-blue-700', accentIcon: 'departure_board' },
  'Route Overcrowding': { heroIcon: 'groups', heroBg: 'bg-orange-100', heroColor: 'text-orange-700', accentIcon: 'airline_seat_recline_normal' },
  'EV Charging Station Fault': { heroIcon: 'ev_station', heroBg: 'bg-green-100', heroColor: 'text-green-700', accentIcon: 'electric_car' },
  'Bicycle Stand Issue': { heroIcon: 'pedal_bike', heroBg: 'bg-lime-100', heroColor: 'text-lime-700', accentIcon: 'two_wheeler' },

  // College / Campus
  'Classroom Projector / AV Failure': { heroIcon: 'videocam_off', heroBg: 'bg-purple-100', heroColor: 'text-purple-700', accentIcon: 'smart_display' },
  'Lab Equipment Damage': { heroIcon: 'science', heroBg: 'bg-teal-100', heroColor: 'text-teal-700', accentIcon: 'biotech' },
  'HVAC / Air Conditioning Failure': { heroIcon: 'ac_unit', heroBg: 'bg-sky-100', heroColor: 'text-sky-700', accentIcon: 'thermostat' },
  'Elevator Breakdown': { heroIcon: 'elevator', heroBg: 'bg-red-50', heroColor: 'text-red-600', accentIcon: 'warning' },

  // Food / Canteen
  'Food Quality & Taste': { heroIcon: 'restaurant_menu', accentIcon: 'thumb_down' },
  'Hygiene & Foreign Contaminants': { heroIcon: 'report_problem', heroBg: 'bg-red-50', heroColor: 'text-red-600', accentIcon: 'health_and_safety' },
  'Water Quality in Mess': { heroIcon: 'water_drop', heroBg: 'bg-cyan-100', heroColor: 'text-cyan-700', accentIcon: 'local_drink' },

  // Safety & Security
  'CCTV Camera Blindspots': { heroIcon: 'videocam_off', heroBg: 'bg-slate-100', heroColor: 'text-slate-600', accentIcon: 'cctv' },
  'Dark / Poorly Lit Pathway': { heroIcon: 'lightbulb', heroBg: 'bg-yellow-100', heroColor: 'text-yellow-700', accentIcon: 'flashlight_on' },
  'Theft or Lost Property': { heroIcon: 'search', heroBg: 'bg-orange-100', heroColor: 'text-orange-700', accentIcon: 'inventory' },
  'Fire Extinguisher Expired': { heroIcon: 'local_fire_department', heroBg: 'bg-red-50', heroColor: 'text-red-600', accentIcon: 'fire_hydrant_alt' },

  // Academic
  'Timetable / Exam Clash': { heroIcon: 'event_busy', heroBg: 'bg-red-50', heroColor: 'text-red-600', accentIcon: 'calendar_today' },
  'Grading Portal Glitch': { heroIcon: 'bug_report', heroBg: 'bg-orange-100', heroColor: 'text-orange-700', accentIcon: 'computer' },
  'Course Material Missing': { heroIcon: 'menu_book', heroBg: 'bg-indigo-100', heroColor: 'text-indigo-700', accentIcon: 'library_books' },

  // Student Welfare
  'Counseling / Mental Health Support': { heroIcon: 'psychology', heroBg: 'bg-purple-100', heroColor: 'text-purple-700', accentIcon: 'self_improvement' },
  'Health Center & First Aid': { heroIcon: 'medical_services', heroBg: 'bg-red-50', heroColor: 'text-red-600', accentIcon: 'emergency' },
  'Disability Accommodation Request': { heroIcon: 'accessible', heroBg: 'bg-blue-100', heroColor: 'text-blue-700', accentIcon: 'accessibility_new' },
  'Harassment / Grievance Redressal': { heroIcon: 'gavel', heroBg: 'bg-slate-100', heroColor: 'text-slate-600', accentIcon: 'policy' },
};

/** Generic fallback for unknown categories */
const genericDefault: IssuePresentationConfig = {
  heroIcon: 'report',
  heroBg: 'bg-emerald-100',
  heroColor: 'text-emerald-700',
  accentIcon: 'campus',
  helperText: 'Provide problem details and location so the campus team can address this.',
  locPlaceholder: 'Campus location or building name',
};

/**
 * Get the presentation config for a given category key and optional issue type.
 * Falls back through: issue override → category default → generic default
 */
export function getIssuePresentationConfig(
  categoryKey: string,
  issueType?: string | null
): IssuePresentationConfig {
  const categoryConfig = categoryPresentation[categoryKey] || genericDefault;

  if (issueType && issueOverrides[issueType]) {
    return {
      ...categoryConfig,
      ...issueOverrides[issueType],
    };
  }

  return categoryConfig;
}
