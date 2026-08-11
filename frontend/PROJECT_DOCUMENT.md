# DNex Project — Living Feature Document
> **Auto-generated** — Do not edit manually. Regenerated on every `npm run dev` save and `npm run build`.
> Last updated: **Tuesday, 11 August 2026 at 12:20 pm**

---

## 📊 Project Overview

| Metric | Count |
|--------|-------|
| TypeScript/TSX files | 126 |
| CSS stylesheets | 6 |
| SQL schema files | 0 |
| Registered routes | 0 |
| Supabase tables used | 16 |
| npm dependencies | 63 |

---

## 🌐 Public Website

### Pages (9)

| Page | File | Lines |
|------|------|-------|
| **About** | `src/app/pages/About.tsx` | 420 |
| **ClientPayment** | `src/app/pages/ClientPayment.tsx` | 211 |
| **Contact** | `src/app/pages/Contact.tsx` | 104 |
| **FreeZone** | `src/app/pages/FreeZone.tsx` | 878 |
| **Home** | `src/app/pages/Home.tsx` | 23 |
| **IndiaServices** | `src/app/pages/IndiaServices.tsx` | 553 |
| **NotFound** | `src/app/pages/NotFound.tsx` | 106 |
| **OurServices** | `src/app/pages/OurServices.tsx` | 1027 |
| **Root** | `src/app/pages/Root.tsx` | 48 |

### Home Section Components (9)

| Component | File | Purpose |
|-----------|------|---------|
| **BaseLeadForm** | `src/app/components/home/BaseLeadForm.tsx` | — |
| **Hero** | `src/app/components/home/Hero.tsx` | Main banner with CTA buttons |
| **LeadForm** | `src/app/components/home/LeadForm.tsx` | Client inquiry / lead capture form |
| **PartnersClients** | `src/app/components/home/PartnersClients.tsx` | — |
| **Pricing** | `src/app/components/home/Pricing.tsx` | Pricing packages display |
| **Process** | `src/app/components/home/Process.tsx` | How it works — step by step |
| **Services** | `src/app/components/home/Services.tsx` | Services overview section |
| **Testimonials** | `src/app/components/home/Testimonials.tsx` | Auto-scrolling testimonials carousel |
| **WhyChooseUs** | `src/app/components/home/WhyChooseUs.tsx` | Key differentiators section |

### Global Components

| Component | File | Purpose |
|-----------|------|---------|
| **Navbar** | `src/app/components/Navbar.tsx` | Responsive top navigation with service dropdowns |
| **Footer** | `src/app/components/Footer.tsx` | Site footer with links and contact info |
| **TeamCarousel** | `src/app/components/TeamCarousel.tsx` | Team members carousel |

### Registered Routes

```

```

---

## 🔐 Admin Portal (/admin/*)

> Secured with Supabase Authentication. Session validated on every mount.

### Pages (9)

| Page | File | Lines |
|------|------|-------|
| **AdminContentPage** | `src/app/admin/pages/AdminContentPage.tsx` | 399 |
| **AdminDashboard** | `src/app/admin/pages/AdminDashboard.tsx` | 81 |
| **AdminInquiries** | `src/app/admin/pages/AdminInquiries.tsx` | 207 |
| **AdminLayout** | `src/app/admin/pages/AdminLayout.tsx` | 58 |
| **AdminLogin** | `src/app/admin/pages/AdminLogin.tsx` | 162 |
| **AdminRedirect** | `src/app/admin/pages/AdminRedirect.tsx` | 6 |
| **AdminServicesPage** | `src/app/admin/pages/AdminServicesPage.tsx` | 218 |
| **AdminSettingsPage** | `src/app/admin/pages/AdminSettingsPage.tsx` | 223 |
| **AdminUsersPage** | `src/app/admin/pages/AdminUsersPage.tsx` | 283 |

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

### Admin Components (6)

| Component | File | Purpose |
|-----------|------|---------|
| **AdminNavbar** | `src/app/admin/components/AdminNavbar.tsx` | Top bar with page title and subtitle |
| **CommunicationTemplates** | `src/app/admin/components/CommunicationTemplates.tsx` | — |
| **DashboardCards** | `src/app/admin/components/DashboardCards.tsx` | KPI stat cards (total, new, contacted, etc.) |
| **InquiryModal** | `src/app/admin/components/InquiryModal.tsx` | Full inquiry detail modal with status update + notes |
| **InquiryTable** | `src/app/admin/components/InquiryTable.tsx` | Sortable inquiry data table with actions |
| **Sidebar** | `src/app/admin/components/Sidebar.tsx` | Collapsible nav sidebar with CRM portal link |

### Admin Services / API Layer (3)

| Service | Exports | Supabase Tables |
|---------|---------|----------------|
| **authService** | AdminUser, onAuthStateChange | — |
| **inquiryService** | InquiryStatus, Inquiry, InquiryFilters | leads |
| **supabaseClient** |  | — |

### Admin — Inquiry Status Lifecycle
```
New → Contacted → In Progress → Closed
```

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

### CRM Pages (8)

| Page | File | Lines |
|------|------|-------|
| **AnalyticsPage** | `src/app/crm/pages/AnalyticsPage.tsx` | 138 |
| **CaseDetailPage** | `src/app/crm/pages/CaseDetailPage.tsx` | 871 |
| **CasesPage** | `src/app/crm/pages/CasesPage.tsx` | 211 |
| **CRMDashboard** | `src/app/crm/pages/CRMDashboard.tsx` | 244 |
| **CRMLayout** | `src/app/crm/pages/CRMLayout.tsx` | 44 |
| **CRMSettingsPage** | `src/app/crm/pages/CRMSettingsPage.tsx` | 227 |
| **NotificationsPage** | `src/app/crm/pages/NotificationsPage.tsx` | 90 |
| **TasksPage** | `src/app/crm/pages/TasksPage.tsx` | 186 |

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

### CRM Components (5)

| Component | File | Purpose |
|-----------|------|---------|
| **CaseModal** | `src/app/crm/components/CaseModal.tsx` | Create new case modal with validation and automation trigger |
| **CRMNavbar** | `src/app/crm/components/CRMNavbar.tsx` | Top bar with notification dropdown panel |
| **CRMSidebar** | `src/app/crm/components/CRMSidebar.tsx` | CRM navigation with Back to Admin link and notification badge |
| **EmailComposeModal** | `src/app/crm/components/EmailComposeModal.tsx` | — |
| **WorkflowSteps** | `src/app/crm/components/WorkflowSteps.tsx` | — |

### CRM Services / Business Logic (10)

| Service | Key Exports | Tables Used |
|---------|------------|------------|
| **activityService** | CRMActivity, ACTIVITY_ICONS, ACTIVITY_COLORS | crm_activities |
| **analyticsService** | CRMNotification | crm_notifications, crm_cases, crm_payments, crm_tasks |
| **automationService** | AutomationRule, AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS, DEFAULT_AUTOMATION_RULES | crm_automation_rules, crm_cases, crm_activities, crm_notifications, crm_tasks |
| **callService** | CRMCall, OUTCOME_LABELS, OUTCOME_COLORS | crm_calls, crm_activities |
| **caseService** | CaseStatus, CasePriority, CASE_STATUSES, STATUS_COLORS… | crm_cases, crm_activities |
| **documentService** | CRMDocument | crm_documents, crm_activities |
| **emailNotificationService** | EmailPayload, NotificationTrigger, CRMNotificationPayload | — |
| **paymentService** | CRMPayment, CRMInvoice, InvoiceItem | crm_payments, crm_activities, crm_invoices |
| **quotationService** | QuotationItem, CRMQuotation | crm_quotations, crm_activities |
| **taskService** | CRMTask | crm_tasks |

### CRM — Case Lifecycle (14 Stages)
```
New Lead → Contacted → Requirement Gathering → Interested → Not Interested
→ Service Assigned → Quotation Sent → Payment Pending → Payment Completed
→ Document Collection → Verification → Processing → Completed → Closed
```

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
| `leads` | Website inquiry form submissions | Admin Portal |

### New CRM Tables (9 tables)

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `crm_cases` | Core case records | case_id, status, priority, assigned_to, sla_deadline |
| `crm_activities` | Activity timeline per case | type, description, performed_by, metadata |
| `crm_tasks` | Task management | title, status, due_date, priority, assigned_to |
| `crm_documents` | Versioned document uploads | name, version, status (pending/approved/rejected) |
| `crm_calls` | Call logs per case | duration_minutes, outcome, notes |
| `crm_payments` | Payment tracking | amount, status, payment_link, razorpay_id |
| `crm_invoices` | Invoice records | invoice_number, items (JSONB), total, status |
| `crm_notifications` | In-app notification feed | type, title, message, read |
| `crm_automation_rules` | Automation rule config | trigger, action, action_data, is_active |

**All tables detected in codebase:**
- `admin_content`
- `admin_services`
- `admin_settings`
- `admin_users`
- `crm_activities`
- `crm_automation_rules`
- `crm_calls`
- `crm_cases`
- `crm_documents`
- `crm_invoices`
- `crm_notifications`
- `crm_payments`
- `crm_quotations`
- `crm_tasks`
- `leads`
- `system_templates`

---

## 🎨 Stylesheets (6 files)

| File | Lines | Purpose |
|------|-------|---------|
| `admin.css` | 1630 | All admin portal styles (.admin-* classes) |
| `crm.css` | 605 | All CRM portal styles (.crm-* classes) — scoped, no conflicts |
| `fonts.css` | 8 | Google Fonts imports |
| `index.css` | 5 | Global reset and base styles |
| `tailwind.css` | 5 | Tailwind CSS base directives |
| `theme.css` | 182 | — |

---

## 📦 Technology Stack

### Frontend Framework
- **Vite** + **React 18** + **TypeScript**
- **React Router v7** — client-side routing
- **Tailwind CSS v4** — utility classes

### UI Libraries
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `lucide-react` — icons
- `recharts` — analytics charts
- `react-hook-form` — form management
- `motion` — animations
- `sonner` — toast notifications

### Backend / Database
- **Supabase** — PostgreSQL + Auth + Storage + Realtime
- `@supabase/supabase-js` — client SDK

### Key npm Dependencies (63 total)

```
@emotion/react, @emotion/styled, @mui/icons-material, @mui/material, @popperjs/core, @radix-ui/react-accordion, @radix-ui/react-alert-dialog, @radix-ui/react-aspect-ratio, @radix-ui/react-avatar, @radix-ui/react-checkbox, @radix-ui/react-collapsible, @radix-ui/react-context-menu, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-hover-card, @radix-ui/react-label, @radix-ui/react-menubar, @radix-ui/react-navigation-menu, @radix-ui/react-popover, @radix-ui/react-progress, @radix-ui/react-radio-group, @radix-ui/react-scroll-area, @radix-ui/react-select, @radix-ui/react-separator, @radix-ui/react-slider, @radix-ui/react-slot, @radix-ui/react-switch, @radix-ui/react-tabs, @radix-ui/react-toggle, @radix-ui/react-toggle-group, @radix-ui/react-tooltip, @supabase/supabase-js, canvg, class-variance-authority, clsx, cmdk, date-fns, dompurify, embla-carousel-react, html2canvas, input-otp, jspdf, jspdf-autotable, lucide-react, motion, next-themes, react, react-day-picker, react-dnd, react-dnd-html5-backend, react-dom, react-hook-form, react-popper, react-resizable-panels, react-responsive-masonry, react-router, react-slick, recharts, sonner, tailwind-merge, tw-animate-css, vaul, zustand
```

---

## 🔌 Integrations

| Integration | Status | Notes |
|-------------|--------|-------|
| **Supabase Auth** | ✅ Active | Email/password, session validation on mount |
| **Supabase Database** | ✅ Active | RLS enabled, 10 tables |
| **Supabase Storage** | 🔧 Setup needed | Create `crm-documents` bucket |
| **Supabase Realtime** | ✅ Active | Notifications channel subscribed |
| **Razorpay** | 🔧 Placeholder | Replace mock link in `paymentService.ts` |
| **WhatsApp API** | 📋 Planned | Add Supabase Edge Function |
| **Email / SMTP** | 📋 Planned | Configure Supabase SMTP or Resend |

---

## 🔐 Authentication & Security

| Feature | Details |
|---------|---------|
| **Auth Provider** | Supabase (PostgreSQL-backed) |
| **Session Validation** | `getSession()` called on every admin/CRM mount |
| **Session Storage** | Supabase manages in `localStorage` (auto-refresh) |
| **Mock Auth Mode** | Set `VITE_MOCK_AUTH=true` for testing without Supabase |
| **Mock Credentials** | `admin@dnex.com` / `Admin@123` (mock mode only) |
| **RLS** | Row Level Security enabled on all CRM tables |

---

## 📁 Project File Tree (Source)

```
src/
├── app/
│   ├── components/         # Shared website components
│   │   ├── home/           # 9 home page sections
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── TeamCarousel.tsx
│   ├── pages/              # 9 public pages
│   ├── admin/              # Admin Portal
│   │   ├── pages/          # 9 admin pages
│   │   ├── components/     # 6 admin components
│   │   ├── services/       # 3 service files
│   │   └── context/        # AuthContext
│   ├── crm/                # CRM Portal (NEW)
│   │   ├── pages/          # 8 CRM pages
│   │   ├── components/     # 5 CRM components
│   │   ├── services/       # 10 service files
│   │   ├── context/        # CRMNotificationContext
│   │   └── supabase_crm_schema.sql
│   ├── App.tsx
│   └── routes.ts           # 0 registered routes
├── lib/
│   ├── supabase.ts         # Shared Supabase client
│   └── servicesStore.ts    # Local service list store
└── styles/
    ├── admin.css            # 1630 lines
    ├── crm.css            # 605 lines
    ├── fonts.css            # 8 lines
    ├── index.css            # 5 lines
    ├── tailwind.css            # 5 lines
    ├── theme.css            # 182 lines
```

---

## 🔄 How This Document Updates Automatically

This file is regenerated by `scripts/generate-docs.mjs` which is called:
1. **On every file save** during `npm run dev` — via the Vite plugin `vite-plugin-doc-gen.js`
2. **On every build** — via `npm run build` pre-hook
3. **Manually** — run `npm run docs`

> ⚠️ Do not edit `PROJECT_DOCUMENT.md` directly — your changes will be overwritten on the next save.

---

*© 2026 DNex Business Consultants. This document is auto-generated.*
