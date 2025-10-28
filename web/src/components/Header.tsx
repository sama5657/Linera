"use client";

import { Bot, LayoutDashboard, Store, PlusCircle, Wifi, WifiOff, HelpCircle } from "lucide-react";

interface HeaderProps {
  activeTab: "dashboard" | "marketplace" | "create";
  setActiveTab: (tab: "dashboard" | "marketplace" | "create") => void;
  isConnected: boolean;
  onShowOnboarding: () => void;
}

export default function Header({ activeTab, setActiveTab, isConnected, onShowOnboarding }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-surface/95 backdrop-blur-lg sticky top-0 z-40 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-primary-variant p-2 rounded-lg">
              <Bot className="w-6 h-6 text-on-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">AgentChain</h1>
              <p className="text-xs text-gray-400">Autonomous AI Agent Economy on Linera</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-primary text-on-primary font-medium"
                  : "text-gray-400 hover:text-on-surface hover:bg-gray-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === "marketplace"
                  ? "bg-primary text-on-primary font-medium"
                  : "text-gray-400 hover:text-on-surface hover:bg-gray-800"
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden md:inline">Marketplace</span>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === "create"
                  ? "bg-primary text-on-primary font-medium"
                  : "text-gray-400 hover:text-on-surface hover:bg-gray-800"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Create Agent</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onShowOnboarding}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-on-surface hover:bg-gray-800 rounded-lg transition-all"
              title="Show guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border border-secondary rounded-lg">
                <Wifi className="w-4 h-4 text-secondary" />
                <span className="text-xs text-secondary hidden md:inline">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 border border-error rounded-lg">
                <WifiOff className="w-4 h-4 text-error" />
                <span className="text-xs text-error hidden md:inline">Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
