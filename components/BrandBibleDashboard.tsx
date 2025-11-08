import React from 'react';
import { BrandIdentity, GeneratedImages, SocialMediaPost } from '../types';
import ColorPalette from './ColorPalette';
import FontPairings from './FontPairings';
import LogoDisplay from './LogoDisplay';
import SocialMediaTemplates from './SocialMediaTemplates';

interface BrandBibleDashboardProps {
  brandIdentity: BrandIdentity | null;
  generatedImages: GeneratedImages | null;
  isLoading: boolean;
  error: string | null;
  mission: string;
  onVisualUpdate: (postIndex: number, newVisualData: Partial<SocialMediaPost>) => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-8 animate-pulse">
        <div>
            <div className="h-8 bg-gray-800/50 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-48 bg-gray-800/50 rounded-lg"></div>
                <div className="h-48 bg-gray-800/50 rounded-lg"></div>
                <div className="h-48 bg-gray-800/50 rounded-lg"></div>
            </div>
        </div>
        <div>
            <div className="h-8 bg-gray-800/50 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="h-32 bg-gray-800/50 rounded-lg"></div>
                <div className="h-32 bg-gray-800/50 rounded-lg"></div>
                <div className="h-32 bg-gray-800/50 rounded-lg"></div>
                <div className="h-32 bg-gray-800/50 rounded-lg"></div>
                <div className="h-32 bg-gray-800/50 rounded-lg"></div>
            </div>
        </div>
        <div>
            <div className="h-8 bg-gray-800/50 rounded w-1/4 mb-4"></div>
            <div className="h-40 bg-gray-800/50 rounded-lg"></div>
        </div>
        <div>
            <div className="h-8 bg-gray-800/50 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
                <div className="h-36 bg-gray-800/50 rounded-lg"></div>
                <div className="h-36 bg-gray-800/50 rounded-lg"></div>
                <div className="h-36 bg-gray-800/50 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const InitialState: React.FC = () => (
    <div className="text-center py-20 px-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <h3 className="mt-2 text-xl font-medium text-white">Your Brand Bible Awaits</h3>
        <p className="mt-1 text-gray-400">Enter your company mission to generate your brand identity.</p>
    </div>
);

const BrandBibleDashboard: React.FC<BrandBibleDashboardProps> = ({ brandIdentity, generatedImages, isLoading, error, mission, onVisualUpdate }) => {
  const renderContent = () => {
    if (isLoading) {
      return <SkeletonLoader />;
    }
    if (error) {
      return (
        <div className="text-center py-20 px-6 bg-red-900/30 rounded-lg border border-red-500/50">
           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-xl font-medium text-red-200">Generation Failed</h3>
          <p className="mt-1 text-red-300">{error}</p>
        </div>
      );
    }
    if (brandIdentity && generatedImages) {
      return (
        <div className="space-y-12">
           <div className="bg-black/20 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-2 text-white">Brand Mission</h2>
                <p className="text-gray-300 italic">"{mission}"</p>
            </div>
          <LogoDisplay generatedImages={generatedImages} />
          <ColorPalette colors={brandIdentity.colorPalette} />
          <FontPairings fontPairing={brandIdentity.fontPairings} />
          <SocialMediaTemplates 
            posts={brandIdentity.socialMediaPosts}
            colors={brandIdentity.colorPalette}
            fonts={brandIdentity.fontPairings}
            logoUrl={generatedImages.primaryLogoUrl}
            onVisualUpdate={onVisualUpdate}
          />
        </div>
      );
    }
    return <InitialState />;
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-lg shadow-2xl shadow-black/30 min-h-[500px]">
       <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">2. Your Brand Bible</h2>
       {renderContent()}
    </div>
  );
};

export default BrandBibleDashboard;