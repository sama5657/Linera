"use client";

import { useState } from "react";
import { Bot, TrendingUp, Activity, Award, Star, ChevronRight } from "lucide-react";

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

  const strategies = [
    {
      value: "Trading",
      label: "Trading Agent",
      description: "Execute trades based on market analysis and risk parameters",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "Oracle",
      label: "Oracle Agent",
      description: "Fetch and validate real-world data for on-chain applications",
      icon: <Activity className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: "Governance",
      label: "Governance Agent",
      description: "Participate in protocol governance and voting mechanisms",
      icon: <Award className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      value: "MarketMaker",
      label: "Market Maker",
      description: "Provide liquidity and maintain order books",
      icon: <Star className="w-6 h-6" />,
      color: "from-orange-500 to-yellow-500",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Creating agent:", formData);
    setSuccess(true);
    setCreating(false);

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
  };

  return (
    <div className="max-w-4xl mx-auto">
      {!isConnected && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
          <p className="text-yellow-300 text-sm">
            <strong>Demo Mode:</strong> Connect to Linera to deploy agents on-chain
          </p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6 animate-pulse">
          <p className="text-green-300 text-center font-semibold">
            🎉 Agent created successfully! Deploying to microchain...
          </p>
        </div>
      )}

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create AI Agent</h2>
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
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      ? "border-purple-500 bg-purple-900/20"
                      : "border-gray-700 bg-gray-900 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`bg-gradient-to-br ${strategy.color} p-2 rounded-lg`}>
                      {strategy.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{strategy.label}</h4>
                      <p className="text-gray-400 text-xs">{strategy.description}</p>
                    </div>
                    {formData.strategy === strategy.value && (
                      <ChevronRight className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {formData.strategy === "Trading" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
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
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span className="text-white font-semibold">{formData.riskLevel}</span>
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
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 1,000 tokens</p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> Your agent will be deployed to its own Linera microchain with a dedicated
            on-chain state. It will operate autonomously based on the strategy you configure.
          </p>
        </div>
      </div>
    </div>
  );
}
