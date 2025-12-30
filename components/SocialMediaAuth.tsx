import React, { useState, useEffect } from 'react';
import { socialMediaService } from '../services/socialMediaService';
import Spinner from './Spinner';
import { SocialMediaAccount } from '../types';

interface SocialMediaAuthProps {
  onAuthComplete?: () => void;
}

const SocialMediaAuth: React.FC<SocialMediaAuthProps> = ({ onAuthComplete }) => {
  const [connectedAccounts, setConnectedAccounts] = useState<SocialMediaAccount[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    setConnectedAccounts(socialMediaService.getConnectedAccounts());
  }, []);

  const handleConnect = async (platform: string) => {
    setIsLoading(platform);
    try {
      let account: SocialMediaAccount;
      
      switch (platform) {
        case 'instagram':
          account = await socialMediaService.connectInstagram();
          break;
        case 'twitter':
          account = await socialMediaService.connectTwitter();
          break;
        case 'linkedin':
          account = await socialMediaService.connectLinkedIn();
          break;
        case 'facebook':
          account = await socialMediaService.connectFacebook();
          break;
        case 'tiktok':
          account = await socialMediaService.connectTikTok();
          break;
        default:
          throw new Error('Unknown platform');
      }
      
      setConnectedAccounts(socialMediaService.getConnectedAccounts());
      onAuthComplete?.();
    } catch (error) {
      console.error(`Failed to connect to ${platform}:`, error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleDisconnect = (platform: string) => {
    socialMediaService.disconnectAccount(platform);
    setConnectedAccounts(socialMediaService.getConnectedAccounts());
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'facebook': return '👍';
      case 'tiktok': return '🎵';
      default: return '🌐';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-600 hover:bg-pink-700';
      case 'twitter': return 'bg-blue-500 hover:bg-blue-600';
      case 'linkedin': return 'bg-blue-700 hover:bg-blue-800';
      case 'facebook': return 'bg-blue-600 hover:bg-blue-700';
      case 'tiktok': return 'bg-black hover:bg-gray-900';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'twitter', name: 'Twitter/X' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'tiktok', name: 'TikTok' }
  ];

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Connect Social Media Accounts</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const isConnected = connectedAccounts.some(acc => acc.platform === platform.id);
          
          return (
            <div
              key={platform.id}
              className="bg-gray-800/50 border border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getPlatformIcon(platform.id)}</span>
                  <div>
                    <h4 className="font-semibold text-white">{platform.name}</h4>
                    <p className="text-sm text-gray-400">
                      {isConnected ? `Connected as @${connectedAccounts.find(acc => acc.platform === platform.id)?.username}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {isConnected ? (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-green-400 mr-3">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-400 mr-3">Disconnected</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => isConnected ? handleDisconnect(platform.id) : handleConnect(platform.id)}
                disabled={isLoading === platform.id}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  isConnected
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : `${getPlatformColor(platform.id)} text-white`
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading === platform.id ? (
                  <span className="flex items-center justify-center">
                    <Spinner className="-ml-1 mr-3 h-4 w-4 text-white" title="Connecting account" />
                    Connecting...
                  </span>
                ) : isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> This is a demo implementation. In production, you would need to register your app with each social media platform and implement proper OAuth authentication.
        </p>
      </div>
    </div>
  );
};

export default SocialMediaAuth;
