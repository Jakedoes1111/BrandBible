import React, { useState, useEffect } from 'react';
import { oauthService, OAuthAccount } from '../services/oauthService';
import Spinner from './Spinner';

interface SocialMediaAuthProps {
  onAuthComplete?: (account: OAuthAccount) => void;
}

const SocialMediaAuth: React.FC<SocialMediaAuthProps> = ({ onAuthComplete }) => {
  const [connectedAccounts, setConnectedAccounts] = useState<OAuthAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnectedAccounts();
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const platform = urlParams.get('platform');
    
    if (code && state && platform) {
      handleOAuthCallback(platform, code, state);
    }
  }, []);

  const loadConnectedAccounts = () => {
    const accounts = oauthService.getConnectedAccounts();
    setConnectedAccounts(accounts);
  };

  const handleOAuthCallback = async (platform: string, code: string, state: string) => {
    try {
      setIsConnecting(platform);
      setError(null);
      
      const account = await oauthService.exchangeCodeForToken(platform, code, state);
      setConnectedAccounts(oauthService.getConnectedAccounts());
      
      if (onAuthComplete) {
        onAuthComplete(account);
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err: any) {
      setError(`Failed to connect ${platform}: ${err.message}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleConnect = async (platform: string) => {
    try {
      setIsConnecting(platform);
      setError(null);
      
      const authUrl = oauthService.getAuthUrl(platform);
      
      // Open popup for OAuth flow
      const popup = window.open(
        authUrl,
        'oauth_popup',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(null);
        }
      }, 1000);
      
      // Listen for messages from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin === window.location.origin) {
          const { type, platform: callbackPlatform, code, state } = event.data;
          
          if (type === 'oauth_callback' && callbackPlatform === platform) {
            clearInterval(checkClosed);
            popup?.close();
            handleOAuthCallback(platform, code, state);
            window.removeEventListener('message', messageListener);
          }
        }
      };
      
      window.addEventListener('message', messageListener);
    } catch (err: any) {
      setError(`Failed to start ${platform} authentication: ${err.message}`);
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (platform: string) => {
    try {
      oauthService.disconnect(platform);
      loadConnectedAccounts();
      setError(null);
    } catch (err: any) {
      setError(`Failed to disconnect ${platform}: ${err.message}`);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      case 'facebook': return '👍';
      case 'tiktok': return '🎵';
      default: return '📱';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-600';
      case 'twitter': return 'bg-blue-500';
      case 'linkedin': return 'bg-blue-700';
      case 'facebook': return 'bg-blue-600';
      case 'tiktok': return 'bg-black';
      default: return 'bg-gray-600';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'Instagram';
      case 'twitter': return 'Twitter/X';
      case 'linkedin': return 'LinkedIn';
      case 'facebook': return 'Facebook';
      case 'tiktok': return 'TikTok';
      default: return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', description: 'Connect your Instagram Business account' },
    { id: 'twitter', name: 'Twitter/X', description: 'Connect your Twitter account' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Connect your LinkedIn profile' },
    { id: 'facebook', name: 'Facebook', description: 'Connect your Facebook page' },
    { id: 'tiktok', name: 'TikTok', description: 'Connect your TikTok account' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-2">Connect Social Media Accounts</h3>
        <p className="text-gray-400 text-sm">
          Connect your accounts to enable direct posting and analytics
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const isConnected = oauthService.isConnected(platform.id);
          const account = connectedAccounts.find(acc => acc.platform === platform.id);
          const isConnectingThis = isConnecting === platform.id;

          return (
            <div
              key={platform.id}
              className={`border rounded-lg p-4 transition-all ${
                isConnected
                  ? 'border-green-600 bg-green-900/10'
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPlatformIcon(platform.id)}</span>
                  <div>
                    <h4 className="font-medium text-white">{platform.name}</h4>
                    <p className="text-xs text-gray-400">{platform.description}</p>
                  </div>
                </div>
                {isConnected && (
                  <span className="text-green-400 text-sm">✓ Connected</span>
                )}
              </div>

              {isConnected && account ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>{account.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Connected {account.expiresAt.toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform.id)}
                  disabled={isConnectingThis}
                  className={`w-full px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    isConnectingThis
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : `${getPlatformColor(platform.id)} text-white hover:opacity-90`
                  }`}
                >
                  {isConnectingThis ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner className="h-4 w-4" title="Connecting account" />
                      Connecting...
                    </span>
                  ) : (
                    `Connect ${platform.name}`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Secure OAuth Authentication</p>
            <p className="text-blue-200/70">
              Your accounts are connected using industry-standard OAuth 2.0 with secure token storage. 
              We never store your passwords and only request necessary permissions for posting and analytics.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Need to configure API credentials? Check your environment variables for client IDs and secrets.
        </p>
      </div>
    </div>
  );
};

export default SocialMediaAuth;
