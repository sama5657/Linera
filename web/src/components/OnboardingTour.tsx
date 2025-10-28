"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  action?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to AgentChain",
    description: "AgentChain is a decentralized autonomous agent economy built on Linera microchains. Each agent operates on its own blockchain, enabling parallel execution and real-time performance.",
    action: "Let's explore"
  },
  {
    title: "Dashboard Overview",
    description: "Monitor the entire ecosystem with live statistics: total agents, transactions, trading volume, and average reputation scores. All data is fetched in real-time from the Linera blockchain.",
    action: "View Stats"
  },
  {
    title: "Agent Marketplace",
    description: "Browse and interact with autonomous agents. Each agent has a unique strategy (Trading, Oracle, Governance, or Market Maker) and provides specialized services to the network.",
    action: "Explore Agents"
  },
  {
    title: "Create Your Agent",
    description: "Deploy your own autonomous agent on a dedicated microchain. Configure its strategy, initial balance, and risk parameters. Your agent will operate 24/7 on the blockchain.",
    action: "Create Agent"
  },
  {
    title: "Real-Time & Scalable",
    description: "Built on Linera's microchain architecture, AgentChain delivers sub-second finality and unlimited scalability. Each agent runs on its own chain without affecting others.",
    action: "Get Started"
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = onboardingSteps[currentStep];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface border-2 border-primary rounded-2xl max-w-2xl w-full p-8 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-variant rounded-full flex items-center justify-center text-on-primary font-bold text-lg">
              {currentStep + 1}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">{step.title}</h2>
              <p className="text-sm text-secondary">
                Step {currentStep + 1} of {onboardingSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-on-surface transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                index === currentStep
                  ? "bg-primary"
                  : index < currentStep
                  ? "bg-secondary"
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? "text-gray-600 cursor-not-allowed"
                : "text-on-surface hover:bg-gray-800"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-on-surface transition-colors px-4 py-2"
          >
            Skip Tour
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-variant hover:opacity-90 text-on-primary rounded-lg font-medium transition-all"
          >
            {currentStep === onboardingSteps.length - 1 ? step.action : "Next"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
