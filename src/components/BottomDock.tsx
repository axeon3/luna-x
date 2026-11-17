import { useEffect, useState } from 'react';
import { CalendarClock, ChevronDown, ChevronUp, Crosshair, MapPin, Pause, Play, Sun } from 'lucide-react';
import { BasemapMode, CLPSMission } from '../data/clpsMissions';
import { CameraPreset } from './LunarViewport';

export interface CustomCoordsValue {
  name: string;
  latDeg: number;
  lonDeg: number;
  elevationM: number;
}

interface BottomDockProps {
  missions: CLPSMission[];
  selectedMissionId: string;
  onSelectMission: (id: string) => void;
  basemapMode: BasemapMode;
  onChangeBasemap: (mode: BasemapMode) => void;
  solarLonDeg: number;
  onChangeSolarLon: (deg: number) => void;
  dateTimeUtc: string;
  onChangeDateTimeUtc: (next: string) => void;
  onSetNowUtc: () => void;
  sunSyncToDateTime: boolean;
  onSyncSunToDateTime: () => void;
  customCoords: CustomCoordsValue;
  onApplyCustomCoords: (next: CustomCoordsValue, flyTo?: boolean) => void;
  pickOnMoon: boolean;
  onTogglePickOnMoon: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  epochNorm: number;
  onChangeEpoch: (val: number) => void;
  onCameraPreset: (preset: CameraPreset) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  simpleMode?: boolean;
}

const BASEMAP_OPTIONS: { id: BasemapMode; simpleLabel: string; techLabel: string }[] = [
  { id: 'wac', simpleLabel: 'Photo Map', techLabel: 'LROC WAC' },
  { id: 'lola', simpleLabel: 'Height Map', techLabel: 'LOLA DEM' },
  { id: 'hazard', simpleLabel: 'Steepness', techLabel: 'Slope Hazard' },
  { id: 'quantized', simpleLabel: '3D Terrain', techLabel: 'Quantized Mesh' },
];

const CAMERA_OPTIONS: { id: CameraPreset; simpleLabel: string; techLabel: string }[] = [
  { id: 'global', simpleLabel: 'Full Moon', techLabel: 'Global' },
  { id: 'south-pole', simpleLabel: 'South Pole', techLabel: 'South Pole' },
  { id: 'far-side', simpleLabel: 'Far Side', techLabel: 'Far Side' },
  { id: 'lander', simpleLabel: 'Landing Site', techLabel: 'Lander' },
];

export function BottomDock({
  missions,
  selectedMissionId,
  onSelectMission,
  basemapMode,
  onChangeBasemap,
  solarLonDeg,
  onChangeSolarLon,
  dateTimeUtc,
  onChangeDateTimeUtc,
  onSetNowUtc,
  sunSyncToDateTime,
  onSyncSunToDateTime,
  customCoords,
  onApplyCustomCoords,
  pickOnMoon,
  onTogglePickOnMoon,
  isPlaying,
  onTogglePlay,
  epochNorm,
  onChangeEpoch,
  onCameraPreset,
  collapsed,
  onToggleCollapsed,
  simpleMode = true,
}: BottomDockProps) {
  const [coordsPanelOpen, setCoordsPanelOpen] = useState(false);
  const [draftLat, setDraftLat] = useState(String(customCoords.latDeg));
  const [draftLon, setDraftLon] = useState(String(customCoords.lonDeg));
  const [draftElev, setDraftElev] = useState(String(customCoords.elevationM));
  const [draftName, setDraftName] = useState(customCoords.name);

  useEffect(() => {
    setDraftLat(String(customCoords.latDeg));
    setDraftLon(String(customCoords.lonDeg));
    setDraftElev(String(customCoords.elevationM));
    setDraftName(customCoords.name);
  }, [customCoords]);

  const handleSubmitCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = Number(draftLat);
    const parsedLon = Number(draftLon);
    const parsedElev = Number(draftElev);
    const safeLat = Number.isFinite(parsedLat) ? Math.max(-90, Math.min(90, parsedLat)) : 0;
    const safeLon = Number.isFinite(parsedLon) ? Math.max(-180, Math.min(180, parsedLon)) : 0;
    const safeElev = Number.isFinite(parsedElev) ? Math.max(-12000, Math.min(20000, parsedElev)) : 0;
    onApplyCustomCoords(
      {
        name: draftName.trim() || 'Custom Lunar Site',
        latDeg: Number(safeLat.toFixed(4)),
        lonDeg: Number(safeLon.toFixed(4)),
        elevationM: Math.round(safeElev),
      },
      true
    );
  };

  const isCustomActive = selectedMissionId === 'custom-coords';

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(1020px,96vw)] pointer-events-none flex flex-col items-center">
      {/* Collapse / Expand Handle */}
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="pointer-events-auto mb-1.5 px-3 py-1 bg-[#0B0F18] border border-slate-800 rounded-t-md text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        title="Toggle Control Dock (H)"
      >
        {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{collapsed ? 'Show Controls' : 'Hide Controls'}</span>
      </button>

      {/* Main Dock Container */}
      <div
        className={`w-full bg-[#0B0F18]/95 border border-slate-800 rounded-lg p-3 transition-all duration-200 ${
          collapsed
            ? 'opacity-0 translate-y-6 pointer-events-none h-0 overflow-hidden p-0 border-0'
            : 'pointer-events-auto opacity-100 translate-y-0'
        }`}
      >
        {/* Expandable Custom Coordinates Bar */}
        {coordsPanelOpen && (
          <form
            onSubmit={handleSubmitCoords}
            className="mb-2.5 pb-2.5 border-b border-slate-800/80 flex flex-wrap items-end gap-2"
          >
            <label className="flex flex-col gap-1 text-[10px] font-mono text-slate-400">
              <span>{simpleMode ? 'Latitude (°)' : 'Lat (°N/-S)'}</span>
              <input
                type="number"
                step="0.0001"
                min={-90}
                max={90}
                value={draftLat}
                onChange={(e) => setDraftLat(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-mono text-slate-400">
              <span>{simpleMode ? 'Longitude (°)' : 'Lon (°E/-W)'}</span>
              <input
                type="number"
                step="0.0001"
                min={-180}
                max={180}
                value={draftLon}
                onChange={(e) => setDraftLon(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-mono text-slate-400">
              <span>{simpleMode ? 'Height (m)' : 'Elev (m)'}</span>
              <input
                type="number"
                step="10"
                min={-12000}
                max={20000}
                value={draftElev}
                onChange={(e) => setDraftElev(e.target.value)}
                className="w-20 px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-mono text-slate-400 flex-1 min-w-[130px]">
              <span>{simpleMode ? 'Spot Name' : 'Site Label'}</span>
              <input
                type="text"
                maxLength={48}
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Custom Lunar Site"
                className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 text-slate-950 rounded hover:bg-cyan-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              {simpleMode ? 'Go to Spot' : 'Go & Inspect'}
            </button>
            <button
              type="button"
              onClick={onTogglePickOnMoon}
              className={`px-2.5 py-1.5 text-xs font-medium rounded border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                pickOnMoon
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Click anywhere on the 3D Moon surface to set coordinates (or Shift+Click anytime)"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{pickOnMoon ? 'Click Moon Now...' : 'Pick on Moon'}</span>
            </button>
          </form>
        )}

        {/* Row 1: Mission Selector Bar + Custom Coordinates Toggle */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setCoordsPanelOpen((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              isCustomActive || coordsPanelOpen
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'bg-slate-900/90 text-cyan-300 hover:bg-slate-800 border border-cyan-500/40'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{simpleMode ? 'Custom Coords' : '+ Custom Coords'}</span>
          </button>

          {missions.map((m) => {
            const active = m.id === selectedMissionId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMission(m.id)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        {/* Row 2: Basemap · Date & Time · Timeline · Sunlight Angle · Camera Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Basemap Layers */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-md">
            {BASEMAP_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeBasemap(opt.id)}
                className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  basemapMode === opt.id
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {simpleMode ? opt.simpleLabel : opt.techLabel}
              </button>
            ))}
          </div>

          {/* Date & Time Picker (UTC) */}
          <div
            className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-md px-2 py-0.5"
            title={simpleMode ? 'Pick a UTC date and time to update real Moon sunlight & 30-day forecasts' : 'UTC Epoch Date & Time'}
          >
            <CalendarClock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <input
              type="date"
              value={dateTimeUtc.slice(0, 10)}
              min="1900-01-01"
              max="2099-12-31"
              onChange={(e) => {
                if (!e.target.value) return;
                onChangeDateTimeUtc(`${e.target.value}T${dateTimeUtc.slice(11, 16) || '00:00'}`);
              }}
              aria-label="Lunar Date (UTC)"
              className="bg-transparent text-[11px] font-mono text-slate-100 focus:outline-none [color-scheme:dark] w-[108px]"
            />
            <input
              type="time"
              value={dateTimeUtc.slice(11, 16)}
              onChange={(e) => {
                if (!e.target.value) return;
                onChangeDateTimeUtc(`${dateTimeUtc.slice(0, 10)}T${e.target.value}`);
              }}
              aria-label="Lunar Time (UTC)"
              className="bg-transparent text-[11px] font-mono text-slate-100 focus:outline-none [color-scheme:dark] w-[68px]"
            />
            <span className="text-[10px] font-mono text-slate-400">UTC</span>
            <button
              type="button"
              onClick={onSetNowUtc}
              className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded cursor-pointer"
            >
              Now
            </button>
          </div>

          {/* Flight Path Timeline Scrubber */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onTogglePlay}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 hover:text-amber-400 cursor-pointer"
              aria-label={isPlaying ? 'Pause Flight Path Animation' : 'Play Flight Path Animation'}
              title={simpleMode ? 'Play / Pause spacecraft motion' : 'Play / Pause CZML Simulation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={epochNorm}
              onChange={(e) => onChangeEpoch(Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
              aria-label={simpleMode ? 'Flight Path Timeline' : 'CZML Mission Epoch Scrubber'}
            />
            <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
              {Math.round(epochNorm * 100)}%
            </span>
          </div>

          {/* Solar Subsolar Longitude */}
          <div
            className="flex items-center gap-1.5"
            title={simpleMode ? 'Move where the Sun shines on the Moon' : 'Solar Illumination Longitude'}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={Math.round(solarLonDeg)}
              onChange={(e) => onChangeSolarLon(Number(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer"
              aria-label={simpleMode ? 'Sunlight Direction' : 'Solar Illumination Longitude'}
            />
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {Math.round(solarLonDeg)}°
            </span>
            {!sunSyncToDateTime && (
              <button
                type="button"
                onClick={onSyncSunToDateTime}
                className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-500/30 cursor-pointer whitespace-nowrap"
                title="Re-sync Sun angle to the selected Date & Time"
              >
                Sync Sun
              </button>
            )}
          </div>

          {/* Camera Targets */}
          <div className="flex items-center gap-1">
            {CAMERA_OPTIONS.map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => onCameraPreset(cam.id)}
                className="px-2 py-1 text-[11px] font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded hover:border-slate-600 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {simpleMode ? cam.simpleLabel : cam.techLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

