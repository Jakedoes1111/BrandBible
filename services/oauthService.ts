// Real OAuth Integration Service for Social Media Platforms

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  apiUrl: string;
}

export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export interface OAuthAccount {
  platform: string;
  userId: string;
  username: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  isConnected: boolean;
  profileData?: any;
}

class OAuthService {
  private configs: Record<string, OAuthConfig> = {};
  private accounts: Map<string, OAuthAccount> = new Map();

  constructor() {
    this.initializeConfigs();
    this.loadAccounts();
  }

  private initializeConfigs() {
    // Instagram (Facebook Graph API)
    this.configs.instagram = {
      clientId: process.env.INSTAGRAM_CLIENT_ID || '',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/auth/instagram/callback`,
      scopes: ['instagram_basic', 'pages_show_list', 'pages_read_engagement', 'instagram_content_publish'],
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      apiUrl: 'https://graph.facebook.com/v18.0'
    };

    // Twitter/X API v2
    this.configs.twitter = {
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/auth/twitter/callback`,
      scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      apiUrl: 'https://api.twitter.com/2'
    };

    // LinkedIn API
    this.configs.linkedin = {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/auth/linkedin/callback`,
      scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social', 'w_social'],
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      apiUrl: 'https://api.linkedin.com/v2'
    };

    // Facebook API
    this.configs.facebook = {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/auth/facebook/callback`,
      scopes: ['public_profile', 'pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
      apiUrl: 'https://graph.facebook.com/v12.0'
    };

    // TikTok (Note: TikTok's API is more restricted)
    this.configs.tiktok = {
      clientId: process.env.TIKTOK_CLIENT_ID || '',
      clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/auth/tiktok/callback`,
      scopes: ['user.info.basic', 'video.list'],
      authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
      apiUrl: 'https://open.tiktokapis.com/v2'
    };
  }

  private loadAccounts() {
    const stored = localStorage.getItem('oauth_accounts');
    if (stored) {
      const accountsData = JSON.parse(stored);
      accountsData.forEach((account: OAuthAccount) => {
        account.expiresAt = new Date(account.expiresAt);
        this.accounts.set(account.platform, account);
      });
    }
  }

  private saveAccounts() {
    const accountsData = Array.from(this.accounts.values());
    localStorage.setItem('oauth_accounts', JSON.stringify(accountsData));
  }

  // Generate OAuth Authorization URL
  getAuthUrl(platform: string): string {
    const config = this.configs[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not configured`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      state: this.generateState(platform)
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(platform: string, code: string, state: string): Promise<OAuthAccount> {
    const config = this.configs[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not configured`);
    }

    // Verify state
    const storedState = sessionStorage.getItem(`oauth_state_${platform}`);
    if (storedState !== state) {
      throw new Error('Invalid state parameter');
    }

    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code: code,
      grant_type: 'authorization_code'
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData: OAuthToken = await response.json();
    
    // Get user profile
    const profileData = await this.getUserProfile(platform, tokenData.access_token);

    const account: OAuthAccount = {
      platform,
      userId: profileData.id,
      username: profileData.username || profileData.name,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
      isConnected: true,
      profileData
    };

    this.accounts.set(platform, account);
    this.saveAccounts();
    
    return account;
  }

  // Get user profile from platform
  private async getUserProfile(platform: string, accessToken: string): Promise<any> {
    const config = this.configs[platform];
    
    switch (platform) {
      case 'instagram':
      case 'facebook':
        const fbResponse = await fetch(`${config.apiUrl}/me?fields=id,name,username&access_token=${accessToken}`);
        return await fbResponse.json();
        
      case 'twitter':
        const twitterResponse = await fetch(`${config.apiUrl}/users/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'BrandBibleGenerator/1.0'
          }
        });
        const userData = await twitterResponse.json();
        return {
          id: userData.data?.id,
          username: userData.data?.username,
          name: userData.data?.name
        };
        
      case 'linkedin':
        const linkedinResponse = await fetch(`${config.apiUrl}/people/~:(format=json)`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        return await linkedinResponse.json();
        
      case 'tiktok':
        const tiktokResponse = await fetch(`${config.apiUrl}/user/info/?fields=open_id,username,display_name&access_token=${accessToken}`);
        const tiktokData = await tiktokResponse.json();
        return {
          id: tiktokData.data?.user?.open_id,
          username: tiktokData.data?.user?.username,
          name: tiktokData.data?.user?.display_name
        };
        
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Refresh access token
  async refreshToken(platform: string): Promise<void> {
    const account = this.accounts.get(platform);
    if (!account || !account.refreshToken) {
      throw new Error(`No refresh token for ${platform}`);
    }

    const config = this.configs[platform];
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: account.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret
      }).toString()
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData: OAuthToken = await response.json();
    
    account.accessToken = tokenData.access_token;
    account.refreshToken = tokenData.refresh_token || account.refreshToken;
    account.expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));
    
    this.accounts.set(platform, account);
    this.saveAccounts();
  }

  // Check if token is expired and refresh if needed
  async ensureValidToken(platform: string): Promise<string> {
    const account = this.accounts.get(platform);
    if (!account) {
      throw new Error(`No account connected for ${platform}`);
    }

    if (Date.now() >= account.expiresAt.getTime() - 300000) { // Refresh 5 minutes before expiry
      await this.refreshToken(platform);
    }

    return this.accounts.get(platform)!.accessToken;
  }

  // Disconnect account
  disconnect(platform: string): void {
    this.accounts.delete(platform);
    this.saveAccounts();
  }

  // Get connected accounts
  getConnectedAccounts(): OAuthAccount[] {
    return Array.from(this.accounts.values());
  }

  // Check if platform is connected
  isConnected(platform: string): boolean {
    const account = this.accounts.get(platform);
    return account?.isConnected || false;
  }

  // Generate state parameter for OAuth
  private generateState(platform: string): string {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(`oauth_state_${platform}`, state);
    return state;
  }

  // Post to platform with real API
  async postToPlatform(platform: string, content: any): Promise<any> {
    const accessToken = await this.ensureValidToken(platform);
    const config = this.configs[platform];

    switch (platform) {
      case 'instagram':
        return await this.postToInstagram(accessToken, config.apiUrl, content);
      case 'twitter':
        return await this.postToTwitter(accessToken, config.apiUrl, content);
      case 'linkedin':
        return await this.postToLinkedIn(accessToken, config.apiUrl, content);
      case 'facebook':
        return await this.postToFacebook(accessToken, config.apiUrl, content);
      case 'tiktok':
        return await this.postToTikTok(accessToken, config.apiUrl, content);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async postToInstagram(accessToken: string, apiUrl: string, content: any): Promise<any> {
    const account = this.accounts.get('instagram')!;
    
    // First create media container
    const mediaResponse = await fetch(`${apiUrl}/${account.userId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: content.imageUrl,
        caption: content.caption,
        media_type: content.visualType === 'video' ? 'VIDEO' : 'IMAGE'
      })
    });

    const mediaData = await mediaResponse.json();
    
    // Then publish the media
    const publishResponse = await fetch(`${apiUrl}/${account.userId}/media_publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creation_id: mediaData.id
      })
    });

    return await publishResponse.json();
  }

  private async postToTwitter(accessToken: string, apiUrl: string, content: any): Promise<any> {
    const tweetData: any = {
      text: content.caption
    };

    if (content.imageUrl) {
      // First upload media
      const mediaResponse = await fetch(`${apiUrl}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media: content.imageUrl
        })
      });

      const mediaResult = await mediaResponse.json();
      tweetData.media = { media_ids: [mediaResult.media_id_string] };
    }

    const response = await fetch(`${apiUrl}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tweetData)
    });

    return await response.json();
  }

  private async postToLinkedIn(accessToken: string, apiUrl: string, content: any): Promise<any> {
    const account = this.accounts.get('linkedin')!;
    
    const postData: any = {
      author: `urn:li:person:${account.userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.caption
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (content.imageUrl) {
      const shareContent = postData.specificContent['com.linkedin.ugc.ShareContent'];
      shareContent.shareMediaCategory = 'IMAGE';
      shareContent.media = [{
        status: 'READY',
        description: {
          text: content.caption
        },
        media: content.imageUrl,
        title: {
          text: 'Shared via Brand Bible Generator'
        }
      }];
    }

    const response = await fetch(`${apiUrl}/ugShares`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    return await response.json();
  }

  private async postToFacebook(accessToken: string, apiUrl: string, content: any): Promise<any> {
    const account = this.accounts.get('facebook')!;
    
    const postData: any = {
      message: content.caption
    };

    if (content.imageUrl) {
      postData.url = content.imageUrl;
      postData.type = 'photo';
    }

    const response = await fetch(`${apiUrl}/${account.userId}/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    return await response.json();
  }

  private async postToTikTok(accessToken: string, apiUrl: string, content: any): Promise<any> {
    // TikTok API is more restricted - this is a simplified version
    const response = await fetch(`${apiUrl}/video/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_url: content.videoUrl,
        caption: content.caption
      })
    });

    return await response.json();
  }
}

export const oauthService = new OAuthService();
