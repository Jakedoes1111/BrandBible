// Template Library - Industry-specific brand presets
import { Color, FontPairing } from '../types';

export interface BrandTemplate {
  id: string;
  name: string;
  category: 'tech' | 'healthcare' | 'food' | 'fashion' | 'education' | 'finance' | 'creative' | 'eco' | 'sports' | 'hospitality';
  description: string;
  preview: string;
  colorPalette: Color[];
  fontPairings: FontPairing;
  brandArchetype: string;
  tone: string[];
  keywords: string[];
  popularFor: string[];
}

export const templateLibrary: BrandTemplate[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    category: 'tech',
    description: 'Modern, innovative, and forward-thinking brand identity for technology companies',
    preview: '🚀',
    colorPalette: [
      { hex: '#0066FF', name: 'Primary Blue', usage: 'Primary' },
      { hex: '#00D4FF', name: 'Cyan', usage: 'Accent' },
      { hex: '#1E3A8A', name: 'Dark Blue', usage: 'Text' },
      { hex: '#F0F9FF', name: 'Sky Blue', usage: 'Background' },
      { hex: '#1F2937', name: 'Charcoal', usage: 'Secondary Text' },
    ],
    fontPairings: {
      header: 'Inter',
      body: 'Roboto',
      notes: 'Modern, clean sans-serif fonts that convey innovation and clarity',
    },
    brandArchetype: 'Innovator',
    tone: ['Innovative', 'Professional', 'Forward-thinking', 'Clear'],
    keywords: ['technology', 'innovation', 'modern', 'software', 'digital'],
    popularFor: ['SaaS companies', 'Startups', 'Tech platforms', 'Apps'],
  },
  {
    id: 'luxury-fashion',
    name: 'Luxury Fashion',
    category: 'fashion',
    description: 'Elegant, sophisticated, and timeless for high-end fashion brands',
    preview: '👗',
    colorPalette: [
      { hex: '#1A1A1A', name: 'Black', usage: 'Primary' },
      { hex: '#D4AF37', name: 'Gold', usage: 'Accent' },
      { hex: '#C0C0C0', name: 'Silver', usage: 'Secondary' },
      { hex: '#FFFFFF', name: 'White', usage: 'Background' },
      { hex: '#4A4A4A', name: 'Charcoal Gray', usage: 'Text' },
    ],
    fontPairings: {
      header: 'Playfair Display',
      body: 'Helvetica Neue',
      notes: 'Classic serif paired with clean sans-serif for timeless elegance',
    },
    brandArchetype: 'Sophisticate',
    tone: ['Elegant', 'Exclusive', 'Refined', 'Luxurious'],
    keywords: ['luxury', 'fashion', 'elegant', 'premium', 'high-end'],
    popularFor: ['Fashion brands', 'Jewelry', 'Luxury goods', 'Boutiques'],
  },
  {
    id: 'organic-food',
    name: 'Organic & Natural',
    category: 'food',
    description: 'Earthy, authentic, and sustainable for organic and natural brands',
    preview: '🌱',
    colorPalette: [
      { hex: '#2D5016', name: 'Forest Green', usage: 'Primary' },
      { hex: '#7CB342', name: 'Leaf Green', usage: 'Accent' },
      { hex: '#A8DADC', name: 'Seafoam', usage: 'Secondary' },
      { hex: '#F1FAEE', name: 'Cream', usage: 'Background' },
      { hex: '#3D3D3D', name: 'Earth Brown', usage: 'Text' },
    ],
    fontPairings: {
      header: 'Montserrat',
      body: 'Open Sans',
      notes: 'Friendly, approachable fonts that feel natural and organic',
    },
    brandArchetype: 'Caregiver',
    tone: ['Natural', 'Authentic', 'Caring', 'Transparent'],
    keywords: ['organic', 'natural', 'sustainable', 'eco-friendly', 'healthy'],
    popularFor: ['Food brands', 'Health products', 'Sustainability', 'Wellness'],
  },
  {
    id: 'playful-creative',
    name: 'Playful & Creative',
    category: 'creative',
    description: 'Fun, energetic, and imaginative for creative businesses',
    preview: '🎨',
    colorPalette: [
      { hex: '#FF6B6B', name: 'Coral Red', usage: 'Primary' },
      { hex: '#4ECDC4', name: 'Teal', usage: 'Accent' },
      { hex: '#45B7D1', name: 'Sky Blue', usage: 'Secondary' },
      { hex: '#F7DC6F', name: 'Sunshine Yellow', usage: 'Highlight' },
      { hex: '#2C3E50', name: 'Navy', usage: 'Text' },
    ],
    fontPairings: {
      header: 'Fredoka One',
      body: 'Nunito',
      notes: 'Rounded, friendly fonts that convey creativity and approachability',
    },
    brandArchetype: 'Creator',
    tone: ['Fun', 'Energetic', 'Imaginative', 'Approachable'],
    keywords: ['creative', 'playful', 'fun', 'artistic', 'colorful'],
    popularFor: ['Design studios', 'Kids products', 'Entertainment', 'Creative services'],
  },
  {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    category: 'finance',
    description: 'Trustworthy, reliable, and established for corporate brands',
    preview: '💼',
    colorPalette: [
      { hex: '#2C3E50', name: 'Navy Blue', usage: 'Primary' },
      { hex: '#34495E', name: 'Slate', usage: 'Secondary' },
      { hex: '#95A5A6', name: 'Silver Gray', usage: 'Accent' },
      { hex: '#ECF0F1', name: 'Light Gray', usage: 'Background' },
      { hex: '#1A252F', name: 'Dark Blue', usage: 'Text' },
    ],
    fontPairings: {
      header: 'Arial',
      body: 'Georgia',
      notes: 'Classic, professional fonts that convey trust and reliability',
    },
    brandArchetype: 'Ruler',
    tone: ['Professional', 'Trustworthy', 'Reliable', 'Established'],
    keywords: ['corporate', 'professional', 'business', 'finance', 'consulting'],
    popularFor: ['Financial services', 'Law firms', 'Consulting', 'B2B companies'],
  },
  {
    id: 'healthcare-wellness',
    name: 'Healthcare & Wellness',
    category: 'healthcare',
    description: 'Calming, caring, and professional for healthcare brands',
    preview: '⚕️',
    colorPalette: [
      { hex: '#0891B2', name: 'Medical Teal', usage: 'Primary' },
      { hex: '#10B981', name: 'Health Green', usage: 'Accent' },
      { hex: '#E0F2FE', name: 'Calm Blue', usage: 'Background' },
      { hex: '#1E3A8A', name: 'Navy', usage: 'Text' },
      { hex: '#6366F1', name: 'Indigo', usage: 'Secondary' },
    ],
    fontPairings: {
      header: 'Lato',
      body: 'Source Sans Pro',
      notes: 'Clean, readable fonts that feel professional and caring',
    },
    brandArchetype: 'Caregiver',
    tone: ['Caring', 'Professional', 'Trustworthy', 'Calming'],
    keywords: ['healthcare', 'medical', 'wellness', 'health', 'care'],
    popularFor: ['Hospitals', 'Clinics', 'Wellness centers', 'Health apps'],
  },
  {
    id: 'education-learning',
    name: 'Education & Learning',
    category: 'education',
    description: 'Friendly, inspiring, and accessible for educational brands',
    preview: '📚',
    colorPalette: [
      { hex: '#3B82F6', name: 'Bright Blue', usage: 'Primary' },
      { hex: '#F59E0B', name: 'Amber', usage: 'Accent' },
      { hex: '#10B981', name: 'Success Green', usage: 'Secondary' },
      { hex: '#FEF3C7', name: 'Warm Yellow', usage: 'Background' },
      { hex: '#1F2937', name: 'Charcoal', usage: 'Text' },
    ],
    fontPairings: {
      header: 'Poppins',
      body: 'Lato',
      notes: 'Friendly, modern fonts that feel accessible and encouraging',
    },
    brandArchetype: 'Sage',
    tone: ['Inspiring', 'Friendly', 'Educational', 'Encouraging'],
    keywords: ['education', 'learning', 'teaching', 'school', 'training'],
    popularFor: ['Schools', 'E-learning', 'Training platforms', 'Educational apps'],
  },
  {
    id: 'fitness-sports',
    name: 'Fitness & Sports',
    category: 'sports',
    description: 'Energetic, bold, and motivating for fitness brands',
    preview: '💪',
    colorPalette: [
      { hex: '#DC2626', name: 'Energy Red', usage: 'Primary' },
      { hex: '#1F2937', name: 'Black', usage: 'Secondary' },
      { hex: '#F97316', name: 'Orange', usage: 'Accent' },
      { hex: '#FAFAFA', name: 'White', usage: 'Background' },
      { hex: '#EF4444', name: 'Bright Red', usage: 'Highlight' },
    ],
    fontPairings: {
      header: 'Oswald',
      body: 'Roboto',
      notes: 'Bold, strong fonts that convey energy and motivation',
    },
    brandArchetype: 'Hero',
    tone: ['Energetic', 'Motivating', 'Bold', 'Strong'],
    keywords: ['fitness', 'sports', 'athletic', 'training', 'performance'],
    popularFor: ['Gyms', 'Sports brands', 'Fitness apps', 'Athletic wear'],
  },
  {
    id: 'restaurant-food',
    name: 'Restaurant & Culinary',
    category: 'food',
    description: 'Appetizing, warm, and inviting for food and beverage brands',
    preview: '🍽️',
    colorPalette: [
      { hex: '#DC2626', name: 'Tomato Red', usage: 'Primary' },
      { hex: '#F59E0B', name: 'Golden Yellow', usage: 'Accent' },
      { hex: '#78350F', name: 'Chocolate Brown', usage: 'Secondary' },
      { hex: '#FEF3C7', name: 'Cream', usage: 'Background' },
      { hex: '#292524', name: 'Coffee Black', usage: 'Text' },
    ],
    fontPairings: {
      header: 'Playfair Display',
      body: 'Lato',
      notes: 'Elegant serif paired with clean sans-serif for appetizing appeal',
    },
    brandArchetype: 'Lover',
    tone: ['Appetizing', 'Warm', 'Inviting', 'Delicious'],
    keywords: ['restaurant', 'food', 'culinary', 'dining', 'gourmet'],
    popularFor: ['Restaurants', 'Cafes', 'Food brands', 'Catering'],
  },
  {
    id: 'minimalist-modern',
    name: 'Minimalist Modern',
    category: 'creative',
    description: 'Clean, sophisticated, and timeless for modern brands',
    preview: '◻️',
    colorPalette: [
      { hex: '#000000', name: 'Black', usage: 'Primary' },
      { hex: '#FFFFFF', name: 'White', usage: 'Background' },
      { hex: '#6B7280', name: 'Gray', usage: 'Secondary' },
      { hex: '#F3F4F6', name: 'Light Gray', usage: 'Subtle Background' },
      { hex: '#1F2937', name: 'Charcoal', usage: 'Text' },
    ],
    fontPairings: {
      header: 'Helvetica',
      body: 'Arial',
      notes: 'Classic, timeless fonts that embody minimalist principles',
    },
    brandArchetype: 'Sage',
    tone: ['Clean', 'Sophisticated', 'Minimal', 'Timeless'],
    keywords: ['minimalist', 'modern', 'clean', 'simple', 'elegant'],
    popularFor: ['Architecture', 'Design studios', 'Tech', 'Premium brands'],
  },
];

export function getTemplatesByCategory(category: string): BrandTemplate[] {
  return templateLibrary.filter(template => template.category === category);
}

export function searchTemplates(query: string): BrandTemplate[] {
  const lowerQuery = query.toLowerCase();
  return templateLibrary.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.keywords.some(k => k.includes(lowerQuery)) ||
    template.popularFor.some(p => p.toLowerCase().includes(lowerQuery))
  );
}

export function getTemplateById(id: string): BrandTemplate | undefined {
  return templateLibrary.find(template => template.id === id);
}

export const categories = [
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'healthcare', name: 'Healthcare', icon: '⚕️' },
  { id: 'food', name: 'Food & Beverage', icon: '🍽️' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'finance', name: 'Finance & Business', icon: '💼' },
  { id: 'creative', name: 'Creative & Design', icon: '🎨' },
  { id: 'eco', name: 'Eco & Sustainability', icon: '🌱' },
  { id: 'sports', name: 'Sports & Fitness', icon: '💪' },
  { id: 'hospitality', name: 'Hospitality', icon: '🏨' },
];
