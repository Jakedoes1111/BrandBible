// Enhanced hook for Gemini API with improved error handling and caching
import { useState, useCallback } from 'react';
import { generateBrandBible } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { performanceService } from '../services/performanceService';
import { useApp } from '../contexts/AppContext';
import { BrandIdentity, GeneratedImages } from '../types';

export function useEnhancedGemini() {
  const { state, actions } = useApp();
  const [progress, setProgress] = useState(0);

  const generateBrand = useCallback(async (mission: string, uploadedAssets?: any[]) => {
    actions.setLoading(true);
    actions.setError(null);
    actions.setMission(mission);
    setProgress(0);

    try {
      // Track performance
      const result = await performanceService.measureAsync(
        'brand_generation',
        async () => {
          setProgress(20);

          const cacheKey = `brand_${mission.substring(0, 50)}`;
          
          // Check cache
          const cached = actions.getCachedData(cacheKey);
          if (cached) {
            console.log('Using cached brand identity');
            setProgress(100);
            return cached;
          }

          setProgress(40);

          // Make API request with retry logic
          const data = await apiService.makeRequest(
            () => generateBrandBible(mission, uploadedAssets),
            {
              retry: {
                maxRetries: 3,
                baseDelay: 2000,
                maxDelay: 10000,
                backoffMultiplier: 2,
              },
              timeout: 60000,
              cache: false, // Don't cache at API service level
            }
          );

          setProgress(80);

          // Cache the result
          actions.setCachedData(cacheKey, data, 1800000); // 30 minutes

          setProgress(100);
          return data;
        }
      );

      actions.setBrandIdentity(result.brandIdentity);
      actions.setGeneratedImages(result.generatedImages);

      // Track successful generation
      performanceService.trackInteraction('generate', 'brand_identity', mission.substring(0, 50));

      return result;
    } catch (error) {
      const errorMessage = apiService.formatError(error);
      actions.setError(errorMessage);
      performanceService.trackError(error as Error, { mission });
      throw error;
    } finally {
      actions.setLoading(false);
      setProgress(0);
    }
  }, [actions]);

  return {
    generateBrand,
    isLoading: state.isLoading,
    error: state.error,
    progress,
    brandIdentity: state.brandIdentity,
    generatedImages: state.generatedImages,
  };
}
