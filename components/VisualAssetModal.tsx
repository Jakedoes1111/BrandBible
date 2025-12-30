import React, { useState, useEffect } from 'react';
import { SocialMediaPost } from '../types';
import { generateImage, generateVideo, editImage, extendVideo } from '../services/geminiService';
import { useDropzone } from 'react-dropzone';
import Spinner from './Spinner';
import LogoOverlayEditor from './LogoOverlayEditor';
import VideoLogoOverlayEditor from './VideoLogoOverlayEditor';
import { assetStorage } from '../services/assetStorage';


interface VisualAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: SocialMediaPost;
  onUpdate: (newVisualData: Partial<SocialMediaPost>) => void;
}

type LoadingState = 'image' | 'video' | 'edit-image' | 'extend-video' | null;

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center p-8">
        <Spinner className="mx-auto h-8 w-8 text-green-400" title={message} />
        <p className="mt-4 font-semibold text-white">{message}</p>
        <p className="text-sm text-gray-400">This may take a few moments...</p>
    </div>
);


// Platform-specific recommended aspect ratios
const PLATFORM_ASPECT_RATIOS: Record<string, { image: string, video: string, description: string }> = {
  'Instagram Post': { image: '1:1', video: '1:1', description: 'Square format optimized for feed' },
  'Instagram Story': { image: '9:16', video: '9:16', description: 'Vertical format for stories' },
  'Instagram Reel': { image: '9:16', video: '9:16', description: 'Vertical format for reels' },
  'Instagram': { image: '1:1', video: '9:16', description: 'Square for posts, vertical for reels' },
  'TikTok': { image: '9:16', video: '9:16', description: 'Vertical format' },
  'YouTube': { image: '16:9', video: '16:9', description: 'Widescreen format' },
  'YouTube Short': { image: '9:16', video: '9:16', description: 'Vertical for Shorts' },
  'Twitter': { image: '16:9', video: '16:9', description: 'Horizontal format' },
  'Facebook': { image: '1:1', video: '1:1', description: 'Square format preferred' },
  'LinkedIn': { image: '1:1', video: '16:9', description: 'Square for images, horizontal for videos' },
  'Pinterest': { image: '2:3', video: '2:3', description: 'Vertical format' },
};

const getRecommendedAspectRatio = (platform: string, type: 'image' | 'video'): string => {
  const platformConfig = PLATFORM_ASPECT_RATIOS[platform];
  if (platformConfig) {
    return type === 'image' ? platformConfig.image : platformConfig.video;
  }
  // Default fallbacks
  return type === 'image' ? '1:1' : '16:9';
};

const VisualAssetModal: React.FC<VisualAssetModalProps> = ({ isOpen, onClose, post, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'gen-image' | 'gen-video' | 'edit' | 'add-logo'>('gen-image');
  const [prompt, setPrompt] = useState(post.imagePrompt);
  const [editPrompt, setEditPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('16:9');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState<LoadingState>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedImageForUpload, setEditedImageForUpload] = useState<{base64: string, mimeType: string} | null>(null);
  const [generationWarning, setGenerationWarning] = useState<string | null>(null);
  const [showLogoOverlay, setShowLogoOverlay] = useState(false);
  const [uploadedLogos, setUploadedLogos] = useState<any[]>([]);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string>('');


  useEffect(() => {
    // If a visual exists, default to the edit tab
    if (post.visualUrl) {
      setActiveTab('edit');
    } else {
      setActiveTab('gen-image');
    }
    setPrompt(post.imagePrompt);
    setEditPrompt('');
    setError(null);
    setGenerationWarning(null);
    
    // Auto-select recommended aspect ratio based on platform
    const recommendedImage = getRecommendedAspectRatio(post.platform, 'image');
    const recommendedVideo = getRecommendedAspectRatio(post.platform, 'video');
    setAspectRatio(recommendedImage as any);
    setVideoAspectRatio(recommendedVideo as any);
    
    // Load uploaded logos
    assetStorage.getAssetsByType('logo').then(logos => {
      setUploadedLogos(logos);
      if (logos.length > 0) {
        setSelectedLogoUrl(logos[0].preview || logos[0].fileData);
      }
    }).catch(console.error);
  }, [post]);

  if (!isOpen) return null;

  const handleGenerateImage = async () => {
    setLoading('image');
    setError(null);
    setGenerationWarning(null);
    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      onUpdate({ visualUrl: imageUrl, visualType: 'image', videoOperation: undefined });
      onClose();
    } catch (e: any) {
      if (e.message && e.message.includes('Imagen / VEO access')) {
        setGenerationWarning(e.message);
      } else {
        setError(e.message || "Failed to generate image.");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateVideo = async () => {
    setLoading('video');
    setError(null);
    setGenerationWarning(null);
    try {
      if (typeof window !== 'undefined' && (window as any).aistudio && !await (window as any).aistudio.hasSelectedApiKey()) {
        await (window as any).aistudio.openSelectKey();
      }
      const { url, operation } = await generateVideo(prompt, videoAspectRatio);
      onUpdate({ visualUrl: url, visualType: 'video', videoOperation: operation });
      onClose();
    } catch (e: any) {
       if (e.message && e.message.includes('Imagen / VEO access')) {
        setGenerationWarning(e.message);
       } else if (e.message?.includes("not found")) {
        setError("API Key error. Please re-select your key via the dialog.");
       } else {
        setError(e.message || "Failed to generate video.");
       }
    } finally {
        setLoading(null);
    }
  };

  const handleEditImage = async () => {
    if (!post.visualUrl || !editedImageForUpload) return;
    setLoading('edit-image');
    setError(null);
    setGenerationWarning(null);
    try {
      const newImageUrl = await editImage(editedImageForUpload.base64, editedImageForUpload.mimeType, editPrompt);
      onUpdate({ visualUrl: newImageUrl, visualType: 'image' });
      onClose();
    } catch(e: any) {
      if (e.message && e.message.includes('Imagen / VEO access')) {
        setGenerationWarning(e.message);
      } else {
        setError(e.message || "Failed to edit image.");
      }
    } finally {
      setLoading(null);
    }
  };

  const handleExtendVideo = async () => {
    if (!post.videoOperation) return;
     setLoading('extend-video');
     setError(null);
     setGenerationWarning(null);
     try {
        if (typeof window !== 'undefined' && (window as any).aistudio && !await (window as any).aistudio.hasSelectedApiKey()) {
            await (window as any).aistudio.openSelectKey();
        }
        const { url, operation } = await extendVideo(post.videoOperation, editPrompt, videoAspectRatio);
        onUpdate({ visualUrl: url, visualType: 'video', videoOperation: operation });
        onClose();
     } catch (e: any) {
        if (e.message && e.message.includes('Imagen / VEO access')) {
            setGenerationWarning(e.message);
        } else if (e.message?.includes("not found")) {
            setError("API Key error. Please re-select your key via the dialog.");
        } else {
            setError(e.message || "Failed to extend video.");
        }
     } finally {
        setLoading(null);
     }
  };
  
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        onUpdate({ visualUrl: dataUrl, visualType: 'image', videoOperation: undefined });
        setEditedImageForUpload({ base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  }, [onUpdate]);

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: false,
    noKeyboard: false,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {}
  });

  const TabButton: React.FC<{ tabId: 'gen-image' | 'gen-video' | 'edit', label: string, disabled?: boolean }> = ({ tabId, label, disabled }) => (
    <button
      onClick={() => !disabled && setActiveTab(tabId)}
      disabled={disabled}
      className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${activeTab === tabId ? 'bg-green-500 text-black' : 'text-gray-300 bg-gray-800 hover:bg-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );

  const AspectRatioSelector: React.FC<{ 
    value: string, 
    onChange: (value: any) => void, 
    options: {value: string, label: string}[],
    platform: string,
    type: 'image' | 'video'
  }> = ({ value, onChange, options, platform, type }) => {
    const recommended = getRecommendedAspectRatio(platform, type);
    const platformConfig = PLATFORM_ASPECT_RATIOS[platform];
    
    return (
      <div className="space-y-2">
        {platformConfig && (
          <p className="text-xs text-gray-400">
            ✨ Recommended for {platform}: <span className="text-green-400 font-semibold">{recommended}</span>
            <span className="text-gray-500"> — {platformConfig.description}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2">
            {options.map(opt => {
              const isRecommended = opt.value === recommended;
              return (
                <button 
                  key={opt.value} 
                  onClick={() => onChange(opt.value)} 
                  className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                    value === opt.value 
                      ? 'bg-green-500 text-black ring-2 ring-green-400' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${isRecommended ? 'ring-1 ring-green-500/50' : ''}`}
                >
                  {opt.label}
                  {isRecommended && <span className="ml-1">⭐</span>}
                </button>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-3xl w-full p-6 m-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-xl font-bold text-white">Manage Visual Asset</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        <div className="flex space-x-2 border-b border-gray-700 pb-4 mb-4 flex-shrink-0 overflow-x-auto">
          <TabButton tabId="gen-image" label="Generate Image" />
          <TabButton tabId="gen-video" label="Generate Video" />
          <TabButton tabId="edit" label="Edit Visual" disabled={!post.visualUrl} />
          <TabButton tabId="add-logo" label="🎨 Add Logo" disabled={!post.visualUrl || uploadedLogos.length === 0} />
        </div>

        <div className="flex-grow overflow-y-auto">
          {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}
          {generationWarning && (
            <div className="bg-yellow-900/40 border border-yellow-500/60 text-yellow-200 p-3 rounded-md mb-4 text-sm">
              {generationWarning}
            </div>
          )}

          {activeTab === 'gen-image' && (
            loading === 'image' ? <LoadingSpinner message="Generating your image..." /> :
            <div className="space-y-4">
              <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Image Prompt</label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="w-full p-2 bg-gray-800 border-gray-600 rounded-md text-gray-200" />
              </div>
              <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Aspect Ratio</label>
                  <AspectRatioSelector 
                    value={aspectRatio} 
                    onChange={setAspectRatio} 
                    platform={post.platform}
                    type="image"
                    options={[
                      {value: '1:1', label: 'Square (1:1)'}, 
                      {value: '16:9', label: 'Horizontal (16:9)'}, 
                      {value: '9:16', label: 'Vertical (9:16)'}, 
                      {value: '4:3', label: 'Standard (4:3)'}, 
                      {value: '3:4', label: 'Portrait (3:4)'}
                    ]}
                  />
              </div>
              <button onClick={handleGenerateImage} className="w-full bg-green-500 text-black font-bold py-2 rounded-md">Generate Image</button>
            </div>
          )}

          {activeTab === 'gen-video' && (
             loading === 'video' ? <LoadingSpinner message="Generating your video..." /> :
            <div className="space-y-4">
              <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Video Prompt</label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="w-full p-2 bg-gray-800 border-gray-600 rounded-md text-gray-200" />
              </div>
              <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Aspect Ratio</label>
                  <AspectRatioSelector 
                    value={videoAspectRatio} 
                    onChange={setVideoAspectRatio}
                    platform={post.platform}
                    type="video" 
                    options={[
                      {value: '16:9', label: 'Horizontal (16:9)'}, 
                      {value: '9:16', label: 'Vertical (9:16)'}
                    ]} 
                  />
              </div>
              <button onClick={handleGenerateVideo} className="w-full bg-green-500 text-black font-bold py-2 rounded-md">Generate Video</button>
            </div>
          )}

          {activeTab === 'edit' && post.visualUrl && (
            post.visualType === 'image' ? (
                loading === 'edit-image' ? <LoadingSpinner message="Editing your image..." /> :
                <div className="space-y-4" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <label className="text-sm font-semibold text-gray-400 block">Current Image (drag to replace)</label>
                    <div className={`relative rounded-lg overflow-hidden border-2 border-dashed ${isDragActive ? 'border-green-500' : 'border-gray-700'}`}>
                        <img src={post.visualUrl} alt="current visual" className="w-full max-h-64 object-contain" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={openFileDialog} className="px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600">Upload new image</button>
                        {editedImageForUpload && <span className="text-xs text-gray-400">Replacement ready</span>}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-400 block mb-2">Edit Prompt</label>
                        <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="e.g., Make the sky purple." rows={3} className="w-full p-2 bg-gray-800 border-gray-600 rounded-md text-gray-200" />
                    </div>
                    <button onClick={handleEditImage} disabled={!editPrompt} className="w-full bg-green-500 text-black font-bold py-2 rounded-md disabled:bg-gray-600">Apply Edit</button>
                </div>
            ) : post.visualType === 'video' ? (
                 loading === 'extend-video' ? <LoadingSpinner message="Extending your video..." /> :
                 <div className="space-y-4">
                     <label className="text-sm font-semibold text-gray-400 block">Current Video</label>
                     <video src={post.visualUrl} controls muted loop className="w-full rounded-lg max-h-64" />
                     <div>
                         <label className="text-sm font-semibold text-gray-400 block mb-2">Extension Prompt</label>
                         <textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} placeholder="What happens next? e.g., The camera pans up to reveal a logo." rows={3} className="w-full p-2 bg-gray-800 border-gray-600 rounded-md text-gray-200" />
                     </div>
                     <button onClick={handleExtendVideo} disabled={!editPrompt} className="w-full bg-green-500 text-black font-bold py-2 rounded-md disabled:bg-gray-600">Extend Video (+7s)</button>
                 </div>
            ) : null
          )}

          {activeTab === 'add-logo' && post.visualUrl && (
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                <h4 className="text-blue-300 font-semibold mb-2">
                  📍 Add Your Brand Logo {post.visualType === 'video' && '(Video)'}
                </h4>
                <p className="text-sm text-gray-300">
                  {post.visualType === 'image' 
                    ? 'Automatically overlay your brand logo on this image. Perfect for maintaining brand consistency across all content.'
                    : 'Add your brand logo to this video with customizable timing and positioning. Choose from static watermark, intro/outro, or bookends.'}
                </p>
              </div>

              {uploadedLogos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No logos uploaded. Upload a logo in the Brand Assets section first.</p>
                </div>
              ) : (
                <>
                  {/* Logo Selection */}
                  {uploadedLogos.length > 1 && (
                    <div>
                      <label className="text-sm font-semibold text-gray-400 block mb-2">
                        Select Logo
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedLogos.map((logo) => (
                          <button
                            key={logo.id}
                            onClick={() => setSelectedLogoUrl(logo.preview || logo.fileData)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedLogoUrl === (logo.preview || logo.fileData)
                                ? 'border-green-500 ring-2 ring-green-400'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <img
                              src={logo.preview || logo.fileData}
                              alt={logo.name}
                              className="w-full h-full object-contain bg-gray-800"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview current media */}
                  <div>
                    <label className="text-sm font-semibold text-gray-400 block mb-2">
                      Current {post.visualType === 'image' ? 'Image' : 'Video'}
                    </label>
                    {post.visualType === 'image' ? (
                      <img
                        src={post.visualUrl}
                        alt="current"
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <video
                        src={post.visualUrl}
                        controls
                        loop
                        muted
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setShowLogoOverlay(true)}
                    disabled={!selectedLogoUrl}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🎨 Add Logo to {post.visualType === 'image' ? 'Image' : 'Video'}
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Logo Overlay Editor Modals */}
      {showLogoOverlay && post.visualUrl && selectedLogoUrl && post.visualType === 'image' && (
        <LogoOverlayEditor
          baseImageUrl={post.visualUrl}
          logoUrl={selectedLogoUrl}
          onApply={(modifiedImageUrl) => {
            onUpdate({ visualUrl: modifiedImageUrl });
            setShowLogoOverlay(false);
            onClose();
          }}
          onCancel={() => setShowLogoOverlay(false)}
        />
      )}

      {showLogoOverlay && post.visualUrl && selectedLogoUrl && post.visualType === 'video' && (
        <VideoLogoOverlayEditor
          baseVideoUrl={post.visualUrl}
          logoUrl={selectedLogoUrl}
          onApply={(modifiedVideoUrl) => {
            onUpdate({ visualUrl: modifiedVideoUrl });
            setShowLogoOverlay(false);
            onClose();
          }}
          onCancel={() => setShowLogoOverlay(false)}
        />
      )}
    </div>
  );
};

export default VisualAssetModal;
