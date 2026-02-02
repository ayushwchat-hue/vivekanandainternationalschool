# Security Remediation Plan

## Overview
This plan addresses all critical and high-severity security vulnerabilities identified in the security review. The fixes are prioritized by severity and dependency order.

---

## Phase 1: Database Security (Critical - Immediate)

### 1.1 Lock Down admin_credentials Table
**Issue**: Password hashes are publicly accessible - anyone can read them.

**Fix**:
- Enable RLS on `admin_credentials`
- Create restrictive policy: No public read/write access
- Only allow access via edge functions with service role

```sql
-- Deny all public access
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
-- No policies = no access for anon/authenticated users
-- Edge functions use service_role which bypasses RLS
```

### 1.2 Secure admission_inquiries Table
**Issue**: Sensitive PII (student names, phone, email, addresses) is publicly readable/modifiable.

**Fix**:
- Keep INSERT open for public submissions
- Restrict SELECT/UPDATE/DELETE to admin sessions only
- Create server-side validation for admin access

```sql
-- Allow public to submit inquiries (INSERT only)
-- Restrict read/update/delete to validated admin sessions
```

### 1.3 Restrict site_content and gallery Tables
**Issue**: `USING (true)` policies allow anyone to modify/delete website content.

**Fix**:
- Keep SELECT public (content needs to be readable)
- Restrict INSERT/UPDATE/DELETE to admin sessions

---

## Phase 2: Authentication Hardening (High Priority)

### 2.1 Server-Side Session Validation
**Issue**: Current code only checks if token EXISTS in sessionStorage, not if it's VALID.

**Current vulnerable code**:
```typescript
// AdminAuthContext.tsx - VULNERABLE
const token = sessionStorage.getItem(SESSION_KEY);
if (token) {
  setIsAuthenticated(true); // No validation!
}
```

**Fix**:
- Store session tokens in database with expiry
- Validate token on each protected request
- Edge function validates session before returning data

**New flow**:
1. Login → Generate secure token → Store in `admin_sessions` table with expiry
2. Each request → Send token → Edge function validates against database
3. Invalid/expired token → Reject request

### 2.2 Add Rate Limiting to Login
**Issue**: No protection against brute force attacks.

**Fix**:
- Track failed login attempts by IP/username
- Implement exponential backoff
- Lock account after N failed attempts

---

## Phase 3: Edge Function Security

### 3.1 Update admin-auth Edge Function
- Add session validation endpoint
- Implement rate limiting
- Add session management (create/validate/invalidate)

### 3.2 Create Protected Data Endpoints
- New edge function for admin data operations
- Validates session token before any operation
- Returns admission inquiries only to valid admins

---

## Phase 4: Storage Security

### 4.1 Restrict gallery-images Bucket
**Issue**: Anyone can upload files.

**Fix**:
- Restrict uploads to validated admin sessions
- Add file type validation
- Limit file sizes

---

## Implementation Order

| Step | Task | Severity | Dependencies |
|------|------|----------|--------------|
| 1 | Create admin_sessions table | Critical | None |
| 2 | Update admin-auth edge function with session management | Critical | Step 1 |
| 3 | Lock down admin_credentials RLS | Critical | None |
| 4 | Secure admission_inquiries RLS | Critical | Step 2 |
| 5 | Secure site_content RLS | Critical | Step 2 |
| 6 | Secure gallery RLS | Critical | Step 2 |
| 7 | Update AdminAuthContext to validate sessions | High | Step 2 |
| 8 | Add rate limiting to login | High | Step 2 |
| 9 | Create admin-data edge function | High | Step 2 |
| 10 | Update storage bucket policies | Medium | Step 2 |
| 11 | Update frontend to use new endpoints | High | Steps 2, 9 |

---

## Estimated Effort
- **Phase 1**: ~30 minutes (database migrations)
- **Phase 2**: ~45 minutes (edge function + context updates)
- **Phase 3**: ~30 minutes (new edge function)
- **Phase 4**: ~15 minutes (storage policies)

**Total**: ~2 hours

---

## Post-Implementation Verification

1. ✅ Verify admin_credentials cannot be queried via Supabase client
2. ✅ Verify admission_inquiries only accessible to logged-in admin
3. ✅ Verify site_content/gallery read works publicly, write requires admin
4. ✅ Test session expiry and validation
5. ✅ Test rate limiting blocks rapid login attempts
6. ✅ Verify storage uploads require admin authentication

---

## Notes

- This uses a custom session system because the project uses single-user admin auth (not Supabase Auth)
- Edge functions with service_role bypass RLS, enabling secure admin operations
- Session tokens stored server-side prevent client-side manipulation
