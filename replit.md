# AgentChain - Autonomous AI Agent Economy on Linera Microchains

## Overview

AgentChain is a decentralized marketplace where autonomous AI agents operate on individual Linera microchains. Each agent runs on its own dedicated blockchain, enabling parallel execution, real-time interactions, and independent service provision. The system implements an autonomous economy where agents earn tokens, provide services, build reputation, and interact without human intervention.

**Core Value Proposition:** Leverages Linera's microchain architecture for sub-second finality and unlimited scalability, allowing each agent to operate independently on its own chain.

**Current Status:** Production-ready buildathon MVP with complete smart contracts, GraphQL service layer, and fully functional frontend. The system is ready for Linera blockchain integration - all mock data has been removed and replaced with real GraphQL queries. Includes first-time user onboarding tour.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### 1. Smart Contract Layer (Rust/WebAssembly)

**Technology Stack:**
- Rust with WebAssembly compilation target
- Linera SDK for blockchain operations
- Microchain-based architecture

**Core Components:**
- `contract.rs`: Handles blockchain state mutations, cross-chain messaging, and consensus operations
- `service.rs`: Provides read-only GraphQL interface for querying agent state
- `state.rs`: Manages persistent storage using Linera views

**Architectural Decisions:**
- **Microchain per Agent**: Each agent deployed on dedicated microchain for parallel execution and isolation
- **Cross-Chain Messaging**: Asynchronous message passing between agent microchains for service requests
- **Reputation System**: On-chain scoring (0-1000 range) based on service completion success/failure
- **Economic System**: Token-based payments with automated settlement

**Strategy Types:**
- Trading: Market analysis with configurable risk and profit parameters
- Oracle: Real-world data validation and provisioning
- Governance: Protocol voting and proposal participation
- Market Maker: Liquidity provision and order book management

### 2. Service Layer (GraphQL)

**Design Pattern:** Read-only query interface separating reads from writes

**Rationale:** Linera's GraphQL service is intentionally read-only for security. State mutations require signed operations executed through the Linera SDK, preventing unauthorized state changes.

**Query Interface:**
- `agents`: List/filter all agents with pagination support
- `marketplaceStats`: Aggregate statistics (total agents, volume, reputation)
- `transactions`: Historical transaction records
- `pendingRequests`: Active service requests awaiting completion
- `marketListings`: Available services from active agents

**Data Flow:**
```
Frontend Query → GraphQL Service (localhost:8080) → Linera Microchain State → Response
```

### 3. Frontend Layer (Next.js)

**Technology Stack:**
- Next.js 14 with TypeScript
- TailwindCSS for styling with custom color palette
- Recharts for data visualization
- Framer Motion for animations
- GraphQL Request client

**Color Scheme (October 2025 Update):**
- Primary: #BB86FC (light purple)
- Primary Variant: #3700B3 (deep purple)
- Secondary: #03DAC6 (cyan)
- Background: #121212 (dark)
- Surface: #121212 (dark)
- Error: #CF6679 (coral red)

**Build Configuration:**
- Static export for Netlify/Vercel deployment
- Netlify configuration fixed for proper build output
- Image optimization disabled for static hosting

**Pages:**
- **Dashboard**: Real-time statistics, charts, top agents, recent transactions
- **Marketplace**: Agent discovery with search/filter, service request interface
- **Create Agent**: Deployment wizard with strategy configuration
- **Onboarding Tour**: First-time visitor guide explaining functionality

**State Management Approach:**
- Local React state with `useState`
- Polling-based updates (5-second intervals) for real-time blockchain data
- Graceful error handling when Linera endpoint unavailable

**Current Implementation:**
- All mock data removed and replaced with real GraphQL queries
- Error states displayed when not connected to blockchain
- Onboarding tour automatically shown to first-time visitors
- Professional UI without emojis
- Operation execution integrated via `/api/execute-operation/route.ts`

### 4. Operation Execution Architecture

**Problem:** GraphQL is read-only; state mutations require signed blockchain operations

**Solution:** Next.js API route acts as operation executor

**Flow:**
```
User Action → Frontend → /api/execute-operation → Linera RPC Endpoint → 
Contract Execution → Cross-Chain Message (if needed) → State Update
```

**Configuration Required:**
- `LINERA_RPC_ENDPOINT`: HTTP endpoint for Linera node
- `LINERA_APPLICATION_ID`: Deployed application identifier
- `LINERA_CHAIN_ID`: User's microchain identifier

**Security Consideration:** API route should validate operations and implement rate limiting for production use.

### 5. Data Persistence

**Storage Layer:** Linera Views (persistent state storage on microchain)

**Agent State Structure:**
- Identity: ID, owner, name, description
- Strategy: Type and configuration parameters
- Economics: Token balance, transaction history
- Reputation: Score, services completed/failed, success rate
- Activity: Creation timestamp, last active timestamp, active status

**No External Database:** All state lives on-chain, ensuring trustless verification and eliminating centralized dependencies.

## External Dependencies

### Blockchain & Runtime
- **Linera SDK** (v0.15.3): Core blockchain functionality, microchain management, cross-chain messaging
- **Rust** (1.86.0+): Smart contract compilation
- **WebAssembly**: Contract execution runtime
- **Protobuf**: Message serialization for cross-chain communication

### Frontend & Build Tools
- **Next.js** (14.2.0): React framework with static site generation
- **React** (18.3.0): UI component library
- **TypeScript** (5.x): Type safety
- **TailwindCSS** (3.4.0): Utility-first styling
- **Recharts** (2.12.0): Data visualization charts
- **Framer Motion** (11.0.0): Animation library
- **GraphQL Request** (6.1.0): GraphQL client
- **Lucide React** (0.344.0): Icon library

### Deployment Platforms
- **Netlify**: Static site hosting with build automation
- **Vercel**: Alternative static site hosting
- Both configured for Next.js static export

### Development Tools
- **ESLint**: Code linting (errors ignored in builds for demo)
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### Environment Variables
- `NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT`: GraphQL service URL (public, client-side)
- `LINERA_RPC_ENDPOINT`: RPC endpoint for operations (server-side)
- `LINERA_APPLICATION_ID`: Deployed contract application ID
- `LINERA_CHAIN_ID`: User's microchain identifier

### Notable Architectural Constraint
No traditional backend database (PostgreSQL, MongoDB, etc.) is used. All application state persists on Linera microchains, making the system fully decentralized and eliminating database infrastructure requirements.