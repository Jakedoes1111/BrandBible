import React, { useState } from 'react';
import { SocialMediaPost, Color, FontPairing } from '../types';
import VisualAssetModal from './VisualAssetModal';
import ShareModal from './ShareModal'; // Import the new ShareModal

interface SocialMediaTemplatesProps {
  posts: SocialMediaPost[];
  colors: Color[];
  fonts: FontPairing;
  logoUrl: string;
  onVisualUpdate: (postIndex: number, newVisualData: Partial<SocialMediaPost>) => void;
}

const SocialMediaTemplates: React.FC<SocialMediaTemplatesProps> = ({ posts, colors, fonts, onVisualUpdate }) => {
  const [visualModalState, setVisualModalState] = useState<{ isOpen: boolean; postIndex: number | null }>({ isOpen: false, postIndex: null });
  const [shareModalState, setShareModalState] = useState<{ isOpen: boolean; post: SocialMediaPost | null }>({ isOpen: false, post: null });


  const handleOpenVisualModal = (index: number) => {
    setVisualModalState({ isOpen: true, postIndex: index });
  };

  const handleCloseVisualModal = () => {
    setVisualModalState({ isOpen: false, postIndex: null });
  };
  
  const handleOpenShareModal = (post: SocialMediaPost) => {
    setShareModalState({ isOpen: true, post: post });
  };

  const handleCloseShareModal = () => {
    setShareModalState({ isOpen: false, post: null });
  };


  const handleUpdateVisual = (newVisualData: Partial<SocialMediaPost>) => {
    if (visualModalState.postIndex !== null) {
      onVisualUpdate(visualModalState.postIndex, newVisualData);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('instagram')) return '📷';
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x')) return '🐦';
    if (lowerPlatform.includes('linkedin')) return '💼';
    if (lowerPlatform.includes('facebook')) return '👍';
    return '🌐';
  };

  const primaryColor = colors.find(c => c.usage.toLowerCase().includes('primary'))?.hex || '#ffffff';

  const selectedPostForVisuals = visualModalState.postIndex !== null ? posts[visualModalState.postIndex] : null;

  return (
    <section>
      <h3 className="text-xl font-bold text-white mb-4">Social Media Content Planner</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {posts.map((post, index) => (
          <div key={index} className="bg-black/20 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg flex flex-col">
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">{getPlatformIcon(post.platform)}</span>
                    <h4 className="text-lg font-bold text-white" style={{ fontFamily: `'${fonts.header}', sans-serif` }}>
                      {post.platform} Post Idea
                    </h4>
                </div>
                <button 
                  onClick={() => handleOpenShareModal(post)}
                  disabled={!post.visualUrl}
                  className="bg-green-500 text-black font-bold py-2 px-4 rounded-md text-sm flex items-center gap-2 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-400">Headline:</p>
                  <p className="text-white" style={{ fontFamily: `'${fonts.header}', sans-serif`, color: primaryColor }}>
                    {post.headline}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400">Body:</p>
                  <p className="text-gray-300" style={{ fontFamily: `'${fonts.body}', sans-serif` }}>
                    {post.body}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-black/20">
              <p className="text-sm font-semibold text-gray-400 mb-2">Visual Content</p>
              <div 
                className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center text-center p-4 border border-gray-700 relative group cursor-pointer"
                onClick={() => handleOpenVisualModal(index)}
              >
                 {post.visualUrl && post.visualType === 'image' && (
                   <img src={post.visualUrl} alt="Generated visual" className="w-full h-full object-cover rounded-md" />
                 )}
                 {post.visualUrl && post.visualType === 'video' && (
                    <video src={post.visualUrl} controls autoPlay muted loop className="w-full h-full object-cover rounded-md" />
                 )}
                 {!post.visualUrl && (
                    <div className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs mt-2">No visual generated</p>
                    </div>
                 )}
                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-green-500 text-black font-bold py-2 px-4 rounded-md">
                        Manage Visual
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visualModalState.isOpen && selectedPostForVisuals && (
        <VisualAssetModal
          isOpen={visualModalState.isOpen}
          onClose={handleCloseVisualModal}
          post={selectedPostForVisuals}
          onUpdate={handleUpdateVisual}
        />
      )}
      {shareModalState.isOpen && shareModalState.post && (
        <ShareModal
          isOpen={shareModalState.isOpen}
          onClose={handleCloseShareModal}
          post={shareModalState.post}
        />
      )}
    </section>
  );
};

export default SocialMediaTemplates;