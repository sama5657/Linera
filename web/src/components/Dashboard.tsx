"use client";

import { useState, useEffect } from "react";
import { Users, Activity, DollarSign, TrendingUp, Bot, Clock } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchMarketplaceStats, fetchAgents, fetchTransactions } from "@/lib/graphql";

interface DashboardProps {
  isConnected: boolean;
}

export default function Dashboard({ isConnected }: DashboardProps) {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalTransactions: 0,
    totalVolume: "0",
    averageReputation: 0,
  });
  const [agents, setAgents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected) {
      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    } else {
      loadMockData();
    }
  }, [isConnected]);

  const loadData = async () => {
    try {
      const [statsData, agentsData, txData] = await Promise.all([
        fetchMarketplaceStats(),
        fetchAgents(),
        fetchTransactions(10),
      ]);
      setStats(statsData);
      setAgents(agentsData.slice(0, 5));
      setTransactions(txData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      loadMockData();
    }
  };

  const loadMockData = () => {
    setStats({
      totalAgents: 127,
      activeAgents: 89,
      totalTransactions: 1543,
      totalVolume: "2847500",
      averageReputation: 847,
    });
    
    setAgents([
      { id: "agent_1", name: "TradeBot Alpha", strategy_type: "Trading", reputation: 950, services_completed: 234 },
      { id: "agent_2", name: "Oracle Prime", strategy_type: "Oracle", reputation: 920, services_completed: 189 },
      { id: "agent_3", name: "Governor One", strategy_type: "Governance", reputation: 890, services_completed: 156 },
      { id: "agent_4", name: "Market Maker X", strategy_type: "MarketMaker", reputation: 875, services_completed: 203 },
      { id: "agent_5", name: "Data Fetcher", strategy_type: "Oracle", reputation: 860, services_completed: 178 },
    ]);

    setTransactions([
      { id: "tx_1", from_agent: "agent_1", to_agent: "agent_2", amount: "1500", timestamp: Date.now() / 1000 - 300 },
      { id: "tx_2", from_agent: "agent_3", to_agent: "agent_1", amount: "2300", timestamp: Date.now() / 1000 - 600 },
      { id: "tx_3", from_agent: "agent_2", to_agent: "agent_4", amount: "1800", timestamp: Date.now() / 1000 - 900 },
    ]);

    setLoading(false);
  };

  const chartData = [
    { time: "12:00", transactions: 45, volume: 12500 },
    { time: "13:00", transactions: 67, volume: 18900 },
    { time: "14:00", transactions: 82, volume: 24300 },
    { time: "15:00", transactions: 93, volume: 28700 },
    { time: "16:00", transactions: 108, volume: 35200 },
    { time: "17:00", transactions: 125, volume: 42800 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Agents"
          value={stats.totalAgents}
          subtitle={`${stats.activeAgents} active`}
          color="blue"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Transactions"
          value={stats.totalTransactions}
          subtitle="All-time"
          color="green"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Total Volume"
          value={Number(stats.totalVolume).toLocaleString()}
          subtitle="Tokens traded"
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg Reputation"
          value={Math.round(stats.averageReputation)}
          subtitle="Out of 1000"
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Transaction Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                labelStyle={{ color: "#F3F4F6" }}
              />
              <Area type="monotone" dataKey="transactions" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Trading Volume</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                labelStyle={{ color: "#F3F4F6" }}
              />
              <Line type="monotone" dataKey="volume" stroke="#EC4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            Top Performing Agents
          </h2>
          <div className="space-y-3">
            {agents.map((agent, index) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.strategy_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{agent.reputation}</p>
                  <p className="text-xs text-gray-400">{agent.services_completed} tasks</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">
                    {tx.from_agent.substring(0, 12)}... → {tx.to_agent.substring(0, 12)}...
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">{Number(tx.amount).toLocaleString()} tokens</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  color: "blue" | "green" | "purple" | "pink";
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses: Record<StatCardProps["color"], string> = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    pink: "from-pink-500 to-rose-500",
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 card-hover">
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-3 rounded-lg w-fit mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
    </div>
  );
}
