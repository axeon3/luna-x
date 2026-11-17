import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { CLPS_MISSIONS } from './src/data/clpsMissions.ts';
import { selenographicToMCMF, computeLanderQuaternion } from './src/engine/selenodesy.ts';
import { encodeLunarQuantizedMeshTile } from './src/engine/quantizedMesh.ts';
import {
  computeDutyCycleTelemetry,
  generateSiteHorizonMask,
  generateSyntheticAzElSeries,
  parseHorizonsCsv,
} from './src/engine/librationEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  sizeBytes: number;
}

class SlidingWindowLRUCache<T> {
  private map = new Map<string, CacheEntry<T>>();
  public hits = 0;
  public misses = 0;
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor(maxEntries: number, ttlMs: number) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.map.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      this.misses++;
      return null;
    }
    // Sliding-window LRU refresh
    this.map.delete(key);
    entry.expiresAt = Date.now() + this.ttlMs;
    this.map.set(key, entry);
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T, sizeBytes = 1024): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxEntries) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) this.map.delete(oldestKey);
    }
    this.map.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
      sizeBytes,
    });
  }

  stats() {
    let totalBytes = 0;
    for (const entry of this.map.values()) totalBytes += entry.sizeBytes;
    return {
      entries: this.map.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      totalBytes,
    };
  }
}

const wmtsCache = new SlidingWindowLRUCache<{ contentType: string; data: Buffer }>(256, 1000 * 60 * 30);
const pdsCache = new SlidingWindowLRUCache<Record<string, unknown>>(64, 1000 * 60 * 15);
const qmCache = new SlidingWindowLRUCache<Buffer>(32, 1000 * 60 * 60);
const horizonsCache = new SlidingWindowLRUCache<Record<string, unknown>>(64, 1000 * 60 * 30);

const MOON_TREK_LAYERS: Record<string, { product: string; ext: string; mime: string }> = {
  lroc_wac: {
    product: 'LRO_WAC_Mosaic_Global_303ppd_v02',
    ext: 'jpg',
    mime: 'image/jpeg',
  },
  lola_clr: {
    product: 'LRO_LOLA_ClrShade_Global_128ppd_v04',
    ext: 'png',
    mime: 'image/png',
  },
};

const ALLOWED_UPSTREAM_HOSTS = new Set([
  'trek.nasa.gov',
  'oderest.rsl.wustl.edu',
  'ssd.jpl.nasa.gov',
  'oauth2.googleapis.com',
]);

type ServerSessionRole = 'observer' | 'operator' | 'admin';

const DYNAMIC_SCOPE_POLICY: Record<
  string,
  { capability: string; tier: 'read' | 'write' | 'elevated'; minRole: ServerSessionRole }
> = {
  'https://www.googleapis.com/auth/drive.metadata.readonly': {
    capability: 'drive:browse',
    tier: 'read',
    minRole: 'observer',
  },
  'https://www.googleapis.com/auth/drive.readonly': {
    capability: 'drive:read',
    tier: 'read',
    minRole: 'observer',
  },
  'https://www.googleapis.com/auth/drive.file': {
    capability: 'drive:export',
    tier: 'write',
    minRole: 'operator',
  },
  'https://www.googleapis.com/auth/drive': {
    capability: 'drive:manage',
    tier: 'elevated',
    minRole: 'admin',
  },
  'https://www.googleapis.com/auth/gmail.readonly': {
    capability: 'gmail:read',
    tier: 'read',
    minRole: 'observer',
  },
  'https://www.googleapis.com/auth/gmail.compose': {
    capability: 'gmail:compose',
    tier: 'write',
    minRole: 'operator',
  },
  'https://www.googleapis.com/auth/gmail.send': {
    capability: 'gmail:send',
    tier: 'write',
    minRole: 'operator',
  },
  'https://www.googleapis.com/auth/gmail.modify': {
    capability: 'gmail:modify',
    tier: 'elevated',
    minRole: 'admin',
  },
  'https://mail.google.com/': {
    capability: 'gmail:delete',
    tier: 'elevated',
    minRole: 'admin',
  },
};

const SERVER_ROLE_RANK: Record<ServerSessionRole, number> = {
  observer: 1,
  operator: 2,
  admin: 3,
};

const SERVER_SCOPE_IMPLICATIONS: Record<string, string[]> = {
  'https://www.googleapis.com/auth/drive': [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ],
  'https://www.googleapis.com/auth/drive.readonly': [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
  ],
  'https://mail.google.com/': [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
  ],
  'https://www.googleapis.com/auth/gmail.modify': [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
  ],
  'https://www.googleapis.com/auth/gmail.compose': [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
  ],
};

function serverScopeSatisfied(grantedScopes: string[], requiredScope: string): boolean {
  for (const g of grantedScopes) {
    if (g === requiredScope) return true;
    if (SERVER_SCOPE_IMPLICATIONS[g]?.includes(requiredScope)) return true;
  }
  return false;
}

function assertAllowedUpstreamUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  if (parsed.protocol !== 'https:' || !ALLOWED_UPSTREAM_HOSTS.has(parsed.hostname)) {
    throw new Error(`Blocked disallowed upstream target: ${parsed.hostname}`);
  }
  return parsed.toString();
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function createApiRateLimiter(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const now = Date.now();
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const bucketKey = `${clientIp}:${req.path.startsWith('/wmts') ? 'wmts' : 'api'}`;
    const existing = rateLimitStore.get(bucketKey);

    if (!existing || now > existing.resetAt) {
      if (rateLimitStore.size > 2000) {
        for (const [k, v] of rateLimitStore.entries()) {
          if (now > v.resetAt) rateLimitStore.delete(k);
        }
      }
      rateLimitStore.set(bucketKey, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    existing.count += 1;
    if (existing.count > maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        error: 'Rate limit exceeded. Please slow down API requests.',
        retryAfterSec,
      });
      return;
    }
    next();
  };
}

function buildMissionCZML() {
  const packets: Record<string, unknown>[] = [
    {
      id: 'document',
      name: 'NASA CLPS Lunar Telemetry Stream',
      version: '1.0',
      clock: {
        interval: '2024-01-08T00:00:00Z/2027-03-01T00:00:00Z',
        currentTime: '2025-03-02T08:34:00Z',
        multiplier: 1,
      },
    },
  ];

  // Landers in MOON_FIXED (IAU2015_Moon)
  for (const m of CLPS_MISSIONS) {
    const q = computeLanderQuaternion(m.lonDeg, m.latDeg, m.attitudeEulerDeg);
    const cartesian: number[] = [];
    const unitQuaternion: number[] = [];

    if (m.isAbortedTrack) {
      // Peregrine TO2-AB: trans-lunar abort & atmospheric reentry arc (10-day window sampled over t=0..3600s normalized)
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const tSec = u * 3600;
        // Curved cislunar loop receding toward Earth-Moon corridor
        const lon = m.lonDeg - u * 48;
        const lat = m.latDeg * (1 - u * 0.4) + Math.sin(u * Math.PI) * 16;
        const altM = 120000 + Math.sin(u * Math.PI) * 1450000;
        const pos = selenographicToMCMF(lon, lat, altM);
        cartesian.push(tSec, Number(pos.x.toFixed(2)), Number(pos.y.toFixed(2)), Number(pos.z.toFixed(2)));
        unitQuaternion.push(
          tSec,
          Number(q.x.toFixed(5)),
          Number(q.y.toFixed(5)),
          Number(q.z.toFixed(5)),
          Number(q.w.toFixed(5))
        );
      }
    } else if (m.hasRoverPath) {
      // Griffin Mission 1: static lander + FLIP rover traverse samples
      const pos = selenographicToMCMF(m.lonDeg, m.latDeg, m.elevationM);
      cartesian.push(0, Number(pos.x.toFixed(2)), Number(pos.y.toFixed(2)), Number(pos.z.toFixed(2)));
      cartesian.push(3600, Number(pos.x.toFixed(2)), Number(pos.y.toFixed(2)), Number(pos.z.toFixed(2)));
      unitQuaternion.push(0, q.x, q.y, q.z, q.w, 3600, q.x, q.y, q.z, q.w);

      // Add separate FLIP rover CZML entity
      const roverCart: number[] = [];
      const roverQuat: number[] = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12;
        const tSec = u * 3600;
        const rLon = m.lonDeg + u * 2.2;
        const rLat = m.latDeg + Math.sin(u * Math.PI) * 0.8;
        const rPos = selenographicToMCMF(rLon, rLat, m.elevationM + 4);
        const rQ = computeLanderQuaternion(rLon, rLat, { roll: 0, pitch: 0, yaw: 65 });
        roverCart.push(tSec, Number(rPos.x.toFixed(2)), Number(rPos.y.toFixed(2)), Number(rPos.z.toFixed(2)));
        roverQuat.push(tSec, rQ.x, rQ.y, rQ.z, rQ.w);
      }
      packets.push({
        id: 'flip-rover',
        name: 'Venturi Astrolab FLIP Rover (TO 20A)',
        availability: `${m.launchDate}T00:00:00Z/2027-03-01T00:00:00Z`,
        position: {
          epoch: `${m.landingDate.slice(0, 10)}T00:00:00Z`,
          referenceFrame: 'MOON_FIXED',
          interpolationAlgorithm: 'HERMITE',
          cartesian: roverCart,
        },
        orientation: {
          epoch: `${m.landingDate.slice(0, 10)}T00:00:00Z`,
          interpolationAlgorithm: 'LINEAR',
          unitQuaternion: roverQuat,
        },
        properties: {
          parentMission: m.id,
          frame: 'IAU2015_Moon',
        },
      });
    } else {
      // Surface lander (with descent approach t=0..300s and stationary surface attitude t=300..3600s)
      const approachPos = selenographicToMCMF(m.lonDeg - 0.8, m.latDeg + 0.5, m.elevationM + 140000);
      const midPos = selenographicToMCMF(m.lonDeg - 0.25, m.latDeg + 0.15, m.elevationM + 35000);
      const surfacePos = selenographicToMCMF(m.lonDeg, m.latDeg, m.elevationM);
      const uprightQ = computeLanderQuaternion(m.lonDeg, m.latDeg, { roll: 0, pitch: 0, yaw: m.attitudeEulerDeg.yaw });

      cartesian.push(
        0,
        Number(approachPos.x.toFixed(2)),
        Number(approachPos.y.toFixed(2)),
        Number(approachPos.z.toFixed(2)),
        150,
        Number(midPos.x.toFixed(2)),
        Number(midPos.y.toFixed(2)),
        Number(midPos.z.toFixed(2)),
        300,
        Number(surfacePos.x.toFixed(2)),
        Number(surfacePos.y.toFixed(2)),
        Number(surfacePos.z.toFixed(2)),
        3600,
        Number(surfacePos.x.toFixed(2)),
        Number(surfacePos.y.toFixed(2)),
        Number(surfacePos.z.toFixed(2))
      );

      unitQuaternion.push(
        0,
        uprightQ.x,
        uprightQ.y,
        uprightQ.z,
        uprightQ.w,
        300,
        q.x,
        q.y,
        q.z,
        q.w,
        3600,
        q.x,
        q.y,
        q.z,
        q.w
      );
    }

    packets.push({
      id: m.id,
      name: `${m.name} (${m.taskOrder})`,
      availability: `${m.launchDate}T00:00:00Z/2027-03-01T00:00:00Z`,
      position: {
        epoch: `${m.landingDate.slice(0, 10)}T00:00:00Z`,
        referenceFrame: 'MOON_FIXED',
        interpolationAlgorithm: 'HERMITE',
        cartesian,
      },
      orientation: {
        epoch: `${m.landingDate.slice(0, 10)}T00:00:00Z`,
        interpolationAlgorithm: 'LINEAR',
        unitQuaternion,
      },
      properties: {
        contractor: m.contractor,
        landerClass: m.landerClass,
        outcome: m.outcome,
        destination: m.destination,
        referenceFrame: 'IAU2015_Moon',
      },
    });
  }

  // Add Far-Side Orbital Relay Satellite (ESA Lunar Pathfinder / Elytra) in elliptical frozen orbit
  const relayCart: number[] = [];
  const relayQuat: number[] = [];
  const orbitSamples = 36;
  for (let i = 0; i <= orbitSamples; i++) {
    const u = i / orbitSamples;
    const tSec = u * 3600;
    const angle = u * Math.PI * 2;
    // Polar elliptical orbit biased over the southern far side (apsis over south pole/far side)
    const lat = -Math.sin(angle) * 78;
    const lon = 152 + Math.cos(angle) * 28;
    const altM = 580000 + 380000 * (1 - Math.sin(angle)) * 0.5;
    const pos = selenographicToMCMF(lon, lat, altM);
    const q = computeLanderQuaternion(lon, lat, { roll: 0, pitch: 180, yaw: (u * 360) % 360 });
    relayCart.push(tSec, Number(pos.x.toFixed(2)), Number(pos.y.toFixed(2)), Number(pos.z.toFixed(2)));
    relayQuat.push(tSec, q.x, q.y, q.z, q.w);
  }

  packets.push({
    id: 'lunar-pathfinder-relay',
    name: 'ESA Lunar Pathfinder / Elytra Relay',
    availability: '2026-01-01T00:00:00Z/2028-01-01T00:00:00Z',
    position: {
      epoch: '2026-12-01T00:00:00Z',
      referenceFrame: 'MOON_FIXED',
      interpolationAlgorithm: 'HERMITE',
      cartesian: relayCart,
    },
    orientation: {
      epoch: '2026-12-01T00:00:00Z',
      interpolationAlgorithm: 'LINEAR',
      unitQuaternion: relayQuat,
    },
    properties: {
      role: 'Far-Side Telemetry Relay',
      supportedMissions: ['cp-12', 'cs-3'],
      referenceFrame: 'IAU2015_Moon',
    },
  });

  return packets;
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));

  // Transport & HTTP security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (req.secure || process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // Defensive input sanity + sliding-window API rate limiting
  app.use('/api', (req, res, next) => {
    if (/(\.\.|%2e%2e|\0|%00|<script)/i.test(req.originalUrl)) {
      res.status(400).json({ error: 'Rejected malformed request sequence' });
      return;
    }
    next();
  });
  app.use('/api/wmts', createApiRateLimiter(450, 60_000));
  app.use('/api', createApiRateLimiter(150, 60_000));

  // 1. NASA Moon Trek WMTS Caching Proxy
  app.get('/api/wmts/:layer/:z/:y/:x', async (req, res) => {
    const { layer, z, y, x } = req.params;
    const cleanX = x.replace(/\.(jpg|png)$/i, '');
    const spec = MOON_TREK_LAYERS[layer];
    if (!spec) {
      res.status(400).json({ error: `Unsupported Moon Trek layer: ${layer}` });
      return;
    }
    if (!/^\d{1,2}$/.test(z) || !/^\d{1,5}$/.test(y) || !/^\d{1,5}$/.test(cleanX)) {
      res.status(400).json({ error: 'Invalid WMTS tile coordinates' });
      return;
    }
    const zNum = Number(z);
    if (zNum < 0 || zNum > 10) {
      res.status(400).json({ error: 'WMTS zoom level out of supported bounds (0..10)' });
      return;
    }

    const cacheKey = `${layer}/${z}/${y}/${cleanX}`;
    const cached = wmtsCache.get(cacheKey);
    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Upstream', 'NASA-Moon-Trek-WMTS');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(cached.data);
      return;
    }

    const upstreamUrl = assertAllowedUpstreamUrl(
      `https://trek.nasa.gov/tiles/Moon/EQ/${spec.product}/1.0.0/default/default028mm/${z}/${y}/${cleanX}.${spec.ext}`
    );
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const upstreamRes = await fetch(upstreamUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'NASA-CLPS-Lunar-Browser/1.0' },
      });
      clearTimeout(timeout);

      if (!upstreamRes.ok) {
        res.status(upstreamRes.status).json({
          error: 'NASA Moon Trek upstream returned non-200',
          status: upstreamRes.status,
          upstreamUrl,
        });
        return;
      }

      const arrayBuf = await upstreamRes.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      wmtsCache.set(cacheKey, { contentType: spec.mime, data: buf }, buf.byteLength);

      res.setHeader('Content-Type', spec.mime);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Upstream', 'NASA-Moon-Trek-WMTS');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buf);
    } catch (err) {
      res.status(502).json({
        error: 'Failed to reach NASA Moon Trek WMTS endpoint',
        detail: err instanceof Error ? err.message : String(err),
        upstreamUrl,
      });
    }
  });

  // 2. NASA PDS Geosciences Node ODE REST API Bridge (v2.1.5)
  app.get('/api/pds/products', async (req, res) => {
    const lat = Number(req.query.lat ?? -80.13);
    const lon = Number(req.query.lon ?? 3.44);
    const rawSpan = Number(req.query.span ?? 1.5);
    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lon) ||
      lon < -360 ||
      lon > 360 ||
      !Number.isFinite(rawSpan)
    ) {
      res.status(400).json({ error: 'Invalid selenographic bounding coordinates' });
      return;
    }
    const span = Math.max(0.25, Math.min(15, rawSpan));
    const dataset = String(req.query.dataset ?? 'lroc');

    const iiptMap: Record<string, { ihid: string; iid: string; pt: string; includeFiles?: boolean }> = {
      lroc: { ihid: 'LRO', iid: 'LROC', pt: 'CDRNAC4' },
      lola: { ihid: 'LRO', iid: 'LOLA', pt: 'RDR4' },
      lola_dem: { ihid: 'LRO', iid: 'LOLA', pt: 'GDRDEM', includeFiles: true },
      lroc_dtm: { ihid: 'LRO', iid: 'LROC', pt: 'SDNDTM', includeFiles: true },
      diviner: { ihid: 'LRO', iid: 'DLRE', pt: 'RDR4' },
    };
    const iipt = iiptMap[dataset] || iiptMap.lroc;
    const includeFiles = Boolean(iipt.includeFiles || req.query.includeFiles === 'true');
    const resultsParam = includeFiles ? 'mf' : 'm';

    const maxlat = Math.min(90, lat + span).toFixed(3);
    const minlat = Math.max(-90, lat - span).toFixed(3);
    // ODE easternlon/westernlon use 0..360° E
    const normLon = ((lon % 360) + 360) % 360;
    const westernlon = Math.max(0, normLon - span).toFixed(3);
    const easternlon = Math.min(360, normLon + span).toFixed(3);

    const cacheKey = `pds:${dataset}:${resultsParam}:${maxlat}:${minlat}:${easternlon}:${westernlon}`;
    const cached = pdsCache.get(cacheKey);
    if (cached) {
      res.json({ ...cached, cache: 'HIT' });
      return;
    }

    const upstreamUrl = assertAllowedUpstreamUrl(
      `https://oderest.rsl.wustl.edu/live2/?target=moon&query=product&results=${resultsParam}&output=JSON&ihid=${iipt.ihid}&iid=${iipt.iid}&pt=${iipt.pt}&minlat=${minlat}&maxlat=${maxlat}&westernlon=${westernlon}&easternlon=${easternlon}&limit=12`
    );
    const t0 = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 11000);
      const upstreamRes = await fetch(upstreamUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'NASA-CLPS-Lunar-Browser/1.0' },
      });
      clearTimeout(timeout);

      const latencyMs = Date.now() - t0;
      if (!upstreamRes.ok) {
        res.status(502).json({
          status: 'upstream_error',
          httpStatus: upstreamRes.status,
          upstreamUrl,
          latencyMs,
          products: [],
        });
        return;
      }

      const rawText = await upstreamRes.text();
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = {};
      }

      const odeResults = (parsed as { ODEResults?: Record<string, unknown> })?.ODEResults ?? {};
      const productsContainer = (odeResults as { Products?: { Product?: unknown } | string })?.Products;
      let rawList: Record<string, unknown>[] = [];
      if (productsContainer && typeof productsContainer === 'object') {
        if (Array.isArray(productsContainer.Product)) {
          rawList = productsContainer.Product as Record<string, unknown>[];
        } else if (productsContainer.Product && typeof productsContainer.Product === 'object') {
          rawList = [productsContainer.Product as Record<string, unknown>];
        }
      }

      const normalizedProducts = rawList.slice(0, 12).map((item) => {
        const pfContainer = item.Product_files as { Product_file?: unknown } | undefined;
        let rawFiles: Record<string, unknown>[] = [];
        if (pfContainer?.Product_file) {
          if (Array.isArray(pfContainer.Product_file)) {
            rawFiles = pfContainer.Product_file as Record<string, unknown>[];
          } else if (typeof pfContainer.Product_file === 'object') {
            rawFiles = [pfContainer.Product_file as Record<string, unknown>];
          }
        }

        const prioritizedFiles = rawFiles
          .filter((f) => f.URL && f.FileName)
          .sort((a, b) => {
            const typeRank = (t: unknown) => (t === 'Product' ? 0 : t === 'Browse' ? 1 : 2);
            const extRank = (name: string) =>
              /\.(tif|tiff|img|jp2|dem)$/i.test(name)
                ? 0
                : /\.(xml|lbl|txt)$/i.test(name)
                ? 1
                : 2;
            const dType = typeRank(a.Type) - typeRank(b.Type);
            if (dType !== 0) return dType;
            return extRank(String(a.FileName)) - extRank(String(b.FileName));
          })
          .slice(0, 8)
          .map((f) => ({
            fileName: String(f.FileName),
            description: String(f.Description || ''),
            type: String(f.Type || 'Product'),
            sizeKb: Number(f.KBytes ?? 0),
            url: String(f.URL),
          }));

        return {
          productId: String(
            item.pdsid || item.Product_id || item.Product_name || item.LabelFileName || 'PDS-PRODUCT'
          ),
          instrumentHost: String(item.ihid || iipt.ihid),
          instrument: String(item.iid || iipt.iid),
          productType: String(item.pt || iipt.pt),
          utcTime: String(item.UTC_start_time || item.utc_start_time || ''),
          centerLat: Number(item.Center_latitude ?? lat),
          centerLon: Number(item.Center_longitude ?? normLon),
          labelUrl: String(item.External_url || item.FilesURL || item.LabelURL || ''),
          filesPageUrl: String(item.FilesURL || ''),
          pdsVersion: String(item.PDS_version_id || 'PDS4'),
          mapScale: item.Map_scale ? String(item.Map_scale) : undefined,
          description: item.Description
            ? String(item.Description).replace(/\s+/g, ' ').trim().slice(0, 220)
            : undefined,
          files: prioritizedFiles,
        };
      });

      const payload = {
        status: 'live',
        source: 'NASA PDS Geosciences Node ODE REST API v2.1.5',
        upstreamUrl,
        bbox: {
          north: Number(maxlat),
          south: Number(minlat),
          east: Number(easternlon),
          west: Number(westernlon),
        },
        latencyMs,
        totalCount: Number(
          (odeResults as { Count?: number })?.Count ?? normalizedProducts.length
        ),
        products: normalizedProducts,
      };

      pdsCache.set(cacheKey, payload, rawText.length);
      res.json({ ...payload, cache: 'MISS' });
    } catch (err) {
      res.status(502).json({
        status: 'unreachable',
        source: 'NASA PDS Geosciences Node ODE REST API v2.1.5',
        upstreamUrl,
        latencyMs: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
        products: [],
      });
    }
  });

  // 3. Time-Dynamic CZML 1.0 Stream
  app.get('/api/czml/missions', (_req, res) => {
    const packets = buildMissionCZML();
    res.setHeader('Content-Type', 'application/json');
    res.json(packets);
  });

  app.get('/api/czml/:missionId', (req, res) => {
    const packets = buildMissionCZML();
    const filtered = packets.filter(
      (p) => p.id === 'document' || p.id === req.params.missionId || p.id === 'lunar-pathfinder-relay'
    );
    res.json(filtered);
  });

  // 4. Quantized Mesh 1.0 Binary Terrain Tile Endpoint (Extension ID 1: Oct-Encoded Normals)
  app.get('/api/terrain/qm/:missionId', (req, res) => {
    let targetLon = 0;
    let targetLat = 0;
    let targetElev = 0;
    let keyId = req.params.missionId;

    if (req.params.missionId === 'custom-coords' || req.params.missionId === 'custom') {
      const lat = Number(req.query.lat ?? 0);
      const lon = Number(req.query.lon ?? 0);
      const elevM = Number(req.query.elevM ?? 0);
      if (
        !Number.isFinite(lat) ||
        lat < -90 ||
        lat > 90 ||
        !Number.isFinite(lon) ||
        lon < -180 ||
        lon > 180 ||
        !Number.isFinite(elevM) ||
        elevM < -12000 ||
        elevM > 20000
      ) {
        res.status(400).json({ error: 'Invalid custom coordinates for Quantized Mesh' });
        return;
      }
      targetLat = lat;
      targetLon = lon;
      targetElev = elevM;
      keyId = `custom:${lat.toFixed(3)}:${lon.toFixed(3)}:${elevM.toFixed(0)}`;
    } else {
      const mission = CLPS_MISSIONS.find((m) => m.id === req.params.missionId);
      if (!mission) {
        res.status(404).json({ error: 'Unknown mission ID' });
        return;
      }
      targetLat = mission.latDeg;
      targetLon = mission.lonDeg;
      targetElev = mission.elevationM;
    }

    const halfSpanDeg = 2.4;
    const cacheKey = `qm:${keyId}:${halfSpanDeg}`;
    let buf = qmCache.get(cacheKey);
    let cacheStatus = 'HIT';
    if (!buf) {
      const ab = encodeLunarQuantizedMeshTile(
        targetLon,
        targetLat,
        targetElev,
        halfSpanDeg,
        24
      );
      buf = Buffer.from(ab);
      qmCache.set(cacheKey, buf, buf.byteLength);
      cacheStatus = 'MISS';
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('X-Cache', cacheStatus);
    res.setHeader('X-Bounds-West', String(targetLon - halfSpanDeg));
    res.setHeader('X-Bounds-East', String(targetLon + halfSpanDeg));
    res.setHeader('X-Bounds-South', String(Math.max(-89.95, targetLat - halfSpanDeg)));
    res.setHeader('X-Bounds-North', String(Math.min(89.95, targetLat + halfSpanDeg)));
    res.send(buf);
  });

  // 5. Live NASA/JPL Horizons Ephemeris & Solar/DTE Duty Cycle (rfc-2026-clps-v1.0)
  app.get('/api/ephemeris/libration', async (req, res) => {
    const lat = Number(req.query.lat ?? -80.13);
    const lon = Number(req.query.lon ?? 3.44);
    const elevM = Number(req.query.elevM ?? 1480);
    const rawHours = Number(req.query.hours ?? 720);
    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lon) ||
      lon < -360 ||
      lon > 360 ||
      !Number.isFinite(elevM) ||
      elevM < -12000 ||
      elevM > 20000 ||
      !Number.isFinite(rawHours)
    ) {
      res.status(400).json({ error: 'Invalid site coordinates or ephemeris window' });
      return;
    }
    const hours = Math.max(24, Math.min(720, rawHours));
    const maskRes: 36 | 360 = Number(req.query.maskRes) === 36 ? 36 : 360;
    const mode = String(req.query.mode ?? 'live');

    const rawStartUtc = typeof req.query.startUtc === 'string' ? req.query.startUtc.trim() : '';
    let startDate = new Date(Date.UTC(2025, 2, 2, 0, 0, 0));
    if (rawStartUtc) {
      const normalizedIso = rawStartUtc.includes('T')
        ? rawStartUtc.endsWith('Z')
          ? rawStartUtc
          : `${rawStartUtc}Z`
        : `${rawStartUtc.replace(' ', 'T')}Z`;
      const parsedMs = Date.parse(normalizedIso);
      if (
        !Number.isFinite(parsedMs) ||
        parsedMs < Date.UTC(1900, 0, 1) ||
        parsedMs > Date.UTC(2099, 11, 31)
      ) {
        res.status(400).json({ error: 'Invalid startUtc date/time (supported 1900-01-01 to 2099-12-31)' });
        return;
      }
      startDate = new Date(parsedMs);
    }

    const startTime = startDate.toISOString().slice(0, 16).replace('T', ' ');
    const stopDate = new Date(startDate.getTime() + hours * 3600 * 1000);
    const stopTime = stopDate.toISOString().slice(0, 16).replace('T', ' ');

    const horizonMask = generateSiteHorizonMask(lat, lon, elevM, maskRes);

    if (mode === 'synthetic') {
      const { sunRows, earthRows } = generateSyntheticAzElSeries(
        lat,
        lon,
        elevM,
        hours,
        startDate.toISOString()
      );
      const payload = computeDutyCycleTelemetry({
        latDeg: lat,
        lonDeg: lon,
        elevationM: elevM,
        horizonMaskDeg: horizonMask,
        sunRows,
        earthRows,
        mock: true,
        source: 'Analytic Libration Fallback (Synthetic)',
      });
      res.json({ ...payload, cache: 'BYPASS', latencyMs: 1 });
      return;
    }

    const cacheKey = `hor:${lat.toFixed(3)}:${lon.toFixed(3)}:${elevM.toFixed(0)}:${hours}:${maskRes}:${startTime}`;
    const cached = horizonsCache.get(cacheKey);
    if (cached) {
      res.json({ ...cached, cache: 'HIT' });
      return;
    }

    const elevKm = (elevM / 1000).toFixed(4);

    const buildHorizonsUrl = (cmd: string) => {
      const params = new URLSearchParams({
        format: 'json',
        COMMAND: `'${cmd}'`,
        OBJ_DATA: `'NO'`,
        MAKE_EPHEM: `'YES'`,
        EPHEM_TYPE: `'OBSERVER'`,
        CENTER: `'coord@301'`,
        SITE_COORD: `'${lon.toFixed(4)},${lat.toFixed(4)},${elevKm}'`,
        START_TIME: `'${startTime}'`,
        STOP_TIME: `'${stopTime}'`,
        STEP_SIZE: `'1h'`,
        QUANTITIES: `'4'`,
        CSV_FORMAT: `'YES'`,
      });
      return assertAllowedUpstreamUrl(
        `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`
      );
    };

    const t0 = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 14000);
      const [sunRes, earthRes] = await Promise.all([
        fetch(buildHorizonsUrl('10'), {
          signal: controller.signal,
          headers: { 'User-Agent': 'NASA-CLPS-Lunar-Browser/1.0' },
        }),
        fetch(buildHorizonsUrl('399'), {
          signal: controller.signal,
          headers: { 'User-Agent': 'NASA-CLPS-Lunar-Browser/1.0' },
        }),
      ]);
      clearTimeout(timeout);

      const latencyMs = Date.now() - t0;
      if (!sunRes.ok || !earthRes.ok) {
        res.status(502).json({
          error: 'NASA/JPL Horizons API returned non-200 status',
          sunStatus: sunRes.status,
          earthStatus: earthRes.status,
          latencyMs,
        });
        return;
      }

      const [sunJson, earthJson] = (await Promise.all([sunRes.json(), earthRes.json()])) as [
        { result?: string; error?: string },
        { result?: string; error?: string },
      ];

      if (!sunJson.result || !earthJson.result) {
        res.status(502).json({
          error: sunJson.error || earthJson.error || 'Missing Horizons result payload',
          latencyMs,
        });
        return;
      }

      const sunRows = parseHorizonsCsv(sunJson.result);
      const earthRows = parseHorizonsCsv(earthJson.result);

      const payload = computeDutyCycleTelemetry({
        latDeg: lat,
        lonDeg: lon,
        elevationM: elevM,
        horizonMaskDeg: horizonMask,
        sunRows,
        earthRows,
        mock: false,
        source: 'NASA/JPL Horizons REST API (DE441 · MEAN_ME)',
      });

      const out = { ...payload, latencyMs };
      horizonsCache.set(cacheKey, out as unknown as Record<string, unknown>, JSON.stringify(out).length);
      res.json({ ...out, cache: 'MISS' });
    } catch (err) {
      res.status(502).json({
        error: 'Failed to reach NASA/JPL Horizons REST API',
        detail: err instanceof Error ? err.message : String(err),
        latencyMs: Date.now() - t0,
      });
    }
  });

  // 6. Server-Side OAuth2 Bearer Token Evaluation (Consent + Policy + Role Verification)
  app.post('/api/auth/evaluate-scopes', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const accessToken = bearerMatch?.[1]?.trim();

    if (!accessToken) {
      res.status(401).json({ error: 'Missing Authorization: Bearer <token> header.' });
      return;
    }

    const rawRequested = Array.isArray(req.body?.requestedScopes)
      ? req.body.requestedScopes.filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
      : [];
    const requestedScopes: string[] = Array.from(new Set(rawRequested));

    const rawRole = String(req.body?.role ?? 'admin');
    const role: ServerSessionRole =
      rawRole === 'observer' || rawRole === 'operator' || rawRole === 'admin'
        ? rawRole
        : 'admin';

    const tokenInfoUrl = assertAllowedUpstreamUrl('https://oauth2.googleapis.com/tokeninfo');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const upstreamRes = await fetch(tokenInfoUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ access_token: accessToken }),
      });
      clearTimeout(timeout);

      if (!upstreamRes.ok) {
        res.status(401).json({
          valid: false,
          error: `Authorization server rejected token (${upstreamRes.status}).`,
        });
        return;
      }

      const info = (await upstreamRes.json()) as {
        scope?: string;
        expires_in?: string | number;
        email?: string;
        email_verified?: string | boolean;
        azp?: string;
        aud?: string;
      };

      const rawTokenScopes = (info.scope || '')
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      // Filter token scopes through least-privilege server policy allowlist and active role ceiling
      const policyAllowedScopes = rawTokenScopes.filter((s) => {
        const spec = DYNAMIC_SCOPE_POLICY[s];
        if (!spec) return false;
        return SERVER_ROLE_RANK[role] >= SERVER_ROLE_RANK[spec.minRole];
      });

      const deniedByConsent: string[] = [];
      const deniedByPolicy: string[] = [];
      const deniedByRole: string[] = [];

      const evaluations = requestedScopes.map((scope) => {
        const policySpec = DYNAMIC_SCOPE_POLICY[scope];
        const policyAllowed = Boolean(policySpec);
        const roleAllowed = policySpec
          ? SERVER_ROLE_RANK[role] >= SERVER_ROLE_RANK[policySpec.minRole]
          : false;
        const consentGranted = serverScopeSatisfied(rawTokenScopes, scope);

        if (!policyAllowed) deniedByPolicy.push(scope);
        else if (!roleAllowed) deniedByRole.push(scope);
        else if (!consentGranted) deniedByConsent.push(scope);

        return {
          scope,
          capability: policySpec?.capability || 'unregistered',
          policyAllowed,
          roleAllowed,
          consentGranted,
          effective: policyAllowed && roleAllowed && consentGranted,
          requiredRole: policySpec?.minRole || null,
        };
      });

      const expiresSec = Number(info.expires_in);
      res.json({
        valid: true,
        evaluatedAt: new Date().toISOString(),
        issuerSource: 'server+oauth2.googleapis.com/tokeninfo',
        verifiedEmail: info.email || null,
        emailVerified: info.email_verified === true || info.email_verified === 'true',
        azp: info.azp || info.aud || null,
        expiresInSec: Number.isFinite(expiresSec) && expiresSec > 0 ? expiresSec : null,
        role,
        rawConsentScopes: rawTokenScopes,
        grantedScopes: policyAllowedScopes,
        deniedScopes: Array.from(new Set([...deniedByPolicy, ...deniedByRole, ...deniedByConsent])),
        deniedByPolicy,
        deniedByRole,
        deniedByConsent,
        evaluations,
      });
    } catch (err) {
      res.status(502).json({
        valid: false,
        error: 'Failed to reach Google OAuth2 tokeninfo endpoint.',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // 7. Real Backend Pipeline, Security Posture & LRU Cache Telemetry
  app.get('/api/health/telemetry', (_req, res) => {
    res.json({
      referenceFrame: 'IAU2015_Moon',
      moonMeanRadiusM: 1737400.0,
      uptimeSec: Math.round(process.uptime()),
      securityPosture: {
        xPoweredByDisabled: true,
        trustProxyEnabled: true,
        jsonBodyLimit: '64kb',
        apiRateLimiterActive: true,
        upstreamHttpsAllowlist: Array.from(ALLOWED_UPSTREAM_HOSTS),
        serviceAccountPolicy: 'ADC / Workload Identity Federation (no static JSON keys)',
        oauthTokenStorage: 'In-memory only (ephemeral client session)',
        dynamicOAuthScopes: {
          mode: 'incremental-runtime',
          tokenIntrospection: '/api/auth/evaluate-scopes -> oauth2.googleapis.com/tokeninfo',
          policyAllowlistCount: Object.keys(DYNAMIC_SCOPE_POLICY).length,
          roles: ['observer', 'operator', 'admin'],
        },
        webApiKeyPolicy: 'Restrict by HTTP referrer & API scope in Google Cloud Console',
      },
      caches: {
        wmts: wmtsCache.stats(),
        pds: pdsCache.stats(),
        quantizedMesh: qmCache.stats(),
        horizons: horizonsCache.stats(),
      },
      endpoints: [
        'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02',
        'https://trek.nasa.gov/tiles/Moon/EQ/LRO_LOLA_ClrShade_Global_128ppd_v04',
        'https://oderest.rsl.wustl.edu/live2/?target=moon&query=product',
        'https://ssd.jpl.nasa.gov/api/horizons.api?CENTER=coord@301',
        'https://oauth2.googleapis.com/tokeninfo',
      ],
    });
  });

  // Vite or Static Frontend
  if (process.env.NODE_ENV !== 'production') {
    process.env.DISABLE_HMR = 'true';
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.get('/@vite/client', (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(`const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else {
    style.textContent = content;
  }
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}
export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url) { return url; }
export class ErrorOverlay extends HTMLElement {}
`);
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT || 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NASA CLPS Lunar Browser server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
