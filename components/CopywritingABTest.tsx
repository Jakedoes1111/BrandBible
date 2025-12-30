import React, { useState } from 'react';
import { advancedAIService, CopywritingVariation } from '../services/advancedAIService';
import Spinner from './Spinner';

interface CopywritingABTestProps {
  initialText: string;
  platform: string;
  onVariationSelected: (variation: any) => void;
}

const CopywritingABTest: React.FC<CopywritingABTestProps> = ({ 
  initialText, 
  platform, 
  onVariationSelected 
}) => {
  const [variations, setVariations] = useState<CopywritingVariation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleGenerateVariations = async () => {
    setIsGenerating(true);
    try {
      const result = await advancedAIService.generateCopywritingVariations(initialText, platform, 4);
      setVariations(result);
      setShowComparison(true);
    } catch (error) {
      console.error('Failed to generate variations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariationSelect = (variationId: string) => {
    setSelectedVariation(variationId);
    const variation = variations?.variations.find(v => v.id === variationId);
    if (variation) {
      onVariationSelected({
        text: variation.text,
        predictedEngagement: variation.predictedEngagement,
        tone: variation.tone
      });
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'facebook': return '👍';
      case 'tiktok': return '🎵';
      default: return '🌐';
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Spinner className="h-8 w-8 text-green-500 mx-auto mb-4" title="Generating A/B test variations" />
            <p className="text-white font-medium">Generating A/B Test Variations</p>
            <p className="text-gray-400 text-sm mt-2">AI is optimizing content for {platform}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!showComparison) {
    return (
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{getPlatformIcon(platform)}</span>
            A/B Testing for {platform}
          </h3>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Original Content</label>
          <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg">
            <p className="text-gray-300">{initialText}</p>
          </div>
        </div>

        <button
          onClick={handleGenerateVariations}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Generate AI Variations
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{getPlatformIcon(platform)}</span>
          A/B Test Variations
        </h3>
        <button
          onClick={() => setShowComparison(false)}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {variations?.variations.map((variation, index) => {
          const isSelected = selectedVariation === variation.id;
          
          return (
            <div
              key={variation.id}
              onClick={() => handleVariationSelect(variation.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-900/30 border-blue-600'
                  : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-white">Variation {index + 1}</span>
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                      {variation.tone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">Predicted Engagement:</span>
                    <span className={`text-sm font-bold ${getEngagementColor(variation.predictedEngagement)}`}>
                      {variation.predictedEngagement}%
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-gray-300 text-sm leading-relaxed">{variation.text}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Characters: {variation.text.length}</span>
                  <span>Words: {variation.text.split(' ').length}</span>
                </div>
                {isSelected && (
                  <span className="text-xs text-green-400 font-medium">Selected</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedVariation && (
        <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-green-400 font-medium mb-1">Best Variation Selected</h4>
              <p className="text-green-300 text-sm">
                This variation has the highest predicted engagement score
              </p>
            </div>
            <button
              onClick={handleGenerateVariations}
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              Generate New Variations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopywritingABTest;
