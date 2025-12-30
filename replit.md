# Taxi Québec

A Next.js web application for a taxi service based in Québec, Canada.

## Overview

This is a French-language taxi booking platform that allows customers to:
- Book taxi rides online
- View transportation services and solutions
- Contact the service via phone or online form
- Access their account

## Tech Stack

- **Framework**: Next.js 15.3.6 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, shadcn/ui components
- **State Management**: React Hook Form with Zod validation
- **Database**: Drizzle ORM with libSQL
- **Authentication**: better-auth with Supabase
- **Maps**: Mapbox, Google Maps integration
- **Animations**: Framer Motion

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   └── dashboard/    # Dashboard pages
├── components/
│   ├── sections/     # Page sections (hero, navigation, footer, etc.)
│   └── ui/           # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/
│   ├── supabase/     # Supabase client configuration
│   └── utils.ts      # Utility functions
└── middleware.ts     # Next.js middleware
```

## Development

The development server runs on port 5000:
```bash
npm run dev -- -H 0.0.0.0 -p 5000
```

## Build

```bash
npm run build
```

## Environment Variables

This project may require the following environment variables:
- Supabase configuration (check `.env.local`)
- Mapbox API key
- Google Maps API key

## Recent Changes

- 2024-12-30: Initial Replit setup - configured Next.js to run on port 5000 with proper host settings
