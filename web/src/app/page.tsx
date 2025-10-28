"use client";

import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import AgentMarketplace from "@/components/AgentMarketplace";
import CreateAgent from "@/components/CreateAgent";
import Header from "@/components/Header";
import OnboardingTour from "@/components/OnboardingTour";
import { Activity } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "marketplace" | "create">("dashboard");
  const [isConnected, setIsConnected] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT;
    setIsConnected(!!endpoint);

    const hasSeenOnboarding = localStorage.getItem("agentchain_onboarding_completed");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("agentchain_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}
      
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isConnected={isConnected}
        onShowOnboarding={() => setShowOnboarding(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {!isConnected && (
          <div className="bg-error/10 border-2 border-error rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-error" />
              <div>
                <h3 className="text-lg font-semibold text-error">Linera Connection Required</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Configure NEXT_PUBLIC_LINERA_GRAPHQL_ENDPOINT in your .env file and start the Linera service.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Run: <code className="bg-surface/50 px-2 py-1 rounded border border-primary">linera service --port 8080</code>
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
          <p>AgentChain - Built on Linera Microchains</p>
          <p className="mt-2 text-xs text-gray-500">
            Real-time, Scalable, Decentralized Autonomous AI Agent Economy
          </p>
        </div>
      </footer>
    </div>
  );
}
