"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Bot, Star, TrendingUp, Award, Activity } from "lucide-react";
import { fetchAgents, fetchMarketListings } from "@/lib/graphql";

interface AgentMarketplaceProps {
  isConnected: boolean;
}

export default function AgentMarketplace({ isConnected }: AgentMarketplaceProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      loadAgents();
    } else {
      loadMockAgents();
    }
  }, [isConnected]);

  useEffect(() => {
    filterAgents();
  }, [searchTerm, strategyFilter, agents]);

  const loadAgents = async () => {
    try {
      const data = await fetchAgents();
      setAgents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading agents:", error);
      loadMockAgents();
    }
  };

  const loadMockAgents = () => {
    const mockAgents = [
      {
        id: "agent_1",
        name: "TradeBot Alpha",
        description: "High-frequency trading specialist with advanced risk management",
        strategy_type: "Trading",
        balance: "125000",
        reputation: 950,
        services_completed: 234,
        services_failed: 12,
        success_rate: 95.1,
        is_active: true,
      },
      {
        id: "agent_2",
        name: "Oracle Prime",
        description: "Real-time data aggregator from multiple trusted sources",
        strategy_type: "Oracle",
        balance: "89000",
        reputation: 920,
        services_completed: 189,
        services_failed: 8,
        success_rate: 95.9,
        is_active: true,
      },
      {
        id: "agent_3",
        name: "Governor One",
        description: "Decentralized governance voting and proposal management",
        strategy_type: "Governance",
        balance: "156000",
        reputation: 890,
        services_completed: 156,
        services_failed: 5,
        success_rate: 96.9,
        is_active: true,
      },
      {
        id: "agent_4",
        name: "Market Maker X",
        description: "Provides liquidity across multiple trading pairs",
        strategy_type: "MarketMaker",
        balance: "203000",
        reputation: 875,
        services_completed: 203,
        services_failed: 15,
        success_rate: 93.1,
        is_active: true,
      },
      {
        id: "agent_5",
        name: "Data Fetcher Pro",
        description: "Specialized in fetching and validating off-chain data",
        strategy_type: "Oracle",
        balance: "74500",
        reputation: 860,
        services_completed: 178,
        services_failed: 10,
        success_rate: 94.7,
        is_active: true,
      },
      {
        id: "agent_6",
        name: "Arbitrage Hunter",
        description: "Identifies and executes cross-chain arbitrage opportunities",
        strategy_type: "Trading",
        balance: "198000",
        reputation: 845,
        services_completed: 267,
        services_failed: 22,
        success_rate: 92.4,
        is_active: true,
      },
    ];
    setAgents(mockAgents);
    setLoading(false);
  };

  const filterAgents = () => {
    let filtered = agents;

    if (searchTerm) {
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (strategyFilter !== "all") {
      filtered = filtered.filter((agent) => agent.strategy_type === strategyFilter);
    }

    setFilteredAgents(filtered);
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case "Trading":
        return <TrendingUp className="w-4 h-4" />;
      case "Oracle":
        return <Activity className="w-4 h-4" />;
      case "Governance":
        return <Award className="w-4 h-4" />;
      case "MarketMaker":
        return <Star className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case "Trading":
        return "from-green-500 to-emerald-500";
      case "Oracle":
        return "from-blue-500 to-cyan-500";
      case "Governance":
        return "from-purple-500 to-pink-500";
      case "MarketMaker":
        return "from-orange-500 to-yellow-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-8 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none min-w-[180px]"
            >
              <option value="all">All Strategies</option>
              <option value="Trading">Trading</option>
              <option value="Oracle">Oracle</option>
              <option value="Governance">Governance</option>
              <option value="MarketMaker">Market Maker</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
          <span>Found {filteredAgents.length} agents</span>
          <span>•</span>
          <span>{filteredAgents.filter((a) => a.is_active).length} active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`bg-gradient-to-br ${getStrategyColor(agent.strategy_type)} p-3 rounded-lg`}>
                <Bot className="w-6 h-6 text-white" />
              </div>
              {agent.is_active && (
                <span className="px-2 py-1 bg-green-900/30 border border-green-700 rounded text-xs text-green-300">
                  Active
                </span>
              )}
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">{agent.name}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{agent.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <div className={`bg-gradient-to-r ${getStrategyColor(agent.strategy_type)} p-1.5 rounded`}>
                {getStrategyIcon(agent.strategy_type)}
              </div>
              <span className="text-gray-300 text-sm font-medium">{agent.strategy_type}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-xs">Reputation</p>
                <p className="text-white font-semibold">{agent.reputation}/1000</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Success Rate</p>
                <p className="text-white font-semibold">{agent.success_rate.toFixed(1)}%</p>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Balance</span>
                <span className="text-purple-400 font-semibold">
                  {Number(agent.balance).toLocaleString()} tokens
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Completed</span>
                <span className="text-green-400 font-semibold">{agent.services_completed} tasks</span>
              </div>
            </div>

            <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all">
              Request Service
            </button>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No agents found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
