/**
 * Input Validation Service
 * Validates and sanitizes user inputs to prevent security issues
 */

import { ValidationError } from './errorHandler';

/**
 * Validate mission statement input
 */
export function validateMissionStatement(mission: string): string {
  if (!mission || typeof mission !== 'string') {
    throw new ValidationError('Mission statement is required');
  }

  const trimmed = mission.trim();

  if (trimmed.length < 10) {
    throw new ValidationError('Mission statement must be at least 10 characters long');
  }

  if (trimmed.length > 5000) {
    throw new ValidationError('Mission statement must not exceed 5000 characters');
  }

  // Remove potentially harmful content
  const sanitized = trimmed
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '');

  return sanitized;
}

/**
 * Validate image prompt
 */
export function validateImagePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') {
    throw new ValidationError('Image prompt is required');
  }

  const trimmed = prompt.trim();

  if (trimmed.length < 3) {
    throw new ValidationError('Image prompt must be at least 3 characters long');
  }

  if (trimmed.length > 4000) {
    throw new ValidationError('Image prompt must not exceed 4000 characters');
  }

  return trimmed;
}

/**
 * Validate chat message
 */
export function validateChatMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    throw new ValidationError('Message is required');
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    throw new ValidationError('Message cannot be empty');
  }

  if (trimmed.length > 2000) {
    throw new ValidationError('Message must not exceed 2000 characters');
  }

  return trimmed;
}

/**
 * Validate aspect ratio
 */
export function validateAspectRatio(ratio: string): '1:1' | '16:9' | '9:16' | '4:3' | '3:4' {
  const validRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'] as const;
  
  if (!validRatios.includes(ratio as any)) {
    throw new ValidationError(`Invalid aspect ratio. Must be one of: ${validRatios.join(', ')}`);
  }

  return ratio as '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

/**
 * Validate model name
 */
export function validateModelName(model: string): string {
  if (!model || typeof model !== 'string') {
    throw new ValidationError('Model name is required');
  }

  // Basic validation - allow alphanumeric, hyphens, dots
  if (!/^[a-zA-Z0-9\-\.]+$/.test(model)) {
    throw new ValidationError('Invalid model name format');
  }

  return model;
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'untitled';
  }

  // Remove path traversal attempts and invalid characters
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\.\./g, '')
    .trim()
    .slice(0, 255) || 'untitled';
}

/**
 * Validate URL
 */
export function validateUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('URL is required');
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new ValidationError('Only HTTP and HTTPS URLs are allowed');
    }

    return url;
  } catch {
    throw new ValidationError('Invalid URL format');
  }
}

/**
 * Validate email
 */
export function validateEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  return email.toLowerCase().trim();
}

/**
 * Validate hex color
 */
export function validateHexColor(color: string): string {
  if (!color || typeof color !== 'string') {
    throw new ValidationError('Color is required');
  }

  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  if (!hexRegex.test(color)) {
    throw new ValidationError('Invalid hex color format. Must be #RGB or #RRGGBB');
  }

  return color.toUpperCase();
}
