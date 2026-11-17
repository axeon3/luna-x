# Backend & Cloud Infrastructure Security Guide

Project ID: `gen-lang-client-0427491063`

## 1. Firebase & OAuth Key Hygiene

- **Restrict Firebase Web API Key**: In Google Cloud Console (**APIs & Services > Credentials**), restrict the browser Web API key configured in `firebase-applet-config.json`:
  - **Application restrictions**: `Websites` (HTTP referrers) limited to:
    - `https://ais-dev-grzbiomzlv3dutcwf63ypg-650936582116.us-east1.run.app/*`
    - `https://ais-pre-grzbiomzlv3dutcwf63ypg-650936582116.us-east1.run.app/*`
    - `http://localhost:3000/*` (local development only; remove before strict production lockdown)
  - **API restrictions**: Restrict key to only required client APIs (`Identity Toolkit API`, `Token Service API`, `Google Drive API`, `Gmail API`).
- **No Static Service Account Keys**: Never place `serviceAccountKey.json` files in this repository (explicitly ignored in `.gitignore`). Use **Application Default Credentials (ADC)** on Cloud Run / Cloud Functions and **Workload Identity Federation (WIF)** in CI/CD pipelines.
- **Standard / Dynamic Scopes & Ephemeral Client Tokens**: Browser OAuth access tokens for Google Drive and Gmail are cached strictly in memory (`src/services/googleDriveAuth.ts`) and never persisted to `localStorage` or `sessionStorage`. Initial sign-in requests user-selected or least-privilege baseline scopes (`drive.metadata.readonly` or `gmail.readonly`), while elevated capabilities (`drive.readonly`, `drive.file`, `drive`, `gmail.compose`, `gmail.send`, `gmail.modify`, `https://mail.google.com/`) are requested dynamically at runtime via OAuth 2.0 incremental authorization (`include_granted_scopes=true`). Issued Bearer tokens are evaluated via `/api/auth/evaluate-scopes` against Google's authorization server (`https://oauth2.googleapis.com/tokeninfo`), a least-privilege scope policy allowlist, and the active session role (`observer`, `operator`, `admin`).

## 2. Cloud Infrastructure Security (GCP Controls)

### Identity & Access Management (IAM)
- **Least Privilege**: Never grant `roles/editor` or `roles/owner` to runtime service accounts. Grant only scoped predefined roles (e.g., `roles/secretmanager.secretAccessor`, `roles/logging.logWriter`, `roles/monitoring.metricWriter`) bound to the specific resource.
- **Dedicated Service Account**: Run this Cloud Run service with a dedicated service account (e.g., `clps-lunar-browser-sa@gen-lang-client-0427491063.iam.gserviceaccount.com`) rather than the default Compute Engine service account.
- **Just-In-Time (JIT) Access**: Gate human operator production access behind **Privileged Access Manager (PAM)** entitlements with time-bounded approvals.

### Network & Perimeter Defense
- **VPC Service Controls (VPC-SC)**: Place `gen-lang-client-0427491063` cloud storage, Secret Manager, and KMS resources inside a VPC-SC perimeter to block credential exfiltration.
- **Private Serverless Egress**: Attach a Serverless VPC Access connector + Cloud NAT + firewall egress rules when routing to private internal services. Public NASA agency endpoints (`trek.nasa.gov`, `oderest.rsl.wustl.edu`, `ssd.jpl.nasa.gov`) are strictly allowlisted in `server.ts`.
- **Web Application Firewall (Cloud Armor)**: Place Cloud Armor in front of the HTTPS Load Balancer with OWASP ModSecurity Core Rule Set (SQLi/XSS), adaptive DDoS protection, and rate-limiting policies complementing the Express `/api/*` rate limiter in `server.ts`.

### Data Protection & Secret Management
- **TLS 1.2/1.3 & CMEK**: Enforce HTTPS-only ingress (TLS 1.2/1.3) at the Cloud Run / Load Balancer edge with HSTS enabled (`Strict-Transport-Security`), and configure **Cloud KMS Customer-Managed Encryption Keys (CMEK)** on persistent buckets/databases for cryptographic revocation control.
- **Secret Manager**: Store runtime secrets (`GEMINI_API_KEY`, external credentials) in **Google Cloud Secret Manager** with automated rotation schedules and mount them as Cloud Run runtime environment variables/volumes rather than `.env` files.

## 3. Application-Layer Protections (`server.ts`)

- `x-powered-by` header disabled; `trust proxy` enabled for Cloud Run edge forwarding.
- Security response headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Permissions-Policy`, and `Strict-Transport-Security` over HTTPS.
- Sliding-window per-IP rate limiting on `/api/*` returning `429 Too Many Requests` with `Retry-After`.
- Strict parameter validation (tile `z/y/x` integers, coordinate ranges, `64kb` JSON body limit) and HTTPS hostname allowlist preventing SSRF on proxy endpoints.
