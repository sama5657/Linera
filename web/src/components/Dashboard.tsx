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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    } else {
      setError("Not connected to Linera blockchain. Please configure your Linera GraphQL endpoint.");
      setLoading(false);
    }
  }, [isConnected]);

  const loadData = async () => {
    try {
      setError(null);
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
      setError("Failed to load data from blockchain. Ensure Linera service is running.");
      setLoading(false);
    }
  };

  const chartData = transactions.slice(0, 6).reverse().map((tx, index) => ({
    time: new Date(tx.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    transactions: index + 1,
    volume: parseInt(tx.amount),
  }));

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
        <Activity className="w-12 h-12 text-error mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-error mb-2">Connection Error</h3>
        <p className="text-gray-300">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-6 py-2 bg-primary hover:bg-primary-variant text-on-primary rounded-lg transition-all"
        >
          Retry Connection
        </button>
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
          color="primary"
        />
        <StatCard
          icon={<Activity className="w-6 h-6" />}
          title="Transactions"
          value={stats.totalTransactions}
          subtitle="All-time"
          color="secondary"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Total Volume"
          value={Number(stats.totalVolume).toLocaleString()}
          subtitle="Tokens traded"
          color="primary-variant"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg Reputation"
          value={Math.round(stats.averageReputation)}
          subtitle="Out of 1000"
          color="secondary"
        />
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-on-surface mb-4">Transaction Activity</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid #BB86FC" }}
                  labelStyle={{ color: "#FFFFFF" }}
                />
                <Area type="monotone" dataKey="transactions" stroke="#BB86FC" fill="#BB86FC" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-on-surface mb-4">Trading Volume</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#121212", border: "1px solid #03DAC6" }}
                  labelStyle={{ color: "#FFFFFF" }}
                />
                <Line type="monotone" dataKey="volume" stroke="#03DAC6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.length > 0 && (
          <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Top Performing Agents
            </h2>
            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-on-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-on-surface font-medium">{agent.name}</p>
                      <p className="text-xs text-gray-400">{agent.strategy_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-on-surface font-semibold">{agent.reputation}</p>
                    <p className="text-xs text-gray-400">{agent.services_completed} tasks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {transactions.length > 0 && (
          <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              Recent Transactions
            </h2>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-gray-800">
                  <div>
                    <p className="text-on-surface text-sm">
                      {tx.from_agent.substring(0, 12)}... → {tx.to_agent.substring(0, 12)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-secondary font-semibold">{Number(tx.amount).toLocaleString()} tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  color: "primary" | "secondary" | "primary-variant";
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses: Record<StatCardProps["color"], string> = {
    primary: "from-primary to-primary-variant",
    secondary: "from-secondary to-primary",
    "primary-variant": "from-primary-variant to-primary",
  };

  return (
    <div className="bg-surface/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800 card-hover">
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-3 rounded-lg w-fit mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-on-surface mt-1">{value}</p>
      <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
    </div>
  );
}
