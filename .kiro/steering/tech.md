# Tech Stack

## Framework & Runtime
- Next.js 14 (App Router)
- React 18
- TypeScript (strict mode)

## Database & ORM
- PostgreSQL
- Prisma ORM

## Authentication
- Clerk (`@clerk/nextjs`)

## Styling
- Tailwind CSS with `tailwindcss-animate`
- shadcn/ui components (New York style)
- CSS variables for theming
- Dark mode via `next-themes`

## State Management
- Redux Toolkit (global state)
- TanStack React Query (server state)
- React Hook Form + Zod (forms)

## External Services
- Stripe (payments, Connect for payouts)
- OpenAI GPT-4 (AI features)
- Instagram Graph API (integrations)
- Firecrawl (web scraping for prospects)
- Vercel Blob (file storage)
- Resend (emails)
- Sentry (error monitoring)
- Supabase (additional storage)

## Key Libraries
- `lucide-react` - Icons
- `framer-motion` - Animations
- `recharts` - Charts
- `axios` - HTTP client
- `date-fns` - Date utilities
- `nanoid` - ID generation
- `sonner` - Toast notifications

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Linting
npm run lint

# Database
npx prisma generate      # Generate client after schema changes
npx prisma migrate dev   # Create and apply migrations
npx prisma studio        # Open database GUI
```

## Path Aliases
- `@/*` maps to `./src/*`
