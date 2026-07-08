// ============================================================
// DNex Project Document Generator
// Run: node scripts/generate-docs.mjs
// Auto-runs via vite-plugin-doc-gen.js on every file save
// ============================================================

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC  = join(ROOT, 'src');

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFile(path) {
  try { return readFileSync(path, 'utf-8'); }
  catch { return ''; }
}

function walkDir(dir, exts = ['.tsx', '.ts', '.css', '.sql'], results = []) {
  if (!existsSync(dir)) return results;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (['node_modules', 'dist', '.git', '.vite'].includes(name)) continue;
      walkDir(full, exts, results);
    } else if (exts.includes(extname(name))) {
      results.push(full);
    }
  }
  return results;
}

function rel(path) {
  return relative(ROOT, path).replace(/\\/g, '/');
}

function countLines(path) {
  return readFile(path).split('\n').length;
}

function extractExports(content) {
  const matches = [...content.matchAll(/export\s+(?:function|const|class|interface|type)\s+(\w+)/g)];
  return [...new Set(matches.map(m => m[1]))];
}

function extractRoutes(content) {
  const matches = [...content.matchAll(/path:\s*['"`]([^'"`]+)['"`]/g)];
  return matches.map(m => m[1]);
}

function extractSupabaseTables(content) {
  const matches = [...content.matchAll(/\.from\(['"`](\w+)['"`]\)/g)];
  return [...new Set(matches.map(m => m[1]))];
}

function now() {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

// ── Scanners ──────────────────────────────────────────────────────────────────

function scanPublicPages() {
  const dir = join(SRC, 'app/pages');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => {
      const content = readFile(join(dir, f));
      return {
        name: basename(f, '.tsx'),
        file: `src/app/pages/${f}`,
        lines: content.split('\n').length,
        exports: extractExports(content),
      };
    });
}

function scanAdminPages() {
  const dir = join(SRC, 'app/admin/pages');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => {
      const content = readFile(join(dir, f));
      return {
        name: basename(f, '.tsx'),
        file: `src/app/admin/pages/${f}`,
        lines: content.split('\n').length,
        tables: extractSupabaseTables(content),
      };
    });
}

function scanAdminComponents() {
  const dir = join(SRC, 'app/admin/components');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => ({ name: basename(f, '.tsx'), file: `src/app/admin/components/${f}` }));
}

function scanAdminServices() {
  const dir = join(SRC, 'app/admin/services');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.ts'))
    .map(f => {
      const content = readFile(join(dir, f));
      return {
        name: basename(f, '.ts'),
        file: `src/app/admin/services/${f}`,
        exports: extractExports(content),
        tables: extractSupabaseTables(content),
      };
    });
}

function scanCRMPages() {
  const dir = join(SRC, 'app/crm/pages');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => {
      const content = readFile(join(dir, f));
      return {
        name: basename(f, '.tsx'),
        file: `src/app/crm/pages/${f}`,
        lines: content.split('\n').length,
      };
    });
}

function scanCRMServices() {
  const dir = join(SRC, 'app/crm/services');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.ts'))
    .map(f => {
      const content = readFile(join(dir, f));
      return {
        name: basename(f, '.ts'),
        file: `src/app/crm/services/${f}`,
        exports: extractExports(content),
        tables: extractSupabaseTables(content),
      };
    });
}

function scanCRMComponents() {
  const dir = join(SRC, 'app/crm/components');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => ({ name: basename(f, '.tsx'), file: `src/app/crm/components/${f}` }));
}

function scanHomeComponents() {
  const dir = join(SRC, 'app/components/home');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.tsx'))
    .map(f => ({ name: basename(f, '.tsx'), file: `src/app/components/home/${f}` }));
}

function scanRoutes() {
  const routeFile = join(SRC, 'app/routes.ts');
  const content = readFile(routeFile);
  return extractRoutes(content);
}

function scanSupabaseTables() {
  const allFiles = walkDir(SRC, ['.ts', '.tsx']);
  const tables = new Set();
  for (const file of allFiles) {
    const content = readFile(file);
    extractSupabaseTables(content).forEach(t => tables.add(t));
  }
  // Also parse the SQL schema
  const sqlFile = join(SRC, 'app/crm/supabase_crm_schema.sql');
  const sql = readFile(sqlFile);
  const sqlMatches = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)];
  sqlMatches.forEach(m => tables.add(m[1]));
  return [...tables].sort();
}

function scanStyles() {
  const dir = join(SRC, 'styles');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.css'))
    .map(f => ({
      name: f,
      file: `src/styles/${f}`,
      lines: countLines(join(dir, f)),
    }));
}

function scanDependencies() {
  const pkg = JSON.parse(readFile(join(ROOT, 'package.json')));
  return {
    deps: Object.keys(pkg.dependencies || {}),
    devDeps: Object.keys(pkg.devDependencies || {}),
  };
}

function countAllFiles() {
  const allTs  = walkDir(SRC, ['.tsx', '.ts']).length;
  const allCss = walkDir(SRC, ['.css']).length;
  const allSql = walkDir(SRC, ['.sql']).length;
  return { allTs, allCss, allSql };
}

// ── Document Builder ──────────────────────────────────────────────────────────

function buildDocument() {
  const publicPages    = scanPublicPages();
  const adminPages     = scanAdminPages();
  const adminComps     = scanAdminComponents();
  const adminServices  = scanAdminServices();
  const crmPages       = scanCRMPages();
  const crmServices    = scanCRMServices();
  const crmComps       = scanCRMComponents();
  const homeComps      = scanHomeComponents();
  const routes         = scanRoutes();
  const tables         = scanSupabaseTables();
  const styles         = scanStyles();
  const deps           = scanDependencies();
  const counts         = countAllFiles();

  const doc = `# DNex Project — Living Feature Document
> **Auto-generated** — Do not edit manually. Regenerated on every \`npm run dev\` save and \`npm run build\`.
> Last updated: **${now()}**

---

## 📊 Project Overview

| Metric | Count |
|--------|-------|
| TypeScript/TSX files | ${counts.allTs} |
| CSS stylesheets | ${counts.allCss} |
| SQL schema files | ${counts.allSql} |
| Registered routes | ${routes.length} |
| Supabase tables used | ${tables.length} |
| npm dependencies | ${deps.deps.length} |

---

## 🌐 Public Website

### Pages (${publicPages.length})

| Page | File | Lines |
|------|------|-------|
${publicPages.map(p => `| **${p.name}** | \`${p.file}\` | ${p.lines} |`).join('\n')}

### Home Section Components (${homeComps.length})

| Component | File | Purpose |
|-----------|------|---------|
${homeComps.map(c => {
  const purposes = {
    Hero: 'Main banner with CTA buttons',
    LeadForm: 'Client inquiry / lead capture form',
    Services: 'Services overview section',
    Process: 'How it works — step by step',
    WhyChooseUs: 'Key differentiators section',
    Testimonials: 'Auto-scrolling testimonials carousel',
    Pricing: 'Pricing packages display',
  };
  return `| **${c.name}** | \`${c.file}\` | ${purposes[c.name] || '—'} |`;
}).join('\n')}

### Global Components

| Component | File | Purpose |
|-----------|------|---------|
| **Navbar** | \`src/app/components/Navbar.tsx\` | Responsive top navigation with service dropdowns |
| **Footer** | \`src/app/components/Footer.tsx\` | Site footer with links and contact info |
| **TeamCarousel** | \`src/app/components/TeamCarousel.tsx\` | Team members carousel |

### Registered Routes

\`\`\`
${routes.map(r => `GET ${r}`).join('\n')}
\`\`\`

---

## 🔐 Admin Portal (/admin/*)

> Secured with Supabase Authentication. Session validated on every mount.

### Pages (${adminPages.length})

| Page | File | Lines |
|------|------|-------|
${adminPages.map(p => `| **${p.name}** | \`${p.file}\` | ${p.lines} |`).join('\n')}

### Admin Pages — Feature Detail

| Page | Key Features |
|------|-------------|
| **AdminLogin** | Email/password login, Supabase auth, mock auth mode, error handling |
| **AdminLayout** | Auth guard (session validation), collapsible sidebar, outlet routing |
| **AdminDashboard** | Stats cards (total/new/contacted/in-progress/closed), recent inquiries table |
| **AdminInquiries** | Search, multi-filter (status/service/date), CSV export, inquiry modal |
| **AdminServicesPage** | Manage service list, add/edit/delete services, sync with lead form |
| **AdminUsersPage** | Add/edit/delete admin users, role assignment (superadmin/content/support) |
| **AdminSettingsPage** | General settings, site content editor, SEO meta configuration |

### Admin Components (${adminComps.length})

| Component | File | Purpose |
|-----------|------|---------|
${adminComps.map(c => {
  const purposes = {
    AdminNavbar: 'Top bar with page title and subtitle',
    DashboardCards: 'KPI stat cards (total, new, contacted, etc.)',
    InquiryModal: 'Full inquiry detail modal with status update + notes',
    InquiryTable: 'Sortable inquiry data table with actions',
    Sidebar: 'Collapsible nav sidebar with CRM portal link',
  };
  return `| **${c.name}** | \`${c.file}\` | ${purposes[c.name] || '—'} |`;
}).join('\n')}

### Admin Services / API Layer (${adminServices.length})

| Service | Exports | Supabase Tables |
|---------|---------|----------------|
${adminServices.map(s =>
  `| **${s.name}** | ${s.exports.slice(0,4).join(', ')}${s.exports.length > 4 ? '…' : ''} | ${s.tables.length > 0 ? s.tables.join(', ') : '—'} |`
).join('\n')}

### Admin — Inquiry Status Lifecycle
\`\`\`
New → Contacted → In Progress → Closed
\`\`\`

### Admin — Role Permissions

| Role | Inquiries | Services | Users | Settings |
|------|-----------|----------|-------|----------|
| superadmin | Full CRUD | Full CRUD | Full CRUD | Full |
| content | View | Full CRUD | — | Content only |
| support | Full CRUD | View | — | — |

---

## 🏢 CRM Portal (/crm/*)

> Full-stack CRM suite with 14-stage case lifecycle, automation, and analytics.
> Shares the same Supabase auth session as the Admin Portal.

### CRM Pages (${crmPages.length})

| Page | File | Lines |
|------|------|-------|
${crmPages.map(p => `| **${p.name}** | \`${p.file}\` | ${p.lines} |`).join('\n')}

### CRM Pages — Feature Detail

| Page | Key Features |
|------|-------------|
| **CRMDashboard** | 8 KPI cards, revenue bar chart, service pie chart, conversion funnel, status breakdown |
| **CasesPage** | Search (name/email/phone/case ID), filter (status/priority/date), CSV export, SLA badges |
| **CaseDetailPage** | 14-stage pipeline stepper, activity timeline, call log, document management, payment tracking, notes |
| **TasksPage** | Kanban board (Pending/In Progress/Done), priority flags, overdue indicators, move between columns |
| **AnalyticsPage** | Revenue trend (LineChart), conversion funnel (BarChart), service split (PieChart), priority breakdown |
| **CRMSettingsPage** | Automation rule CRUD, enable/disable toggle, seed defaults, system config display |
| **NotificationsPage** | Read/unread notifications, mark all read, type icons, timestamp display |

### CRM Components (${crmComps.length})

| Component | File | Purpose |
|-----------|------|---------|
${crmComps.map(c => {
  const purposes = {
    CRMSidebar: 'CRM navigation with Back to Admin link and notification badge',
    CRMNavbar: 'Top bar with notification dropdown panel',
    CaseModal: 'Create new case modal with validation and automation trigger',
  };
  return `| **${c.name}** | \`${c.file}\` | ${purposes[c.name] || '—'} |`;
}).join('\n')}

### CRM Services / Business Logic (${crmServices.length})

| Service | Key Exports | Tables Used |
|---------|------------|------------|
${crmServices.map(s =>
  `| **${s.name}** | ${s.exports.slice(0,4).join(', ')}${s.exports.length > 4 ? '…' : ''} | ${s.tables.length > 0 ? s.tables.join(', ') : '—'} |`
).join('\n')}

### CRM — Case Lifecycle (14 Stages)
\`\`\`
New Lead → Contacted → Requirement Gathering → Interested → Not Interested
→ Service Assigned → Quotation Sent → Payment Pending → Payment Completed
→ Document Collection → Verification → Processing → Completed → Closed
\`\`\`

### CRM — Automation Rules Engine

| Trigger | Action | Default State |
|---------|--------|---------------|
| Payment marked Paid | Set status → "Document Collection" | Active |
| Document uploaded | Set status → "Verification" | Active |
| No response (24h) | Send notification reminder | Active |
| New case created | Notify team | Active |

### CRM — Case Activity Types

| Type | Icon | Color |
|------|------|-------|
| status_change | 🔄 | Gold (#C9963C) |
| note | 📝 | Indigo |
| call | 📞 | Green |
| payment | 💰 | Blue |
| document | 📄 | Purple |
| message | 💬 | Pink |
| task | ✅ | Amber |
| system | ⚙️ | Gray |

### CRM — SLA Status Indicators

| State | Condition | Color |
|-------|-----------|-------|
| On track | > 24h remaining | Green |
| Warning | < 24h remaining | Amber |
| Breached | Past deadline | Red |

---

## 🗄️ Database — Supabase Tables

### Existing Tables (Pre-CRM)

| Table | Purpose | Used By |
|-------|---------|---------|
| \`leads\` | Website inquiry form submissions | Admin Portal |

### New CRM Tables (9 tables)

| Table | Purpose | Key Columns |
|-------|---------|------------|
| \`crm_cases\` | Core case records | case_id, status, priority, assigned_to, sla_deadline |
| \`crm_activities\` | Activity timeline per case | type, description, performed_by, metadata |
| \`crm_tasks\` | Task management | title, status, due_date, priority, assigned_to |
| \`crm_documents\` | Versioned document uploads | name, version, status (pending/approved/rejected) |
| \`crm_calls\` | Call logs per case | duration_minutes, outcome, notes |
| \`crm_payments\` | Payment tracking | amount, status, payment_link, razorpay_id |
| \`crm_invoices\` | Invoice records | invoice_number, items (JSONB), total, status |
| \`crm_notifications\` | In-app notification feed | type, title, message, read |
| \`crm_automation_rules\` | Automation rule config | trigger, action, action_data, is_active |

**All tables detected in codebase:**
${tables.map(t => `- \`${t}\``).join('\n')}

---

## 🎨 Stylesheets (${styles.length} files)

| File | Lines | Purpose |
|------|-------|---------|
${styles.map(s => {
  const purposes = {
    'admin.css':    'All admin portal styles (.admin-* classes)',
    'crm.css':      'All CRM portal styles (.crm-* classes) — scoped, no conflicts',
    'index.css':    'Global reset and base styles',
    'fonts.css':    'Google Fonts imports',
    'tailwind.css': 'Tailwind CSS base directives',
  };
  return `| \`${s.name}\` | ${s.lines} | ${purposes[s.name] || '—'} |`;
}).join('\n')}

---

## 📦 Technology Stack

### Frontend Framework
- **Vite** + **React 18** + **TypeScript**
- **React Router v7** — client-side routing
- **Tailwind CSS v4** — utility classes

### UI Libraries
${deps.deps.filter(d => d.startsWith('@radix-ui')).slice(0,5).map(d => `- \`${d}\``).join('\n')}
- \`lucide-react\` — icons
- \`recharts\` — analytics charts
- \`react-hook-form\` — form management
- \`motion\` — animations
- \`sonner\` — toast notifications

### Backend / Database
- **Supabase** — PostgreSQL + Auth + Storage + Realtime
- \`@supabase/supabase-js\` — client SDK

### Key npm Dependencies (${deps.deps.length} total)

\`\`\`
${deps.deps.join(', ')}
\`\`\`

---

## 🔌 Integrations

| Integration | Status | Notes |
|-------------|--------|-------|
| **Supabase Auth** | ✅ Active | Email/password, session validation on mount |
| **Supabase Database** | ✅ Active | RLS enabled, 10 tables |
| **Supabase Storage** | 🔧 Setup needed | Create \`crm-documents\` bucket |
| **Supabase Realtime** | ✅ Active | Notifications channel subscribed |
| **Razorpay** | 🔧 Placeholder | Replace mock link in \`paymentService.ts\` |
| **WhatsApp API** | 📋 Planned | Add Supabase Edge Function |
| **Email / SMTP** | 📋 Planned | Configure Supabase SMTP or Resend |

---

## 🔐 Authentication & Security

| Feature | Details |
|---------|---------|
| **Auth Provider** | Supabase (PostgreSQL-backed) |
| **Session Validation** | \`getSession()\` called on every admin/CRM mount |
| **Session Storage** | Supabase manages in \`localStorage\` (auto-refresh) |
| **Mock Auth Mode** | Set \`VITE_MOCK_AUTH=true\` for testing without Supabase |
| **Mock Credentials** | \`admin@dnex.com\` / \`Admin@123\` (mock mode only) |
| **RLS** | Row Level Security enabled on all CRM tables |

---

## 📁 Project File Tree (Source)

\`\`\`
src/
├── app/
│   ├── components/         # Shared website components
│   │   ├── home/           # ${homeComps.length} home page sections
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── TeamCarousel.tsx
│   ├── pages/              # ${publicPages.length} public pages
│   ├── admin/              # Admin Portal
│   │   ├── pages/          # ${adminPages.length} admin pages
│   │   ├── components/     # ${adminComps.length} admin components
│   │   ├── services/       # ${adminServices.length} service files
│   │   └── context/        # AuthContext
│   ├── crm/                # CRM Portal (NEW)
│   │   ├── pages/          # ${crmPages.length} CRM pages
│   │   ├── components/     # ${crmComps.length} CRM components
│   │   ├── services/       # ${crmServices.length} service files
│   │   ├── context/        # CRMNotificationContext
│   │   └── supabase_crm_schema.sql
│   ├── App.tsx
│   └── routes.ts           # ${routes.length} registered routes
├── lib/
│   ├── supabase.ts         # Shared Supabase client
│   └── servicesStore.ts    # Local service list store
└── styles/
    ${styles.map(s => `├── ${s.name}            # ${s.lines} lines`).join('\n    ')}
\`\`\`

---

## 🔄 How This Document Updates Automatically

This file is regenerated by \`scripts/generate-docs.mjs\` which is called:
1. **On every file save** during \`npm run dev\` — via the Vite plugin \`vite-plugin-doc-gen.js\`
2. **On every build** — via \`npm run build\` pre-hook
3. **Manually** — run \`npm run docs\`

> ⚠️ Do not edit \`PROJECT_DOCUMENT.md\` directly — your changes will be overwritten on the next save.

---

*© ${new Date().getFullYear()} DNex Business Consultants. This document is auto-generated.*
`;

  return doc;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function generateDocs() {
  const doc = buildDocument();
  const outPath = join(ROOT, 'PROJECT_DOCUMENT.md');
  writeFileSync(outPath, doc, 'utf-8');
  console.log(`[docs] ✅ PROJECT_DOCUMENT.md updated — ${new Date().toLocaleTimeString()}`);
  return outPath;
}

// Run directly only when invoked as a script (e.g. `npm run docs`)
// NOT when imported as a module by the Vite plugin — avoids double-run on startup.
const scriptPath = process.argv[1]?.replace(/\\/g, '/');
const modulePath = fileURLToPath(import.meta.url).replace(/\\/g, '/');
if (scriptPath && modulePath.endsWith(scriptPath.split('/').pop())) {
  generateDocs();
}
