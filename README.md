# Drones Frontend Monorepo

Three separate web apps for the drone delivery platform, plus a shared package.

## Structure

```
frontend/
├── apps/
│   ├── customer-web/     # Final customers (port 5173)
│   ├── restaurant-web/   # Restaurant owners (port 5174)
│   ├── admin-web/        # Platform admin + fleet ops (port 5175)
│   └── mobile-app/       # Customer mobile (React Native)
├── packages/
│   └── shared/           # API client, auth, UI components, layouts
```

## Prerequisites

- Node.js 20+
- Yarn 4 (`corepack enable`)
- Backend API running at `http://localhost:8080`

## Setup

```bash
yarn install
```

Regenerate the API client (requires backend swagger):

```bash
yarn orval
```

## Development

Run a single app:

```bash
yarn dev:customer    # http://localhost:5173
yarn dev:restaurant  # http://localhost:5174
yarn dev:admin       # http://localhost:5175
```

Run all web apps in parallel:

```bash
yarn dev
```

### Mobile app (React Native)

From the repo root:

```bash
yarn start:mobile      # Metro bundler
yarn android:mobile    # Run on Android
yarn ios:mobile        # Run on iOS (macOS only)
```

Or from `apps/mobile-app` directly: `yarn start`, `yarn android`, etc.

## Auth roles

| App | Dev port | Required API role |
|-----|----------|-------------------|
| customer-web | 5173 | `User` |
| restaurant-web | 5174 | `RestaurantOwner` (interim: `Admin` for dev) |
| admin-web | 5175 | `Admin` |
| mobile-app | — | `User` (customer only) |

Each app stores its own workspace session in localStorage with an app-specific key prefix, so logging into one app does not affect the others during local development.

## Restaurant owner note

The restaurant owner app currently scopes data to the first restaurant returned by the API until backend support exists for owner-linked restaurants (`RestaurantOwner` role + `/api/restaurants/mine`).

## Build

```bash
yarn build
```
