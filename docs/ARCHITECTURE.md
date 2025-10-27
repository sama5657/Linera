# AgentChain Architecture

## System Overview

AgentChain implements a distributed autonomous agent economy using Linera's microchain architecture. The system consists of three main layers:

### 1. Smart Contract Layer (Rust/Wasm)

**Components:**
- `contract.rs`: Core blockchain logic, state mutations, cross-chain messaging
- `service.rs`: GraphQL query interface for frontends and external systems  
- `state.rs`: Persistent state management using Linera views

**Key Features:**
- Each agent deployed on dedicated microchain
- Asynchronous cross-chain messaging between agents
- Reputation-based economic system
- Service marketplace with automated settlement

### 2. Service Layer (GraphQL)

**Queries:**
- `agents`: List all agents with filtering
- `marketplaceStats`: Global statistics
- `transactions`: Recent transaction history
- `pendingRequests`: Active service requests
- `marketListings`: Available services

**Real-time Updates:**
- Event streams for agent activities
- Transaction notifications
- Service completion alerts

### 3. Frontend Layer (Next.js)

**Pages:**
- Dashboard: Live statistics and charts
- Marketplace: Agent discovery and service requests
- Create Agent: Deploy new autonomous agents

**Data Flow:**
```
User Action → GraphQL Mutation → Linera Service → Contract Execution → 
Cross-Chain Message → Target Agent → Service Execution → GraphQL Event → 
Frontend Update
```

## Microchain Architecture

### Agent Microchain Structure

Each agent operates on its own microchain with:

```rust
Agent {
    id: String,              // Unique agent identifier
    owner: String,           // Chain owner address
    strategy: AgentStrategy, // Trading/Oracle/Governance/MarketMaker
    balance: u128,           // Token balance
    reputation: u64,         // 0-1000 reputation score
    services_completed: u64, // Successful services
    services_failed: u64,    // Failed services
}
```

### Cross-Chain Message Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Agent A   │         │ Validators  │         │   Agent B   │
│  Microchain │         │             │         │  Microchain │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ Service Request       │                       │
       ├──────────────────────>│                       │
       │                       │ Validate & Route      │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │   Execute Service     │
       │                       │<──────────────────────┤
       │                       │                       │
       │  Service Response     │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │   Payment Transfer    │                       │
       ├──────────────────────>│──────────────────────>│
       │                       │                       │
```

## State Management

### Views Structure

```rust
AgentChainState {
    agents: MapView<String, Agent>,
    service_requests: MapView<String, ServiceRequest>,
    transactions: MapView<String, Transaction>,
    market_listings: MapView<String, MarketListing>,
    total_agents: RegisterView<u64>,
    total_transactions: RegisterView<u64>,
    total_volume: RegisterView<u128>,
}
```

### State Transitions

1. **Agent Creation**: New microchain + initial state
2. **Service Request**: Cross-chain message + escrow
3. **Service Execution**: Provider processes + updates state
4. **Service Completion**: Payment transfer + reputation update

## Economic Model

### Token Flow

```
Agent Balance → Service Payment → Escrow → 
(Success) → Provider Balance + Reputation↑
(Failure) → Refund + Provider Reputation↓
```

### Reputation System

- Base: 100 points
- Success: +1 point (max 1000)
- Failure: -5 points (min 0)
- Impacts: Service pricing, marketplace ranking, trust score

## Agent Strategies

### 1. Trading Agent
```rust
Trading {
    risk_level: u8,      // 1-10 (conservative to aggressive)
    min_profit: u128,    // Minimum profit threshold
}
```

**Behavior:**
- Analyzes market data
- Executes trades when profit > min_profit
- Adjusts position based on risk_level

### 2. Oracle Agent
```rust
Oracle {
    data_sources: Vec<String>,  // External API endpoints
    update_frequency: u64,      // Seconds between updates
}
```

**Behavior:**
- Fetches data from sources
- Validates and aggregates
- Publishes to requester chains

### 3. Governance Agent
```rust
Governance {
    voting_power: u128,           // Token-weighted votes
    delegation_enabled: bool,     // Allow vote delegation
}
```

**Behavior:**
- Monitors governance proposals
- Analyzes voting options
- Executes votes based on strategy

### 4. Market Maker Agent
```rust
MarketMaker {
    spread_bps: u16,           // Spread in basis points
    liquidity_depth: u128,     // Total liquidity provided
}
```

**Behavior:**
- Places bid/ask orders
- Maintains spread
- Rebalances inventory

## Security Considerations

### Smart Contract
- Input validation on all operations
- Balance checks before transfers
- Reputation bounds enforcement
- Message authentication

### Cross-Chain Messages
- Signed by sender chain
- Validated by validators
- Atomic execution guaranteed
- Replay attack protection

### Frontend
- GraphQL queries to local Linera service
- No private key exposure
- HTTPS enforcement in production
- Input sanitization

## Performance Characteristics

### Throughput
- **Per Agent**: Unlimited (dedicated microchain)
- **Global**: Linear scaling with agent count
- **Bottleneck**: Validator processing capacity

### Latency
- **Block Finality**: <0.5 seconds
- **Cross-Chain Message**: <1 second
- **GraphQL Query**: <100ms (local)
- **Frontend Update**: Real-time (event streams)

### Storage
- **Per Agent**: ~1KB base state
- **Per Transaction**: ~200 bytes
- **Per Service Request**: ~500 bytes
- **Scalability**: Distributed across microchains

## Future Enhancements

### Phase 2
- Agent-to-agent direct negotiation protocols
- Multi-agent collaboration contracts
- Advanced reputation algorithms
- Machine learning integration

### Phase 3
- Governance DAO for protocol upgrades
- Cross-protocol bridges
- Oracle network with TEE
- Mobile wallet support

### Mainnet
- Token economics and staking
- Validator incentives
- Slashing conditions
- Emergency pause mechanisms
