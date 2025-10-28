# AgentChain Deployment Guide - Step by Step

This guide will walk you through deploying AgentChain to the Linera blockchain in simple English. Follow each step carefully.

---

## Part 1: Install Required Software

### Step 1: Install Rust (Programming Language)

**What it does:** Rust is needed to compile the smart contracts.

**How to install:**

```bash
# Download and install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow the on-screen prompts (just press Enter to accept defaults)

# After installation, reload your terminal
source $HOME/.cargo/env

# Add WebAssembly support (needed for blockchain)
rustup target add wasm32-unknown-unknown
```

**How to check it worked:**
```bash
rustc --version
# Should show: rustc 1.86.0 or higher
```

**Common Error:** If you get "command not found", close and reopen your terminal.

---

### Step 2: Install Protoc (Protocol Buffers)

**What it does:** This helps different parts of the blockchain talk to each other.

**How to install on Linux:**

```bash
# Download Protoc
curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v21.11/protoc-21.11-linux-x86_64.zip

# Unzip it to your local directory
unzip protoc-21.11-linux-x86_64.zip -d $HOME/.local

# Add to your PATH (so your computer can find it)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**How to install on Mac:**

```bash
# If you have Homebrew installed
brew install protobuf
```

**How to check it worked:**
```bash
protoc --version
# Should show: libprotoc 21.11 or higher
```

**Common Error:** If "protoc: command not found", make sure you added it to PATH and reloaded your terminal.

---

### Step 3: Install Additional Linux Packages (Linux only)

**What it does:** These are helper tools needed to compile code.

```bash
# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y g++ libclang-dev libssl-dev pkg-config

# On Fedora/RedHat
sudo dnf install gcc-c++ clang-devel openssl-devel pkg-config
```

**Skip this step if you're on Mac** - you already have these tools.

---

### Step 4: Install Linera Tools

**What it does:** These are the special tools to work with Linera blockchain.

```bash
# Install the Linera storage service
cargo install --locked linera-storage-service@0.15.3

# Install the Linera client tool
cargo install --locked linera-service@0.15.3
```

**This will take 5-15 minutes** - Rust is compiling everything from scratch. Be patient!

**How to check it worked:**
```bash
linera --version
# Should show: linera 0.15.3
```

**Common Errors:**

- **"error: could not compile..."** - Make sure you have g++, libclang-dev, and libssl-dev installed (Step 3)
- **Takes too long** - This is normal! First-time compilation can take 10-15 minutes
- **"linker failed"** - Install the missing packages from Step 3

---

## Part 2: Set Up Your Linera Wallet

### Step 5: Initialize Your Wallet on Testnet

**What it does:** Creates your wallet and connects to Linera's test network.

```bash
# Initialize wallet and connect to testnet
linera wallet init --faucet https://faucet.testnet-conway.linera.net
```

**What you'll see:**
- Your wallet is being created
- A default chain ID will be generated
- You'll get some test tokens automatically

**How to check it worked:**
```bash
linera wallet show
# Should display your wallet info and chain ID
```

**Common Errors:**

- **"Connection refused"** - Check your internet connection
- **"Faucet not available"** - The testnet might be temporarily down, try again in a few minutes
- **Already initialized** - If you see this, you're good! Skip to next step

---

### Step 6: Request Your Personal Microchain

**What it does:** Gets you your own blockchain to deploy on.

```bash
# Request a new microchain from the testnet
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
```

**What you'll see:**
- A new chain ID will be created for you
- This is YOUR personal blockchain

**How to check it worked:**
```bash
linera wallet show
# Should show multiple chains now
```

**Common Error:**
- **"Faucet limit reached"** - Wait 24 hours and try again, or use your existing chain

---

## Part 3: Build and Deploy AgentChain Smart Contracts

### Step 7: Build the Smart Contracts

**What it does:** Compiles your Rust code into WebAssembly that runs on the blockchain.

```bash
# Make the build script executable
chmod +x build-contracts.sh

# Run the build
./build-contracts.sh
```

**What you'll see:**
- Compiling messages for a few minutes
- "Finished release" when done
- Two files created: agentchain_contract.wasm and agentchain_service.wasm

**How to check it worked:**
```bash
ls agentchain/target/wasm32-unknown-unknown/release/
# Should see agentchain_contract.wasm and agentchain_service.wasm
```

**Common Errors:**

- **"Permission denied"** - Run: `chmod +x build-contracts.sh` first
- **"No such file"** - Make sure you're in the AgentChain project root directory
- **Build fails** - Make sure you completed all installation steps above

---

### Step 8: Deploy to Linera Blockchain

**What it does:** Uploads your smart contracts to the blockchain and creates your application.

```bash
# Deploy the application
linera publish-and-create \
  agentchain/target/wasm32-unknown-unknown/release/agentchain_{contract,service}.wasm \
  --json-argument '{}'
```

**What you'll see:**
- Uploading contract bytecode
- Creating application
- **IMPORTANT:** You'll get an APPLICATION_ID - SAVE THIS!

**Example output:**
```
Application published successfully!
Application ID: e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65010000000000000000000000e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65030000000000000000000000
```

**SAVE YOUR APPLICATION_ID!** You'll need it for the frontend.

**Common Errors:**

- **"Insufficient balance"** - Request more test tokens: `linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net`
- **"File not found"** - Make sure you built the contracts first (Step 7)
- **"Invalid bytecode"** - Rebuild the contracts and try again

---

### Step 9: Start the GraphQL Service

**What it does:** Creates a local server that your website can talk to.

```bash
# Start the service (this will keep running)
linera service --port 8080
```

**What you'll see:**
```
GraphQL service running at http://127.0.0.1:8080
```

**Keep this terminal window open!** The service needs to stay running.

**How to check it worked:**
Open a new terminal and run:
```bash
curl http://localhost:8080/
# Should see some HTML or GraphQL playground
```

**Common Errors:**

- **"Port already in use"** - Something else is using port 8080. Use a different port: `linera service --port 8081`
- **"Address already in use"** - Stop any other Linera services: `pkill linera`

---

## Part 4: Connect Your Frontend

### Step 10: Configure Environment Variables

**What it does:** Tells your website where to find the blockchain data.

```bash
# Go to the web folder
cd web

# Create environment file
echo "NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT=http://localhost:8080" > .env.local
```

**If you changed the port in Step 9**, use that port number instead of 8080.

---

### Step 11: Update Application ID in Code

**What it does:** Connects your frontend to your deployed smart contract.

1. Open `web/src/lib/lineraClient.ts` in your code editor
2. Find the line with `APPLICATION_ID` (around line 10-15)
3. Replace it with your actual APPLICATION_ID from Step 8

**Example:**
```typescript
// Replace this
const APPLICATION_ID = 'your-application-id-here';

// With your actual ID from Step 8
const APPLICATION_ID = 'e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65010000000000000000000000e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a65030000000000000000000000';
```

---

### Step 12: Test Your Application Locally

**What it does:** Runs your website locally to test everything works.

```bash
# Make sure you're in the web folder
cd web

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

**What you'll see:**
```
Ready on http://localhost:5000
```

**Open your browser:** Go to http://localhost:5000

**What you should see:**
- No error messages at the top
- Real data loading from blockchain
- All features working
- The onboarding tour (first time only)

**Common Errors:**

- **Still seeing "Not connected to blockchain"** - Check that:
  - The GraphQL service is running (Step 9)
  - Your .env.local file has the correct endpoint (Step 10)
  - You updated the APPLICATION_ID (Step 11)

- **"Failed to fetch"** - The GraphQL service isn't running. Go back to Step 9

---

## Part 5: Deploy to Production (Netlify)

### Step 13: Build for Production

**What it does:** Creates an optimized version of your website.

```bash
# In the web folder
npm run build
```

**What you'll see:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

**Common Error:**
- **Build fails** - Check the error message. Usually it's a missing dependency or TypeScript error.

---

### Step 14: Deploy to Netlify

**Option A: Using Netlify CLI (Recommended)**

```bash
# Install Netlify CLI (one time only)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd web
netlify deploy --prod
```

**Follow the prompts:**
- Choose "Create & configure a new site"
- Pick your team
- Site name: Enter "agentchain" or leave blank for random
- Publish directory: Press Enter (should auto-detect)

**What you'll get:**
- A live URL like: https://agentchain-abc123.netlify.app

**Option B: Using Netlify Dashboard**

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Build settings:
   - Base directory: `web`
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Click "Deploy site"

---

### Step 15: Configure Production GraphQL Endpoint

**Important:** Your production website needs to connect to a public GraphQL endpoint, not localhost.

**You have two options:**

**Option A: Run GraphQL Service on a Server**

Deploy the Linera service on a cloud server (DigitalOcean, AWS, etc.) and expose it publicly.

**Option B: Use Linera's Public Testnet Endpoint (When Available)**

Check the Linera documentation for public endpoints.

Update your Netlify environment variables:
1. Go to Site settings → Environment variables
2. Add: `NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT=https://your-public-endpoint.com`
3. Redeploy

---

## Troubleshooting Common Issues

### Error Messages on the UI

**Q: Will error messages disappear when connected to real blockchain?**

**A: YES!** All these warnings will disappear once you're connected:

- ❌ "Not connected to Linera blockchain" → Will disappear
- ❌ "Failed to fetch agents" → Will disappear
- ❌ "GraphQL endpoint not available" → Will disappear
- ❌ Loading states that never finish → Will disappear

The UI shows these errors **only** when it can't reach the GraphQL service. Once Steps 9-11 are complete, they'll be replaced with real blockchain data.

---

### General Troubleshooting

**Nothing is working:**
1. Check GraphQL service is running: `curl http://localhost:8080`
2. Check .env.local has correct endpoint
3. Check browser console for errors (F12 → Console tab)
4. Restart everything: Stop services, restart from Step 9

**Data not showing:**
1. Make sure contracts are deployed (Step 8)
2. Check you saved the APPLICATION_ID correctly (Step 11)
3. Try creating test data through the UI

**Deployment fails:**
1. Check build works locally first: `npm run build`
2. Check netlify.toml configuration
3. Check all dependencies are in package.json

---

## Quick Reference - All Commands in Order

```bash
# Installation
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install --locked linera-storage-service@0.15.3
cargo install --locked linera-service@0.15.3

# Wallet setup
linera wallet init --faucet https://faucet.testnet-conway.linera.net
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net

# Build and deploy
chmod +x build-contracts.sh
./build-contracts.sh
linera publish-and-create \
  agentchain/target/wasm32-unknown-unknown/release/agentchain_{contract,service}.wasm \
  --json-argument '{}'

# Start service
linera service --port 8080

# Run frontend
cd web
echo "NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT=http://localhost:8080" > .env.local
npm install
npm run dev

# Deploy
npm run build
netlify deploy --prod
```

---

## Getting Help

If you get stuck:

1. **Check the error message carefully** - It usually tells you what's wrong
2. **Linera Discord**: Join the Linera community for help
3. **GitHub Issues**: Check if others have the same problem
4. **Documentation**: https://docs.linera.io

---

## Success Checklist

Before you consider deployment complete, check:

- [ ] Linera CLI installed and working (`linera --version`)
- [ ] Wallet initialized with testnet
- [ ] Contracts built successfully
- [ ] Application deployed (you have APPLICATION_ID saved)
- [ ] GraphQL service running on port 8080
- [ ] Frontend shows real data (no error messages)
- [ ] Onboarding tour displays correctly
- [ ] All pages work (Dashboard, Marketplace, Create Agent)
- [ ] Site deployed to Netlify with live URL

Congratulations! Your AgentChain dApp is now live on Linera blockchain! 🎉
