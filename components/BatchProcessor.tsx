import React, { useState } from 'react';
import { advancedAIService, BatchBrandVariation, BrandArchetype } from '../services/advancedAIService';

interface BatchProcessorProps {
  missionStatement: string;
  onVariationsGenerated: (variations: BatchBrandVariation[]) => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({ missionStatement, onVariationsGenerated }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedArchetypes, setSelectedArchetypes] = useState<string[]>(['luxury', 'tech', 'eco']);
  const [variationCount, setVariationCount] = useState(3);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const archetypes = advancedAIService.getBrandArchetypes();

  const handleArchetypeToggle = (archetypeId: string) => {
    setSelectedArchetypes(prev => 
      prev.includes(archetypeId) 
        ? prev.filter(id => id !== archetypeId)
        : [...prev, archetypeId]
    );
  };

  const handleBatchGenerate = async () => {
    if (selectedArchetypes.length === 0) {
      alert('Please select at least one brand archetype');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Initializing batch processing...');

    try {
      const variations: BatchBrandVariation[] = [];
      const totalSteps = selectedArchetypes.length;

      for (let i = 0; i < selectedArchetypes.length; i++) {
        const archetypeId = selectedArchetypes[i];
        setCurrentStep(`Generating ${archetypes.find(a => a.id === archetypeId)?.name} variation...`);
        setProgress((i / totalSteps) * 100);

        const brandIdentity = await advancedAIService.generateBrandWithArchetype(missionStatement, archetypeId);
        
        variations.push({
          id: `variation_${i + 1}`,
          name: `${archetypes.find(a => a.id === archetypeId)?.name} Variation`,
          brandIdentity,
          performanceScore: Math.random() * 100,
          targetAudience: archetypes.find(a => a.id === archetypeId)?.values.join(', ') || ''
        });
      }

      setProgress(100);
      setCurrentStep('Batch processing complete!');
      
      setTimeout(() => {
        onVariationsGenerated(variations);
        setIsProcessing(false);
        setProgress(0);
        setCurrentStep('');
      }, 1000);

    } catch (error) {
      console.error('Batch processing failed:', error);
      setCurrentStep('Error occurred during processing');
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Batch Processing</h3>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{currentStep}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedArchetypes.map((archetypeId, index) => {
            const archetype = archetypes.find(a => a.id === archetypeId);
            const isCompleted = (progress / (100 / selectedArchetypes.length)) > index;
            
            return (
              <div 
                key={archetypeId}
                className={`p-4 rounded-lg border ${
                  isCompleted 
                    ? 'bg-green-900/20 border-green-600' 
                    : 'bg-gray-800/50 border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{archetype?.name}</h4>
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-400">{archetype?.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Batch Brand Generation</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Brand Archetypes ({selectedArchetypes.length} selected)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {archetypes.map((archetype) => {
            const isSelected = selectedArchetypes.includes(archetype.id);
            
            return (
              <div
                key={archetype.id}
                onClick={() => handleArchetypeToggle(archetype.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{archetype.name}</h4>
                    <p className="text-sm text-gray-400 mb-2">{archetype.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {archetype.values.slice(0, 3).map((value, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ml-3 ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Variations per Archetype
        </label>
        <input
          type="range"
          min="1"
          max="5"
          value={variationCount}
          onChange={(e) => setVariationCount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 (Fast)</span>
          <span>{variationCount} variations</span>
          <span>5 (Comprehensive)</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Will generate {selectedArchetypes.length * variationCount} total brand variations
        </div>
        <button
          onClick={handleBatchGenerate}
          disabled={selectedArchetypes.length === 0}
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Batch Generation
        </button>
      </div>
    </div>
  );
};

export default BatchProcessor;
