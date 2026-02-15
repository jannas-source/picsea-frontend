# Tech Stack: MySealium Web Platform

## Core Framework

- **Primary Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## Technical Architecture

- **Rendering Strategy**: Hybrid (Static Generation for landing pages, Server Components for data-heavy sections).
- **State Management**: React Context / Hooks for UI state; SWR/React Query for data fetching.
- **Form Handling**: React Hook Form + Zod for validation.

## Backend & Infrastructure (GCP Alignment)

- **Primary Cloud**: Google Cloud Platform (GCP).
- **Authentication**: [Google Cloud Identity Platform](https://cloud.google.com/identity-platform).
- **Database**: [Cloud SQL (PostgreSQL)](https://cloud.google.com/sql/docs/postgres) for relational data and vessel twins.
- **Functions**: GCP Cloud Functions for AI routing and procurement logic.
- **Storage**: GCP Cloud Storage for marine part images and manuals.

## Deployment & CI/CD

- **Hosting**: GitHub Pages (Static Export) for initial landing, transitioning to Vercel/Cloud Run for the full SaaS.
- **CI/CD**: GitHub Actions for automated testing and deployment.
- **Monitoring**: Sentry for error tracking and PostHog for product analytics.

## Development Standards

- **Linting**: ESLint + Prettier (Standardized via `.eslintrc.json`).
- **Tests**: Vitest for unit testing; Playwright for E2E user flows.
- **Commits**: Conventional Commits standard.
