import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Search, X } from 'lucide-react';
import type { InspectorTab } from '../data/clpsMissions';
import {
  GLOSSARY_CATEGORY_LABELS,
  GLOSSARY_ENTRIES,
  type GlossaryCategory,
} from '../data/glossaryTerms';

interface GlossaryPanelProps {
  simpleMode: boolean;
  onJumpToTab: (tab: InspectorTab) => void;
}

const CATEGORIES: (GlossaryCategory | 'all')[] = ['all', 'moon', 'maps', 'data', 'security'];

const TAB_NAMES_SIMPLE: Partial<Record<InspectorTab, string>> = {
  telemetry: 'Overview',
  matrix: 'Missions',
  ephemeris: 'Sun & Comms',
  czml: 'Flight Path',
  pds: 'Moon Data',
  drive: 'Google Drive',
  gmail: 'Gmail',
};

const TAB_NAMES_TECH: Partial<Record<InspectorTab, string>> = {
  telemetry: 'Telemetry',
  matrix: 'Missions',
  ephemeris: 'Ephemeris',
  czml: 'CZML',
  pds: 'PDS ODE',
  drive: 'Drive',
  gmail: 'Gmail',
};

export function GlossaryPanel({ simpleMode, onJumpToTab }: GlossaryPanelProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GlossaryCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY_ENTRIES.filter((entry) => {
      if (category !== 'all' && entry.category !== category) return false;
      if (!q) return true;
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.simpleName.toLowerCase().includes(q) ||
        entry.shortMeaning.toLowerCase().includes(q) ||
        entry.explanation.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5">
        <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {simpleMode ? 'Plain-Language Glossary' : 'Mission & Telemetry Glossary'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Clear, everyday explanations for the space terms, map layers, charts, and security checks
            used across this Moon browser.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a word (e.g. zenith, quaternion, LOLA, scope)..."
          className="w-full pl-8 pr-8 py-1.5 text-xs bg-[#070A10] border border-slate-800 rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/70"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-2 py-1 text-[11px] font-medium rounded whitespace-nowrap shrink-0 cursor-pointer ${
              category === cat
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {GLOSSARY_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="text-[11px] font-mono text-slate-400">
        Showing {filtered.length} of {GLOSSARY_ENTRIES.length} terms
      </div>

      {filtered.length === 0 ? (
        <div className="p-4 border border-slate-800 rounded bg-[#070A10] text-xs text-slate-400">
          No matching glossary terms found. Try clearing your search filter.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((entry) => {
            const tabLabel = entry.relatedTab
              ? (simpleMode ? TAB_NAMES_SIMPLE : TAB_NAMES_TECH)[entry.relatedTab]
              : undefined;

            return (
              <div
                key={entry.id}
                className="p-3 border border-slate-800 bg-[#070A10] rounded-lg space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-100">{entry.simpleName}</div>
                    <div className="text-[11px] font-mono text-cyan-300 mt-0.5">{entry.term}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {GLOSSARY_CATEGORY_LABELS[entry.category]}
                  </span>
                </div>

                <p className="text-xs font-medium text-amber-300 leading-snug">
                  {entry.shortMeaning}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">{entry.explanation}</p>

                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-400 truncate">Seen in: {entry.whereUsed}</span>
                  {entry.relatedTab && tabLabel && (
                    <button
                      type="button"
                      onClick={() => onJumpToTab(entry.relatedTab!)}
                      className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer shrink-0 font-medium"
                    >
                      <span>Open {tabLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
