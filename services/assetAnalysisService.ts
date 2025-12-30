import { analyzeImage, ImageAnalysisResult } from './geminiService';
import { assetStorage } from './assetStorage';

export interface AssetAnalysis extends ImageAnalysisResult {
    assetId: string;
    analyzedAt: Date;
}

class AssetAnalysisService {

    async analyzeAsset(assetId: string, imageData: string): Promise<AssetAnalysis> {
        try {
            // 1. Analyze image using AI
            const analysisResult = await analyzeImage(imageData);

            // 2. Create analysis record
            const analysis: AssetAnalysis = {
                assetId,
                analyzedAt: new Date(),
                ...analysisResult
            };

            // 3. Update asset metadata in storage (if we had a metadata field for this)
            // For now, we just return the analysis. 
            // In a real app, we might want to save this back to the asset in IndexedDB.
            // Let's try to update the asset tags at least.

            try {
                const assets = await assetStorage.getAssets();
                const asset = assets.find(a => a.id === assetId);
                if (asset) {
                    // Merge existing tags with new ones, avoiding duplicates
                    const newTags = [...new Set([...(asset.tags || []), ...analysis.tags])];

                    // Update asset in storage
                    // We need to implement updateAsset in assetStorage or just re-save
                    // assetStorage.saveAssets doesn't update, it puts. So if ID matches it updates.
                    // But we need to construct the full asset object.

                    const updatedAsset = {
                        ...asset,
                        tags: newTags,
                        // We could also store the full analysis in metadata if we extended the type
                        metadata: {
                            ...asset.metadata,
                            analysis: {
                                colors: analysis.colors,
                                style: analysis.style
                            }
                        }
                    };

                    // We need to handle the file property which is missing in storage but required for upload?
                    // assetStorage.saveAssets expects UploadedAsset which has 'file'.
                    // But stored assets have 'fileData' instead.
                    // We might need a specific update method in assetStorage to handle this cleanly.
                    // For now, let's just return the analysis and let the UI handle the display.
                }
            } catch (storageError) {
                console.warn("Failed to update asset tags in storage:", storageError);
            }

            return analysis;
        } catch (error) {
            console.error("Asset analysis failed:", error);
            throw error;
        }
    }
}

export const assetAnalysisService = new AssetAnalysisService();
