import { useState } from 'react';
import { Check, Copy, ExternalLink, Mail } from 'lucide-react';

type SectionFilter =
  | 'all'
  | 'team'
  | 'space-apps'
  | 'nasa-data'
  | 'platforms'
  | 'recognition'
  | 'deliverables';

interface TeamMember {
  name: string;
  handle: string;
  email: string;
  role: string;
}

interface DataSourceGroup {
  category: string;
  items: { label: string; url?: string }[];
}

interface DeliverableItem {
  name: string;
  description: string;
}

const SECTION_FILTERS: { id: SectionFilter; label: string }[] = [
  { id: 'all', label: 'All Sections' },
  { id: 'team', label: 'Team Axe' },
  { id: 'space-apps', label: 'Space Apps 2026' },
  { id: 'nasa-data', label: 'NASA Data' },
  { id: 'platforms', label: 'Platforms' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'deliverables', label: 'Deliverables' },
];

const TEAM_ROSTER: TeamMember[] = [
  {
    name: 'Acxel Rodriguez',
    handle: '@axeon3',
    email: 'axeonetwothree@gmail.com',
    role: 'Dynamic Coordination & System Architecture',
  },
  {
    name: 'Gayathri Srinivasan',
    handle: '@gsrini3',
    email: 'gayathri.sr.em@gmail.com',
    role: 'Scientific Modeling & Topography Data',
  },
  {
    name: 'Priyajit Paul',
    handle: '@priyajitpaul275',
    email: 'priyajitpaul275@gmail.com',
    role: 'Frontend Engineering & Data Visualization',
  },
  {
    name: 'Mariam Tahir',
    handle: '@mariamtahir',
    email: 'mariamtahirfsc@gmail.com',
    role: 'UX Design & Mission Deliverables',
  },
];

const NASA_DATA_GROUPS: DataSourceGroup[] = [
  {
    category: 'Core NASA API & Data Portals',
    items: [
      { label: 'NASA Open APIs Portal', url: 'https://api.nasa.gov/' },
      { label: 'Updated APOD API Endpoint', url: 'https://api.nasa.gov/' },
      { label: 'NASA Open Data Portal (Datasets)', url: 'https://data.nasa.gov/' },
      { label: 'NASA Image and Video Library', url: 'https://images.nasa.gov/' },
    ],
  },
  {
    category: 'Planetary, Lunar & JPL Ephemeris APIs',
    items: [
      { label: 'JPL SSD/CNEOS API Service', url: 'https://ssd-api.jpl.nasa.gov/' },
      {
        label: 'JPL Horizons On-Line Ephemeris System & JPL Horizons REST API',
        url: 'https://ssd.jpl.nasa.gov/horizons/',
      },
      {
        label: 'JPL Horizons File API & JPL Horizons Lookup API',
        url: 'https://ssd-api.jpl.nasa.gov/doc/horizons.html',
      },
      {
        label: 'JPL SBDB (Small-Body DataBase) API',
        url: 'https://ssd-api.jpl.nasa.gov/doc/sbdb.html',
      },
      {
        label: 'NASA Solar System Treks, Moon Trek Portal, WMTS API Index, & Moon Trek WMTS API',
        url: 'https://trek.nasa.gov/moon/',
      },
      { label: 'NASA/JPL Planetary and Lunar Ephemerides DE440 and DE441' },
      {
        label: 'NASA NAIF Generic Planetary SPK Kernels',
        url: 'https://naif.jpl.nasa.gov/naif/data_generic.html',
      },
    ],
  },
  {
    category: 'Lunar Topography & Thermal Ground Truth',
    items: [
      {
        label: 'NASA PDS Geosciences Node — LRO LOLA Data and Services',
        url: 'https://pds-geosciences.wustl.edu/missions/lro/lola.htm',
      },
      {
        label: 'NASA PDS Geosciences Node — Lunar Reconnaissance Orbiter (LRO)',
        url: 'https://pds-geosciences.wustl.edu/missions/lro/',
      },
      {
        label: 'NASA PDS Geosciences Node — Moon Exploration Archives',
        url: 'https://pds-geosciences.wustl.edu/lunar/',
      },
      {
        label: 'USGS Astrogeology Science Center — Moon LRO LOLA DEM 118m & USGS STAC API',
        url: 'https://astrogeology.usgs.gov/',
      },
      {
        label: 'NASA Planetary Geodesy Data Archive (PGDA) — Product 95',
        url: 'https://pgda.gsfc.nasa.gov/',
      },
    ],
  },
  {
    category: 'Earth Science & Satellite Imagery APIs',
    items: [
      { label: 'Earthdata GIBS API', url: 'https://nasa-gibs.github.io/gibs-api-docs/' },
      { label: 'Earthdata CMR Search API', url: 'https://cmr.earthdata.nasa.gov/' },
      { label: 'Earthdata CMR STAC API', url: 'https://cmr.earthdata.nasa.gov/stac/' },
    ],
  },
];

const PLATFORM_ACKNOWLEDGMENTS: { label: string; detail?: string; url?: string }[] = [
  {
    label: 'Gemini, Gemini for Research (Google AI Studio), and Gemini Deep Research',
    url: 'https://aistudio.google.com/',
  },
  {
    label: 'Google DeepMind, Google DeepMind Publications, and Gemini Models',
    url: 'https://deepmind.google/',
  },
  {
    label:
      'Google Support & Community and Google Open Research Tools (Google Dataset Search, Google Scholar, Google Cloud Public Datasets, Google Workspace)',
  },
  { label: 'Android Team' },
  {
    label:
      'Mozilla, Firefox Browser, Firefox for Android, Mozilla Support, and Mozilla Community Hub',
    url: 'https://www.mozilla.org/',
  },
  {
    label: 'GitHub (teamaxe/lunar)',
    detail: 'version control',
    url: 'https://github.com/teamaxe/lunar',
  },
  {
    label: 'WhatsApp',
    detail: 'real-time team messaging and engineering coordination',
  },
];

const DELIVERABLES: DeliverableItem[] = [
  { name: 'LUNA-X Documentation', description: 'LUNA-X Documentation' },
  { name: 'Comprehensive Wrap-Up', description: 'Team Axe — Comprehensive Wrap-Up' },
  { name: 'Mission Case Study', description: 'Case Study' },
  {
    name: 'Contacts & Directory',
    description: 'NASA Space Apps Challenge 2026 — Contacts & Links',
  },
  { name: 'Technical Specification', description: 'Technical Specification (PDF)' },
  {
    name: 'Presentation Deck',
    description: 'Lunar Landing Site & Hardware Protection Engine Deck',
  },
];

export function ThankYouPanel() {
  const [activeFilter, setActiveFilter] = useState<SectionFilter>('all');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedEmail(value);
      window.setTimeout(() => {
        setCopiedEmail((curr) => (curr === value ? null : curr));
      }, 1800);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const showSection = (id: Exclude<SectionFilter, 'all'>) =>
    activeFilter === 'all' || activeFilter === id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-amber-400">
          NASA Space Apps Challenge 2026 · Lunar Landing Site Navigator
        </div>
        <h2 className="text-lg font-semibold text-slate-100 leading-snug text-balance">
          Team Axe — Credits, Acknowledgments & Cited Sources
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Mission credits, NASA Space Apps Challenge organizers, planetary ephemeris & lunar topography APIs, and project deliverables for{' '}
          <a
            href="https://github.com/teamaxe/lunar"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
          >
            teamaxe/lunar
          </a>
          .
        </p>
      </div>

      {/* Section Filter Controls */}
      <div
        className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md overflow-x-auto"
        role="tablist"
        aria-label="Acknowledgment Sections"
      >
        {SECTION_FILTERS.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 1. Team Axe Credits */}
      {showSection('team') && (
        <section className="border-t border-slate-800/80 pt-5 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              1. Team Axe Credits
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>Team Axe Official Page</span>
              <span aria-hidden="true">·</span>
              <span>Project Submission Tab</span>
              <span aria-hidden="true">·</span>
              <a
                href="https://github.com/teamaxe/lunar"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
              >
                <span>GitHub Repository (teamaxe/lunar)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-400">Core Team Roster</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEAM_ROSTER.map((member) => (
                <div
                  key={member.handle}
                  className="p-3 bg-[#070A10] border border-slate-800/80 rounded-md space-y-1.5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-100">
                      {member.name}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 shrink-0">
                      {member.handle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {member.role}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    <a
                      href={`mailto:${member.email}`}
                      className="text-[11px] font-mono text-slate-400 hover:text-amber-300 inline-flex items-center gap-1.5 truncate"
                    >
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(member.email)}
                      className="text-[11px] text-slate-400 hover:text-slate-100 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                      aria-label={`Copy email for ${member.name}`}
                    >
                      {copiedEmail === member.email ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. NASA Space Apps Challenge 2026 */}
      {showSection('space-apps') && (
        <section className="border-t border-slate-800/80 pt-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100">
            2. NASA Space Apps Challenge 2026 — Organizers, Directorate Sponsors & Contacts
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <div className="p-3.5 bg-[#070A10] border border-slate-800/80 rounded-md space-y-2.5">
              <div className="text-[11px] font-mono text-amber-400">
                Challenge & Program Links
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex flex-wrap items-baseline justify-between gap-2 pb-1.5 border-b border-slate-800/60">
                  <a
                    href="https://www.spaceappschallenge.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-100 hover:text-cyan-300 inline-flex items-center gap-1.5"
                  >
                    <span>NASA Space Apps Challenge Official Portal & Alternate Domain</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <a
                    href="mailto:info@spaceappschallenge.org"
                    className="font-mono text-[11px] text-cyan-300 hover:text-cyan-200"
                  >
                    info@spaceappschallenge.org
                  </a>
                </li>
                <li className="pb-1.5 border-b border-slate-800/60">
                  Challenge #10: Lunar Landing Site Navigator & 2026 Challenges
                </li>
                <li className="flex flex-wrap items-baseline justify-between gap-2 pb-1.5 border-b border-slate-800/60">
                  <span>NASA Space Apps Global Organizing (GO) Team</span>
                  <a
                    href="mailto:info@spaceappschallenge.org"
                    className="font-mono text-[11px] text-cyan-300 hover:text-cyan-200"
                  >
                    info@spaceappschallenge.org
                  </a>
                </li>
                <li className="flex flex-wrap items-baseline justify-between gap-2 pb-1.5 border-b border-slate-800/60">
                  <span>
                    Cathy Lei (<span className="font-mono text-slate-200">@cathoryn</span>, San José Local Event Lead)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    <a
                      href="mailto:catherine@komplex.health"
                      className="font-mono text-cyan-300 hover:text-cyan-200"
                    >
                      catherine@komplex.health
                    </a>
                    {' · '}
                    San José Local Event
                  </span>
                </li>
                <li>
                  2026 Local Events, Find a Team, Resources Hub, Team Formation Guide
                </li>
              </ul>
            </div>

            <div className="p-3.5 bg-[#070A10] border border-slate-800/80 rounded-md space-y-2.5">
              <div className="text-[11px] font-mono text-amber-400">
                Partners & Collaborators
              </div>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <div>
                  <span className="font-semibold text-slate-100">2026 Global Collaborators: </span>
                  GoDaddy, Google, Meteomatics, Microsoft, Miro
                </div>
                <div className="pt-1.5 border-t border-slate-800/60">
                  <span className="font-semibold text-slate-100">2026 Space Agency Partners: </span>
                  ISRO, ESA, JAXA, CSA, UK Space Agency, and 17 global space agency partners
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. NASA APIs, Planetary Ephemeris & Lunar Data Sources */}
      {showSection('nasa-data') && (
        <section className="border-t border-slate-800/80 pt-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100">
            3. NASA APIs, Planetary Ephemeris & Lunar Data Sources
          </h3>

          <div className="space-y-3">
            {NASA_DATA_GROUPS.map((group) => (
              <div
                key={group.category}
                className="p-3.5 bg-[#070A10] border border-slate-800/80 rounded-md space-y-2"
              >
                <div className="text-[11px] font-mono text-cyan-300">
                  {group.category}
                </div>
                <ul className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {group.items.map((item) => (
                    <li
                      key={item.label}
                      className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <span>{item.label}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Platform, AI Research & Browser Acknowledgments */}
      {showSection('platforms') && (
        <section className="border-t border-slate-800/80 pt-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">
            4. Platform, AI Research & Browser Acknowledgments
          </h3>
          <div className="p-3.5 bg-[#070A10] border border-slate-800/80 rounded-md">
            <ul className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {PLATFORM_ACKNOWLEDGMENTS.map((item) => (
                <li
                  key={item.label}
                  className="py-2 first:pt-0 last:pb-0 flex items-baseline justify-between gap-3"
                >
                  <span className="leading-relaxed">
                    <span className="text-slate-200">{item.label}</span>
                    {item.detail && (
                      <span className="text-slate-400"> — {item.detail}</span>
                    )}
                  </span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 5. Service & Community Recognition */}
      {showSection('recognition') && (
        <section className="border-t border-slate-800/80 pt-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">
            5. Service & Community Recognition
          </h3>
          <div className="p-4 bg-[#070A10] border border-slate-800/80 rounded-md">
            <p className="text-xs text-slate-200 leading-relaxed">
              We express our deepest gratitude and recognition to the men and women currently serving and who have served. Their unwavering dedication, sacrifice, and continued support safeguard the foundational environment that enables open scientific exploration, public service, and collaborative innovation worldwide.
            </p>
          </div>
        </section>
      )}

      {/* 6. Project Documentation & Deliverables */}
      {showSection('deliverables') && (
        <section className="border-t border-slate-800/80 pt-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">
            6. Project Documentation & Deliverables
          </h3>
          <div className="overflow-x-auto bg-[#070A10] border border-slate-800/80 rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <th className="py-2.5 px-3 font-medium">Deliverable Name</th>
                  <th className="py-2.5 px-3 font-medium">Description / Resource Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {DELIVERABLES.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-100 whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
