import React, { useState } from 'react';
import { advancedAIService, VideoTemplate } from '../services/advancedAIService';

interface VideoProductionSuiteProps {
  onVideoGenerated: (videoData: any) => void;
}

const VideoProductionSuite: React.FC<VideoProductionSuiteProps> = ({ onVideoGenerated }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [script, setScript] = useState('');
  const [voiceType, setVoiceType] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [musicGenre, setMusicGenre] = useState('electronic');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const templates = advancedAIService.getVideoTemplates();
  
  const availableEffects = [
    { id: 'fade', name: 'Fade In/Out', category: 'transition' },
    { id: 'zoom', name: 'Zoom', category: 'transition' },
    { id: 'slide', name: 'Slide', category: 'transition' },
    { id: 'filter-warm', name: 'Warm Filter', category: 'filter' },
    { id: 'filter-cool', name: 'Cool Filter', category: 'filter' },
    { id: 'filter-vintage', name: 'Vintage Filter', category: 'filter' },
    { id: 'text-bounce', name: 'Bouncing Text', category: 'text' },
    { id: 'text-typewriter', name: 'Typewriter Effect', category: 'text' },
    { id: 'text-glow', name: 'Glowing Text', category: 'text' }
  ];

  const musicGenres = [
    'electronic', 'pop', 'corporate', 'ambient', 'upbeat', 'cinematic', 'minimal'
  ];

  const handleEffectToggle = (effectId: string) => {
    setSelectedEffects(prev => 
      prev.includes(effectId) 
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    );
  };

  const handleGenerateVideo = async () => {
    if (!selectedTemplate || !script.trim()) {
      alert('Please select a template and provide a script');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Initializing video production...');

    try {
      // Step 1: Generate voiceover
      setProcessingStep('Generating voiceover...');
      const voiceoverUrl = await advancedAIService.generateVoiceover(script, voiceType);

      // Step 2: Generate background music
      setProcessingStep('Creating background music...');
      const musicUrl = await advancedAIService.generateBackgroundMusic(musicGenre, selectedTemplate.duration);

      // Step 3: Generate subtitles
      setProcessingStep('Generating subtitles...');
      const subtitles = await advancedAIService.generateSubtitles(voiceoverUrl);

      // Step 4: Apply effects and render
      setProcessingStep('Applying effects and rendering video...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing

      const videoData = {
        template: selectedTemplate,
        script,
        voiceoverUrl,
        musicUrl,
        subtitles,
        effects: selectedEffects,
        videoUrl: `https://mock-video-api.com/renders/${Date.now()}.mp4`,
        thumbnailUrl: `https://mock-video-api.com/thumbnails/${Date.now()}.jpg`
      };

      setGeneratedContent(videoData);
      setProcessingStep('Video production complete!');
      
      setTimeout(() => {
        onVideoGenerated(videoData);
        setIsProcessing(false);
        setProcessingStep('');
      }, 1000);

    } catch (error) {
      console.error('Video production failed:', error);
      setProcessingStep('Error occurred during production');
      setIsProcessing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return '🎵';
      case 'instagram': return '📷';
      case 'youtube': return '📺';
      case 'linkedin': return '💼';
      default: return '🎬';
    }
  };

  if (isProcessing) {
    return (
      <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6">Video Production Suite</h3>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>{processingStep}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-white mb-2">Template</h4>
            <p className="text-sm text-gray-400">{selectedTemplate?.name}</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-white mb-2">Duration</h4>
            <p className="text-sm text-gray-400">{selectedTemplate?.duration}s</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-white mb-2">Voice</h4>
            <p className="text-sm text-gray-400 capitalize">{voiceType}</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-white mb-2">Music</h4>
            <p className="text-sm text-gray-400 capitalize">{musicGenre}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Video Production Suite</h3>
      
      {/* Template Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Choose Video Template</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            
            return (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <span>{getPlatformIcon(template.platform)}</span>
                    {template.name}
                  </h4>
                  {isSelected && (
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>Platform: {template.platform}</p>
                  <p>Duration: {template.duration}s</p>
                  <p>Style: {template.musicStyle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Script Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Video Script</label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter your video script here. This will be used for voiceover and subtitles..."
          className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="text-xs text-gray-400 mt-1">
          Characters: {script.length} | Estimated duration: ~{Math.ceil(script.length / 150)}s
        </div>
      </div>

      {/* Voice Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Voice Type</label>
        <div className="grid grid-cols-3 gap-3">
          {(['male', 'female', 'neutral'] as const).map((voice) => (
            <button
              key={voice}
              onClick={() => setVoiceType(voice)}
              className={`p-3 rounded-lg border capitalize transition-all ${
                voiceType === voice
                  ? 'bg-blue-900/30 border-blue-600 text-white'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              {voice}
            </button>
          ))}
        </div>
      </div>

      {/* Music Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Background Music</label>
        <select
          value={musicGenre}
          onChange={(e) => setMusicGenre(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {musicGenres.map((genre) => (
            <option key={genre} value={genre} className="bg-gray-800">
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Effects Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Video Effects ({selectedEffects.length} selected)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableEffects.map((effect) => {
            const isSelected = selectedEffects.includes(effect.id);
            
            return (
              <div
                key={effect.id}
                onClick={() => handleEffectToggle(effect.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{effect.name}</span>
                  <div className={`w-4 h-4 rounded border-2 ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-500'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 capitalize">{effect.category}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateVideo}
        disabled={!selectedTemplate || !script.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-md hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Generate Video
      </button>

      {/* Generated Content Preview */}
      {generatedContent && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
          <h4 className="text-green-400 font-medium mb-3">Video Generated Successfully!</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Template:</span>
              <span className="text-white ml-2">{generatedContent.template.name}</span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <span className="text-white ml-2">{generatedContent.template.duration}s</span>
            </div>
            <div>
              <span className="text-gray-400">Voice:</span>
              <span className="text-white ml-2 capitalize">{voiceType}</span>
            </div>
            <div>
              <span className="text-gray-400">Effects:</span>
              <span className="text-white ml-2">{selectedEffects.length} applied</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoProductionSuite;
