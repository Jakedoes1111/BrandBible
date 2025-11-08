import React, { useState, useEffect } from 'react';
import { SocialMediaPost } from '../types';
import { generateImage, generateVideo, editImage, extendVideo } from '../services/geminiService';
import { useDropzone } from 'react-dropzone';


interface VisualAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: SocialMediaPost;
  onUpdate: (newVisualData: Partial<SocialMediaPost>) => void;
}

type LoadingState = 'image' | 'video' | 'edit-image' | 'extend-video' | null;

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center p-8">
        <svg className="animate-spin mx-auto h-8 w-8 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 font-semibold text-white">{message}</p>
        <p className="text-sm text-gray-400">This may take a few moments...</p>
    </div>
);


const VisualAssetModal: React.FC<VisualAssetModalProps> = ({ isOpen, onClose, post, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'gen-image' | 'gen-video' | 'edit'>('gen-image');
  const [prompt, setPrompt] = useState(post.imagePrompt);
  const [editPrompt, setEditPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('16:9');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState<LoadingState>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedImageForUpload, setEditedImageForUpload] = useState<{base64: string, mimeType: string} | null>(null);


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
  }, [post]);

  if (!isOpen) return null;

  const handleGenerateImage = async () => {
    setLoading('image');
    setError(null);
    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      onUpdate({ visualUrl: imageUrl, visualType: 'image', videoOperation: undefined });
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to generate image.");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateVideo = async () => {
    setLoading('video');
    setError(null);
    try {
      if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
        await window.aistudio.openSelectKey();
      }
      const { url, operation } = await generateVideo(prompt, videoAspectRatio);
      onUpdate({ visualUrl: url, visualType: 'video', videoOperation: operation });
      onClose();
    } catch (e: any) {
       setError(e.message.includes("not found") ? "API Key error. Please re-select your key via the dialog." : (e.message || "Failed to generate video."));
    } finally {
        setLoading(null);
    }
  };

  const handleEditImage = async () => {
    if (!post.visualUrl || !editedImageForUpload) return;
    setLoading('edit-image');
    setError(null);
    try {
      const newImageUrl = await editImage(editedImageForUpload.base64, editedImageForUpload.mimeType, editPrompt);
      onUpdate({ visualUrl: newImageUrl, visualType: 'image' });
      onClose();
    } catch(e: any) {
      setError(e.message || "Failed to edit image.");
    } finally {
      setLoading(null);
    }
  };

  const handleExtendVideo = async () => {
    if (!post.videoOperation) return;
     setLoading('extend-video');
     setError(null);
     try {
        if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
            await window.aistudio.openSelectKey();
        }
        const { url, operation } = await extendVideo(post.videoOperation, editPrompt, videoAspectRatio);
        onUpdate({ visualUrl: url, visualType: 'video', videoOperation: operation });
        onClose();
     } catch (e: any) {
        setError(e.message.includes("not found") ? "API Key error. Please re-select your key via the dialog." : (e.message || "Failed to extend video."));
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: !!post.visualUrl,
    noKeyboard: !!post.visualUrl,
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

  const AspectRatioSelector: React.FC<{ value: string, onChange: (value: any) => void, options: {value: string, label: string}[] }> = ({ value, onChange, options }) => (
    <div className="flex space-x-2">
        {options.map(opt => (
            <button key={opt.value} onClick={() => onChange(opt.value)} className={`px-3 py-1 text-xs rounded-md ${value === opt.value ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-300'}`}>
                {opt.label}
            </button>
        ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-3xl w-full p-6 m-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-xl font-bold text-white">Manage Visual Asset</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        <div className="flex space-x-2 border-b border-gray-700 pb-4 mb-4 flex-shrink-0">
          <TabButton tabId="gen-image" label="Generate Image" />
          <TabButton tabId="gen-video" label="Generate Video" />
          <TabButton tabId="edit" label="Edit Visual" disabled={!post.visualUrl} />
        </div>

        <div className="flex-grow overflow-y-auto">
          {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</div>}

          {activeTab === 'gen-image' && (
            loading === 'image' ? <LoadingSpinner message="Generating your image..." /> :
            <div className="space-y-4">
              <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Image Prompt</label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} className="w-full p-2 bg-gray-800 border-gray-600 rounded-md text-gray-200" />
              </div>
              <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Aspect Ratio</label>
                  <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} options={[
                      {value: '16:9', label: '16:9'}, {value: '1:1', label: '1:1'}, {value: '9:16', label: '9:16'}, {value: '4:3', label: '4:3'}, {value: '3:4', label: '3:4'}
                  ]}/>
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
                  <AspectRatioSelector value={videoAspectRatio} onChange={setVideoAspectRatio} options={[ {value: '16:9', label: '16:9'}, {value: '9:16', label: '9:16'} ]} />
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

        </div>
      </div>
    </div>
  );
};

export default VisualAssetModal;
