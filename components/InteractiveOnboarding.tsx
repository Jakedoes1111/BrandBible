import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  action?: string;
  completed: boolean;
}

const InteractiveOnboarding: React.FC = () => {
  const { state, actions } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '👋 Welcome to BrandBible!',
      description: 'Your complete brand identity and content creation platform. Let\'s take a quick tour!',
      completed: false,
    },
    {
      id: 'generate-brand',
      title: '🎯 Generate Your Brand',
      description: 'Start by generating your brand identity. Enter your company mission and let AI create your colors, fonts, and content strategy.',
      action: 'Go to Brand Generator',
      completed: false,
    },
    {
      id: 'templates',
      title: '📚 Try Templates',
      description: 'Speed up the process with industry-specific templates. Choose from Tech, Fashion, Healthcare, and more!',
      action: 'Browse Templates',
      completed: false,
    },
    {
      id: 'bulk-content',
      title: '🚀 Generate Bulk Content',
      description: 'Create 30, 60, or 90 days of content in one click. Perfect for planning your content calendar months in advance.',
      action: 'Try Bulk Generator',
      completed: false,
    },
    {
      id: 'style-guide',
      title: '📖 Export Style Guide',
      description: 'Export professional brand guidelines to share with your team and ensure consistency.',
      action: 'View Style Guide',
      completed: false,
    },
    {
      id: 'complete',
      title: '🎉 You\'re All Set!',
      description: 'You now know the main features. Explore the other tabs to discover analytics, scheduling, and more!',
      completed: false,
    },
  ];

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setIsVisible(true);
    } else {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleAction = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'generate-brand':
        actions.setActiveTab('bible');
        break;
      case 'templates':
        actions.setActiveTab('templates');
        break;
      case 'bulk-content':
        actions.setActiveTab('bulkcontent');
        break;
      case 'style-guide':
        actions.setActiveTab('styleguide');
        break;
    }

    handleNext();
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
    setHasCompletedOnboarding(true);
  };

  const restartOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setCurrentStep(0);
    setIsVisible(true);
    setHasCompletedOnboarding(false);
  };

  if (!isVisible) {
    return hasCompletedOnboarding ? (
      <button
        onClick={restartOnboarding}
        className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-40 text-sm"
      >
        📚 Restart Tutorial
      </button>
    ) : null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Onboarding Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-green-500/50 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 rounded-t-2xl">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 rounded-tl-2xl"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Counter */}
          <div className="text-center mb-6">
            <span className="text-gray-400 text-sm">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">{step.title}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Illustration or Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-full p-8">
              <div className="text-6xl">{getStepIcon(step.id)}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            {step.action && (
              <button
                onClick={handleAction}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
              >
                {step.action}
              </button>
            )}
            {!step.action && currentStep < steps.length - 1 && (
              <button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
              >
                Next →
              </button>
            )}
            {currentStep === steps.length - 1 && (
              <button
                onClick={completeOnboarding}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
              >
                Get Started! 🚀
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          {/* Tips */}
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                💡 <strong>Pro Tip:</strong> {getProTip(step.id)}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

function getStepIcon(stepId: string): string {
  const icons: Record<string, string> = {
    welcome: '👋',
    'generate-brand': '🎯',
    templates: '📚',
    'bulk-content': '🚀',
    'style-guide': '📖',
    complete: '🎉',
  };

  return icons[stepId] || '✨';
}

function getProTip(stepId: string): string {
  const tips: Record<string, string> = {
    'generate-brand': 'The more detailed your mission statement, the better your brand identity will be!',
    templates: 'You can customize any template after applying it - they\'re just starting points.',
    'bulk-content': 'Adjust the content mix to match your marketing strategy (e.g., 20% promotional, 80% value).',
    'style-guide': 'Share the style guide with designers and team members to maintain brand consistency.',
  };

  return tips[stepId] || 'Take your time to explore all features!';
}

export default InteractiveOnboarding;
