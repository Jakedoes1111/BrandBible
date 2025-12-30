import React, { useState } from 'react';
import { StyleGuideGenerator, StyleGuideConfig } from '../services/styleGuideGenerator';
import { BrandIdentity, GeneratedImages } from '../types';
import { downloadBlob } from '../utils/mediaOptimization';

interface StyleGuideExporterProps {
  brandIdentity: BrandIdentity;
  generatedImages: GeneratedImages | null;
  mission: string;
}

const StyleGuideExporter: React.FC<StyleGuideExporterProps> = ({
  brandIdentity,
  generatedImages,
  mission,
}) => {
  const [config, setConfig] = useState<StyleGuideConfig>({
    format: 'html',
    sections: {
      overview: true,
      logoUsage: true,
      colorSystem: true,
      typography: true,
      spacing: true,
      imagery: true,
      voiceTone: true,
      socialMedia: true,
      dosDonts: true,
      examples: true,
    },
    includeAssets: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      const generator = new StyleGuideGenerator(brandIdentity, generatedImages, mission);
      const sections = generator.generate(config);

      let content: string;
      let filename: string;
      let mimeType: string;

      if (config.format === 'html') {
        content = generator.exportHTML(sections);
        filename = 'brand-style-guide.html';
        mimeType = 'text/html';
      } else if (config.format === 'markdown') {
        content = generator.exportMarkdown(sections);
        filename = 'brand-style-guide.md';
        mimeType = 'text/markdown';
      } else {
        // PDF export would require jspdf library
        alert('PDF export requires additional setup. Using HTML for now.');
        content = generator.exportHTML(sections);
        filename = 'brand-style-guide.html';
        mimeType = 'text/html';
      }

      const blob = new Blob([content], { type: mimeType });
      downloadBlob(blob, filename);

      alert('Style guide exported successfully!');
    } catch (error) {
      console.error('Error generating style guide:', error);
      alert('Failed to generate style guide. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (section: keyof typeof config.sections) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section],
      },
    }));
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Export Brand Style Guide</h2>
      <p className="text-gray-400 mb-6">
        Generate a comprehensive style guide document with all your brand guidelines.
      </p>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-white font-semibold mb-3">Export Format</label>
          <div className="flex gap-4">
            {['html', 'markdown', 'pdf'].map((format) => (
              <button
                key={format}
                onClick={() => setConfig(prev => ({ ...prev, format: format as any }))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  config.format === format
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
          {config.format === 'pdf' && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ PDF export requires additional dependencies (coming soon)
            </p>
          )}
        </div>

        {/* Section Selection */}
        <div>
          <label className="block text-white font-semibold mb-3">Include Sections</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(config.sections).map((section) => (
              <label
                key={section}
                className="flex items-center space-x-2 text-gray-300 cursor-pointer hover:text-white transition-colors"
              >
                <input
                  type="checkbox"
                  checked={config.sections[section as keyof typeof config.sections]}
                  onChange={() => toggleSection(section as keyof typeof config.sections)}
                  className="w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500"
                />
                <span className="capitalize">
                  {section.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="flex items-center space-x-2 text-gray-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={config.includeAssets}
              onChange={(e) => setConfig(prev => ({ ...prev, includeAssets: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500"
            />
            <span>Include brand assets (logos, images)</span>
          </label>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Style Guide...
            </span>
          ) : (
            '📄 Export Style Guide'
          )}
        </button>

        <div className="bg-blue-900/20 border border-blue-500/40 rounded-lg p-4">
          <h3 className="text-blue-200 font-semibold mb-2">💡 What You'll Get:</h3>
          <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
            <li>Professional brand documentation</li>
            <li>Logo usage guidelines with examples</li>
            <li>Complete color specifications (HEX, RGB, CMYK)</li>
            <li>Typography system and hierarchy</li>
            <li>Voice & tone guidelines</li>
            <li>Social media best practices</li>
            <li>Do's and don'ts with visuals</li>
            <li>Ready to share with team and designers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StyleGuideExporter;
