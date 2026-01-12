# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:8080
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

This is **Conquer Plank** (code name: "kronos-hold"), a gamified plank exercise dApp with a Greek mythology theme. Users earn $PLANK tokens and Aura Points by holding planks, competing in guilds.

### Tech Stack
- Vite + React 18 + TypeScript
- shadcn/ui components (Radix primitives)
- Tailwind CSS
- TanStack Query
- React Router DOM
- Framer Motion for animations

### Key Patterns

**Path aliases**: Use `@/` for imports from `src/` (e.g., `@/components/ui/button`)

**State management**: All game state lives in `GameContext` (`src/contexts/GameContext.tsx`):
- Wallet connection (mock implementation)
- User profile, guilds, streaks
- Plank session completion and reward claiming
- NFT minting state

**Game data types and utilities**: `src/lib/gameData.ts` contains:
- TypeScript interfaces: `UserProfile`, `Guild`, `GuildMember`, `SessionResult`
- Reward calculators: `calculateAuraPoints()`, `calculatePlankReward()`, `calculateLifeTimeGained()`
- Time formatters: `formatTime()`, `formatTimeReadable()`, `shortenAddress()`
- Mock guild data with Greek-themed names

### Page Flow
1. `/` - Home (Index) with onboarding modal for new users
2. `/plank/technique` - Pre-session technique guidance
3. `/plank/session` - Active plank timer
4. `/plank/result` - Session results with reward claiming
5. `/rankings` - Leaderboard
6. `/guild` - Guild details
7. `/profile` - User profile

### Component Organization
- `src/components/ui/` - shadcn/ui primitives (don't modify unless necessary)
- `src/components/layout/AppLayout.tsx` - Main app shell with header and mobile bottom nav
- `src/components/` - App-specific components (GuildCard, TimeTower, StreakIndicator, etc.)
