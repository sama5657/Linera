# AgentChain Deployment Guide

## Prerequisites Checklist

Before deploying AgentChain, ensure you have:

- [ ] Rust 1.86.0 or later installed
- [ ] `wasm32-unknown-unknown` target added
- [ ] Protobuf compiler (protoc) installed
- [ ] Linera CLI tools installed
- [ ] Node.js 18+ and npm installed
- [ ] Netlify or Vercel account (for frontend)

## Part 1: Deploy Smart Contracts to Linera Testnet

### Step 1: Environment Setup

```bash
# Run automated setup script
chmod +x setup-linera.sh
./setup-linera.sh
```

Or manually:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Install Linera CLI
cargo install --locked linera-service@0.15.3
cargo install --locked linera-storage-service@0.15.3

# Verify installation
linera --version
```

### Step 2: Initialize Wallet

```bash
# Initialize wallet on Testnet
linera wallet init --faucet https://faucet.testnet-conway.linera.net

# Request a microchain and tokens
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net

# View your wallet
linera wallet show
```

**Save your chain ID** - you'll need it for the frontend configuration.

### Step 3: Build Smart Contracts

```bash
# Make build script executable
chmod +x build-contracts.sh

# Build contracts
./build-contracts.sh
```

This compiles:
- `agentchain_contract.wasm` - Core blockchain logic
- `agentchain_service.wasm` - GraphQL service

### Step 4: Deploy to Linera

```bash
# Deploy application
linera publish-and-create \
  agentchain/target/wasm32-unknown-unknown/release/agentchain_{contract,service}.wasm \
  --json-argument '{}'
```

**Save the Application ID** from the output.

### Step 5: Start Linera Service

```bash
# Start GraphQL service on port 8080
linera service --port 8080
```

Keep this running in a terminal. The frontend will connect to `http://localhost:8080`.

### Step 6: Verify Deployment

Open http://localhost:8080 in your browser to access GraphiQL.

Test with this query:

```graphql
query {
  marketplaceStats {
    totalAgents
    activeAgents
    totalTransactions
    totalVolume
    averageReputation
  }
}
```

## Part 2: Deploy Frontend to Netlify

### Step 1: Install Dependencies

```bash
cd web
npm install
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

Set:
```env
NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
NEXT_PUBLIC_LINERA_CHAIN_ID=your_chain_id_here
```

### Step 3: Build for Production

```bash
# Build static export
npm run build
npm run export
```

This creates the `out/` directory with static files.

### Step 4: Deploy to Netlify

**Option A: Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Option B: Netlify Web Interface**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import existing project"
3. Connect your Git repository
4. Set build settings:
   - Base directory: `web`
   - Build command: `npm run build && npm run export`
   - Publish directory: `web/out`
5. Add environment variable:
   - Key: `NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT`
   - Value: Your Linera service URL

### Step 5: Update Linera Endpoint

For production, you'll need a publicly accessible Linera service.

**Options:**

1. **Run on VPS**:
```bash
# On your server
linera service --port 8080 --listen 0.0.0.0
```

2. **Use Linera Public Endpoints** (when available)

3. **Deploy with Docker**:
```dockerfile
FROM rust:1.86
RUN cargo install --locked linera-service@0.15.3
EXPOSE 8080
CMD ["linera", "service", "--port", "8080", "--listen", "0.0.0.0"]
```

Update Netlify environment variable to your public endpoint.

## Part 3: Deploy Frontend to Vercel

### Step 1: Prepare Repository

Ensure you have a Git repository with your code.

### Step 2: Deploy to Vercel

**Option A: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option B: Vercel Web Interface**

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `out`
5. Add environment variables:
   - `NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT`
   - `NEXT_PUBLIC_LINERA_CHAIN_ID`

### Step 3: Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### Contract Build Fails

**Error**: `wasm32-unknown-unknown target not found`

**Solution**:
```bash
rustup target add wasm32-unknown-unknown
```

**Error**: `protoc: command not found`

**Solution**:
```bash
# Linux
sudo apt-get install protobuf-compiler

# macOS
brew install protobuf
```

### Deployment Fails

**Error**: `Failed to create application`

**Solution**:
- Ensure wallet has sufficient balance
- Check Linera service is running
- Verify .wasm files exist in target directory

### Frontend Connection Issues

**Error**: `GraphQL endpoint not reachable`

**Solution**:
- Verify Linera service is running on correct port
- Check firewall/security group settings
- Ensure CORS is enabled if accessing cross-origin

### Netlify Build Fails

**Error**: `Module not found`

**Solution**:
```bash
# Clean install
cd web
rm -rf node_modules package-lock.json
npm install
```

## Production Checklist

Before going to production:

- [ ] Smart contracts deployed to Linera Testnet
- [ ] Linera service running on stable server
- [ ] Frontend built and deployed
- [ ] Environment variables configured
- [ ] GraphQL endpoint publicly accessible
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring setup
- [ ] Analytics configured
- [ ] Documentation updated

## Monitoring

### Smart Contract

```bash
# Check application status
linera query-application <APPLICATION_ID>

# View recent blocks
linera query-chain-history
```

### Frontend

- **Netlify**: Check build logs in dashboard
- **Vercel**: Monitor deployments and analytics
- **Sentry**: Add error tracking (recommended)

### Linera Service

```bash
# Check service logs
journalctl -u linera-service -f

# Monitor resource usage
htop
```

## Updating

### Update Smart Contracts

```bash
# Rebuild
./build-contracts.sh

# Redeploy
linera publish-and-create \
  agentchain/target/wasm32-unknown-unknown/release/agentchain_{contract,service}.wasm \
  --json-argument '{}'
```

### Update Frontend

```bash
# Pull latest changes
git pull

# Rebuild
cd web
npm install
npm run build
npm run export

# Redeploy
netlify deploy --prod
# or
vercel --prod
```

## Cost Estimates

### Linera Testnet
- **Free** during testnet phase
- Mainnet costs TBD

### Netlify
- **Free tier**: 100GB bandwidth/month
- **Pro**: $19/month for 1TB bandwidth

### Vercel
- **Free tier**: 100GB bandwidth/month
- **Pro**: $20/month for 1TB bandwidth

### VPS (for Linera service)
- **DigitalOcean**: $6/month (1GB RAM)
- **AWS EC2**: ~$10/month (t3.micro)

## Support

For deployment issues:

- **Linera Discord**: https://discord.gg/linera
- **AgentChain Issues**: Create GitHub issue
- **Linera Docs**: https://linera.dev

---

**Next Steps**: See [API.md](API.md) for GraphQL API documentation.
