# Team Lunar & Luna-X — Comprehensive Documentation

Unified technical reference for **Team Axe / Lunar** and **Luna-X** (NASA Space Apps Challenge 2026): repositories, lunar navigation & selenodesy engines, lunar navigation hardware protection, and full-stack software & cloud security controls.

---

## 1. Repositories & Project Resources

| Repository / Resource | Purpose |
| :--- | :--- |
| [`axeon3/lunar`](https://github.com/axeon3/lunar) | Primary Axeon3 lunar navigation platform repository (renamed from `luna-x`), including Terraform Cloud Run scanner and DevSecOps workflows. |
| [`teamaxe/Luna-X`](https://github.com/teamaxe/Luna-X) | Upstream Team Axe Luna-X application codebase (3D lunar viewport, CLPS mission browser, selenodesy engine, security specs). |
| [`teamaxe/lunar`](https://github.com/teamaxe/lunar) | NASA Space Apps Challenge 2026 Team Axe lunar exploration repository. |
| [`axeon3/axeon3.github.io`](https://github.com/axeon3/axeon3.github.io) | Public GitHub Pages documentation portal (`#181825` theme). |
| [`axeon3/neo`](https://github.com/axeon3/neo) | Security automation, CodeQL static analysis, security scanners, and SPDX/CycloneDX SBOM workflows. |
| [Team Axe — NASA Space Apps 2026](https://www.spaceappschallenge.org/2026/find-a-team/axe/?tab=members) | Official NASA Space Apps Challenge 2026 team page. |

### Core Documentation Files

- `README.md` — Project overview, architecture, local setup, and deployment instructions.
- `DOCS.md` — This comprehensive documentation index.
- `SECURITY.md` — Firebase/OAuth key hygiene, GCP IAM least privilege, VPC-SC, Cloud Armor, CMEK, and Express protections.
- `security_spec.md` — Firestore data invariants, coordinate/schema bounds, and the 12 "Dirty Dozen" adversarial payload test cases.
- `libration_sim.py` — Python lunar libration and selenodetic reference simulator.

---

## 2. Lunar Navigation & Selenodesy Stack

### Core Modules

- **Selenodesy & Coordinate Systems (`src/engine/selenodesy.ts`)**
  - Converts between selenodetic latitude/longitude/elevation (`-90°..90°`, `-180°..180°`, `-12,000m..20,000m`) and Moon-centered fixed Cartesian coordinates for landing site targeting.
- **Earth-Moon Libration Engine (`src/engine/librationEngine.ts`, `libration_sim.py`)**
  - Models optical and physical lunar libration, sub-Earth point drift, and Earth-visibility line-of-sight windows for direct-to-Earth (DTE) communications.
- **Quantized Terrain Mesh & Basemaps (`src/engine/quantizedMesh.ts`, `src/engine/lunarTextures.ts`)**
  - Streams and decodes lunar digital elevation tiles across `wac`, `lola`, `hazard`, and `quantized` basemap modes.
- **3D Lunar Viewport & Lander Models (`src/components/LunarViewport.tsx`, `src/engine/landerModels.ts`)**
  - Interactive 3D lunar globe, slope/hazard visualization, and procedural lander geometry for landing site inspection.
- **Ephemeris & CZML Trajectory Worker (`src/workers/czmlWorker.ts`, `src/components/EphemerisPanel.tsx`, `src/components/PayloadCharts.tsx`)**
  - Off-main-thread Web Worker generating CZML orbital packets paired with ephemeris telemetry and payload charts.
- **CLPS Missions, Saved Sites & Glossary (`src/data/clpsMissions.ts`, `src/components/SavedSitesPanel.tsx`, `src/data/glossaryTerms.ts`)**
  - Catalogs Commercial Lunar Payload Services (CLPS) landing sites, user-saved waypoints, and lunar navigation terminology.

### Allowlisted NASA Data Feeds (`server.ts`)

- `trek.nasa.gov` — NASA Moon Trek basemap and elevation tiles.
- `oderest.rsl.wustl.edu` — PDS Orbital Data Explorer (ODE) REST API.
- `ssd.jpl.nasa.gov` — NASA JPL Solar System Dynamics ephemeris services.

---

## 3. Lunar Navigation Hardware Protection

### Radiation & SEU/SEL Mitigation
- Rad-hardened / rad-tolerant flight processors against Galactic Cosmic Rays (GCR) and Solar Particle Events (SPE).
- Triple Modular Redundancy (TMR) for critical navigation state vectors.
- EDAC / ECC memory scrubbing for Single-Event Upsets (SEU).
- Latch-up Current Limiters (LCL) and hardware watchdog reset timers.

### Extreme Thermal Regulation
- Multi-Layer Insulation (MLI) blankets for `+120°C` lunar noon exposure.
- Survival heaters and Radioisotope Heater Unit (RHU) enclosures for `-170°C` lunar night.
- Permanently Shadowed Region (PSR) cryogenic isolation (`< -230°C`).
- Thermal louvers and heat pipes for IMU and star-tracker alignment stability.

### Regolith & Electrostatic Dust Defense
- Electrodynamic Dust Shield (EDS) on optical apertures and solar arrays.
- Hermetically sealed LiDAR, camera, and star-tracker optics.
- Abrasion-resistant coatings against sharp silicate lunar regolith.
- Chassis grounding and ESD-protected harness connectors.

### Optical & RF Sensor Protection
- Sun-exclusion baffles and shutters for star trackers and optical cameras.
- Multi-sensor fusion fallback (IMU + Terrain Relative Navigation).
- Dual-band RF redundancy (S-band / X-band / Ka-band relay).
- Anti-multipath antenna placement for crater-rim and polar operations.

### Power Bus & Mechanical Protection
- Dual-redundant power distribution buses with solid-state switches, automated load shedding, and deterministic safe-mode brownout recovery.
- Hazard-avoidance slope and boulder detection prior to touchdown.
- Shock-isolated avionics bays and micrometeoroid Whipple shielding on external sensor housings.

---

## 4. Software & Cloud Security Protection

### Application-Layer Defenses (`server.ts`)
- Strict HTTPS hostname allowlist preventing SSRF on NASA proxy endpoints.
- Per-IP sliding-window rate limiting on `/api/*` returning `429 Too Many Requests` with `Retry-After`.
- Strict tile `z/y/x` integer validation, coordinate range checks, and `64kb` JSON request body limit.
- Security response headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Permissions-Policy`, and disabled `x-powered-by`.

### Firestore Data Invariants & "Dirty Dozen" (`security_spec.md`)
- **Default Deny**: All unmatched paths denied for reads and writes.
- **Verified Identity**: Requires `request.auth != null` and `request.auth.token.email_verified == true`.
- **Strict Ownership**: `/users/{userId}/private/profile` and `/users/{userId}/sites/{siteId}` restricted strictly to the owner.
- **Immutability & Bounds**: Immutable `ownerId` and `createdAt`, server-enforced `request.time`, no ghost/shadow keys, coordinate bounds (`-90..90`, `-180..180`, `-12000..20000`), basemap enum allowlist (`wac`, `lola`, `hazard`, `quantized`), ID regex (`^[a-zA-Z0-9_\-]+$`, `<= 128`), and string length caps (`<= 400`).

### Identity, Dynamic Scopes & Ephemeral Tokens (`SECURITY.md`, `DynamicScopeModal.tsx`, `RuntimeScopesCard.tsx`)
- In-memory OAuth access tokens (never persisted to `localStorage` or `sessionStorage`).
- Incremental OAuth 2.0 authorization (`include_granted_scopes=true`) with least-privilege baseline scopes.
- Server-side Bearer token evaluation via `/api/auth/evaluate-scopes` against Google `tokeninfo`, scope allowlist, and RBAC roles (`observer`, `operator`, `admin`).
- Zero static service account keys; Application Default Credentials (ADC) and Workload Identity Federation (WIF).

### Cloud Infrastructure & DevSecOps (`SECURITY.md`, `axeon3-scanner/`, `axeon3/neo`)
- Dedicated least-privilege Cloud Run service account and Privileged Access Manager (PAM) JIT access.
- VPC Service Controls (VPC-SC), Cloud Armor WAF (OWASP CRS + adaptive DDoS), TLS 1.2/1.3, Cloud KMS CMEK, and Google Cloud Secret Manager.
- Automated CodeQL SAST, security scanners, and SPDX/CycloneDX SBOM generation.
- React `ErrorBoundary.tsx` for runtime UI fault containment.

---

## 5. Local Development

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build
```
