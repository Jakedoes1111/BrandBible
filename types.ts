// Define all shared types for the application.

export interface Color {
  hex: string;
  name: string;
  usage: string;
}

export interface FontPairing {
  header: string;
  body: string;
  notes: string;
}

export interface SocialMediaPost {
  platform: string;
  headline: string;
  body: string;
  imagePrompt: string;
  visualUrl?: string;
  visualType?: 'image' | 'video';
  videoOperation?: any; // To store the result from a VEO generation for extensions
}

export interface BrandIdentity {
  colorPalette: Color[];
  fontPairings: FontPairing;
  socialMediaPosts: SocialMediaPost[];
}

export interface GeneratedImages {
  primaryLogoUrl: string;
  secondaryMarkUrls: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Social Media Integration Types
export interface SocialMediaAccount {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok';
  accessToken: string;
  userId: string;
  username: string;
  isConnected: boolean;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface MediaFile {
  file: File;
  preview: string;
  base64: string;
  type: 'image' | 'video';
}