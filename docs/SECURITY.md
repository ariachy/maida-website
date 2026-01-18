# Maída Website - Security Documentation

## 🔒 Security Overview

This document outlines security measures for the Maída admin panel.

---

## 🔐 Authentication

### Password Security
| Measure | Implementation |
|---------|----------------|
| Hashing | Bcrypt with 12 salt rounds |
| Minimum length | 12 characters |
| Requirements | Uppercase, lowercase, number, special char |
| Storage | Only hash stored, never plain text |

### Password Validation
```typescript
function validatePassword(password: string) {
  const errors = [];
  if (password.length < 12) errors.push('Min 12 characters');
  if (!/[A-Z]/.test(password)) errors.push('Need uppercase');
  if (!/[a-z]/.test(password)) errors.push('Need lowercase');
  if (!/[0-9]/.test(password)) errors.push('Need number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Need special char');
  return { valid: errors.length === 0, errors };
}
```

---

## 🍪 Session Management

### Cookie Configuration
| Setting | Value | Purpose |
|---------|-------|---------|
| `httpOnly` | `true` | Prevents JavaScript access |
| `secure` | `true` | HTTPS only |
| `sameSite` | `strict` | CSRF protection |
| `path` | `/admin` | Only sent to admin routes |
| `maxAge` | 30 minutes | Auto-expiration |

### Session Features
- **Sliding expiration** - Extends on activity
- **Single token** - One active session per login
- **IP logging** - Track session origin
- **User agent logging** - Track device info

---

## 🛡️ API Security

### Every Admin Route Must:
```typescript
export async function PUT(request: Request) {
  // 1. Validate session
  const user = await validateSession();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Validate input
  const data = await request.json();
  const validated = schema.safeParse(data);
  if (!validated.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  // 3. Perform action
  // ...
  
  // 4. Log to audit trail
  await logAudit(user.id, 'UPDATE_CONTENT', 'en.json', request);
  
  return Response.json({ success: true });
}
```

### Rate Limiting
| Endpoint | Limit |
|----------|-------|
| Login | 5 attempts per 15 min |
| API calls | 100 per minute |
| File uploads | 10 per minute |

---

## 📁 File Upload Security

### Allowed Types
```typescript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/gif'
];
```

### Size Limits
| File Type | Max Size |
|-----------|----------|
| Images | 5 MB |
| Total storage | 500 MB |

### Security Measures
1. **Whitelist file types** - Only allow specific MIME types
2. **Validate magic bytes** - Check actual file content, not just extension
3. **Rename files** - Use UUID, remove original filename
4. **Store outside webroot** - Move to safe location first
5. **Scan for malware** - Optional integration with ClamAV

### Safe Upload Flow
```typescript
async function handleUpload(file: File) {
  // 1. Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // 2. Validate size
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large');
  }
  
  // 3. Generate safe filename
  const ext = file.type.split('/')[1];
  const safeName = `${crypto.randomUUID()}.${ext}`;
  
  // 4. Save to uploads folder
  const path = `/public/uploads/${safeName}`;
  await saveFile(file, path);
  
  // 5. Return public URL
  return `/uploads/${safeName}`;
}
```

---

## 🗄️ Database Security

### SQLite File
| Measure | Implementation |
|---------|----------------|
| Location | `prisma/admin.db` |
| Git | Added to `.gitignore` |
| Permissions | 600 (owner read/write only) |
| Backups | Daily automated backups |

### Sensitive Data
- Passwords: Bcrypt hashed
- Sessions: Random tokens, not sequential
- Audit logs: IP addresses stored for security

---

## 🔑 Environment Variables

### Required Secrets
```env
# .env.local (NEVER COMMIT)

# Database
DATABASE_URL="file:./prisma/admin.db"

# Auth - generate: openssl rand -base64 32
NEXTAUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="https://maida.pt"

# Initial admin (first setup only)
INIT_ADMIN_EMAIL="your-email@example.com"
```

### Security Rules
- ❌ Never commit `.env.local`
- ❌ Never log secrets
- ❌ Never expose in client code
- ✅ Use different secrets per environment
- ✅ Rotate secrets annually

---

## 📝 Audit Logging

### What's Logged
| Action | Details Captured |
|--------|------------------|
| Login | User, IP, timestamp, success/fail |
| Logout | User, IP, timestamp |
| Content edit | User, file, changes, IP, timestamp |
| User create | Admin who created, new user email |
| User delete | Admin who deleted, deleted user |
| Upload | User, filename, size, IP |

### Log Retention
- Keep logs for 90 days
- Older logs archived monthly
- GDPR: Can export/delete on request

---

## 🌐 HTTP Security Headers

### next.config.js
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
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }
];
```

---

## ✅ Security Checklist

### Before Launch
- [ ] Strong `NEXTAUTH_SECRET` generated
- [ ] `.env.local` in `.gitignore`
- [ ] `prisma/admin.db` in `.gitignore`
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Primary admin created

### Ongoing
- [ ] Monitor failed login attempts
- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate secrets annually
- [ ] Backup database daily

---

## 🚨 Incident Response

### If Credentials Compromised
1. Immediately rotate `NEXTAUTH_SECRET`
2. Delete all sessions from database
3. Force password reset for all users
4. Review audit logs for unauthorized access
5. Check for unauthorized content changes

### If Database Compromised
1. Take site offline
2. Restore from backup
3. Rotate all secrets
4. Reset all passwords
5. Review and patch vulnerability

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)
