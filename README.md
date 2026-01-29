# KoopLand - AI-Verified Idea Marketplace

**Live Demo:** [https://koopland.vercel.app/](https://koopland.vercel.app/)


**Deployed COntract On Base:** 0x53fffbff24c64d052d18dc248b7d2220495dc2dc

## Overview
KoopLand is a decentralized marketplace for buying and selling vetted business ideas as NFTs. Every idea is analyzed and rated by AI before listing, ensuring quality for buyers. Cross-chain payments are powered by **SideShift.ai**, enabling seamless transactions across 200+ cryptocurrencies.

## Core Features
- **AI Verification**: Ideas are automatically rated for originality, use case value, and category relevance
- **Cross-Chain Payments On BASE network via SideShift**: Buy ideas with BTC, ETH, USDC, SOL, or 200+ other tokens
- **NFT Ownership**: Purchased ideas are minted as NFTs for proof of ownership
- **Multi-Category**: DeFi, AI, SocialFi, DAO, Gaming, Infrastructure, and more
- **Transparent Ratings**: View AI scores before purchasing

## How SideShift Powers Cross-Chain Payments

### The Problem
Traditional marketplaces force users into a single payment currency. Sellers want payment in their preferred crypto, buyers hold different tokens. This creates friction and limits participation.

### Our Solution with SideShift.ai
1. **Seller lists idea** - Sets price in USD (e.g., $299)
2. **Buyer selects payment token** - Chooses from 200+ options (BTC, ETH, MATIC, etc.)
3. **SideShift API processes swap** - Converts buyer's token to seller's preferred token in real-time
4. **Direct wallet delivery** - Both parties receive funds in their chosen cryptocurrency
5. **NFT minted** - Buyer receives idea ownership NFT

**Example Flow:**
```
Seller wants payment in USDC → Buyer pays with BTC
    ↓
SideShift converts BTC → USDC instantly (suspended)
    ↓
Seller receives USDC, Buyer receives idea NFT
```

This eliminates currency barriers and enables truly global participation.

## Revenue Model

### Go-to-Market Strategy
- **Seller Fee**: $1.00 per idea upload (covers AI verification costs)
- **Buyer Fee**: $0.50 per purchase (platform revenue)
- **No Hidden Costs**: SideShift swap fees handled transparently

**Pricing Example:**
- Idea priced at $299
- Seller pays: $1 upload fee
- Buyer pays: $299 + $0.50 platform fee = $299.50
- Platform profit: $1.50 per transaction

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Payments**: SideShift.ai API for cross-chain swaps
- **AI**: OpenAI GPT-4 for idea verification
- **Blockchain**: NFT minting (implementation pending)
- **Database**: MongoDB

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance
- SideShift API access
- OpenAI API key

### Installation
```bash
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

### Environment Variables
```
MONGODB_URI=
NEXT_PUBLIC_SIDESHIFT_API_URL=https://sideshift.ai/api/v2
OPENAI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Roadmap
- [x] MVP with dummy data
- [ ] SideShift API integration
- [ ] AI verification system
- [ ] NFT minting on purchase
- [ ] User authentication
- [ ] Seller dashboard with analytics
- [ ] Dispute resolution system
- [ ] Mobile app

## Why SideShift?
SideShift's API enables seamless cross-chain token swaps with:
- 200+ cryptocurrencies across 40+ chains
- Direct-to-wallet delivery
- No account required
- Competitive rates
- Developer-friendly API

This makes KoopLand truly borderless - anyone can sell ideas, anyone can buy, regardless of their preferred blockchain.

## Contributing
Contributions welcome! Please open an issue or submit a PR.

## License
MIT

## Contact
- Website: [https://koopland.vercel.app/](https://koopland.vercel.app/)
- Built for SideShift.ai Buildathon 2024


## Deploy commands on Dapp -   forge script script/IdeaMarketplaceNFT.s.sol:IdeaMarketplaceNFTScript --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
