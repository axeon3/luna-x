import type { InspectorTab } from './clpsMissions';

export type GlossaryCategory = 'moon' | 'maps' | 'data' | 'security';

export interface GlossaryEntry {
  id: string;
  term: string;
  simpleName: string;
  category: GlossaryCategory;
  shortMeaning: string;
  explanation: string;
  whereUsed: string;
  relatedTab?: InspectorTab;
}

export const GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategory | 'all', string> = {
  all: 'All Terms',
  moon: 'Moon & Space',
  maps: 'Maps & 3D Terrain',
  data: 'Data & Signals',
  security: 'App Permissions',
};

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'clps',
    term: 'CLPS (Commercial Lunar Payload Services)',
    simpleName: 'Commercial Moon Delivery Program',
    category: 'moon',
    shortMeaning: 'NASA program that hires private companies to fly science gear to the Moon.',
    explanation:
      'Instead of building every lunar lander itself, NASA pays commercial aerospace companies (like Firefly, Intuitive Machines, Astrobotic, and Blue Origin) to carry NASA instruments and rovers to different parts of the Moon.',
    whereUsed: 'Mission Selector & Missions List',
    relatedTab: 'matrix',
  },
  {
    id: 'selenodetic',
    term: 'Selenodetic Coordinates (Lat / Lon / Elevation)',
    simpleName: 'Moon Map Coordinates',
    category: 'moon',
    shortMeaning: 'Latitude, longitude, and height measured on the Moon, just like GPS on Earth.',
    explanation:
      'Latitude measures how far north (+N) or south (-S) a spot is from the Moon’s equator. Longitude measures east (+E) or west (-W). Elevation tells how high a ridge or how deep a crater floor is compared to the Moon’s average radius (1,737.4 km).',
    whereUsed: 'Top-left readout & Overview tab',
    relatedTab: 'telemetry',
  },
  {
    id: 'iau2015-moon',
    term: 'IAU2015_Moon / MOON_ME / MCMF',
    simpleName: 'Moon-Centered 3D Map Frame',
    category: 'moon',
    shortMeaning: 'The standard 3D coordinate system centered on the Moon instead of Earth.',
    explanation:
      'Standard GPS maps use an Earth model (WGS84, radius ~6,378 km). Using an Earth model for the Moon causes over 4,600 km of size error. IAU2015_Moon uses the real Moon sphere (1,737.4 km radius), and MCMF (Moon-Centered Moon-Fixed) gives exact X, Y, Z positions locked to the lunar surface.',
    whereUsed: 'Overview & Flight Path (CZML) tabs',
    relatedTab: 'telemetry',
  },
  {
    id: 'solar-zenith',
    term: 'Solar Zenith Angle & Subsolar Longitude',
    simpleName: 'Sunlight Angle',
    category: 'moon',
    shortMeaning: 'How high or low the Sun sits in the sky at a landing site.',
    explanation:
      '0° means the Sun is directly overhead (bright noon). 90° means the Sun is right on the horizon (long shadows at sunrise or sunset). Above 90° means the Sun has set and the site is in darkness.',
    whereUsed: 'Top-left readout, Sun Slider & Overview tab',
    relatedTab: 'telemetry',
  },
  {
    id: 'near-far-pole',
    term: 'Near Side, Far Side & South Pole',
    simpleName: 'Regions of the Moon',
    category: 'moon',
    shortMeaning: 'The three main destinations where landers touch down.',
    explanation:
      'The Near Side always faces Earth, making radio communication direct and easy. The Far Side always faces away from Earth and needs an orbiting relay satellite to send data home. The South Pole has rugged ridges with long sunlight and deep craters that hold water ice in permanent shadow.',
    whereUsed: 'Missions filter & Camera presets',
    relatedTab: 'matrix',
  },
  {
    id: 'psr',
    term: 'PSR (Permanently Shadowed Region)',
    simpleName: 'Never-Sunlit Crater Floor',
    category: 'moon',
    shortMeaning: 'Deep polar craters where sunlight never reaches the bottom.',
    explanation:
      'Because the Moon’s tilt is tiny, deep craters near the South Pole stay frozen in permanent darkness for billions of years. Scientists think water ice and other frozen gases are trapped there.',
    whereUsed: 'South Pole mission summaries',
    relatedTab: 'matrix',
  },
  {
    id: 'regolith',
    term: 'Lunar Regolith',
    simpleName: 'Moon Dust & Crushed Rock',
    category: 'moon',
    shortMeaning: 'The powdery layer of broken rock and sharp dust covering the Moon.',
    explanation:
      'Created by billions of years of tiny meteorite impacts, regolith is fine, abrasive, and clings to equipment. Landers drill into it to measure heat flow and look for water molecules.',
    whereUsed: 'Mission science charts & summaries',
    relatedTab: 'telemetry',
  },
  {
    id: 'lroc-wac',
    term: 'LROC WAC (Wide Angle Camera)',
    simpleName: 'Photo Map Layer',
    category: 'maps',
    shortMeaning: 'Real black-and-white photographs of the Moon taken from NASA’s LRO orbiter.',
    explanation:
      'The Lunar Reconnaissance Orbiter Camera stitches thousands of photos into a global mosaic so you can see craters, plains, and ridges as they actually look.',
    whereUsed: 'Bottom bar map layer selector',
  },
  {
    id: 'lola-dem',
    term: 'LOLA DEM (Digital Elevation Model)',
    simpleName: 'Height & Elevation Map',
    category: 'maps',
    shortMeaning: 'Color-coded terrain map measured by laser pulses from lunar orbit.',
    explanation:
      'NASA’s Lunar Orbiter Laser Altimeter bounces laser beams off the Moon to measure exact heights. High mountains and crater rims appear in warmer/brighter tones while low basins appear in cooler/darker tones.',
    whereUsed: 'Bottom bar map layer selector & Moon Data tab',
    relatedTab: 'pds',
  },
  {
    id: 'slope-hazard',
    term: 'Slope Hazard Map',
    simpleName: 'Steepness Safety Map',
    category: 'maps',
    shortMeaning: 'Highlights steep crater walls where a lander could tip over.',
    explanation:
      'Flat ground is safe for landing, while slopes steeper than ~10–15° are risky. Several real Moon landers tipped over after touching down on sloped terrain.',
    whereUsed: 'Bottom bar map layer selector',
  },
  {
    id: 'quantized-mesh',
    term: 'Quantized Mesh 1.0 & Oct-Normals',
    simpleName: '3D Terrain Patch',
    category: 'maps',
    shortMeaning: 'Compact 3D triangle grid that models hills and lighting around a landing site.',
    explanation:
      'Instead of sending huge terrain files, Quantized Mesh packs vertex positions into small 16-bit numbers and compresses surface slope directions ("oct-normals") into 2 bytes each so 3D hills shade smoothly.',
    whereUsed: '3D Terrain map mode & Overview tab',
    relatedTab: 'telemetry',
  },
  {
    id: 'quaternion',
    term: 'Attitude Unit Quaternion (ENU → MCMF)',
    simpleName: '3D Tilt & Facing Direction',
    category: 'maps',
    shortMeaning: 'Four numbers [x, y, z, w] that describe how a lander is tilted and rotated in 3D.',
    explanation:
      'Engineers use quaternions instead of regular angles so 3D rotations stay smooth and never get stuck ("gimbal lock"). A tipped lander like IM-1 Odysseus or IM-2 Athena has a large tilt angle.',
    whereUsed: 'Overview & Flight Path (CZML) tabs',
    relatedTab: 'telemetry',
  },
  {
    id: 'czml',
    term: 'CZML (Cesium Language) & SLERP/Hermite',
    simpleName: 'Animated Flight Path Stream',
    category: 'data',
    shortMeaning: 'Time-stamped data format showing where spacecraft move and how they turn over time.',
    explanation:
      'A background web worker reads CZML packets and smoothly fills in positions ("Hermite") and rotations ("SLERP") between time stamps so the 3D scene animates smoothly without freezing the screen.',
    whereUsed: 'Timeline slider & Flight Path tab',
    relatedTab: 'czml',
  },
  {
    id: 'ephemeris-libration',
    term: 'JPL Horizons Ephemeris & Lunar Libration',
    simpleName: 'Sun & Earth Position Forecast',
    category: 'data',
    shortMeaning: 'Precise tables predicting where the Sun and Earth appear in the lunar sky.',
    explanation:
      'The Moon wobbles slightly as it orbits Earth — this gentle wobble is called libration. Because of libration, Earth appears to drift across a small patch of the sky near the lunar horizon, changing when radio signals can reach Earth.',
    whereUsed: 'Sun & Comms (Ephemeris) tab',
    relatedTab: 'ephemeris',
  },
  {
    id: 'horizon-mask',
    term: '360° Horizon Mask',
    simpleName: 'Surrounding Mountain Skyline',
    category: 'data',
    shortMeaning: 'A full-circle outline showing how tall nearby hills and crater rims are in every direction.',
    explanation:
      'Even if the Sun or Earth is slightly above 0°, a tall crater rim can still block sunlight or radio signals. The horizon mask tracks the blocking height all the way around (0° to 360°).',
    whereUsed: 'Sun & Comms (Ephemeris) tab',
    relatedTab: 'ephemeris',
  },
  {
    id: 'solar-duty-dte',
    term: 'Solar Duty Cycle & DTE (Direct-to-Earth) Gate',
    simpleName: 'Power & Radio Signal Check',
    category: 'data',
    shortMeaning: 'Pass/fail checks for whether a site gets enough sunlight (≥70%) and Earth radio view (≥55%).',
    explanation:
      'Landers need solar power to survive and direct line-of-sight to Earth ("DTE") to send science data home unless an orbital relay satellite passes overhead.',
    whereUsed: 'Sun & Comms (Ephemeris) tab',
    relatedTab: 'ephemeris',
  },
  {
    id: 'pds-ode',
    term: 'NASA PDS ODE (Planetary Data System)',
    simpleName: 'NASA Moon Data Archive',
    category: 'data',
    shortMeaning: 'Official NASA library of Moon photos, laser height scans, and temperature maps.',
    explanation:
      'The Orbital Data Explorer (ODE) lets the app search live NASA archives for LROC camera images, LOLA elevation files, and Diviner thermal measurements right around the selected landing site.',
    whereUsed: 'Moon Data (PDS Archive) tab',
    relatedTab: 'pds',
  },
  {
    id: 'dynamic-scopes',
    term: 'Standard / Dynamic OAuth Scopes',
    simpleName: 'Ask-Only-When-Needed Permissions',
    category: 'security',
    shortMeaning: 'Permissions requested one at a time at runtime only when you click a feature that needs them.',
    explanation:
      'Instead of asking for full access to your entire Google Drive and Gmail upfront, the app starts with minimal read permissions. When you click Export, Send Email, or Delete, it asks for just that specific permission at that moment.',
    whereUsed: 'Google Drive & Gmail tabs',
    relatedTab: 'drive',
  },
  {
    id: 'policy-role-consent',
    term: 'Consent, Policy Allowlist & Session Role',
    simpleName: 'Three-Part Security Check',
    category: 'security',
    shortMeaning: 'Every token is checked against what you approved, what the app allows, and your chosen role.',
    explanation:
      '1) User Consent: Did you approve the permission in Google’s popup? 2) Policy Allowlist: Is this scope on the app’s approved least-privilege list? 3) Session Role: Does your active role (Observer, Flight Controller, or Mission Admin) allow that action?',
    whereUsed: 'Dynamic Scopes panel in Drive & Gmail',
    relatedTab: 'gmail',
  },
];
