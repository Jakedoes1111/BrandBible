// FIX: Implemented the main App component with advanced features.
import React, { useState } from 'react';
import BrandInputForm from './components/BrandInputForm';
import BrandBibleDashboard from './components/BrandBibleDashboard';
import ImageEditor from './components/ImageEditor';
import ChatBot from './components/ChatBot';
import BatchProcessor from './components/BatchProcessor';
import CopywritingABTest from './components/CopywritingABTest';
import VideoProductionSuite from './components/VideoProductionSuite';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ContentCalendar from './components/ContentCalendar';
import BrandGuidelinesGenerator from './components/BrandGuidelinesGenerator';
import AssetManager from './components/AssetManager';
import ContentScheduler from './components/ContentScheduler';
import { generateBrandBible } from './services/geminiService';
import { BrandIdentity, GeneratedImages, SocialMediaPost } from './types';

function App() {
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mission, setMission] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'bible' | 'editor' | 'batch' | 'copywriting' | 'video' | 'analytics' | 'calendar' | 'guidelines' | 'assets' | 'scheduler'>('bible');

  const handleGenerate = async (missionStatement: string) => {
    setIsLoading(true);
    setError(null);
    setBrandIdentity(null);
    setGeneratedImages(null);
    setMission(missionStatement);

    try {
      const { brandIdentity, generatedImages } = await generateBrandBible(missionStatement);
      setBrandIdentity(brandIdentity);
      setGeneratedImages(generatedImages);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualUpdate = (postIndex: number, newVisualData: Partial<SocialMediaPost>) => {
    if (!brandIdentity) return;

    const updatedPosts = [...brandIdentity.socialMediaPosts];
    updatedPosts[postIndex] = {
      ...updatedPosts[postIndex],
      ...newVisualData
    };
    
    setBrandIdentity({
      ...brandIdentity,
      socialMediaPosts: updatedPosts
    });
  };

  const handleBatchVariationsGenerated = (variations: any[]) => {
    console.log('Batch variations generated:', variations);
  };

  const handleCopywritingVariationSelected = (variation: any) => {
    console.log('Copywriting variation selected:', variation);
  };

  const handleVideoGenerated = (videoData: any) => {
    console.log('Video generated:', videoData);
  };

  const handlePostScheduled = (post: any) => {
    console.log('Post scheduled:', post);
  };

  const handleGuidelinesGenerated = (guidelines: any) => {
    console.log('Guidelines generated:', guidelines);
  };

  const handleAssetSelected = (asset: any) => {
    console.log('Asset selected:', asset);
  };

  const TabButton: React.FC<{ tabId: typeof activeTab, label: string, icon?: string }> = ({ tabId, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 rounded-t-lg font-bold transition-colors text-sm ${
        activeTab === tabId 
          ? 'bg-black/30 backdrop-blur-sm border-t border-l border-r border-gray-700 text-green-400' 
          : 'text-gray-400 hover:bg-gray-800/50'
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-red-900/50 min-h-screen text-gray-200">
       <div className="absolute inset-0 bg-black/50"></div>
      <div className="container mx-auto p-4 sm:p-8 relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tighter">
            Brand Bible <span className="bg-gradient-to-r from-green-400 to-green-500 text-transparent bg-clip-text">Generator Pro</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Advanced AI-powered brand identity creation with multi-modal capabilities, analytics, and content optimization.
          </p>
        </header>
        
        <div className="flex justify-center border-b border-gray-700 mb-[-1px] overflow-x-auto">
          <TabButton tabId="bible" label="Brand Generator" icon="🎯" />
          <TabButton tabId="editor" label="Media Editor" icon="🎨" />
          <TabButton tabId="batch" label="Batch Processing" icon="⚡" />
          <TabButton tabId="copywriting" label="A/B Testing" icon="🧪" />
          <TabButton tabId="video" label="Video Suite" icon="🎬" />
          <TabButton tabId="analytics" label="Analytics" icon="📊" />
          <TabButton tabId="calendar" label="Calendar" icon="📅" />
          <TabButton tabId="guidelines" label="Guidelines" icon="📋" />
          <TabButton tabId="assets" label="Assets" icon="🗂️" />
          <TabButton tabId="scheduler" label="Scheduler" icon="⏰" />
        </div>

        {activeTab === 'bible' && (
           <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <BrandInputForm onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-2">
              <BrandBibleDashboard
                brandIdentity={brandIdentity}
                generatedImages={generatedImages}
                isLoading={isLoading}
                error={error}
                mission={mission}
                onVisualUpdate={handleVisualUpdate}
              />
            </div>
          </main>
        )}

        {activeTab === 'editor' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <ImageEditor />
           </main>
        )}

        {activeTab === 'batch' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <BatchProcessor 
               missionStatement={mission} 
               onVariationsGenerated={handleBatchVariationsGenerated} 
             />
           </main>
        )}

        {activeTab === 'copywriting' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <CopywritingABTest 
               initialText="Welcome to our brand! Discover amazing products and services."
               platform="instagram"
               onVariationSelected={handleCopywritingVariationSelected}
             />
           </main>
        )}

        {activeTab === 'video' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <VideoProductionSuite onVideoGenerated={handleVideoGenerated} />
           </main>
        )}

        {activeTab === 'analytics' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <AnalyticsDashboard 
               brandIdentity={brandIdentity}
               generatedContent={brandIdentity?.socialMediaPosts || []}
             />
           </main>
        )}

        {activeTab === 'calendar' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <ContentCalendar onPostScheduled={handlePostScheduled} />
           </main>
        )}

        {activeTab === 'guidelines' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <BrandGuidelinesGenerator 
               brandIdentity={brandIdentity}
               onGuidelinesGenerated={handleGuidelinesGenerated}
             />
           </main>
        )}

        {activeTab === 'assets' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <AssetManager 
               brandIdentity={brandIdentity}
               onAssetSelected={handleAssetSelected}
             />
           </main>
        )}

        {activeTab === 'scheduler' && (
           <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
             <ContentScheduler />
           </main>
        )}

      </div>
      <ChatBot />
    </div>
  );
}

export default App;