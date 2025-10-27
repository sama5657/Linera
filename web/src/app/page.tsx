"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import AgentMarketplace from "@/components/AgentMarketplace";
import CreateAgent from "@/components/CreateAgent";
import Header from "@/components/Header";
import { Activity } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "marketplace" | "create">("dashboard");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT;
    if (endpoint) {
      setIsConnected(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isConnected={isConnected} />
      
      <main className="container mx-auto px-4 py-8">
        {!isConnected && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-300">Linera Connection Required</h3>
                <p className="text-sm text-yellow-200/80 mt-1">
                  Configure NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT in your .env file and start the Linera service.
                </p>
                <p className="text-xs text-yellow-200/60 mt-2">
                  Run: <code className="bg-black/30 px-2 py-1 rounded">linera service --port 8080</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && <Dashboard isConnected={isConnected} />}
        {activeTab === "marketplace" && <AgentMarketplace isConnected={isConnected} />}
        {activeTab === "create" && <CreateAgent isConnected={isConnected} />}
      </main>

      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>AgentChain - Built on Linera Microchains | Autonomous AI Agent Economy</p>
          <p className="mt-2 text-xs text-gray-500">
            Real-time, Scalable, Decentralized | Linera Buildathon Submission
          </p>
        </div>
      </footer>
    </div>
  );
}
