# 🔥 DareUp - DeFi Social Dating & NFT Personality Badges

[![Security Scan](https://github.com/4kittt/dare-app/actions/workflows/security-scan.yml/badge.svg)](https://github.com/4kittt/dare-app/actions/workflows/security-scan.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)

**Match compatible crypto creators with AI-powered personality insights and mint unique NFT badges on Base Sepolia.**

DareUp is a personality quiz mini-app built for Farcaster's Base ecosystem. Users take a 16-question personality assessment across four vectors (Vision, Risk, Style, Action), mint personalized NFT badges, and connect with compatible profiles through an AI-enhanced matching algorithm.

## 🚀 Features

- 🧠 **Personality Vector System**: Four-axis scoring (Vision/Vision, Risk, Style, Action)
- 💎 **NFT Badge Minting**: Unique personality-based NFT badges on Base Sepolia
- 🤖 **AI Compatibility Matching**: Vercel AI Gateway enhanced matching suggestions
- 🎯 **Swipe Interface**: Tinder-like experience for crypto creators
- 👥 **Farcaster Integration**: Native mini-app with Neynar SDK
- 🔒 **Security First**: Comprehensive security scanning and audit-ready code
- 🎨 **Western Theme**: Custom typography and western-inspired design

## 📋 Prerequisites

- **Base Sepolia Wallet** with test ETH
- **[Farcaster](https://farcaster.xyz/) account**
- **[Vercel](https://vercel.com/) account** for hosting
- **[Coinbase Developer Platform](https://portal.cdp.coinbase.com/) API key**
- **[Neynar API key](https://neynar.com/)** for Farcaster integration
- **[Supabase](https://supabase.com/)** account for database
- **Node.js 18+** and **npm**

## 🛠️ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/4kittt/dare-app.git
cd dare-app
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# Required
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEYNAR_API_KEY=your_neynar_api_key
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_api_key

# For production
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_BASE_APP_ID=your_app_id
```

### 3. Database Setup

Run the Supabase migrations or create tables manually:

```sql
-- Users/profiles table
CREATE TABLE profiles (
  fid bigint PRIMARY KEY,
  username text UNIQUE,
  display_name text,
  pfp_url text,
  personality_scores jsonb,
  track text CHECK (track IN ('Build', 'Connect')),
  minted boolean DEFAULT false,
  minted_at timestamp,
  created_at timestamp DEFAULT now()
);
```

### 4. Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Testing & Linting

```bash
# Run security linting
npm run lint

# Run dependency vulnerability check
npm audit

# Type checking
npm run build
```

## 🏗️ Architecture

### Core Components

```
dare-app/
├── app/
│   ├── api/               # Next.js API routes
│   │   ├── ai-compatibility/  # AI matching endpoint
│   │   ├── badge-data/        # NFT data queries
│   │   ├── user-has-minted/   # Mint status checks
│   │   └── profiles/          # User profile management
│   ├── components/            # React components
│   │   ├── PersonalityRadar.tsx   # Quiz visualization
│   │   ├── SwipeContainer.tsx      # Matching interface
│   │   └── Wallet.tsx             # OnchainKit integration
│   ├── lib/
│   │   ├── nft.ts             # NFT minting utilities
│   │   ├── ai-matching.ts     # Compatibility algorithms
│   │   ├── supabase.ts        # Database client
│   │   └── types.ts           # TypeScript definitions
│   └── page.tsx               # Main quiz flow
├── contracts/             # Smart contracts
│   ├── PersonalityBadge.sol  # ERC-721 contract
│   └── PersonalityBadgeABI.ts # Contract interface
├── .github/               # GitHub Actions & Dependabot
└── wagmiConfig.ts         # Web3 configuration
```

### Key Technologies

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Web3**: OnchainKit, Wagmi, Base Sepolia
- **Social**: Farcaster SDK, Neynar API
- **AI**: Vercel AI Gateway
- **Database**: Supabase (PostgreSQL)
- **Security**: ESLint security rules, Dependabot, CodeQL

## 🚀 Deployment

### Vercel Deployment

1. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   ```

2. **Set Environment Variables**:
   ```bash
   # Using Vercel CLI or Dashboard
   vercel env add NEXT_PUBLIC_ONCHAINKIT_API_KEY production
   vercel env add AI_GATEWAY_API_KEY production
   # ... add all other environment variables
   ```

3. **Farcaster Manifest**:
   - Update `minikit.config.ts` with your domain
   - Generate account association at [Farcaster Manifest tool](https://farcaster.xyz/~/developers/mini-apps/manifest)

### Smart Contract Deployment

```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia
```

Update the contract address in `contracts/PersonalityBadgeABI.ts`.

## 🔒 Security

This project implements comprehensive security measures:

### Automated Security Scanning
- **CodeQL Analysis**: Static code analysis for vulnerabilities
- **ESLint Security Rules**: Security-focused linting rules
- **Dependency Scanning**: npm audit for vulnerabilities
- **Dependabot**: Automated dependency updates

### Manual Security Checks
- Input validation on all API endpoints
- Secure environment variable handling
- TypeScript for type safety
- Regular dependency audits

### Security Headers (Recommended)
```javascript
// next.config.js
{
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: "default-src 'self'" }
      ]
    }
  ]
}
```

## 🤝 API Reference

### AI Compatibility Endpoint
```typescript
POST /api/ai-compatibility
// Calculate AI-enhanced compatibility scores

Response:
{
  baseScore: number,           // Original algorithm score
  aiEnhancedScore: number,     // AI-enhanced score
  confidenceLevel: number,     // AI confidence (0-100)
  analysis: {
    personalityInsights: string[],
    compatibilityFactors: Array<{
      trait: string,
      score: number,
      reasoning: string
    }>,
    conversationStarters: string[]
  }
}
```

### NFT Minting Hook
```typescript
const { mintBadge, result, isPending, isConfirming } = useMintPersonalityBadge(
  personalityType,  // User's personality type
  visionScore,      // Vision vector (-10 to +10)
  riskScore,        // Risk tolerance
  styleScore,       // Social style
  actionScore,      // Action orientation
  track,           // "Build" | "Connect"
  fid,             // Farcaster ID
  username         // Farcaster username
);
```

## 📈 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Security-first development**:
   ```bash
   npm run lint    # Security & code quality
   npm audit        # Dependency vulnerabilities
   npm run build   # Type checking
   ```
4. **Commit**: `git commit -m 'Add amazing feature with security checks'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Security Requirements
- All PRs must pass security scanning
- No untested dependencies
- Environment variables properly handled
- Input validation on all user inputs

## 📄 License

**MIT License**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software...

## ⚠️ Disclaimer

**This is a development project for educational purposes only.**

- No official affiliation with Coinbase, Base, or Farcaster
- Testnets only - no real economic value
- Always audit smart contracts before mainnet deployment
- DYOR on all security implications

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Base Ecosystem**: [base.org](https://base.org)
- **Farcaster**: [farcaster.xyz](https://farcaster.xyz)
- **OnchainKit**: [docs.base.org](https://docs.base.org)

---

**Built with ❤️ for the Base ecosystem**
