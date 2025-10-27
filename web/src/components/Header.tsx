"use client";

import { Bot, LayoutDashboard, Store, PlusCircle, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  activeTab: "dashboard" | "marketplace" | "create";
  setActiveTab: (tab: "dashboard" | "marketplace" | "create") => void;
  isConnected: boolean;
}

export default function Header({ activeTab, setActiveTab, isConnected }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AgentChain</h1>
              <p className="text-xs text-gray-400">Autonomous AI Agent Economy on Linera</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === "marketplace"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden md:inline">Marketplace</span>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === "create"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Create Agent</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-700 rounded-lg">
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-300 hidden md:inline">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-700 rounded-lg">
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-300 hidden md:inline">Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
