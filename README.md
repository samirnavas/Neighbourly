# 🏘️ Neighbourly

A hyper-local asset-sharing marketplace where neighbours can rent out empty driveways (Spaces) for parking or heavy-duty items (Tools) to people in their community.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + custom Shadcn-style UI components
- **Backend/Database/Auth**: Supabase
- **Map**: react-leaflet + leaflet (OpenStreetMap tiles)
- **Deployment**: Vercel

## MVP Features

- 🔐 **Auth** — User signup and login via Supabase Auth
- 🗺️ **Interactive Map** — Full-screen Leaflet map on the Explore page; pins are colour-coded by category (🟢 Space / 🔵 Tool)
- 📝 **Add a Listing** — Secure form to add a Space or Tool listing (Title, Description, Category, Price/day, Lat/Lng); auto-detects current location
- 📅 **Booking Logic** — Date-range booking form with overlap validation and price calculation

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set Up Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Find these values in your Supabase dashboard → **Settings → API**.

### 4. Set Up the Database

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of supabase/schema.sql and paste into:
# Supabase Dashboard → SQL Editor → New Query
```

The schema creates:
- `profiles` — extends auth.users with full_name/avatar
- `listings` — unified table for both Spaces and Tools
- `bookings` — records booking windows with overlap checking

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/
│   ├── actions/        # Server Actions (auth, listings, bookings)
│   ├── auth/
│   │   ├── login/      # Login page
│   │   └── signup/     # Signup page
│   ├── explore/        # Interactive map page
│   ├── listings/
│   │   ├── [id]/       # Listing detail + booking form
│   │   └── new/        # Add listing form
│   ├── layout.tsx      # Root layout with Navbar
│   └── page.tsx        # Homepage
├── components/
│   ├── ui/             # Reusable UI primitives (Button, Input, Card, etc.)
│   ├── BookingForm.tsx # Client-side booking form
│   ├── Map.tsx         # Leaflet map (client-only, dynamically imported)
│   └── Navbar.tsx      # Top navigation bar
├── lib/
│   ├── supabase/
│   │   ├── client.ts   # Browser Supabase client
│   │   └── server.ts   # Server Supabase client
│   └── utils.ts        # cn() utility
├── supabase/
│   └── schema.sql      # Full database schema
├── types/
│   └── index.ts        # TypeScript types
└── middleware.ts        # Auth route protection
```

## Database Schema

### `listings` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `owner_id` | uuid | FK → auth.users |
| `title` | text | Required |
| `description` | text | Optional |
| `category` | text | `'space'` or `'tool'` |
| `price_per_day` | numeric | ≥ 0 |
| `latitude` | double precision | For map pin |
| `longitude` | double precision | For map pin |
| `is_active` | boolean | Toggle visibility |

### `bookings` table
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `listing_id` | uuid | FK → listings |
| `renter_id` | uuid | FK → auth.users |
| `start_date` | date | |
| `end_date` | date | ≥ start_date |
| `total_price` | numeric | Calculated |
| `status` | text | `pending/confirmed/completed/cancelled` |

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!
