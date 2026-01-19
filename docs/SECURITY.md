# Maída Website - Security Documentation

## 🔒 Security Overview

This document outlines security measures for the Maída admin panel.

---

## 🔑 Authentication

### Password Security
| Measure | Implementation |
|---------|----------------|
| Hashing | Bcrypt with 12 salt rounds |
| Minimum length | 8 characters |
| Storage | Only hash stored, never plain text |

### Password Hashing (auth.ts)
```typescript
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

## 🍪 Session Management

### Cookie Configuration
| Setting | Value | Purpose |
|---------|-------|---------|
| `httpOnly` | `true` | Prevents JavaScript access |
| `secure` | `true` (prod) | HTTPS only in production |
| `sameSite` | `strict` | CSRF protection |
| `path` | `/` | Sent to all routes |
| `maxAge` | 1800 (30 min) | Auto-expiration |

### Implementation (auth.ts)
```typescript
export function getSessionCookieOptions() {
  return {
    name: 'maida_admin_session',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 30 * 60, // 30 minutes in seconds
    path: '/',
  };
}
```

### Session Features
- **Sliding expiration** - Session extends on each validated request
- **Secure tokens** - 32-byte random hex strings
- **IP logging** - Track session origin
- **User agent logging** - Track device info
- **Database-backed** - Sessions stored in SQLite, can be invalidated server-side

### Token Generation
```typescript
import { randomBytes } from 'crypto';

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}
```

---

## 🛡️ API Security

### Protected Route Pattern
All admin API routes validate the session:

```typescript
// src/app/api/admin/auth/session/route.ts
import { validateSession } from '@/lib/auth';

export async function GET() {
  const result = await validateSession();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: result.user,
  });
}
```

### Session Validation Flow
```
1. Extract token from cookie
2. Look up session in database
3. Check if expired
4. If valid: extend expiration, return user
5. If invalid: return 401 Unauthorized
```

---

## 🗄️ Database Security

### SQLite File Protection
| Measure | Implementation |
|---------|----------------|
| Location | `prisma/admin.db` |
| Git | Added to `.gitignore` |
| Access | Server-side only |

### Gitignore Entries
```gitignore
# Database
prisma/admin.db
prisma/admin.db-journal
```

### Sensitive Data Handling
- **Passwords**: Bcrypt hashed, never stored plain
- **Sessions**: Random 64-character hex tokens
- **User data**: Only email, name, timestamps stored

---

## 🔐 Environment Variables

### Required Variables
```env
# .env (committed - non-sensitive)
DATABASE_URL="file:./prisma/admin.db"
```

### Security Rules
- ✅ Database URL can be committed (file path, not credentials)
- ❌ Never commit actual credentials
- ❌ Never log sensitive data
- ✅ Use `.env.local` for any secrets (auto-gitignored by Next.js)

---

## 🛡️ Primary Admin Protection

The first admin created is marked as "primary" and cannot be deleted:

```prisma
model User {
  // ...
  isPrimary Boolean @default(false)  // Cannot be deleted
}
```

```typescript
// In user deletion logic (Phase 3)
if (user.isPrimary) {
  return { error: 'Cannot delete primary admin' };
}
```

---

## 🌐 HTTP Security Headers

### Recommended Headers (next.config.js)
```javascript
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## ✅ Security Checklist

### Phase 1 (Complete) ✅
- [x] Bcrypt password hashing (12 rounds)
- [x] HTTP-only session cookies
- [x] Secure flag in production
- [x] SameSite=strict for CSRF protection
- [x] 30-minute session timeout
- [x] Sliding session expiration
- [x] Database-backed sessions
- [x] Primary admin protection
- [x] Database file gitignored

### Phase 2 (Content Editors)
- [ ] Input validation on content updates
- [ ] File type validation for uploads
- [ ] File size limits
- [ ] Sanitize filenames

### Phase 3 (User Management)
- [ ] Password strength requirements
- [ ] Prevent primary admin deletion
- [ ] Session invalidation on password change

### Ongoing
- [ ] Keep dependencies updated
- [ ] Monitor for security advisories
- [ ] Regular password rotation (recommended)

---

## 🚨 Incident Response

### If Admin Credentials Compromised
1. Log into admin panel
2. Change password immediately
3. (Phase 3) Invalidate all sessions
4. Review for unauthorized changes

### If Database File Exposed
1. Rotate all admin passwords
2. Delete and recreate sessions table
3. Review access logs
4. Consider credential exposure (hashed, but still rotate)

---

## 📚 Security Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Bcrypt Best Practices](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/)
