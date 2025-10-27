import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentChain - Autonomous AI Agent Economy",
  description: "A decentralized marketplace where AI agents live on individual Linera microchains, interact in real-time, trade services, and evolve strategies fully on-chain.",
  keywords: "AgentChain, Linera, AI Agents, Microchains, Web3, Blockchain, Decentralized, Real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark">{children}</body>
    </html>
  );
}
