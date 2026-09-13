import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  ArrowRight,
  FolderCheck,
  Building2,
  Ticket,
  MapPin,
  Compass,
  CornerDownLeft,
  ArrowUpDown,
  Bell,
  Sliders,
  MessageSquare,
  Sparkles,
  Shield,
  BookOpen
} from 'lucide-react';
import { TicketReport, Facility, CategoryInfo, NavigationTab } from '../types';
import { masterCategories, initialFacilities } from '../data/mockData';

export interface CommandPaletteSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavigationTab, extraData?: any) => void;
  reports: TicketReport[];
  onSelectTicketDetail?: (report: TicketReport) => void;
  onSelectCategory?: (categoryKey: string) => void;
  onSelectFacility?: (facility: Facility) => void;
}

export type SearchResultGroup = 'TICKETS' | 'CATEGORIES' | 'FACILITIES' | 'PAGES';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  group: SearchResultGroup;
  badge?: string;
  badgeColor?: string;
  iconName?: string;
  originalData?: TicketReport | Facility | CategoryInfo | NavigationTab;
  onSelect: () => void;
}

export const CommandPaletteSearch: React.FC<CommandPaletteSearchProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  reports,
  onSelectTicketDetail,
  onSelectCategory,
  onSelectFacility,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build searchable items dynamically from REAL existing application data
  const results: SearchResultItem[] = React.useMemo(() => {
    const searchItems: SearchResultItem[] = [];
    const cleanQuery = query.trim().toLowerCase();

    // 1. NAVIGATION PAGES
    const pagesList: { id: NavigationTab; title: string; subtitle: string; icon: string }[] = [
      { id: 'dashboard', title: 'Dashboard Overview', subtitle: 'View real-time campus metrics and ticket activity', icon: 'compass' },
      { id: 'report-problem', title: 'Report a Problem', subtitle: 'Submit a new issue for AI classification & squad dispatch', icon: 'sparkles' },
      { id: 'facilities', title: 'Campus Facilities & Services', subtitle: 'Browse labs, library, canteen, sports & campus services', icon: 'building' },
      { id: 'my-reports', title: 'My Tickets & History', subtitle: 'Track status and updates on your submitted reports', icon: 'ticket' },
      { id: 'feedback', title: 'Campus Feedback', subtitle: 'Submit general suggestions and institutional ratings', icon: 'message' },
      { id: 'settings', title: 'Profile & Settings', subtitle: 'Manage student credentials, contact info & preferences', icon: 'sliders' },
    ];

    pagesList.forEach((page) => {
      if (
        !cleanQuery ||
        page.title.toLowerCase().includes(cleanQuery) ||
        page.subtitle.toLowerCase().includes(cleanQuery) ||
        page.id.toLowerCase().includes(cleanQuery)
      ) {
        searchItems.push({
          id: `page-${page.id}`,
          title: page.title,
          subtitle: page.subtitle,
          group: 'PAGES',
          badge: 'NAVIGATION',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          originalData: page.id,
          onSelect: () => {
            onClose();
            onNavigateTab(page.id);
          },
        });
      }
    });

    // 2. TICKETS / COMPLAINTS / INCIDENTS
    reports.forEach((ticket) => {
      const matchText = `${ticket.id} ${ticket.title} ${ticket.category} ${ticket.subCategory || ''} ${ticket.location} ${ticket.description} ${ticket.status} ${ticket.squad || ''}`.toLowerCase();
      if (!cleanQuery || matchText.includes(cleanQuery)) {
        searchItems.push({
          id: `ticket-${ticket.id}`,
          title: `${ticket.id}: ${ticket.title}`,
          subtitle: `${ticket.category} • ${ticket.location} • ${ticket.status}`,
          group: 'TICKETS',
          badge: ticket.status,
          badgeColor: ticket.status === 'Resolved' || ticket.status === 'Closed'
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            : ticket.status === 'In Progress' || ticket.status === 'Under Review'
            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            : 'bg-slate-500/10 text-slate-600 border-slate-500/20',
          originalData: ticket,
          onSelect: () => {
            onClose();
            if (onSelectTicketDetail) {
              onSelectTicketDetail(ticket);
            } else {
              onNavigateTab('my-reports');
            }
          },
        });
      }
    });

    // 3. CATEGORIES & ISSUES
    masterCategories.forEach((cat) => {
      const issuesText = cat.issues.join(' ');
      const matchText = `${cat.name} ${cat.subtitle} ${cat.question} ${issuesText}`.toLowerCase();
      if (!cleanQuery || matchText.includes(cleanQuery)) {
        searchItems.push({
          id: `cat-${cat.key}`,
          title: cat.name,
          subtitle: `${cat.subtitle} (${cat.issues.length} issue types)`,
          group: 'CATEGORIES',
          badge: 'CATEGORY',
          badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
          originalData: cat,
          onSelect: () => {
            onClose();
            if (onSelectCategory) {
              onSelectCategory(cat.key);
            } else {
              onNavigateTab('report-problem', { domain: cat.key });
            }
          },
        });
      }
    });

    // 4. FACILITIES & BUILDINGS
    initialFacilities.forEach((facility) => {
      const servicesText = facility.services.join(' ');
      const matchText = `${facility.name} ${facility.title} ${facility.description} ${facility.location} ${facility.access} ${servicesText}`.toLowerCase();
      if (!cleanQuery || matchText.includes(cleanQuery)) {
        searchItems.push({
          id: `fac-${facility.id}`,
          title: facility.name,
          subtitle: `${facility.title} • ${facility.location}`,
          group: 'FACILITIES',
          badge: facility.badge || 'FACILITY',
          badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
          originalData: facility,
          onSelect: () => {
            onClose();
            if (onSelectFacility) {
              onSelectFacility(facility);
            } else {
              onNavigateTab('facilities');
            }
          },
        });
      }
    });

    return searchItems;
  }, [query, reports, onClose, onNavigateTab, onSelectTicketDetail, onSelectCategory, onSelectFacility]);

  // Keep index within bounds
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (results.length === 0) return 0;
      return Math.min(prev, results.length - 1);
    });
  }, [results]);

  // Handle keyboard navigation inside search list
  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        results[selectedIndex].onSelect();
      }
    }
  };

  // Group results for structured display
  const groupedResults = React.useMemo<Record<SearchResultGroup, SearchResultItem[]>>(() => {
    const groups: Record<SearchResultGroup, SearchResultItem[]> = {
      PAGES: [],
      TICKETS: [],
      CATEGORIES: [],
      FACILITIES: [],
    };
    results.forEach((item) => {
      groups[item.group].push(item);
    });
    return groups;
  }, [results]);

  if (!isOpen) return null;

  let globalItemIndex = 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search Command Palette"
      className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-start justify-center pt-8 sm:pt-16 md:pt-24 p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-3.5 sm:p-4 bg-surface-container-low border-b border-border-subtle flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInput}
            placeholder="Search tickets, facilities, categories, pages, or locations..."
            className="w-full bg-transparent text-sm sm:text-base font-body-md text-on-surface placeholder:text-outline focus:outline-none pr-16"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-surface-container border border-border-subtle text-on-surface-variant font-mono-code text-[11px] font-medium shadow-2xs">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Close search modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {results.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <Search className="w-8 h-8 text-outline mb-1 opacity-60" />
              <p className="font-title text-sm font-semibold text-on-surface">No matching records found</p>
              <p className="font-body-sm text-xs text-outline max-w-xs">
                Try searching for a ticket ID (e.g. TK-9041), category (e.g. Hostel), or facility (e.g. Library).
              </p>
            </div>
          ) : (
            (Object.keys(groupedResults) as SearchResultGroup[]).map((groupName) => {
              const items = groupedResults[groupName];
              if (!items || items.length === 0) return null;
              return (
                <div key={groupName} className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[10.5px] font-mono-code font-bold uppercase tracking-wider text-on-surface-variant/80">
                      {groupName} ({items.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const currentIndex = globalItemIndex++;
                      const isSelected = currentIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => item.onSelect()}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-primary/10 border-primary/40 shadow-xs'
                              : 'bg-surface-card hover:bg-surface-container-low border-border-subtle/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-on-surface-variant'
                              }`}
                            >
                              {item.group === 'TICKETS' && <Ticket className="w-4 h-4" />}
                              {item.group === 'CATEGORIES' && <FolderCheck className="w-4 h-4" />}
                              {item.group === 'FACILITIES' && <Building2 className="w-4 h-4" />}
                              {item.group === 'PAGES' && <Compass className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-title text-xs sm:text-sm font-semibold text-on-surface truncate">
                                  {item.title}
                                </span>
                              </div>
                              <span className="font-body-sm text-[11px] sm:text-xs text-on-surface-variant truncate">
                                {item.subtitle}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.badge && (
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-mono-code font-bold uppercase ${
                                  item.badgeColor || 'bg-surface-container text-on-surface-variant border-border-subtle'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ArrowRight
                              className={`w-4 h-4 transition-transform ${
                                isSelected ? 'text-primary translate-x-0.5' : 'text-outline opacity-40'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-2.5 sm:p-3 bg-surface-container-lowest border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-code text-on-surface-variant px-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-border-subtle text-[10px]">↑↓</kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-border-subtle text-[10px]">↵</kbd>{' '}
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-border-subtle text-[10px]">ESC</kbd>{' '}
              Close
            </span>
          </div>
          <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider">NexCampus Global Search</span>
        </div>
      </motion.div>
    </div>
  );
};
