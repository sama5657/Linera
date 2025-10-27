#!/bin/bash

set -e

echo "🔨 Building AgentChain Linera Contracts..."
echo ""

if ! command -v rustc &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo "📦 Installing wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
fi

echo "🔧 Building contract and service..."
cd agentchain

cargo build --release --target wasm32-unknown-unknown

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Compiled artifacts:"
echo "   Contract: target/wasm32-unknown-unknown/release/agentchain_contract.wasm"
echo "   Service:  target/wasm32-unknown-unknown/release/agentchain_service.wasm"
echo ""
echo "Next steps:"
echo "1. Deploy to Linera: linera publish-and-create \\"
echo "     target/wasm32-unknown-unknown/release/agentchain_{contract,service}.wasm \\"
echo "     --json-argument '{}'"
echo ""
