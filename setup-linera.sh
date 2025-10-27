#!/bin/bash

set -e

echo "🚀 AgentChain - Linera Setup Script"
echo "===================================="
echo ""

echo "Checking prerequisites..."

if ! command -v rustc &> /dev/null; then
    echo "❌ Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    echo "✅ Rust found: $(rustc --version)"
fi

if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo "📦 Adding wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
else
    echo "✅ wasm32-unknown-unknown target installed"
fi

if ! command -v protoc &> /dev/null; then
    echo "📦 Installing protoc..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -LO https://github.com/protocolbuffers/protobuf/releases/download/v21.11/protoc-21.11-linux-x86_64.zip
        unzip protoc-21.11-linux-x86_64.zip -d $HOME/.local
        rm protoc-21.11-linux-x86_64.zip
        export PATH="$HOME/.local/bin:$PATH"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install protobuf
    fi
else
    echo "✅ protoc found: $(protoc --version)"
fi

if ! command -v linera &> /dev/null; then
    echo "📦 Installing Linera CLI tools..."
    cargo install --locked linera-storage-service@0.15.3
    cargo install --locked linera-service@0.15.3
else
    echo "✅ Linera CLI found: $(linera --version)"
fi

echo ""
echo "✅ All prerequisites installed!"
echo ""
echo "Next steps:"
echo "1. Initialize wallet: linera wallet init --faucet https://faucet.testnet-conway.linera.net"
echo "2. Request chain:    linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net"
echo "3. Build contracts:  ./build-contracts.sh"
echo "4. Deploy:          See docs/DEPLOYMENT.md"
echo ""
