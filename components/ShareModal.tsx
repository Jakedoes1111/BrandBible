import React, { useState, useEffect } from 'react';
import { SocialMediaPost, PostResult } from '../types';
import { socialMediaService } from '../services/socialMediaService';
import SocialMediaAuth from './SocialMediaAuth';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: SocialMediaPost;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post }) => {
  const [textCopied, setTextCopied] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [postingTo, setPostingTo] = useState<string | null>(null);
  const [postResults, setPostResults] = useState<{ [key: string]: PostResult }>({});
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const accounts = socialMediaService.getConnectedAccounts().map(acc => acc.platform);
      setConnectedAccounts(accounts);
      setPostResults({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fullText = `${post.headline}\n\n${post.body}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullText);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  const handleDirectPost = async (platform: string) => {
    setPostingTo(platform);
    setPostResults(prev => ({ ...prev, [platform]: { success: false, error: null } }));

    try {
      let result: PostResult;
      const caption = `${post.headline}\n\n${post.body}`;

      switch (platform) {
        case 'instagram':
          if (!post.visualUrl) {
            result = { success: false, error: 'Instagram requires an image or video' };
            break;
          }
          result = await socialMediaService.postToInstagram(post.visualUrl, caption);
          break;
        case 'twitter':
          result = await socialMediaService.postToTwitter(caption, post.visualUrl);
          break;
        case 'linkedin':
          result = await socialMediaService.postToLinkedIn(caption, post.visualUrl);
          break;
        case 'facebook':
          result = await socialMediaService.postToFacebook(caption, post.visualUrl);
          break;
        case 'tiktok':
          if (!post.visualUrl || post.visualType !== 'video') {
            result = { success: false, error: 'TikTok requires video content' };
            break;
          }
          result = await socialMediaService.postToTikTok(post.visualUrl, caption);
          break;
        default:
          result = { success: false, error: 'Unsupported platform' };
      }

      setPostResults(prev => ({ ...prev, [platform]: result }));
    } catch (error) {
      setPostResults(prev => ({ 
        ...prev, 
        [platform]: { success: false, error: 'Failed to post. Please try again.' }
      }));
    } finally {
      setPostingTo(null);
    }
  };

  const handleAuthComplete = () => {
    const accounts = socialMediaService.getConnectedAccounts().map(acc => acc.platform);
    setConnectedAccounts(accounts);
    setShowAuth(false);
  };
  
  const getPlatformDetails = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('instagram')) return { name: 'Instagram', url: 'https://www.instagram.com', icon: '📷' };
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x')) return { name: 'X (Twitter)', url: 'https://twitter.com/compose/post', icon: '🐦' };
    if (lowerPlatform.includes('linkedin')) return { name: 'LinkedIn', url: 'https://www.linkedin.com/feed/?shareActive=true', icon: '💼' };
    if (lowerPlatform.includes('facebook')) return { name: 'Facebook', url: 'https://www.facebook.com', icon: '👍' };
    if (lowerPlatform.includes('tiktok')) return { name: 'TikTok', url: 'https://www.tiktok.com', icon: '🎵' };
    return { name: 'Social Media', url: '#', icon: '🌐' };
  };
  
  const platformDetails = getPlatformDetails(post.platform);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-3xl w-full p-6 m-4 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-white">Share Your Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        {showAuth ? (
          <SocialMediaAuth onAuthComplete={handleAuthComplete} />
        ) : (
          <div className="flex-grow overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {post.visualUrl && (
                <div className="flex flex-col items-center">
                  {post.visualType === 'image' ? (
                    <img src={post.visualUrl} alt="Post visual" className="rounded-lg w-full object-contain max-h-64 mb-4" />
                  ) : (
                    <video src={post.visualUrl} controls muted loop className="rounded-lg w-full max-h-64 mb-4" />
                  )}
                  <a 
                    href={post.visualUrl} 
                    download={`brand-visual-${Date.now()}`}
                    className="w-full text-center bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Visual
                  </a>
                </div>
              )}
              <div className="flex flex-col">
                <textarea
                  readOnly
                  value={fullText}
                  rows={post.visualUrl ? 8 : 12}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm mb-4"
                />
                <button 
                  onClick={handleCopyText}
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  {textCopied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Direct Posting</h4>
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm text-green-400 hover:text-green-300 transition-colors"
                >
                  Manage Accounts →
                </button>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok'].map((platform) => {
                  const isConnected = connectedAccounts.includes(platform);
                  const result = postResults[platform];
                  const isPosting = postingTo === platform;
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => isConnected ? handleDirectPost(platform) : setShowAuth(true)}
                      disabled={isPosting}
                      className={`p-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        isConnected
                          ? result?.success
                            ? 'bg-green-600 text-white'
                            : result?.error
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      } disabled:opacity-50`}
                    >
                      <span className="text-lg">{getPlatformDetails(platform).icon}</span>
                      {isPosting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Posting...
                        </span>
                      ) : result?.success ? (
                        'Posted ✓'
                      ) : result?.error ? (
                        'Failed ✗'
                      ) : isConnected ? (
                        `Post to ${getPlatformDetails(platform).name}`
                      ) : (
                        'Connect First'
                      )}
                    </button>
                  );
                })}
              </div>
              
              {Object.values(postResults).some((result: any) => result?.success || result?.error) && (
                <div className="mt-4 space-y-2">
                  {Object.entries(postResults).map(([platform, result]: [string, any]) => (
                    result && (result.success || result.error) && (
                      <div key={platform} className={`p-3 rounded-lg text-sm ${
                        result.success 
                          ? 'bg-green-900/30 border border-green-700/50 text-green-300' 
                          : 'bg-red-900/30 border border-red-700/50 text-red-300'
                      }`}>
                        {result.success ? (
                          <div>
                            <strong>✓ Posted to {getPlatformDetails(platform).name}</strong>
                            {result.postUrl && (
                              <a href={result.postUrl} target="_blank" rel="noopener noreferrer" className="block mt-1 text-blue-300 hover:text-blue-200">
                                View Post →
                              </a>
                            )}
                          </div>
                        ) : (
                          <div>
                            <strong>✗ Failed to post to {getPlatformDetails(platform).name}</strong>
                            <div className="text-xs mt-1">{result.error}</div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 pt-4">
              <a
                href={platformDetails.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Manual Post to {platformDetails.name}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
