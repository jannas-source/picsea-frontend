# PicSea Project Management System - Architecture

## Overview

PicSea is a marine project management productivity tool, not an AI demo. The system is job-centric: every workflow starts from a job and ends with validated outcomes and institutional knowledge.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                │
├─────────────┬──────────┬───────────┬───────────────┤
│  Dashboard  │   Job    │ Analytics │  Maintenance  │
│  (jobs list │ Workspace│ (cost/time│  (schedules,  │
│  templates) │ (capture,│  patterns)│   forecasts)  │
│             │  BOM,    │           │               │
│             │  install,│           │               │
│             │  verify) │           │               │
├─────────────┴──────────┴───────────┴───────────────┤
│               Local Store (localStorage)            │
│          + API Client (lib/api.ts)                  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│                  BACKEND (Express/Node)              │
├──────────┬──────────┬───────────┬──────────────────┤
│  /jobs   │/validate │/analytics │  /maintenance    │
│  CRUD,   │pre-order │dashboard  │  schedules,      │
│  items,  │post-inst │job-perf   │  auto-detect,    │
│  photos  │feedback  │failures   │  forecasts       │
├──────────┴──────────┴───────────┴──────────────────┤
│  /templates   │  /identify (Gemini 3 Flash)        │
│  CRUD, from-  │  Photo → Part Intelligence         │
│  job creation │                                     │
├───────────────┴────────────────────────────────────┤
│              PostgreSQL + Digital Twin               │
│  vessels, parts, jobs, installations, validations,  │
│  part_history, maintenance_schedules, templates     │
└─────────────────────────────────────────────────────┘
```

## Data Model (Migration 010)

### Core Tables (existing)
- `vessels` - Fleet registry with specs
- `parts` - Part catalog with specs, fitment
- `jobs` - Work orders (extended with time/cost tracking)
- `job_items` - BOM line items (extended with status pipeline)

### New Tables
- `installations` - Post-install records (hours, outcome, photos, verification)
- `validations` - Feedback events (success, failure, return, compatibility issue)
- `part_history` - Aggregated institutional knowledge per part
- `maintenance_schedules` - Predictive maintenance with interval tracking
- `compatibility_rules` - Pre-order validation rules (voltage, fitment, etc.)
- `job_templates` - Reusable job blueprints with auto-updated estimates
- `user_preferences` - Persona matching (expertise level, display prefs)
- `related_parts` - Co-occurrence tracking ("always order together")
- `job_photos` - Server-side photo storage with AI analysis results

### Key Views
- `v_upcoming_maintenance` - Overdue + due soon maintenance
- `v_job_summary` - Job cost/time with accuracy metrics
- `v_part_failure_patterns` - Failure analysis per part

## Frontend Architecture

### Views (AppShell nav)
1. **Dashboard** - Job list with progress bars, warnings, template-based creation
2. **Job Workspace** - 4 tabs:
   - **Capture** - Batch photo upload → Gemini auto-identification
   - **BOM** - Parts table with search, pricing, stock status
   - **Install & Verify** - Status pipeline, installation capture, time tracking, lessons learned
   - **Export** - CSV/PDF PO generation with vendor breakdown
3. **Maintenance** - Fleet-wide maintenance schedules (overdue/due soon/upcoming)
4. **Analytics** - Cost accuracy, time accuracy, parts verified, failure patterns

### Key Components
- `ValidationPanel` - Warnings, confidence indicators, status tracker, install capture
- `TemplateSelector` - Template browser for quick job creation
- `MaintenanceView` - Schedule management with urgency grouping
- `AnalyticsView` - Performance metrics and lessons learned

### State Management
- `localStorage` for jobs, templates, maintenance, preferences (offline-first)
- `lib/api.ts` for server-side operations (validation, analytics)
- `lib/store.ts` for local CRUD and business logic

## Productivity Features

### 1. Verification Loops
- **Pre-order**: Voltage mismatch, return history, companion parts, supplier warnings
- **Post-install**: Outcome capture, time tracking, installer notes, photo documentation

### 2. Validation Feedback
- Event tracking: success/failure/return/damage/wrong_part
- Part history aggregation: common issues, install tips, supplier ratings
- Supplier avoidance based on negative feedback

### 3. Regression Learning
- Template estimates auto-update from completed job actuals
- Co-occurrence detection for "always order together" suggestions
- Failure pattern analysis per part type

### 4. Persona Matching
- Expertise levels: beginner (videos, explanations) → professional (torque specs, upgrades)
- Learned preferences: preferred suppliers, materials, ordering patterns

### 5. Project Lifecycle
- Template → Job → Capture → BOM → Order → Install → Verify → Document → Template
- Full cycle builds institutional knowledge automatically

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/jobs` | GET/POST | List/create jobs |
| `/api/jobs/:id` | GET/PATCH | Get/update job with full details |
| `/api/jobs/:id/items` | POST | Add BOM item |
| `/api/jobs/:id/items/:id` | PATCH/DELETE | Update/remove item |
| `/api/validations/pre-order` | POST | Compatibility check |
| `/api/validations/installation` | POST | Record installation |
| `/api/validations/installation/:id/verify` | POST | Verify outcome |
| `/api/validations/feedback` | POST | Submit feedback event |
| `/api/templates` | GET/POST | List/create templates |
| `/api/templates/:id` | PATCH | Update template |
| `/api/analytics/dashboard` | GET | Dashboard stats |
| `/api/analytics/job-performance` | GET | Quoting accuracy |
| `/api/analytics/failure-patterns` | GET | Part failure analysis |
| `/api/analytics/maintenance-forecast` | GET | Upcoming maintenance |
| `/api/analytics/part-insights/:id` | GET | Part institutional knowledge |
| `/api/maintenance` | GET/POST | List/create schedules |
| `/api/maintenance/:id/performed` | POST | Mark done, recalculate next |
| `/api/maintenance/auto-detect` | POST | Pattern detection from history |
