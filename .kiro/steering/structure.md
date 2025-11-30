# Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (protected)/       # Authenticated routes
│   │   ├── dashboard/     # Main dashboard
│   │   │   └── [slug]/    # User-specific dashboard sections
│   │   ├── callback/      # OAuth callbacks
│   │   └── payment/       # Payment pages
│   ├── (website)/         # Public marketing pages
│   └── api/               # API routes
│
├── actions/               # Server Actions (use 'use server')
│   ├── ai/               # AI suggestion actions
│   ├── automations/      # Automation CRUD
│   ├── deal-finder/      # Prospect discovery
│   ├── feedback/         # Feature requests
│   ├── integrations/     # Instagram integration
│   ├── marketplace/      # Products, purchases, payouts
│   ├── referral/         # Referral system
│   ├── user/             # User management
│   └── webhook/          # Webhook handlers
│
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── global/           # Shared app components
│   ├── marketplace/      # Marketplace-specific
│   ├── feedback/         # Feedback system
│   ├── referral/         # Referral components
│   └── ugc-video/        # Video generator
│
├── hooks/                # Custom React hooks
├── lib/                  # Utility modules & service clients
├── icons/                # Custom icon components
├── constants/            # Static data & config
├── providers/            # React context providers
├── redux/                # Redux store & slices
├── types/                # TypeScript type definitions
└── middleware.ts         # Clerk auth middleware

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Migration history
```

## Conventions

### Route Groups
- `(auth)` - Unauthenticated pages
- `(protected)` - Requires authentication
- `(website)` - Public marketing pages

### Server Actions
- Located in `src/actions/`
- Always start with `'use server'`
- Use `onCurrentUser()` for auth
- Return `{ status, data?, error? }` pattern

### API Routes
- Use `NextRequest`/`NextResponse`
- Auth via `currentUser()` from Clerk
- Validate ownership before mutations

### Components
- UI primitives in `components/ui/`
- Feature components colocated or in feature folders
- Page-specific components in `_components/` subdirectories

### Database
- Use `client` from `@/lib/prisma`
- Cast to `any` for newer models not in generated types
- UUIDs for all primary keys
