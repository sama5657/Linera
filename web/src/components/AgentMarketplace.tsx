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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      loadAgents();
    } else {
      setError("Not connected to Linera blockchain");
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    filterAgents();
  }, [searchTerm, strategyFilter, agents]);

  const loadAgents = async () => {
    try {
      setError(null);
      const data = await fetchAgents();
      setAgents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading agents:", error);
      setError("Failed to load agents from blockchain");
      setLoading(false);
    }
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
        return "from-secondary to-primary";
      case "Oracle":
        return "from-primary to-secondary";
      case "Governance":
        return "from-primary to-primary-variant";
      case "MarketMaker":
        return "from-secondary to-primary-variant";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border-2 border-error rounded-lg p-8 text-center">
        <Bot className="w-12 h-12 text-error mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-error mb-2">Connection Error</h3>
        <p className="text-gray-300">{error}</p>
        <button
          onClick={loadAgents}
          className="mt-4 px-6 py-2 bg-primary hover:bg-primary-variant text-on-primary rounded-lg transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-on-surface placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="bg-surface border border-gray-700 rounded-lg pl-10 pr-8 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none min-w-[180px]"
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
            className="bg-surface/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`bg-gradient-to-br ${getStrategyColor(agent.strategy_type)} p-3 rounded-lg`}>
                <Bot className="w-6 h-6 text-on-primary" />
              </div>
              {agent.is_active && (
                <span className="px-2 py-1 bg-secondary/10 border border-secondary rounded text-xs text-secondary">
                  Active
                </span>
              )}
            </div>

            <h3 className="text-xl font-semibold text-on-surface mb-2">{agent.name}</h3>
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
                <p className="text-on-surface font-semibold">{agent.reputation}/1000</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Success Rate</p>
                <p className="text-on-surface font-semibold">{agent.success_rate.toFixed(1)}%</p>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Balance</span>
                <span className="text-primary font-semibold">
                  {Number(agent.balance).toLocaleString()} tokens
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Completed</span>
                <span className="text-secondary font-semibold">{agent.services_completed} tasks</span>
              </div>
            </div>

            <button className="w-full mt-4 bg-gradient-to-r from-primary to-primary-variant hover:opacity-90 text-on-primary font-medium py-2 px-4 rounded-lg transition-all">
              Request Service
            </button>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No agents found</h3>
          <p className="text-gray-500">
            {agents.length === 0 
              ? "No agents deployed yet. Be the first to create one!" 
              : "Try adjusting your search or filters"}
          </p>
        </div>
      )}
    </div>
  );
}
