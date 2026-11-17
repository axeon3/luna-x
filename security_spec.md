# Firestore Security Specification

## 1. Data Invariants
1. **Default Deny**: Every document path not explicitly matched is denied for both reads and writes.
2. **Verified Identity**: All reads and writes require `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Strict Path & Ownership Alignment**:
   - `/users/{userId}/private/profile`: Only the owner (`request.auth.uid == userId`) may read or write, preventing any cross-user PII exposure.
   - `/users/{userId}/sites/{siteId}`: Only the owner (`request.auth.uid == userId` and `data.ownerId == request.auth.uid`) may read, list, create, update, or delete.
4. **Immutable Ownership & Temporal Integrity**:
   - `uid` / `ownerId` and `createdAt` cannot change after creation (`incoming().ownerId == existing().ownerId`, `incoming().createdAt == existing().createdAt`).
   - `createdAt == request.time` on create; `updatedAt == request.time` on create and update.
5. **Strict Schema & Bounds**:
   - No shadow/ghost keys allowed (`keys().hasAll(...) && keys().hasOnly(...)` on create; `affectedKeys().hasOnly(...)` on update).
   - Coordinate bounds enforced: `-90 <= latDeg <= 90`, `-180 <= lonDeg <= 180`, `-12000 <= elevationM <= 20000`.
   - Basemap enum enforced: `basemapMode in ['wac', 'lola', 'hazard', 'quantized']`.
   - String lengths and ID regex (`^[a-zA-Z0-9_\-]+$`, `size() <= 128`) strictly enforced.

## 2. The "Dirty Dozen" Adversarial Payloads (All Must Yield `PERMISSION_DENIED`)
1. **Unauthenticated Write**: `create` on `/users/userA/sites/site1` with `request.auth == null`.
2. **Unverified Email**: `create` on `/users/userA/sites/site1` with `request.auth.uid == 'userA'` and `request.auth.token.email_verified == false`.
3. **Cross-User Read (PII Leak)**: `get` on `/users/userB/private/profile` authenticated as `userA`.
4. **Cross-User List (Query Scrape)**: `list` on `/users/userB/sites` authenticated as `userA`.
5. **Identity Spoofing on Create**: `create` on `/users/userA/sites/site1` with `ownerId: "userB"`.
6. **Ghost / Shadow Field Injection**: `create` on `/users/userA/sites/site1` containing extra field `isAdmin: true`.
7. **Immutable Field Tampering on Update**: `update` changing `ownerId` or `createdAt`.
8. **Client-Spoofed Timestamp**: `create` or `update` where `createdAt` / `updatedAt` != `request.time`.
9. **ID Poisoning**: `create` with `siteId` = 200-char string or containing invalid characters (`site/../../x`).
10. **Coordinate Out-of-Range Poisoning**: `create` with `latDeg: 145` or `elevationM: 999999`.
11. **Invalid Enum Poisoning**: `update` setting `basemapMode: "invalid_layer"`.
12. **String Size Exhaustion (Denial of Wallet)**: `create` or `update` setting `notes` to a 2,000-character string (`> 400`).
