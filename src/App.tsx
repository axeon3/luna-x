import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  BasemapMode,
  CLPSMission,
  CLPS_MISSIONS,
  InspectorTab,
} from './data/clpsMissions';
import {
  SavedLunarSite,
  auth,
  subscribeSavedSites,
  syncUserPrivateProfile,
} from './firebase';
import { computeLunarSubsolarPoint, computeSolarZenithDeg } from './engine/selenodesy';
import type { SampledEntityState } from './workers/czmlWorker';
import { CameraPreset, LunarViewport } from './components/LunarViewport';
import { TopBar } from './components/TopBar';
import { BottomDock, CustomCoordsValue } from './components/BottomDock';
import { InspectorDrawer } from './components/InspectorDrawer';

function formatNowUtcMinute(): string {
  return new Date().toISOString().slice(0, 16);
}

export default function App() {
  const [selectedMissionId, setSelectedMissionId] = useState<string>('to19d'); // Blue Ghost 1 default
  const [activeTab, setActiveTab] = useState<InspectorTab | null>(null);
  const [basemapMode, setBasemapMode] = useState<BasemapMode>('wac');

  const initialDateTimeUtc = useMemo(() => formatNowUtcMinute(), []);
  const initialSolar = useMemo(
    () => computeLunarSubsolarPoint(new Date(`${initialDateTimeUtc}:00Z`)),
    [initialDateTimeUtc]
  );

  const [dateTimeUtc, setDateTimeUtc] = useState<string>(initialDateTimeUtc);
  const [solarLonDeg, setSolarLonDeg] = useState<number>(initialSolar.lonDeg);
  const [solarLatDeg, setSolarLatDeg] = useState<number>(initialSolar.latDeg);
  const [sunSyncToDateTime, setSunSyncToDateTime] = useState<boolean>(true);

  const [customCoords, setCustomCoords] = useState<CustomCoordsValue>({
    name: 'Custom Lunar Site',
    latDeg: -23.5,
    lonDeg: 14.2,
    elevationM: 0,
  });
  const [pickOnMoon, setPickOnMoon] = useState<boolean>(false);

  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [simpleMode, setSimpleMode] = useState<boolean>(true);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [epochNorm, setEpochNorm] = useState<number>(0.35);

  const [cameraPreset, setCameraPreset] = useState<{ preset: CameraPreset; seq: number }>({
    preset: 'global',
    seq: 0,
  });

  const [cursorCoords, setCursorCoords] = useState<{ latDeg: number; lonDeg: number } | null>(null);
  const [wmtsInfo, setWmtsInfo] = useState<{
    layer: string;
    loaded: number;
    total: number;
    cacheHits: number;
    liveTiles: number;
  } | null>(null);

  const [qmStats, setQmStats] = useState<{
    missionId: string;
    vertexCount: number;
    triangleCount: number;
    byteLength: number;
    minHeightM: number;
    maxHeightM: number;
    hasOctNormals: boolean;
    sampleOctPair: [number, number];
    sampleDecodedNormal: [number, number, number];
  } | null>(null);

  // Off-thread Web Worker CZML pipeline
  const workerRef = useRef<Worker | null>(null);
  const [rawCzmlPackets, setRawCzmlPackets] = useState<unknown[]>([]);
  const [czmlSummary, setCzmlSummary] = useState<{ parseMs: number; entityCount: number }>({
    parseMs: 0,
    entityCount: 0,
  });
  const [czmlStates, setCzmlStates] = useState<SampledEntityState[]>([]);

  // Firebase Auth & Firestore Cloud Sync
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseAuthReady, setFirebaseAuthReady] = useState<boolean>(false);
  const [savedSites, setSavedSites] = useState<SavedLunarSite[]>([]);
  const [firebaseSyncError, setFirebaseSyncError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFirebaseAuthReady(true);
      setFirebaseSyncError(null);
      if (user) {
        void syncUserPrivateProfile(user).catch((err) => {
          setFirebaseSyncError(err instanceof Error ? err.message : 'Profile sync failed');
        });
      } else {
        setSavedSites([]);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseAuthReady || !firebaseUser) {
      setSavedSites([]);
      return;
    }
    const unsub = subscribeSavedSites(
      firebaseUser.uid,
      (sites) => {
        setSavedSites(sites);
        setFirebaseSyncError(null);
      },
      (err) => {
        setFirebaseSyncError(err.message);
      }
    );
    return () => unsub();
  }, [firebaseAuthReady, firebaseUser]);

  useEffect(() => {
    const worker = new Worker(new URL('./workers/czmlWorker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.type === 'CZML_PARSED') {
        setCzmlSummary({ parseMs: msg.parseMs, entityCount: msg.summary.length });
        worker.postMessage({ type: 'SAMPLE_EPOCH', progressNorm: 0.35 });
      } else if (msg.type === 'EPOCH_SAMPLED') {
        setCzmlStates(msg.states);
      }
    };

    fetch('/api/czml/missions')
      .then((res) => res.json())
      .then((packets) => {
        setRawCzmlPackets(packets);
        worker.postMessage({ type: 'PARSE_CZML', packets });
      })
      .catch(() => {
        // Worker remains idle if server unavailable
      });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Playback loop advancing epochNorm -> Web Worker SAMPLE_EPOCH
  useEffect(() => {
    if (!isPlaying) return;
    let last = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      if (dt >= 0.08) {
        last = now;
        setEpochNorm((prev) => {
          const next = (prev + dt * 0.025) % 1;
          workerRef.current?.postMessage({ type: 'SAMPLE_EPOCH', progressNorm: next });
          return next;
        });
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // Keyboard shortcut 'H' to toggle bottom control dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const customMission: CLPSMission = useMemo(() => {
    const { name, latDeg, lonDeg, elevationM } = customCoords;
    const hemisphere: CLPSMission['hemisphere'] =
      latDeg <= -60 ? 'South Pole' : Math.abs(lonDeg) <= 90 ? 'Near Side' : 'Far Side';
    const coordLabel = `${Math.abs(latDeg).toFixed(4)}°${latDeg >= 0 ? 'N' : 'S'}, ${Math.abs(lonDeg).toFixed(4)}°${lonDeg >= 0 ? 'E' : 'W'}`;
    const baseSolarLon = solarLonDeg;
    const series = [0, 5, 10, 15, 20, 25, 29].map((day) => {
      const subLon = ((((baseSolarLon - day * 12.19) % 360) + 540) % 360) - 180;
      const zenith = computeSolarZenithDeg(lonDeg, latDeg, subLon, solarLatDeg);
      const sunEl = Number((90 - zenith).toFixed(1));
      const estTempK = Math.round(sunEl > 0 ? 120 + 250 * Math.pow(Math.sin((sunEl * Math.PI) / 180), 0.25) : 95);
      return { x: day, y: sunEl, ySecondary: estTempK };
    });

    return {
      id: 'custom-coords',
      taskOrder: 'CUSTOM',
      name: name || 'Custom Lunar Site',
      contractor: 'User Coordinates',
      landerClass: 'Nova-C',
      destination: coordLabel,
      hemisphere,
      latDeg,
      lonDeg,
      elevationM,
      outcome: 'planned',
      statusLabel: `Custom Target · ${coordLabel}`,
      launchDate: dateTimeUtc.slice(0, 10),
      landingDate: dateTimeUtc.slice(0, 10),
      attitudeEulerDeg: { roll: 0, pitch: 0, yaw: 0 },
      payloads: [
        'IAU2015_Moon Selenodetic Target Pin',
        '30-Day Solar & Earth DTE Forecast',
        'NASA PDS ODE Archive Bounding Query',
        'Quantized Mesh 1.0 Elevation Patch',
      ],
      renderingMode: 'Custom lunar coordinate pin & local illumination analysis',
      summary: `Custom selenographic site at ${coordLabel} (elevation ${elevationM} m). All 3D lighting, NASA/JPL Horizons 30-day sun & Earth forecasts, PDS archive searches, and Quantized Mesh terrain patches evaluate at these exact coordinates.`,
      chart: {
        title: '29.5-Day Solar Elevation & Surface Temp Estimate',
        xLabel: 'Days from Selected Date (d)',
        yLabel: 'Solar Elevation',
        yUnit: 'deg',
        secondaryLabel: 'Est. Temp (K)',
        series,
      },
    };
  }, [customCoords, dateTimeUtc, solarLonDeg, solarLatDeg]);

  const selectedMission = useMemo(() => {
    if (selectedMissionId === 'custom-coords') return customMission;
    return CLPS_MISSIONS.find((m) => m.id === selectedMissionId) || CLPS_MISSIONS[0];
  }, [selectedMissionId, customMission]);

  const handleSelectMission = useCallback((id: string) => {
    setPickOnMoon(false);
    setSelectedMissionId(id);
    setActiveTab('telemetry');
    setCameraPreset((prev) => ({ preset: 'lander', seq: prev.seq + 1 }));
  }, []);

  const handleApplyCustomCoords = useCallback((next: CustomCoordsValue, flyTo = true) => {
    setPickOnMoon(false);
    setCustomCoords(next);
    setSelectedMissionId('custom-coords');
    setActiveTab((prev) => prev || 'telemetry');
    if (flyTo) {
      setCameraPreset((prev) => ({ preset: 'lander', seq: prev.seq + 1 }));
    }
  }, []);

  const handlePickCoordsFromMoon = useCallback(
    (coords: { latDeg: number; lonDeg: number }) => {
      setPickOnMoon(false);
      setCustomCoords((prev) => ({
        ...prev,
        latDeg: coords.latDeg,
        lonDeg: coords.lonDeg,
      }));
      setSelectedMissionId('custom-coords');
      setActiveTab((prev) => prev || 'telemetry');
    },
    []
  );

  const handleDateTimeUtcChange = useCallback((next: string) => {
    setDateTimeUtc(next);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(next)) {
      const subsolar = computeLunarSubsolarPoint(new Date(`${next}:00Z`));
      setSolarLonDeg(subsolar.lonDeg);
      setSolarLatDeg(subsolar.latDeg);
      setSunSyncToDateTime(true);
    }
  }, []);

  const handleSetNowUtc = useCallback(() => {
    handleDateTimeUtcChange(formatNowUtcMinute());
  }, [handleDateTimeUtcChange]);

  const handleManualSolarLonChange = useCallback((deg: number) => {
    setSunSyncToDateTime(false);
    setSolarLonDeg(deg);
  }, []);

  const handleSyncSunToDateTime = useCallback(() => {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeUtc)) {
      const subsolar = computeLunarSubsolarPoint(new Date(`${dateTimeUtc}:00Z`));
      setSolarLonDeg(subsolar.lonDeg);
      setSolarLatDeg(subsolar.latDeg);
      setSunSyncToDateTime(true);
    }
  }, [dateTimeUtc]);

  const handleLoadSavedSite = useCallback(
    (site: SavedLunarSite) => {
      setPickOnMoon(false);
      setCustomCoords({
        name: site.name,
        latDeg: site.latDeg,
        lonDeg: site.lonDeg,
        elevationM: site.elevationM,
      });
      setSelectedMissionId('custom-coords');
      if (site.basemapMode) {
        setBasemapMode(site.basemapMode);
      }
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(site.dateTimeUtc)) {
        handleDateTimeUtcChange(site.dateTimeUtc);
      }
      setCameraPreset((prev) => ({ preset: 'lander', seq: prev.seq + 1 }));
    },
    [handleDateTimeUtcChange]
  );

  const handleSelectTopTab = useCallback((tab: InspectorTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  }, []);

  const handleResetGlobe = useCallback(() => {
    setPickOnMoon(false);
    setActiveTab(null);
    setCameraPreset((prev) => ({ preset: 'global', seq: prev.seq + 1 }));
  }, []);

  const handleChangeEpoch = useCallback((val: number) => {
    setIsPlaying(false);
    setEpochNorm(val);
    workerRef.current?.postMessage({ type: 'SAMPLE_EPOCH', progressNorm: val });
  }, []);

  const handleCameraPreset = useCallback((preset: CameraPreset) => {
    setCameraPreset((prev) => ({ preset, seq: prev.seq + 1 }));
  }, []);

  const displayLat = cursorCoords ? cursorCoords.latDeg : selectedMission.latDeg;
  const displayLon = cursorCoords ? cursorCoords.lonDeg : selectedMission.lonDeg;
  const solarZenith = computeSolarZenithDeg(displayLon, displayLat, solarLonDeg, solarLatDeg);

  return (
    <div className="relative w-screen h-screen bg-[#07090E] text-slate-100 overflow-hidden flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTopTab}
        onResetGlobe={handleResetGlobe}
        simpleMode={simpleMode}
        onToggleSimpleMode={() => setSimpleMode((prev) => !prev)}
      />

      {/* Main Unobstructed 3D Viewport Stage */}
      <main className="relative flex-1 w-full overflow-hidden">
        <LunarViewport
          missions={CLPS_MISSIONS}
          selectedMissionId={selectedMissionId}
          activeMission={selectedMission}
          basemapMode={basemapMode}
          solarLonDeg={solarLonDeg}
          solarLatDeg={solarLatDeg}
          cameraPreset={cameraPreset}
          czmlStates={czmlStates}
          customTarget={{
            active: selectedMissionId === 'custom-coords',
            latDeg: customCoords.latDeg,
            lonDeg: customCoords.lonDeg,
            elevationM: customCoords.elevationM,
          }}
          pickOnMoon={pickOnMoon}
          onSelectMission={handleSelectMission}
          onPickCoords={handlePickCoordsFromMoon}
          onCursorCoords={setCursorCoords}
          onWmtsProgress={setWmtsInfo}
          onQmLoaded={setQmStats}
        />

        {/* Quiet Top-Left Selenodetic Telemetry Readout (Unboxed Text) */}
        <div className="pointer-events-none fixed top-16 left-5 z-10 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">
            {simpleMode
              ? 'Moon Globe · Radius 1,737.4 km'
              : 'IAU2015_Moon · R_M 1,737.400 km'}
          </div>
          <div className="text-xs font-mono text-slate-200">
            {cursorCoords ? (simpleMode ? 'Pointer' : 'Cursor') : selectedMission.taskOrder}:{' '}
            <span className="text-cyan-300">
              {displayLat >= 0 ? `${displayLat.toFixed(2)}°N` : `${Math.abs(displayLat).toFixed(2)}°S`}
            </span>
            {' · '}
            <span className="text-cyan-300">
              {displayLon >= 0 ? `${displayLon.toFixed(2)}°E` : `${Math.abs(displayLon).toFixed(2)}°W`}
            </span>
            {' · '}
            <span className="text-amber-300">
              {simpleMode
                ? `Sun Angle ${solarZenith.toFixed(1)}° (${solarZenith < 90 ? 'Day' : 'Night'})`
                : `Zenith ${solarZenith.toFixed(1)}°`}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            UTC: <span className="text-slate-200">{dateTimeUtc.replace('T', ' ')}</span>
            {sunSyncToDateTime ? ' · Sun synced' : ' · Sun manual'}
          </div>
          {pickOnMoon && (
            <div className="text-[11px] font-mono text-cyan-300">
              Click anywhere on the Moon surface to set custom coordinates
            </div>
          )}
          {wmtsInfo && (
            <div className="text-[11px] font-mono text-slate-400">
              {simpleMode
                ? `Moon Map (${wmtsInfo.layer === 'wac' ? 'Photo' : 'Height'}): ${wmtsInfo.liveTiles}/${wmtsInfo.total} tiles`
                : `NASA Moon Trek ${wmtsInfo.layer.toUpperCase()}: ${wmtsInfo.liveTiles}/${wmtsInfo.total} tiles`}
              {wmtsInfo.cacheHits > 0 ? ` (${wmtsInfo.cacheHits} cached)` : ''}
            </div>
          )}
        </div>

        {/* Selected Mission Quick Open Handle when Drawer is Closed */}
        {!activeTab && (
          <div className="fixed top-16 right-5 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className="px-3 py-2 bg-[#0B0F18] border border-slate-800 rounded-md text-xs font-medium text-emerald-300 hover:border-emerald-500/60 hover:text-emerald-200 transition-colors cursor-pointer"
            >
              {firebaseUser ? `Saved (${savedSites.length})` : 'Saved Sites'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('glossary')}
              className="px-3 py-2 bg-[#0B0F18] border border-slate-800 rounded-md text-xs font-medium text-cyan-300 hover:border-cyan-500/60 hover:text-cyan-200 transition-colors cursor-pointer"
            >
              Glossary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className="px-3.5 py-2 bg-[#0B0F18] border border-slate-800 rounded-md text-xs font-medium text-slate-200 hover:border-amber-500/60 hover:text-white transition-colors cursor-pointer"
            >
              {simpleMode ? `About ${selectedMission.name}` : `Inspect ${selectedMission.name}`}
            </button>
          </div>
        )}

        <BottomDock
          missions={CLPS_MISSIONS}
          selectedMissionId={selectedMissionId}
          onSelectMission={handleSelectMission}
          basemapMode={basemapMode}
          onChangeBasemap={setBasemapMode}
          solarLonDeg={solarLonDeg}
          onChangeSolarLon={handleManualSolarLonChange}
          dateTimeUtc={dateTimeUtc}
          onChangeDateTimeUtc={handleDateTimeUtcChange}
          onSetNowUtc={handleSetNowUtc}
          sunSyncToDateTime={sunSyncToDateTime}
          onSyncSunToDateTime={handleSyncSunToDateTime}
          customCoords={customCoords}
          onApplyCustomCoords={handleApplyCustomCoords}
          pickOnMoon={pickOnMoon}
          onTogglePickOnMoon={() => setPickOnMoon((p) => !p)}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          epochNorm={epochNorm}
          onChangeEpoch={handleChangeEpoch}
          onCameraPreset={handleCameraPreset}
          collapsed={dockCollapsed}
          onToggleCollapsed={() => setDockCollapsed((c) => !c)}
          simpleMode={simpleMode}
        />

        <InspectorDrawer
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onClose={() => setActiveTab(null)}
          missions={CLPS_MISSIONS}
          selectedMission={selectedMission}
          onSelectMission={handleSelectMission}
          solarLonDeg={solarLonDeg}
          solarLatDeg={solarLatDeg}
          dateTimeUtc={dateTimeUtc}
          onChangeDateTimeUtc={handleDateTimeUtcChange}
          onSetNowUtc={handleSetNowUtc}
          customCoords={customCoords}
          onApplyCustomCoords={handleApplyCustomCoords}
          pickOnMoon={pickOnMoon}
          onTogglePickOnMoon={() => setPickOnMoon((p) => !p)}
          basemapMode={basemapMode}
          onChangeBasemap={setBasemapMode}
          qmStats={qmStats}
          czmlSummary={czmlSummary}
          czmlStates={czmlStates}
          rawCzmlPackets={rawCzmlPackets}
          firebaseUser={firebaseUser}
          firebaseAuthReady={firebaseAuthReady}
          savedSites={savedSites}
          firebaseSyncError={firebaseSyncError}
          onLoadSavedSite={handleLoadSavedSite}
          simpleMode={simpleMode}
        />
      </main>
    </div>
  );
}

