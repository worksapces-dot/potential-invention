# Referral System Documentation

## Overview
The referral system allows users to invite friends and earn rewards. Both the referrer and referee get benefits when someone signs up using a referral code.

## Features

### 1. Referral Code Generation
- Users can generate unique 8-character referral codes
- Codes are automatically generated when accessing the referral dashboard
- Each user can only have one referral code

### 2. Referral Tracking
- Track who referred whom
- Monitor referral statistics (total referrals, earnings, etc.)
- View detailed referral history

### 3. Reward System
- **Referrer Reward**: $10 credit when someone uses their code
- **Referee Reward**: $5 credit when they use a referral code
- Rewards can be claimed from the dashboard
- Support for different reward types (credits, subscription extensions, discounts)

### 4. Smart URL Handling
- Referral codes can be shared via URL: `yoursite.com?ref=ABC12345`
- Middleware automatically captures and stores referral codes
- Welcome banner shows when users have pending referral codes

## Database Schema

### User Model Updates
```prisma
model User {
  // ... existing fields
  referralCode     String?    @unique
  referredBy       User?      @relation("Referrals", fields: [referredById], references: [id])
  referredById     String?    @db.Uuid
  referrals        User[]     @relation("Referrals")
  referralRewards  ReferralReward[]
}
```

### ReferralReward Model
```prisma
model ReferralReward {
  id          String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String        @db.Uuid
  type        RewardType
  amount      Int           // in cents for CREDIT, days for SUBSCRIPTION_EXTENSION
  description String
  claimed     Boolean       @default(false)
  claimedAt   DateTime?
  referredUserId String?    @db.Uuid
  createdAt   DateTime      @default(now())
}

enum RewardType {
  CREDIT
  SUBSCRIPTION_EXTENSION
  MARKETPLACE_DISCOUNT
}
```

## API Endpoints

### Server Actions
- `generateReferralCode()` - Generate unique referral code for user
- `getReferralStats()` - Get user's referral statistics and history
- `applyReferralCode(code)` - Apply a referral code for new user
- `claimReferralReward(rewardId)` - Claim a specific reward

### REST API
- `POST /api/referral/apply` - Apply referral code
- `GET /api/referral/stats` - Get referral statistics

## Components

### ReferralDashboard
Main dashboard component showing:
- Referral statistics cards
- Referral code sharing
- How it works section
- Rewards history
- Referrals list

### ReferralWelcomeBanner
Banner shown to new users with pending referral codes:
- Auto-detects referral codes from URL
- Allows manual entry of referral codes
- Dismissible with localStorage persistence

### ReferralCodeInput
Standalone component for referral code entry:
- Used in onboarding flows
- Success/error state handling
- Validation and feedback

## Usage

### 1. Add to Settings Page
```tsx
import ReferralDashboard from '@/components/referral/referral-dashboard'

// In your settings page
<ReferralDashboard />
```

### 2. Add Welcome Banner to Dashboard
```tsx
import ReferralWelcomeBanner from '@/components/referral/referral-welcome-banner'

// In your main dashboard
<ReferralWelcomeBanner />
```

### 3. Use the Hook
```tsx
import { useReferral } from '@/hooks/use-referral'

const { stats, generateCode, applyCode, claimReward } = useReferral()
```

## Migration

Run the migration to add referral system to your database:

```bash
# Apply the migration
npx prisma db push

# Or generate and apply migration
npx prisma migrate dev --name add_referral_system
```

## Configuration

### Reward Amounts
Edit the reward amounts in `/src/actions/referral/index.ts`:

```typescript
// Reward for referrer (person who shared the code)
amount: 1000, // $10 credit

// Reward for referee (person who used the code)  
amount: 500, // $5 credit
```

### Referral Code Length
Change the code length in the `generateReferralCode` function:

```typescript
referralCode = nanoid(8).toUpperCase() // 8 characters
```

## Security Considerations

1. **Unique Codes**: Each referral code is unique and tied to one user
2. **One-Time Use**: Users can only be referred once
3. **Self-Referral Prevention**: Users cannot refer themselves
4. **Reward Claiming**: Rewards must be explicitly claimed
5. **Expiration**: Referral codes in cookies expire after 7 days

## Styling

The components use the existing dashboard design system:
- `background-80`, `background-90` for card backgrounds
- `light-blue`, `keyword-green`, `keyword-yellow` for accent colors
- `text-secondary` for muted text
- `border-in-active/50` for borders

## Future Enhancements

1. **Referral Tiers**: Different rewards based on referral count
2. **Time-Limited Campaigns**: Special referral bonuses
3. **Social Sharing**: Direct integration with social platforms
4. **Analytics**: Detailed referral performance metrics
5. **Referral Contests**: Leaderboards and competitions