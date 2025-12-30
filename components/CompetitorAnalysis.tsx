import React, { useState } from 'react';
import { BrandIdentity } from '../types';

interface Competitor {
  id: string;
  name: string;
  industry: string;
  colors: string[];
  fontStyle: string;
  tone: string;
  strengths: string[];
  weaknesses: string[];
  contentStrategy: {
    postingFrequency: string;
    platforms: string[];
    contentTypes: string[];
  };
  engagement: {
    avgLikes: number;
    avgShares: number;
    avgComments: number;
    followerCount: number;
  };
}

interface CompetitorAnalysisProps {
  brandIdentity: BrandIdentity | null;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ brandIdentity }) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

  const analyzeCompetitor = async () => {
    if (!newCompetitorName.trim()) return;

    setIsAnalyzing(true);

    // Simulate API analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newCompetitor: Competitor = {
      id: `comp_${Date.now()}`,
      name: newCompetitorName,
      industry: brandIdentity?.colorPalette[0]?.usage || 'General',
      colors: generateRandomColors(5),
      fontStyle: ['Modern Sans-Serif', 'Classic Serif', 'Bold Display'][Math.floor(Math.random() * 3)],
      tone: ['Professional', 'Casual', 'Playful', 'Authoritative'][Math.floor(Math.random() * 4)],
      strengths: [
        'Strong visual identity',
        'Consistent posting schedule',
        'High engagement rate',
        'Clear brand messaging',
      ].slice(0, Math.floor(Math.random() * 2) + 2),
      weaknesses: [
        'Limited platform presence',
        'Inconsistent content quality',
        'Low video content',
        'Weak call-to-actions',
      ].slice(0, Math.floor(Math.random() * 2) + 1),
      contentStrategy: {
        postingFrequency: ['Daily', '3-4 times/week', '2-3 times/week'][Math.floor(Math.random() * 3)],
        platforms: ['Instagram', 'LinkedIn', 'Twitter', 'Facebook'].slice(0, Math.floor(Math.random() * 3) + 2),
        contentTypes: ['Images', 'Videos', 'Carousels', 'Stories'],
      },
      engagement: {
        avgLikes: Math.floor(Math.random() * 5000) + 500,
        avgShares: Math.floor(Math.random() * 500) + 50,
        avgComments: Math.floor(Math.random() * 300) + 20,
        followerCount: Math.floor(Math.random() * 100000) + 10000,
      },
    };

    setCompetitors([...competitors, newCompetitor]);
    setNewCompetitorName('');
    setIsAnalyzing(false);
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id));
    if (selectedCompetitor?.id === id) {
      setSelectedCompetitor(null);
    }
  };

  const generateRandomColors = (count: number): string[] => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B500', '#2ECC71'];
    return colors.sort(() => Math.random() - 0.5).slice(0, count);
  };

  const getDifferentiationOpportunities = (): string[] => {
    if (competitors.length === 0) return [];

    const opportunities = [
      'Focus on video content - most competitors use static images',
      'Increase posting frequency to stand out',
      'Develop unique visual style with brand colors',
      'Create more interactive content (polls, Q&A)',
      'Leverage user-generated content',
      'Establish thought leadership through long-form content',
    ];

    return opportunities.slice(0, 3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Competitor Analysis</h2>
        <p className="text-gray-400 mb-6">
          Track your competitors and identify opportunities for differentiation
        </p>

        {/* Add Competitor */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter competitor name or URL..."
            value={newCompetitorName}
            onChange={(e) => setNewCompetitorName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && analyzeCompetitor()}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500"
          />
          <button
            onClick={analyzeCompetitor}
            disabled={isAnalyzing || !newCompetitorName.trim()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze'}
          </button>
        </div>

        {competitors.length === 0 && (
          <div className="mt-6 text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">🔍</div>
            <p>Add competitors to start your analysis</p>
          </div>
        )}
      </div>

      {/* Competitor Cards */}
      {competitors.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {competitors.map(competitor => (
            <div
              key={competitor.id}
              onClick={() => setSelectedCompetitor(competitor)}
              className={`bg-black/30 backdrop-blur-sm border rounded-lg p-6 cursor-pointer transition-all ${
                selectedCompetitor?.id === competitor.id
                  ? 'border-green-500 ring-2 ring-green-500/50'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{competitor.name}</h3>
                  <p className="text-gray-400 text-sm">{competitor.industry}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCompetitor(competitor.id);
                  }}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Color Palette */}
              <div className="mb-4">
                <div className="text-gray-400 text-sm mb-2">Color Palette</div>
                <div className="flex gap-2">
                  {competitor.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full border-2 border-gray-700"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="text-gray-400 text-xs">Followers</div>
                  <div className="text-white font-bold">
                    {(competitor.engagement.followerCount / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <div className="text-gray-400 text-xs">Avg Engagement</div>
                  <div className="text-white font-bold">
                    {Math.round(
                      (competitor.engagement.avgLikes +
                        competitor.engagement.avgShares +
                        competitor.engagement.avgComments) /
                        competitor.engagement.followerCount *
                        100
                    )}%
                  </div>
                </div>
              </div>

              {/* Posting Frequency */}
              <div className="text-sm">
                <span className="text-gray-400">Posts: </span>
                <span className="text-white">{competitor.contentStrategy.postingFrequency}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Analysis */}
      {selectedCompetitor && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            Detailed Analysis: {selectedCompetitor.name}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <span>💪</span> Strengths
              </h4>
              <ul className="space-y-2">
                {selectedCompetitor.strengths.map((strength, idx) => (
                  <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <span>⚠️</span> Weaknesses
              </h4>
              <ul className="space-y-2">
                {selectedCompetitor.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Content Strategy */}
          <div className="mt-6 bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Content Strategy</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Platforms</div>
                <div className="text-white">
                  {selectedCompetitor.contentStrategy.platforms.join(', ')}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Content Types</div>
                <div className="text-white">
                  {selectedCompetitor.contentStrategy.contentTypes.join(', ')}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Font Style</div>
                <div className="text-white">{selectedCompetitor.fontStyle}</div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-blue-400 text-2xl font-bold">
                {(selectedCompetitor.engagement.avgLikes / 1000).toFixed(1)}K
              </div>
              <div className="text-gray-400 text-sm">Avg Likes</div>
            </div>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-green-400 text-2xl font-bold">
                {selectedCompetitor.engagement.avgShares}
              </div>
              <div className="text-gray-400 text-sm">Avg Shares</div>
            </div>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <div className="text-purple-400 text-2xl font-bold">
                {selectedCompetitor.engagement.avgComments}
              </div>
              <div className="text-gray-400 text-sm">Avg Comments</div>
            </div>
          </div>
        </div>
      )}

      {/* Differentiation Opportunities */}
      {competitors.length > 0 && (
        <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💡</span> Differentiation Opportunities
          </h3>
          <div className="space-y-3">
            {getDifferentiationOpportunities().map((opportunity, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-black/30 rounded-lg p-3">
                <span className="text-green-400 text-xl">→</span>
                <p className="text-gray-300">{opportunity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Matrix */}
      {competitors.length >= 2 && (
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Comparison Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 pb-3 pr-4">Metric</th>
                  {competitors.slice(0, 3).map(comp => (
                    <th key={comp.id} className="text-left text-gray-400 pb-3 px-4">
                      {comp.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-3 pr-4 text-gray-300">Followers</td>
                  {competitors.slice(0, 3).map(comp => (
                    <td key={comp.id} className="py-3 px-4 text-white">
                      {(comp.engagement.followerCount / 1000).toFixed(1)}K
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 pr-4 text-gray-300">Posting Frequency</td>
                  {competitors.slice(0, 3).map(comp => (
                    <td key={comp.id} className="py-3 px-4 text-white">
                      {comp.contentStrategy.postingFrequency}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 pr-4 text-gray-300">Tone</td>
                  {competitors.slice(0, 3).map(comp => (
                    <td key={comp.id} className="py-3 px-4 text-white">
                      {comp.tone}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysis;
