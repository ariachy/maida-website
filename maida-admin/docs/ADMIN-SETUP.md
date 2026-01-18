# Maída Admin Panel - Setup Guide

## Phase 1: Foundation Setup

This guide walks you through setting up the admin panel authentication system.

---

## 📦 1. Install Dependencies

Add these to your existing `package.json`:

```bash
npm install @prisma/client bcryptjs
npm install -D prisma @types/bcryptjs
```

---

## 🗄️ 2. Database Setup

### Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

### Copy the schema

Copy `prisma/schema.prisma` from the admin files to your project.

### Create the database

```bash
npx prisma db push
```

This creates `prisma/admin.db` with the Users and Sessions tables.

---

## 🔐 3. Environment Variables

Create `.env.local` in your project root:

```env
# Database
DATABASE_URL="file:./prisma/admin.db"

# Session secret (generate a secure random string)
SESSION_SECRET="your-super-secret-key-at-least-32-chars"
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

---

## 👤 4. Create Primary Admin

Run the setup script to create your first admin user:

```bash
npm run setup-admin
```

Or manually with:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/setup-admin.ts
```

You'll be prompted for:
- Email address
- Name (optional)
- Password (min 8 characters)

**Note:** The primary admin cannot be deleted through the UI for security.

---

## 📁 5. File Structure

Add these files to your project:

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                    # Login page
│   │   └── (protected)/
│   │       ├── layout.tsx              # Auth-protected layout
│   │       └── dashboard/
│   │           └── page.tsx            # Dashboard
│   │
│   └── api/
│       └── admin/
│           └── auth/
│               ├── login/route.ts
│               ├── logout/route.ts
│               └── session/route.ts
│
├── components/
│   └── admin/
│       └── AdminSidebar.tsx
│
├── lib/
│   ├── prisma.ts
│   └── auth.ts
│
prisma/
├── schema.prisma
└── admin.db (gitignored)

scripts/
└── setup-admin.ts
```

---

## 🚀 6. Test the Setup

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:3000/admin`
3. Log in with your admin credentials
4. You should see the dashboard!

---

## 🔒 Security Features

### Session Management
- HTTP-only cookies (no JavaScript access)
- Secure flag in production (HTTPS only)
- SameSite=strict (CSRF protection)
- 30-minute sliding expiration

### Password Security
- Bcrypt hashing (12 rounds)
- Minimum 8 characters required

### Protected Routes
- Server-side session validation
- Automatic redirect to login if unauthorized

---

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"
Run: `npx prisma generate`

### "Database does not exist"
Run: `npx prisma db push`

### Session not persisting
Check that:
1. `DATABASE_URL` is set correctly
2. Cookies are enabled in your browser
3. You're not in incognito mode

### "Invalid email or password"
1. Make sure you created an admin with `npm run setup-admin`
2. Check the email is correct (case-insensitive)
3. Password must match exactly

---

## Next Steps

After Phase 1 is complete, we'll add:

- **Phase 2:** Content editors with EN/PT tabs
- **Phase 3:** User management
- **Phase 4:** Dynamic language management

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |
| `npm run setup-admin` | Create primary admin user |
