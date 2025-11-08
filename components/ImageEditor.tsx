import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { editImage } from '../services/geminiService';
import { MediaFile } from '../types';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<MediaFile | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        setOriginalImage({
          file,
          preview: URL.createObjectURL(file),
          base64: base64,
          type: fileType,
        });
        setEditedImage(null);
        setError(null);
        setPrompt('');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: false,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {}
  });

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) {
        setError('Please upload an image or video and provide an editing prompt.');
        return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
        const result = await editImage(originalImage.base64, originalImage.file.type, prompt);
        setEditedImage(result);
    } catch(e) {
        console.error(e);
        setError('Failed to edit media. Please try a different prompt or file.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
    setIsLoading(false);
  };
  
  if (!originalImage) {
    return (
      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-green-500 bg-green-900/20' : 'border-gray-600 hover:border-green-500'}`}>
        <input {...getInputProps()} />
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-200">
          {isDragActive ? 'Drop the image or video here ...' : 'Drag & drop an image or video, or click to select'}
        </p>
        <p className="mt-1 text-sm text-gray-400">PNG, JPG, GIF, WEBP, MP4, MOV, AVI, WEBM supported</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Media Editor</h2>
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 rounded-lg shadow-2xl shadow-black/30">
           <div className="mb-6">
            <label htmlFor="prompt" className="block text-lg font-bold mb-2 text-white">1. Your Original Media</label>
             {originalImage.type === 'image' ? (
               <img src={originalImage.preview} alt="Original" className="rounded-lg w-full object-contain max-h-96" />
             ) : (
               <video src={originalImage.preview} controls className="rounded-lg w-full object-contain max-h-96" />
             )}
           </div>
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-lg font-bold mb-2 text-white">2. Describe Your Edit</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Change the background to a sunny beach with palm trees."
              className="w-full h-24 p-3 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all text-gray-200 placeholder:text-gray-500"
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-4">
             <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className="flex-1 bg-green-400 text-black font-bold py-3 px-4 rounded-md hover:bg-green-500 disabled:bg-green-900 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : 'Generate Edit'}
            </button>
             <button
                onClick={handleStartOver}
                className="bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Start Over
            </button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">3. Edited Media</h2>
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 p-6 rounded-lg shadow-2xl shadow-black/30 aspect-square flex items-center justify-center">
            {isLoading && (
                <div className="w-full h-full bg-gray-800/50 rounded-lg animate-pulse"></div>
            )}
            {error && !isLoading && (
                 <div className="text-center text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 font-medium">{error}</p>
                 </div>
            )}
            {editedImage && !isLoading && (
                <div>
                    {originalImage.type === 'image' ? (
                      <img src={editedImage} alt="Edited" className="rounded-lg w-full object-contain max-h-[500px]" />
                    ) : (
                      <video src={editedImage} controls className="rounded-lg w-full object-contain max-h-[500px]" />
                    )}
                     <a
                        href={editedImage}
                        download={`edited-media-${Date.now()}.${originalImage.type === 'image' ? 'png' : 'mp4'}`}
                        className="mt-4 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                        Download {originalImage.type === 'image' ? 'Image' : 'Video'}
                    </a>
                </div>
            )}
            {!editedImage && !isLoading && !error && (
                 <div className="text-center text-gray-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                     </svg>
                    <p className="mt-2 font-medium">Your edited media will appear here.</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;