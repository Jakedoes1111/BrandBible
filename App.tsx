// Enhanced App component with improved architecture
import React, { useEffect, useState, useRef } from 'react';
import BrandInputForm from './components/BrandInputForm';
import BrandBibleDashboard from './components/BrandBibleDashboard';
import ChatBot from './components/ChatBot';
import BatchProcessor from './components/BatchProcessor';
import CopywritingABTest from './components/CopywritingABTest';
import VideoProductionSuite from './components/VideoProductionSuite';
import ContentCalendar from './components/ContentCalendar';
import ImageEditor from './components/ImageEditor/ImageEditor';
import SocialAccountManager from './components/SocialAccountManager';
import PerformanceDashboard from './components/PerformanceDashboard';
import InsightsPanel from './components/InsightsPanel';
import { contentStorage } from './services/contentStorage';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import BrandGuidelinesGenerator from './components/BrandGuidelinesGenerator';
import AssetManager from './components/AssetManager';
import ContentScheduler from './components/ContentScheduler';
import StyleGuideExporter from './components/StyleGuideExporter';
import TemplateLibrary from './components/TemplateLibrary';
import BulkContentGeneratorUI from './components/BulkContentGeneratorUI';
import InteractiveOnboarding from './components/InteractiveOnboarding';
import BrandHealthMonitor from './components/BrandHealthMonitor';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import HashtagResearch from './components/HashtagResearch';
import BatchLogoApplicationUI from './components/BatchLogoApplicationUI';
import { SectionErrorBoundary } from './components/ErrorBoundary';
import { BrandTemplate } from './services/templateLibrary';
import { useEnhancedGemini, useApp } from './hooks';
import { performanceService } from './services/performanceService';
import { indexedDBService } from './services/indexedDBService';
import { SocialMediaPost } from './types';

function App() {
  // activeTab is now managed in global state via useApp()

  const { state, actions } = useApp();
  const { generateBrand, isLoading, error, progress } = useEnhancedGemini();

  // Track page view on mount
  useEffect(() => {
    performanceService.trackPageView(window.location.pathname);

    // Load saved projects from IndexedDB
    indexedDBService.getProjects().then((projects) => {
      actions.setSavedProjects(projects);
    }).catch(console.error);

    // Cleanup performance observers on unmount
    return () => {
      performanceService.cleanup();
    };
  }, []);

  const handleGenerate = async (missionStatement: string, uploadedAssets?: any[]) => {
    try {
      await generateBrand(missionStatement, uploadedAssets);

      // Auto-save project
      const project = {
        id: `project_${Date.now()}`,
        name: missionStatement.substring(0, 50),
        mission: missionStatement,
        brandIdentity: state.brandIdentity!,
        generatedImages: state.generatedImages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await indexedDBService.saveProject(project);
      actions.saveProject(project);
    } catch (err) {
      console.error('Failed to generate brand:', err);
    }
  };

  const handleVisualUpdate = (postIndex: number, newVisualData: Partial<SocialMediaPost>) => {
    actions.updateVisual(postIndex, newVisualData);
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

  const handleTemplateSelected = async (template: BrandTemplate) => {
    // Apply template to brand identity
    const mission = `Create a ${template.name} brand identity`;
    actions.setMission(mission);
    actions.setBrandIdentity({
      colorPalette: template.colorPalette,
      fontPairings: template.fontPairings,
      socialMediaPosts: [],
    });
    console.log('Template applied:', template.name);
  };

  const handleBatchLogoComplete = (updatedPosts: SocialMediaPost[]) => {
    if (state.brandIdentity) {
      actions.setBrandIdentity({
        ...state.brandIdentity,
        socialMediaPosts: updatedPosts,
      });
    }
  };

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavButton: React.FC<{
    tabId: typeof state.activeTab,
    label: string,
    icon?: string,
    onClick?: () => void
  }> = ({ tabId, label, icon, onClick }) => (
    <button
      onClick={onClick || (() => {
        actions.setActiveTab(tabId);
        setOpenDropdown(null);
      })}
      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap ${state.activeTab === tabId
        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
        : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
        }`}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </button>
  );

  const DropdownButton: React.FC<{
    label: string,
    icon?: string,
    dropdownId: string,
    children: React.ReactNode
  }> = ({ label, icon, dropdownId, children }) => {
    const isOpen = openDropdown === dropdownId;
    const hasActiveChild = React.Children.toArray(children).some(
      (child: any) => child.props?.tabId === state.activeTab
    );

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : dropdownId)}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap flex items-center gap-1 ${hasActiveChild || isOpen
            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
            : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
            }`}
        >
          {icon && <span>{icon}</span>}
          {label}
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-[9999] min-w-[200px] py-1">
            {children}
          </div>
        )}
      </div>
    );
  };

  const DropdownItem: React.FC<{
    tabId: typeof state.activeTab,
    label: string,
    icon?: string
  }> = ({ tabId, label, icon }) => (
    <button
      onClick={() => {
        actions.setActiveTab(tabId);
        setOpenDropdown(null);
      }}
      className={`w-full text-left px-4 py-2 text-sm transition-colors ${state.activeTab === tabId
        ? 'bg-green-500/20 text-green-400'
        : 'text-gray-300 hover:bg-gray-800'
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
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => actions.setActiveTab('bible')}
              className="group cursor-pointer hover:opacity-80 transition-opacity"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                🎨 <span className="bg-gradient-to-r from-green-400 to-green-500 text-transparent bg-clip-text">BrandBible</span>
              </h1>
            </button>
            <p className="text-sm text-gray-500 hidden sm:block">
              AI-Powered Content Automation Platform
            </p>
          </div>

          {/* New Navigation Bar */}
          <nav className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 relative z-[100]" ref={dropdownRef}>
            <div className="flex flex-wrap items-center gap-2">
              {/* Main Pages */}
              <NavButton tabId="bible" label="Brand Generator" icon="🎯" />

              {/* Create Dropdown */}
              <DropdownButton label="Create" icon="✨" dropdownId="create">
                <DropdownItem tabId="bulkcontent" label="Bulk Content" icon="🚀" />
                <DropdownItem tabId="templates" label="Templates" icon="📚" />
                <DropdownItem tabId="editor" label="Media Editor" icon="🎨" />
                <DropdownItem tabId="video" label="Video Suite" icon="🎬" />
              </DropdownButton>

              {/* Schedule Dropdown */}
              <DropdownButton label="Schedule" icon="📅" dropdownId="schedule">
                <DropdownItem tabId="calendar" label="Content Calendar" icon="📅" />
                <DropdownItem tabId="scheduler" label="Scheduler" icon="⏰" />
              </DropdownButton>

              {/* Analyze Dropdown */}
              <DropdownButton label="Analyze" icon="📊" dropdownId="analyze">
                <DropdownItem tabId="performance" label="Performance" icon="📈" />
                <DropdownItem tabId="insights" label="AI Insights" icon="🤖" />
                <DropdownItem tabId="analytics" label="Analytics" icon="📊" />
                <DropdownItem tabId="brandhealth" label="Brand Health" icon="💊" />
                <DropdownItem tabId="competitors" label="Competitors" icon="🔍" />
                <DropdownItem tabId="hashtags" label="Hashtags" icon="#️⃣" />
                <DropdownItem tabId="copywriting" label="A/B Testing" icon="🧪" />
              </DropdownButton>

              {/* Tools Dropdown */}
              <DropdownButton label="Tools" icon="🛠️" dropdownId="tools">
                <DropdownItem tabId="styleguide" label="Style Guide" icon="📖" />
                <DropdownItem tabId="guidelines" label="Guidelines" icon="📋" />
                <DropdownItem tabId="assets" label="Asset Manager" icon="🗂️" />
                <DropdownItem tabId="accounts" label="Social Accounts" icon="🔗" />
                <DropdownItem tabId="batch" label="Batch Processing" icon="⚡" />
                <DropdownItem tabId="batchlogo" label="Batch Logo Application" icon="🎨" />
              </DropdownButton>
            </div>
          </nav>
        </header>

        {state.activeTab === 'bible' && (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <SectionErrorBoundary sectionName="Brand Input Form">
                <BrandInputForm onGenerate={handleGenerate} isLoading={isLoading} />
              </SectionErrorBoundary>
            </div>
            <div className="lg:col-span-2">
              <SectionErrorBoundary sectionName="Brand Bible Dashboard">
                <BrandBibleDashboard
                  brandIdentity={state.brandIdentity}
                  generatedImages={state.generatedImages}
                  isLoading={isLoading}
                  error={error}
                  mission={state.mission}
                  onVisualUpdate={handleVisualUpdate}
                />
              </SectionErrorBoundary>
            </div>
          </main>
        )}

        {state.activeTab === 'templates' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Template Library">
              <TemplateLibrary onSelectTemplate={handleTemplateSelected} />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'styleguide' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Style Guide Exporter">
              {state.brandIdentity ? (
                <StyleGuideExporter
                  brandIdentity={state.brandIdentity}
                  generatedImages={state.generatedImages}
                  mission={state.mission}
                />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Generate a brand identity first to export a style guide.
                </div>
              )}
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'bulkcontent' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Bulk Content Generator">
              <BulkContentGeneratorUI brandIdentity={state.brandIdentity} />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'brandhealth' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Brand Health Monitor">
              <BrandHealthMonitor brandIdentity={state.brandIdentity} />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'competitors' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Competitor Analysis">
              <CompetitorAnalysis brandIdentity={state.brandIdentity} />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'hashtags' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Hashtag Research">
              <HashtagResearch brandIdentity={state.brandIdentity} />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'editor' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Image Editor">
              <ImageEditor />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'batch' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Batch Processor">
              <BatchProcessor
                missionStatement={state.mission}
                onVariationsGenerated={handleBatchVariationsGenerated}
              />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'copywriting' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="A/B Testing">
              <CopywritingABTest
                initialText="Welcome to our brand! Discover amazing products and services."
                platform="instagram"
                onVariationSelected={handleCopywritingVariationSelected}
              />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'video' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Video Production Suite">
              <VideoProductionSuite onVideoGenerated={handleVideoGenerated} />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'analytics' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Analytics Dashboard">
              <AnalyticsDashboard
                brandIdentity={state.brandIdentity}
                generatedContent={state.brandIdentity?.socialMediaPosts || []}
              />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'performance' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Performance Dashboard">
              <PerformanceDashboard />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'insights' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="AI Insights">
              <InsightsPanel />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'calendar' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Content Calendar">
              <ContentCalendar onPostScheduled={handlePostScheduled} />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'guidelines' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Brand Guidelines Generator">
              <BrandGuidelinesGenerator
                brandIdentity={state.brandIdentity}
                onGuidelinesGenerated={handleGuidelinesGenerated}
              />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'assets' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Asset Manager">
              <AssetManager
                brandIdentity={state.brandIdentity}
                onAssetSelected={handleAssetSelected}
              />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'schedule' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Content Scheduler">
              <ContentScheduler />
            </SectionErrorBoundary>
          </main>
        )}

        {state.activeTab === 'editor' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Image Editor</h2>
              </div>
              <ImageEditor />
            </div>
          </main>
        )}

        {state.activeTab === 'accounts' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Social Accounts</h2>
              </div>
              <SocialAccountManager />
            </div>
          </main>
        )}

        {state.activeTab === 'batchlogo' && (
          <main className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 sm:p-8 rounded-b-lg shadow-2xl shadow-black/30">
            <SectionErrorBoundary sectionName="Batch Logo Application">
              {state.brandIdentity && state.brandIdentity.socialMediaPosts.length > 0 ? (
                <BatchLogoApplicationUI
                  posts={state.brandIdentity.socialMediaPosts}
                  onComplete={handleBatchLogoComplete}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Content to Brand</h3>
                  <p className="text-gray-400 mb-6">
                    Generate brand content first, then come back here to apply logos to all items at once.
                  </p>
                  <button
                    onClick={() => actions.setActiveTab('calendar')}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${state.activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Content Calendar
                  </button>
                  <button
                    onClick={() => actions.setActiveTab('schedule')}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${state.activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Schedule Posts
                  </button>
                  <button
                    onClick={() => actions.setActiveTab('editor')}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${state.activeTab === 'editor' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Image Editor
                  </button>
                  <button
                    onClick={() => actions.setActiveTab('accounts')}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${state.activeTab === 'accounts' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Social Accounts
                  </button>
                  <button
                    onClick={() => actions.setActiveTab('bible')}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors"
                  >
                    Go to Brand Generator
                  </button>
                </div>
              )}
            </SectionErrorBoundary>
          </main>
        )}

      </div>
      <ChatBot />
      <InteractiveOnboarding />
    </div >
  );
}

export default App;