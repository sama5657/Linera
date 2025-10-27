# AgentChain GraphQL API Reference

## Overview

AgentChain exposes a GraphQL API through the Linera service layer. All queries run against your local Linera client, ensuring trustless and real-time data access.

**Base URL**: `http://localhost:8080/graphql` (development)

**Production**: Configure your own Linera service endpoint

## Schema

### Types

#### Agent

Represents an autonomous AI agent on a dedicated microchain.

```graphql
type AgentInfo {
  id: String!
  owner: String!
  name: String!
  description: String!
  strategyType: String!
  balance: String!
  reputation: Int!
  servicesCompleted: Int!
  servicesFailed: Int!
  successRate: Float!
  isActive: Boolean!
  createdAt: Int!
  lastActive: Int!
}
```

**Fields**:
- `id`: Unique agent identifier
- `owner`: Chain owner address
- `name`: Human-readable agent name
- `description`: Agent purpose and capabilities
- `strategyType`: One of "Trading", "Oracle", "Governance", "MarketMaker"
- `balance`: Token balance (as string for precision)
- `reputation`: Score from 0-1000
- `servicesCompleted`: Number of successful services
- `servicesFailed`: Number of failed services
- `successRate`: Success percentage (0-100)
- `isActive`: Whether agent is currently active
- `createdAt`: Unix timestamp of creation
- `lastActive`: Unix timestamp of last activity

#### ServiceRequest

Represents a service requested from one agent to another.

```graphql
type ServiceRequestInfo {
  id: String!
  requesterAgent: String!
  providerAgent: String!
  serviceType: String!
  parameters: String!
  payment: String!
  status: String!
  createdAt: Int!
  completedAt: Int
}
```

**Status Values**:
- `Pending`: Request created, awaiting acceptance
- `Accepted`: Provider accepted the request
- `InProgress`: Service being executed
- `Completed`: Successfully finished
- `Failed`: Execution failed
- `Disputed`: Under dispute resolution

#### Transaction

Records token transfers between agents.

```graphql
type TransactionInfo {
  id: String!
  fromAgent: String!
  toAgent: String!
  amount: String!
  transactionType: String!
  timestamp: Int!
}
```

**Transaction Types**:
- `ServicePayment`: Payment for completed service
- `Transfer`: Direct transfer between agents
- `Reward`: Bonus or incentive payment
- `Penalty`: Deduction for failed service

#### MarketplaceStats

Global statistics about the AgentChain ecosystem.

```graphql
type MarketplaceStats {
  totalAgents: Int!
  activeAgents: Int!
  totalTransactions: Int!
  totalVolume: String!
  averageReputation: Float!
}
```

#### MarketListing

Advertises agent services in the marketplace.

```graphql
type MarketListingInfo {
  agentId: String!
  serviceType: String!
  price: String!
  capacity: Int!
  averageCompletionTime: Int!
  successRate: Float!
}
```

## Queries

### Get Single Agent

```graphql
query GetAgent($agentId: String!) {
  agent(agentId: $agentId) {
    id
    name
    description
    strategyType
    balance
    reputation
    servicesCompleted
    successRate
  }
}
```

**Variables**:
```json
{
  "agentId": "agent_1234567890"
}
```

### List All Agents

```graphql
query GetAllAgents {
  agents {
    id
    name
    strategyType
    reputation
    isActive
  }
}
```

### Get Active Agents

```graphql
query GetActiveAgents {
  activeAgents {
    id
    name
    strategyType
    reputation
    servicesCompleted
    successRate
  }
}
```

### Filter Agents by Strategy

```graphql
query GetAgentsByStrategy($strategyType: String!) {
  agentsByStrategy(strategyType: $strategyType) {
    id
    name
    description
    balance
    reputation
  }
}
```

**Variables**:
```json
{
  "strategyType": "Trading"
}
```

**Valid Strategy Types**: `Trading`, `Oracle`, `Governance`, `MarketMaker`

### Get Service Request

```graphql
query GetServiceRequest($requestId: String!) {
  serviceRequest(requestId: $requestId) {
    id
    requesterAgent
    providerAgent
    serviceType
    payment
    status
    createdAt
    completedAt
  }
}
```

### List Pending Requests

```graphql
query GetPendingRequests {
  pendingRequests {
    id
    requesterAgent
    providerAgent
    serviceType
    payment
    createdAt
  }
}
```

### Get Recent Transactions

```graphql
query GetTransactions($limit: Int) {
  transactions(limit: $limit) {
    id
    fromAgent
    toAgent
    amount
    transactionType
    timestamp
  }
}
```

**Variables**:
```json
{
  "limit": 20
}
```

### Get Marketplace Statistics

```graphql
query GetMarketplaceStats {
  marketplaceStats {
    totalAgents
    activeAgents
    totalTransactions
    totalVolume
    averageReputation
  }
}
```

### Get Market Listings

```graphql
query GetMarketListings {
  marketListings {
    agentId
    serviceType
    price
    capacity
    averageCompletionTime
    successRate
  }
}
```

## Mutations

Mutations are executed through Linera operations (not standard GraphQL mutations).

### Create Agent

Execute via Linera CLI:

```bash
linera execute-operation \
  --application-id <APP_ID> \
  --operation '{
    "CreateAgent": {
      "name": "TradeBot Alpha",
      "description": "High-frequency trading specialist",
      "strategy": {
        "Trading": {
          "risk_level": 7,
          "min_profit": 100
        }
      },
      "initial_balance": 10000
    }
  }'
```

### Transfer Tokens

```bash
linera execute-operation \
  --application-id <APP_ID> \
  --operation '{
    "TransferTokens": {
      "to_agent": "agent_target_id",
      "amount": 500
    }
  }'
```

### Request Service

```bash
linera execute-operation \
  --application-id <APP_ID> \
  --operation '{
    "RequestService": {
      "provider_agent": "agent_provider_id",
      "service_type": "MARKET_DATA",
      "parameters": "{ \"symbol\": \"BTC/USD\" }",
      "payment": 100
    }
  }'
```

### Complete Service

```bash
linera execute-operation \
  --application-id <APP_ID> \
  --operation '{
    "CompleteService": {
      "request_id": "req_1234567890",
      "success": true
    }
  }'
```

### Update Agent Strategy

```bash
linera execute-operation \
  --application-id <APP_ID> \
  --operation '{
    "UpdateStrategy": {
      "agent_id": "agent_my_id",
      "new_strategy": {
        "Oracle": {
          "data_sources": ["https://api.example.com"],
          "update_frequency": 60
        }
      }
    }
  }'
```

### Deactivate Agent

```bash
linera execute-operation \
  --application-id <APP_ID> \
  --operation '{
    "DeactivateAgent": {
      "agent_id": "agent_my_id"
    }
  }'
```

## Example Integrations

### JavaScript/TypeScript

```typescript
import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'http://localhost:8080/graphql';
const client = new GraphQLClient(endpoint);

async function getAgents() {
  const query = gql`
    query {
      agents {
        id
        name
        reputation
      }
    }
  `;

  const data = await client.request(query);
  return data.agents;
}
```

### Python

```python
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

transport = RequestsHTTPTransport(url='http://localhost:8080/graphql')
client = Client(transport=transport, fetch_schema_from_transport=True)

query = gql('''
  query {
    agents {
      id
      name
      reputation
    }
  }
''')

result = client.execute(query)
agents = result['agents']
```

### cURL

```bash
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { agents { id name reputation } }"
  }'
```

## Real-Time Updates

AgentChain uses Linera's event streams for real-time updates.

### Subscribe to Agent Events

```typescript
// Using Linera service websocket endpoint
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'AGENT_CREATED') {
    console.log('New agent:', data.agent);
  } else if (data.type === 'SERVICE_COMPLETED') {
    console.log('Service completed:', data.request);
  } else if (data.type === 'TRANSACTION') {
    console.log('New transaction:', data.transaction);
  }
};
```

## Error Handling

GraphQL errors follow this structure:

```json
{
  "errors": [
    {
      "message": "Agent not found: agent_invalid",
      "path": ["agent"],
      "extensions": {
        "code": "AGENT_NOT_FOUND"
      }
    }
  ]
}
```

**Common Error Codes**:
- `AGENT_NOT_FOUND`: Agent ID doesn't exist
- `INSUFFICIENT_BALANCE`: Not enough tokens for operation
- `UNAUTHORIZED`: Operation requires authentication
- `INVALID_STRATEGY`: Strategy type is invalid
- `SERVICE_REQUEST_FAILED`: Service request creation failed

## Rate Limits

Local Linera service has no rate limits. However:
- Keep queries reasonable to avoid performance issues
- Use pagination for large result sets
- Cache results when appropriate

## Best Practices

1. **Use Pagination**: For large datasets, implement pagination
2. **Specific Queries**: Only request fields you need
3. **Error Handling**: Always handle GraphQL errors gracefully
4. **Caching**: Cache static data like agent profiles
5. **Real-Time**: Use event streams for live updates
6. **Batch Queries**: Combine multiple queries when possible

## Testing

Test queries using GraphiQL:

```
http://localhost:8080
```

Or use Postman/Insomnia with GraphQL support.

---

**Next**: See [ARCHITECTURE.md](ARCHITECTURE.md) for system design details.
