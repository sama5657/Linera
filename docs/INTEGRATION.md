# AgentChain Integration Guide

## Current Implementation Status

### ✅ Completed (Demo Ready)

1. **Smart Contracts (Rust/Linera SDK)**
   - ✅ Agent state management on microchains
   - ✅ Cross-chain messaging infrastructure
   - ✅ Economic system (tokens, payments, reputation)
   - ✅ Service request/completion workflows
   - ✅ Market listings and discovery

2. **GraphQL Service Layer**
   - ✅ Complete query API for all agent data
   - ✅ Marketplace statistics and analytics
   - ✅ Transaction history
   - ✅ Real-time state access

3. **Frontend (Next.js)**
   - ✅ Dashboard with live statistics
   - ✅ Agent marketplace with search/filter
   - ✅ Agent creation interface
   - ✅ Real-time visualizations
   - ✅ Mock data for demonstration

4. **Documentation**
   - ✅ Comprehensive README
   - ✅ Architecture documentation
   - ✅ Deployment guides
   - ✅ API reference

5. **Deployment**
   - ✅ Netlify configuration
   - ✅ Vercel configuration
   - ✅ Build automation scripts

### 🚧 Production Integration Requirements

To connect the demo frontend to live Linera operations, you need to:

#### 1. Backend API for Operation Execution

The included `/api/execute-operation/route.ts` provides a template. You need to:

**Configure Environment Variables:**
```bash
LINERA_RPC_ENDPOINT=http://localhost:8080
LINERA_APPLICATION_ID=your_app_id_here
LINERA_CHAIN_ID=your_chain_id_here
```

**Implementation Options:**

**Option A: Direct SDK Integration (Node.js Backend)**
```typescript
import { execSync } from 'child_process';

export async function executeLineraOperation(operation: any) {
  const result = execSync(
    `linera execute-operation --application-id ${APP_ID} --operation '${JSON.stringify(operation)}'`,
    { encoding: 'utf-8' }
  );
  return JSON.parse(result);
}
```

**Option B: REST API Wrapper**
If you expose Linera's operation endpoint via REST:
```typescript
const response = await fetch(`${LINERA_ENDPOINT}/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ operation }),
});
```

**Option C: WebSocket for Real-Time**
For live updates:
```typescript
const ws = new WebSocket(`ws://${LINERA_ENDPOINT}/ws`);
ws.send(JSON.stringify({ type: 'EXECUTE_OP', operation }));
```

#### 2. Update CreateAgent Component

Replace mock implementation (lines 54-75 in `CreateAgent.tsx`):

```typescript
import { createAgent } from '@/lib/lineraClient';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setCreating(true);

  try {
    const result = await createAgent({
      name: formData.name,
      description: formData.description,
      strategy: formData.strategy as any,
      initialBalance: parseInt(formData.initialBalance),
      riskLevel: parseInt(formData.riskLevel),
      minProfit: parseInt(formData.minProfit),
    });

    if (result.success) {
      setSuccess(true);
      console.log('Agent created:', result.agentId);
      
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          name: "",
          description: "",
          strategy: "Trading",
          initialBalance: "10000",
          riskLevel: "5",
          minProfit: "100",
        });
      }, 3000);
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Failed to create agent:', error);
    alert('Failed to create agent. Check console for details.');
  } finally {
    setCreating(false);
  }
};
```

#### 3. Real-Time Data Subscriptions

For live dashboard updates:

```typescript
// In Dashboard.tsx
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080/ws');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'AGENT_CREATED') {
      // Refresh agents list
      refetch();
    } else if (data.type === 'TRANSACTION') {
      // Add to transactions
      setTransactions(prev => [data.transaction, ...prev]);
    }
  };

  return () => ws.close();
}, []);
```

## Architecture Patterns

### Why GraphQL is Read-Only

In Linera's architecture:
- **GraphQL Service**: Read-only queries of blockchain state
- **Contract Operations**: Write operations via Linera SDK

This separation ensures:
1. Security: Only signed transactions can mutate state
2. Consensus: All state changes go through blockchain consensus
3. Verifiability: All mutations are on-chain and auditable

### Recommended Production Stack

```
┌─────────────────┐
│   Next.js UI    │
└────────┬────────┘
         │ HTTP/WS
┌────────▼────────┐
│  Backend API    │ ← Your custom server
│  (Node/Python)  │
└────────┬────────┘
         │ Execute operations
┌────────▼────────┐
│  Linera SDK     │
└────────┬────────┘
         │ RPC
┌────────▼────────┐
│ Linera Testnet  │
│   (Conway)      │
└─────────────────┘
```

## Testing Integration

### 1. Local Testing

```bash
# Terminal 1: Start Linera service
linera service --port 8080

# Terminal 2: Start Next.js dev server
cd web && npm run dev

# Terminal 3: Execute test operation
curl -X POST http://localhost:3000/api/execute-operation \
  -H "Content-Type: application/json" \
  -d '{
    "operation": {
      "CreateAgent": {
        "name": "Test Agent",
        "description": "Test",
        "strategy": {"Trading": {"risk_level": 5, "min_profit": 100}},
        "initial_balance": 10000
      }
    }
  }'
```

### 2. Verify GraphQL Queries

```bash
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ agents { id name reputation } }"}'
```

### 3. End-to-End Test

1. Create agent via UI
2. Verify in GraphQL: `query { agents { id name } }`
3. Check Linera chain: `linera query-application <APP_ID>`

## Security Considerations

### 1. API Authentication

Add authentication to `/api/execute-operation`:

```typescript
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization');
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... execute operation
}
```

### 2. Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

const { success } = await ratelimit.limit(userId);
if (!success) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

### 3. Input Validation

```typescript
import { z } from 'zod';

const CreateAgentSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500),
  strategy: z.enum(['Trading', 'Oracle', 'Governance', 'MarketMaker']),
  initialBalance: z.number().min(1000).max(1000000),
});

const validatedData = CreateAgentSchema.parse(operation.CreateAgent);
```

## Deployment Checklist

- [ ] Linera contracts deployed to testnet
- [ ] Linera service running on stable server
- [ ] Backend API deployed and accessible
- [ ] Environment variables configured
- [ ] Frontend points to production API
- [ ] Authentication implemented
- [ ] Rate limiting enabled
- [ ] Error monitoring (Sentry) configured
- [ ] Analytics (PostHog) set up
- [ ] SSL/TLS certificates active

## FAQ

**Q: Why doesn't the Create Agent button work?**
A: The demo uses mock data. Follow this guide to connect to real Linera operations.

**Q: Can I use GraphQL mutations instead of the API route?**
A: No. Linera's GraphQL service is read-only. Mutations must go through contract operations via the SDK.

**Q: How do I test without deploying contracts?**
A: Use the included mock data. The UI is fully functional in demo mode.

**Q: What's the latency for agent creation?**
A: Typically 1-3 seconds depending on network conditions and block time.

**Q: Can agents on different chains interact?**
A: Yes! Cross-chain messaging is built into the contracts. See `handle_message` in `contract.rs`.

## Next Steps

1. Deploy contracts following `DEPLOYMENT.md`
2. Implement backend API using the template
3. Update frontend components to use `lineraClient.ts`
4. Test end-to-end locally
5. Deploy to production

---

**Need Help?** Open an issue or ask in Linera Discord.
