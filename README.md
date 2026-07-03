# Allumi Admin

Admin dashboard for the Allumi platform. Manage albums, tracks, journeys, legal documents, and social links.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast builds and HMR
- **Tailwind CSS v4** for styling
- **Supabase** for auth, database, and file storage
- **TanStack Query** for server state management
- **TanStack Table** for data tables
- **React Hook Form** + **Zod** for form handling and validation
- **React Router** for client-side routing

## Features

- **Dashboard** — User stats overview and user management
- **Albums** — Full CRUD for albums and tracks, with audio/image uploads and drag-and-drop reordering
- **Journeys** — Create and manage journeys with custom colors
- **Legal Documents** — Markdown editor with live preview for privacy policies, terms, and disclaimers
- **Social Links** — Manage social media links with drag-and-drop ordering
- **Website Content** — Manage website page sections, founder profile, app screenshots, store links, and FAQ with bilingual EN/DE support
- **Auth** — Email/password authentication with admin role verification via Supabase

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/Allumi-App/allumi-admin.git
   cd allumi-admin
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Copy the environment file and add your Supabase credentials:

   ```sh
   cp .env.example .env
   ```

   Update `.env` with your Supabase URL and anon key.

4. Start the development server:

   ```sh
   npm run dev
   ```

### Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start development server           |
| `npm run build`     | TypeScript check + production build |
| `npm run lint`      | Run ESLint                         |
| `npm run preview`   | Preview production build locally   |

## Project Structure

```
src/
├── components/
│   ├── layout/          # Dashboard layout, sidebar
│   └── shared/          # Reusable UI components
├── features/
│   ├── albums/          # Album & track management
│   ├── auth/            # Authentication & auth guard
│   ├── home/            # Dashboard home page
│   ├── journeys/        # Journey management
│   ├── legal/           # Legal document editor
│   ├── social-links/    # Social link management
│   └── website/         # Website content management
│       ├── sections/    # Page sections (hero, concept, etc.)
│       ├── founder/     # Founder profile & tags
│       ├── screenshots/ # App screenshot gallery
│       ├── store-links/ # App Store / Google Play links
│       └── faq/         # FAQ items
├── hooks/               # Shared hooks (auth)
├── lib/                 # Supabase client, utilities
├── App.tsx              # Route definitions
├── main.tsx             # Entry point
└── index.css            # Tailwind theme & global styles
```

## License

[MIT](LICENSE)
