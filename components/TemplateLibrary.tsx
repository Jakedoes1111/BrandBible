import React, { useState } from 'react';
import { templateLibrary, getTemplatesByCategory, searchTemplates, categories, BrandTemplate } from '../services/templateLibrary';
import { useApp } from '../hooks';

interface TemplateLibraryProps {
  onSelectTemplate: (template: BrandTemplate) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate }) => {
  const { actions } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<BrandTemplate | null>(null);

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory === 'all'
    ? templateLibrary
    : getTemplatesByCategory(selectedCategory);

  const handleSelectTemplate = (template: BrandTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      actions.setActiveTab('bible');
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Template Library</h2>
        <p className="text-gray-400">
          Start with a professionally designed template for your industry
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Templates
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className={`bg-gray-800/50 border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:border-green-500 ${
              selectedTemplate?.id === template.id
                ? 'border-green-500 ring-2 ring-green-500/50'
                : 'border-gray-700'
            }`}
          >
            <div className="text-4xl mb-3">{template.preview}</div>
            <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{template.description}</p>
            
            {/* Color Palette Preview */}
            <div className="flex gap-2 mb-4">
              {template.colorPalette.slice(0, 5).map((color, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full border-2 border-gray-700"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {template.tone.slice(0, 3).map((tone, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                >
                  {tone}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No templates found. Try a different search or category.
        </div>
      )}

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedTemplate.preview} {selectedTemplate.name}
              </h3>
              <p className="text-gray-400">{selectedTemplate.description}</p>
            </div>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Color Palette */}
            <div>
              <h4 className="text-white font-semibold mb-3">Color Palette</h4>
              <div className="space-y-2">
                {selectedTemplate.colorPalette.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg border border-gray-700"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <div className="text-white font-medium">{color.name}</div>
                      <div className="text-gray-400 text-sm">{color.hex} • {color.usage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography & Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Typography</h4>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-white font-medium mb-1">
                    Header: {selectedTemplate.fontPairings.header}
                  </div>
                  <div className="text-gray-400 text-sm mb-2">
                    Body: {selectedTemplate.fontPairings.body}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {selectedTemplate.fontPairings.notes}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Brand Archetype</h4>
                <div className="bg-gray-800 rounded-lg p-3 text-white">
                  {selectedTemplate.brandArchetype}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Tone</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tone.map((tone, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-full"
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Popular For</h4>
                <div className="text-gray-400 text-sm">
                  {selectedTemplate.popularFor.join(', ')}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleUseTemplate}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            Use This Template
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/40 rounded-lg p-4">
        <h3 className="text-blue-200 font-semibold mb-2">💡 How Templates Work:</h3>
        <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
          <li>Select a template that matches your industry</li>
          <li>Customize colors, fonts, and messaging</li>
          <li>All templates are professionally designed</li>
          <li>Save time with pre-configured brand elements</li>
          <li>Templates are just starting points - make them your own!</li>
        </ul>
      </div>
    </div>
  );
};

export default TemplateLibrary;
