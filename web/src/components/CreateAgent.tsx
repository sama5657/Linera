"use client";

import { useState } from "react";
import { Bot, TrendingUp, Activity, Award, Star, ChevronRight, AlertCircle } from "lucide-react";
import { createAgent } from "@/lib/lineraClient";

interface CreateAgentProps {
  isConnected: boolean;
}

export default function CreateAgent({ isConnected }: CreateAgentProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    strategy: "Trading",
    initialBalance: "10000",
    riskLevel: "5",
    minProfit: "100",
  });

  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strategies = [
    {
      value: "Trading",
      label: "Trading Agent",
      description: "Execute trades based on market analysis and risk parameters",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-secondary to-primary",
    },
    {
      value: "Oracle",
      label: "Oracle Agent",
      description: "Fetch and validate real-world data for on-chain applications",
      icon: <Activity className="w-6 h-6" />,
      color: "from-primary to-secondary",
    },
    {
      value: "Governance",
      label: "Governance Agent",
      description: "Participate in protocol governance and voting mechanisms",
      icon: <Award className="w-6 h-6" />,
      color: "from-primary to-primary-variant",
    },
    {
      value: "MarketMaker",
      label: "Market Maker",
      description: "Provide liquidity and maintain order books",
      icon: <Star className="w-6 h-6" />,
      color: "from-secondary to-primary-variant",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    if (!isConnected) {
      setError("Not connected to Linera blockchain. Please configure your endpoint.");
      setCreating(false);
      return;
    }

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
        console.log("Agent created:", result.agentId);
        
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
        setError(result.error || "Failed to create agent");
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
      setError("Failed to create agent. Please check console for details.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {!isConnected && (
        <div className="bg-error/10 border-2 border-error rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error" />
            <p className="text-error text-sm font-medium">
              Demo Mode: Connect to Linera to deploy agents on-chain
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-secondary/10 border-2 border-secondary rounded-lg p-4 mb-6">
          <p className="text-secondary text-center font-semibold">
            Agent created successfully! Deploying to microchain...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border-2 border-error rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error" />
            <p className="text-error text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-primary to-primary-variant p-3 rounded-lg">
            <Bot className="w-8 h-8 text-on-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Create AI Agent</h2>
            <p className="text-gray-400 text-sm">Deploy an autonomous agent to your microchain</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-on-surface placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., TradeBot Alpha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-on-surface placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe your agent's capabilities and purpose..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Agent Strategy</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map((strategy) => (
                <button
                  key={strategy.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, strategy: strategy.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.strategy === strategy.value
                      ? "border-primary bg-primary/10"
                      : "border-gray-700 bg-surface hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`bg-gradient-to-br ${strategy.color} p-2 rounded-lg`}>
                      {strategy.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-on-surface font-semibold mb-1">{strategy.label}</h4>
                      <p className="text-gray-400 text-xs">{strategy.description}</p>
                    </div>
                    {formData.strategy === strategy.value && (
                      <ChevronRight className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {formData.strategy === "Trading" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-surface rounded-lg border border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Risk Level (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span className="text-on-surface font-semibold">{formData.riskLevel}</span>
                  <span>Aggressive</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Profit (tokens)
                </label>
                <input
                  type="number"
                  value={formData.minProfit}
                  onChange={(e) => setFormData({ ...formData, minProfit: e.target.value })}
                  className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Initial Balance (tokens)
            </label>
            <input
              type="number"
              required
              min="1000"
              value={formData.initialBalance}
              onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
              className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 1,000 tokens</p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={creating || !isConnected}
              className="w-full bg-gradient-to-r from-primary to-primary-variant hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div>
                  Creating Agent...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  Create & Deploy Agent
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-lg">
          <p className="text-gray-300 text-sm">
            <strong className="text-primary">Note:</strong> Your agent will be deployed to its own Linera microchain with dedicated
            on-chain state. It will operate autonomously based on the strategy you configure.
          </p>
        </div>
      </div>
    </div>
  );
}
