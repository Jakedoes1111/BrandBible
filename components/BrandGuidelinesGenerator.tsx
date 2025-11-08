import React, { useState } from 'react';
import { advancedAIService, BrandGuidelines } from '../services/advancedAIService';

interface BrandGuidelinesGeneratorProps {
  brandIdentity: any;
  onGuidelinesGenerated: (guidelines: BrandGuidelines) => void;
}

const BrandGuidelinesGenerator: React.FC<BrandGuidelinesGeneratorProps> = ({ 
  brandIdentity, 
  onGuidelinesGenerated 
}) => {
  const [guidelines, setGuidelines] = useState<BrandGuidelines | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [customSections, setCustomSections] = useState<string[]>([]);

  const sections = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'logo', name: 'Logo Usage', icon: '🎯' },
    { id: 'colors', name: 'Color Rules', icon: '🎨' },
    { id: 'typography', name: 'Typography', icon: '📝' },
    { id: 'voice', name: 'Brand Voice', icon: '🗣️' },
    { id: 'imagery', name: 'Imagery', icon: '🖼️' },
    { id: 'dos-donts', name: 'Do\'s & Don\'ts', icon: '✅❌' }
  ];

  const handleGenerateGuidelines = async () => {
    if (!brandIdentity) {
      alert('Please generate a brand identity first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const generatedGuidelines = await advancedAIService.generateBrandGuidelines(brandIdentity);
      setGuidelines(generatedGuidelines);
      onGuidelinesGenerated(generatedGuidelines);
    } catch (error) {
      console.error('Failed to generate guidelines:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomSection = () => {
    const sectionName = prompt('Enter section name:');
    if (sectionName) {
      setCustomSections([...customSections, sectionName]);
    }
  };

  const handleExportGuidelines = () => {
    if (!guidelines) return;

    const guidelinesText = `
BR ${brandIdentity.name || 'Brand'} Guidelines
    =====================================

    OVERVIEW
    --------
    ${brandIdentity.missionStatement || 'Mission statement here'}

    LOGO USAGE
    ----------
    ${guidelines.logoUsage}

    COLOR RULES
    -----------
    ${guidelines.colorRules.join('\n')}

    TYPOGRAPHY
    ----------
    ${guidelines.typography}

    BRAND VOICE
    -----------
    ${guidelines.voice}

    IMAGERY
    -------
    ${guidelines.imagery}

    DO'S
    ----
    ${guidelines.doAndDont.do.join('\n')}

    DON'TS
    ------
    ${guidelines.doAndDont.dont.join('\n')}
    `;

    const blob = new Blob([guidelinesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(brandIdentity.name || 'brand').replace(/\s+/g, '_')}_guidelines.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isGenerating) {
    return (
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-white font-medium">Generating Brand Guidelines</p>
            <p className="text-gray-400 text-sm mt-2">Creating comprehensive brand rulebook...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!guidelines) {
    return (
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Brand Guidelines Generator</h3>
          <p className="text-gray-400 mb-6">
            Create comprehensive brand guidelines based on your generated brand identity
          </p>
          <button
            onClick={handleGenerateGuidelines}
            disabled={!brandIdentity}
            className="bg-purple-600 text-white font-bold py-3 px-6 rounded-md hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Generate Guidelines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Brand Guidelines</h3>
            <p className="text-gray-400 text-sm">
              {brandIdentity.name || 'Your Brand'} comprehensive rulebook
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddCustomSection}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
            >
              Add Section
            </button>
            <button
              onClick={handleExportGuidelines}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-gray-700 p-4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-purple-900/30 text-purple-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span>{section.icon}</span>
                <span className="text-sm font-medium">{section.name}</span>
              </button>
            ))}
            
            {customSections.map((section, index) => (
              <button
                key={`custom-${index}`}
                onClick={() => setActiveSection(`custom-${index}`)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === `custom-${index}`
                    ? 'bg-purple-900/30 text-purple-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span>📄</span>
                <span className="text-sm font-medium">{section}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">Brand Overview</h4>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h5 className="font-medium text-white mb-2">Mission Statement</h5>
                <p className="text-gray-300">{brandIdentity.missionStatement || 'Mission statement here'}</p>
              </div>
              
              {brandIdentity.colorPalette && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                  <h5 className="font-medium text-white mb-3">Primary Colors</h5>
                  <div className="flex gap-3">
                    {brandIdentity.colorPalette.slice(0, 4).map((color: any, index: number) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-600 mb-2"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <p className="text-xs text-gray-400">{color.hex}</p>
                        <p className="text-xs text-gray-300">{color.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'logo' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">Logo Usage</h4>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{guidelines.logoUsage}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'colors' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">Color Rules</h4>
              <div className="space-y-3">
                {guidelines.colorRules.map((rule, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-300">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'typography' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">Typography</h4>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{guidelines.typography}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'voice' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">Brand Voice</h4>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{guidelines.voice}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'imagery' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">Imagery Guidelines</h4>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{guidelines.imagery}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'dos-donts' && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">Do's & Don'ts</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Do's
                  </h5>
                  <div className="space-y-2">
                    {guidelines.doAndDont.do.map((item, index) => (
                      <div key={index} className="bg-green-900/20 rounded-lg p-3 border border-green-700/50">
                        <p className="text-green-300 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-red-400 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Don'ts
                  </h5>
                  <div className="space-y-2">
                    {guidelines.doAndDont.dont.map((item, index) => (
                      <div key={index} className="bg-red-900/20 rounded-lg p-3 border border-red-700/50">
                        <p className="text-red-300 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection.startsWith('custom-') && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">
                {customSections[parseInt(activeSection.split('-')[1])]}
              </h4>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <textarea
                  className="w-full h-64 bg-transparent text-gray-300 placeholder-gray-500 border-none outline-none resize-none"
                  placeholder="Add your custom guidelines here..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandGuidelinesGenerator;
