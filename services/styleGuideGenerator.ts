// Brand Style Guide Generator - Export professional brand guidelines
import { BrandIdentity, GeneratedImages, Color, FontPairing } from '../types';

export interface StyleGuideConfig {
  format: 'pdf' | 'html' | 'markdown';
  sections: {
    overview: boolean;
    logoUsage: boolean;
    colorSystem: boolean;
    typography: boolean;
    spacing: boolean;
    imagery: boolean;
    voiceTone: boolean;
    socialMedia: boolean;
    dosDonts: boolean;
    examples: boolean;
  };
  includeAssets: boolean;
}

export interface StyleGuideSection {
  title: string;
  content: string;
  subsections?: StyleGuideSection[];
}

export class StyleGuideGenerator {
  private brandIdentity: BrandIdentity;
  private generatedImages: GeneratedImages | null;
  private mission: string;

  constructor(
    brandIdentity: BrandIdentity,
    generatedImages: GeneratedImages | null,
    mission: string
  ) {
    this.brandIdentity = brandIdentity;
    this.generatedImages = generatedImages;
    this.mission = mission;
  }

  // Generate complete style guide
  generate(config: StyleGuideConfig): StyleGuideSection[] {
    const sections: StyleGuideSection[] = [];

    if (config.sections.overview) {
      sections.push(this.generateOverview());
    }

    if (config.sections.logoUsage && this.generatedImages) {
      sections.push(this.generateLogoUsage());
    }

    if (config.sections.colorSystem) {
      sections.push(this.generateColorSystem());
    }

    if (config.sections.typography) {
      sections.push(this.generateTypography());
    }

    if (config.sections.spacing) {
      sections.push(this.generateSpacing());
    }

    if (config.sections.imagery) {
      sections.push(this.generateImageryGuidelines());
    }

    if (config.sections.voiceTone) {
      sections.push(this.generateVoiceAndTone());
    }

    if (config.sections.socialMedia) {
      sections.push(this.generateSocialMediaGuidelines());
    }

    if (config.sections.dosDonts) {
      sections.push(this.generateDosAndDonts());
    }

    if (config.sections.examples) {
      sections.push(this.generateExamples());
    }

    return sections;
  }

  private generateOverview(): StyleGuideSection {
    return {
      title: 'Brand Overview',
      content: `
# Brand Overview

## Mission
${this.mission}

## Purpose of This Guide
This brand style guide establishes the visual and verbal identity standards for our brand. It ensures consistency across all touchpoints and maintains brand integrity.

## How to Use This Guide
- Reference this guide for all brand-related materials
- Follow specifications exactly for colors, fonts, and logo usage
- Contact the brand team if you have questions
- Review this guide regularly for updates

## Core Brand Values
Our brand represents:
- Authenticity and transparency
- Innovation and forward-thinking
- Quality and excellence
- Connection with our audience
      `.trim(),
    };
  }

  private generateLogoUsage(): StyleGuideSection {
    return {
      title: 'Logo Usage',
      content: `
# Logo Usage Guidelines

## Primary Logo
The primary logo is our main brand identifier and should be used in most applications.

**Clear Space:** Maintain a minimum clear space around the logo equal to the height of the logo element.

**Minimum Size:**
- Print: 0.5 inches (12.7mm) width
- Digital: 120px width

## Logo Variations
We provide multiple logo variations for different applications:

1. **Primary Logo** - Full color on light backgrounds
2. **Reverse Logo** - White on dark backgrounds  
3. **Monochrome** - Single color applications
4. **Icon/Mark** - Small space applications

## Usage Rules

### DO:
✓ Use the provided logo files without modification
✓ Maintain aspect ratio when scaling
✓ Ensure sufficient contrast with background
✓ Use appropriate logo variation for context
✓ Maintain clear space around logo

### DON'T:
✗ Distort or stretch the logo
✗ Change logo colors
✗ Add effects (drop shadows, gradients, etc.)
✗ Rotate the logo
✗ Place on busy backgrounds
✗ Recreate or redraw the logo

## Background Usage
- **Light Backgrounds:** Use primary full-color logo
- **Dark Backgrounds:** Use reverse (white) logo
- **Photography:** Ensure sufficient contrast or use overlay
- **Patterns:** Avoid - use solid backgrounds only
      `.trim(),
    };
  }

  private generateColorSystem(): StyleGuideSection {
    const colors = this.brandIdentity.colorPalette;
    
    const colorSpecs = colors.map(color => this.generateColorSpecs(color)).join('\n\n');

    return {
      title: 'Color System',
      content: `
# Color Palette

Our color palette is carefully selected to convey our brand personality and ensure accessibility.

## Color Specifications

${colorSpecs}

## Color Usage Guidelines

### Primary Colors
Use primary colors for major brand elements:
- Logo and brand identity
- Headers and key messages
- Call-to-action buttons
- Major design elements

### Secondary Colors
Use secondary colors for:
- Supporting elements
- Backgrounds and fills
- Icons and illustrations
- Dividers and borders

### Accessibility
All color combinations meet WCAG 2.1 AA standards for accessibility:
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text
- Test all combinations before use

## Color Applications

**Digital:**
- Use HEX values for web
- Use RGB for digital design

**Print:**
- Use CMYK for offset printing
- Use Pantone for spot color printing
- Always provide color-calibrated proofs

**Color Combinations:**
- Pair light and dark values for contrast
- Use accent colors sparingly (10-20% of design)
- Maintain brand color ratios: 60% primary, 30% secondary, 10% accent
      `.trim(),
    };
  }

  private generateColorSpecs(color: Color): string {
    // Convert HEX to RGB
    const rgb = this.hexToRgb(color.hex);
    // Approximate CMYK (would need proper conversion in production)
    const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);
    
    return `
### ${color.name} - ${color.usage}

**HEX:** ${color.hex}
**RGB:** rgb(${rgb.r}, ${rgb.g}, ${rgb.b})
**CMYK:** C${cmyk.c}% M${cmyk.m}% Y${cmyk.y}% K${cmyk.k}%

**Usage:** ${color.usage}
    `.trim();
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    
    c = ((c - k) / (1 - k)) * 100;
    m = ((m - k) / (1 - k)) * 100;
    y = ((y - k) / (1 - k)) * 100;
    k = k * 100;
    
    return {
      c: Math.round(c),
      m: Math.round(m),
      y: Math.round(y),
      k: Math.round(k)
    };
  }

  private generateTypography(): StyleGuideSection {
    const fonts = this.brandIdentity.fontPairings;

    return {
      title: 'Typography',
      content: `
# Typography System

Typography is a crucial element of our brand identity. Consistent use of our font system ensures professional and recognizable communications.

## Font Family

### Headlines & Display
**Font:** ${fonts.header}

Use for:
- Page headlines (H1, H2)
- Hero text
- Banners and promotional materials
- Large display copy

Sizes:
- H1: 48-72px (3-4.5rem)
- H2: 36-48px (2.25-3rem)
- H3: 24-36px (1.5-2.25rem)

### Body Text & Content
**Font:** ${fonts.body}

Use for:
- Body copy and paragraphs
- Captions and descriptions
- Navigation
- UI elements

Sizes:
- Body: 16-18px (1-1.125rem)
- Small: 14px (0.875rem)
- Caption: 12px (0.75rem)

## Font Pairing Rationale
${fonts.notes}

## Typography Hierarchy

### Desktop
- **H1:** ${fonts.header}, 72px, Bold
- **H2:** ${fonts.header}, 48px, Bold
- **H3:** ${fonts.header}, 36px, Semibold
- **H4:** ${fonts.header}, 24px, Semibold
- **Body:** ${fonts.body}, 18px, Regular
- **Small:** ${fonts.body}, 14px, Regular

### Mobile
- **H1:** ${fonts.header}, 48px, Bold
- **H2:** ${fonts.header}, 36px, Bold
- **H3:** ${fonts.header}, 24px, Semibold
- **H4:** ${fonts.header}, 20px, Semibold
- **Body:** ${fonts.body}, 16px, Regular
- **Small:** ${fonts.body}, 14px, Regular

## Line Height & Spacing
- **Headlines:** 1.2x font size
- **Body Text:** 1.6x font size
- **Paragraph Spacing:** 1em between paragraphs
- **Letter Spacing:** Default (adjust only for display type)

## Best Practices
- Maximum line length: 65-75 characters
- Use font weights to create hierarchy, not just size
- Maintain sufficient contrast for readability
- Test legibility at different sizes
- Avoid using more than 2-3 font weights
      `.trim(),
    };
  }

  private generateSpacing(): StyleGuideSection {
    return {
      title: 'Spacing System',
      content: `
# Spacing & Layout

Consistent spacing creates visual harmony and improves readability.

## Spacing Scale
We use an 8px base unit for our spacing system:

- **4px** (0.25rem) - Minimal spacing
- **8px** (0.5rem) - Extra small
- **16px** (1rem) - Small
- **24px** (1.5rem) - Medium
- **32px** (2rem) - Large
- **48px** (3rem) - Extra large
- **64px** (4rem) - XXL
- **96px** (6rem) - Jumbo

## Layout Guidelines

### Grid System
- **Desktop:** 12-column grid with 24px gutters
- **Tablet:** 8-column grid with 16px gutters
- **Mobile:** 4-column grid with 16px gutters

### Margins & Padding
- **Page Margins:** 48px desktop, 24px mobile
- **Section Padding:** 64px vertical, responsive horizontal
- **Card Padding:** 24px all sides
- **Button Padding:** 12px vertical, 24px horizontal

### Responsive Breakpoints
- **Mobile:** 0-767px
- **Tablet:** 768-1023px
- **Desktop:** 1024-1439px
- **Large Desktop:** 1440px+

## Best Practices
- Use consistent spacing multiples of 8px
- Increase spacing for visual breathing room
- Group related elements with less space
- Separate unrelated elements with more space
      `.trim(),
    };
  }

  private generateImageryGuidelines(): StyleGuideSection {
    return {
      title: 'Imagery & Photography',
      content: `
# Imagery Guidelines

Our visual style communicates our brand values through carefully curated imagery.

## Photography Style

### Characteristics
- **Authentic:** Real people, genuine moments
- **Bright:** Well-lit, optimistic tone
- **Focused:** Clear subject, minimal distractions
- **Colorful:** Vibrant but natural colors
- **Diverse:** Representing our audience

### Composition
- Use rule of thirds for balanced composition
- Include negative space
- Focus on human connection and emotion
- Avoid overly staged or stock-looking photos

### Color Treatment
- Enhance natural colors
- Maintain brand color palette influence
- Consistent color grading across images
- High contrast with good exposure

## Illustration Style

### When to Use Illustrations
- Abstract concepts
- Data visualization
- Icons and UI elements
- Decorative elements

### Illustration Characteristics
- Simple, clean lines
- Flat design aesthetic
- Brand color palette
- Consistent style across all illustrations

## Image Specifications

### Web
- **Hero Images:** 1920x1080px, 72 DPI
- **Featured Images:** 1200x630px, 72 DPI
- **Thumbnails:** 400x400px, 72 DPI
- **Format:** WebP with JPG fallback

### Print
- **Posters:** 300 DPI minimum
- **Brochures:** 300 DPI, CMYK color mode
- **Business Cards:** 300 DPI, bleed included
- **Format:** TIFF or high-quality PDF

### Social Media
- **Instagram:** 1080x1080px (square), 1080x1350px (portrait)
- **Facebook:** 1200x630px
- **Twitter:** 1200x675px
- **LinkedIn:** 1200x627px

## Usage Guidelines

### DO:
✓ Use high-quality, professional images
✓ Maintain consistent style across platforms
✓ Include diverse representation
✓ Ensure proper image rights and licensing
✓ Optimize images for web performance

### DON'T:
✗ Use cliché stock photography
✗ Over-edit or heavily filter images
✗ Mix photography styles
✗ Use images without proper permissions
✗ Compromise image quality for file size
      `.trim(),
    };
  }

  private generateVoiceAndTone(): StyleGuideSection {
    return {
      title: 'Voice & Tone',
      content: `
# Brand Voice & Tone

Our voice is the consistent personality of our brand, while our tone adapts to context.

## Brand Voice Attributes

### Authentic
We speak honestly and transparently. No corporate jargon or marketing fluff.
- Be genuine and real
- Admit mistakes
- Show behind-the-scenes

### Helpful
We prioritize being useful over being clever.
- Solve problems
- Provide clear guidance
- Anticipate questions

### Friendly
We're approachable and warm without being unprofessional.
- Use conversational language
- Be personable
- Show empathy

### Confident
We know our stuff and share knowledge generously.
- Be authoritative without arrogance
- Back up claims with data
- Admit what we don't know

## Tone Guidelines

Tone varies by context while maintaining our core voice:

### Inspiring Content
- Optimistic and energizing
- Forward-looking
- Motivational but grounded

### Educational Content
- Clear and instructive
- Patient and thorough
- Encouraging

### Marketing Content
- Enthusiastic but not pushy
- Benefit-focused
- Action-oriented

### Error Messages
- Helpful and apologetic
- Solution-focused
- Reassuring

### Customer Support
- Patient and understanding
- Professional and respectful
- Proactive

## Writing Guidelines

### Grammar & Style
- Use active voice
- Write in second person ("you") when addressing audience
- Keep sentences short and scannable
- Use contractions for conversational tone
- Avoid jargon and acronyms

### Formatting
- Use headers to break up content
- Keep paragraphs short (2-3 sentences)
- Use bullet points for lists
- Bold key information
- Include white space

### Inclusive Language
- Use gender-neutral language
- Avoid ableist language
- Be culturally sensitive
- Consider global audience

## Examples

### Good Example
"Let's get your brand looking amazing. Here's a quick guide to choosing your colors."

### Poor Example
"Leverage our cutting-edge platform to synergize your brand asset optimization workflow."

### Good Example
"Oops! Something went wrong. Don't worry—your work is saved. Try refreshing the page."

### Poor Example
"ERROR 500: Internal server error. Stack trace: [...]"
      `.trim(),
    };
  }

  private generateSocialMediaGuidelines(): StyleGuideSection {
    return {
      title: 'Social Media Guidelines',
      content: `
# Social Media Guidelines

Consistent social media presence strengthens brand recognition and engagement.

## Platform-Specific Guidelines

${this.brandIdentity.socialMediaPosts.map((post, index) => `
### ${post.platform}

**Headline:** ${post.headline}

**Body:**
${post.body}

**Image Prompt:** ${post.imagePrompt}

**Best Practices:**
- Post frequency: ${this.getRecommendedFrequency(post.platform)}
- Best times: ${this.getRecommendedTimes(post.platform)}
- Hashtag count: ${this.getHashtagCount(post.platform)}
- Tone: ${this.getPlatformTone(post.platform)}
`).join('\n')}

## General Social Media Best Practices

### Content Mix (80/20 Rule)
- **80%** - Valuable, educational, entertaining content
- **20%** - Promotional content

### Posting Schedule
- Maintain consistent posting schedule
- Use scheduling tools
- Monitor and respond to engagement
- Track performance metrics

### Visual Consistency
- Use brand colors prominently
- Include logo (watermark for images)
- Maintain similar filters/editing style
- Use consistent aspect ratios per platform

### Engagement Guidelines
- Respond to comments within 24 hours
- Like and reply to mentions
- Share user-generated content (with permission)
- Use brand voice in all interactions
- Handle negative feedback professionally

### Hashtag Strategy
- Mix branded, trending, and niche hashtags
- Research hashtags before using
- Create branded hashtag campaign
- Monitor hashtag performance
- Update strategy based on metrics

### Crisis Management
- Respond quickly to issues
- Be transparent and honest
- Take conversations offline when appropriate
- Have escalation process
- Learn from feedback
      `.trim(),
    };
  }

  private getRecommendedFrequency(platform: string): string {
    const frequencies: Record<string, string> = {
      'instagram': '4-7 times per week',
      'twitter': '3-5 times per day',
      'linkedin': '2-3 times per week',
      'facebook': '3-5 times per week',
      'tiktok': '1-3 times per day',
    };
    return frequencies[platform.toLowerCase()] || '3-5 times per week';
  }

  private getRecommendedTimes(platform: string): string {
    const times: Record<string, string> = {
      'instagram': '11am-1pm, 7pm-9pm',
      'twitter': '9am-10am, 12pm-1pm, 5pm-6pm',
      'linkedin': '7am-9am, 12pm-1pm, 5pm-6pm',
      'facebook': '1pm-3pm, 6pm-8pm',
      'tiktok': '6am-10am, 7pm-11pm',
    };
    return times[platform.toLowerCase()] || 'Test and optimize for your audience';
  }

  private getHashtagCount(platform: string): string {
    const counts: Record<string, string> = {
      'instagram': '10-15 hashtags',
      'twitter': '1-2 hashtags',
      'linkedin': '3-5 hashtags',
      'facebook': '1-3 hashtags',
      'tiktok': '3-5 hashtags',
    };
    return counts[platform.toLowerCase()] || '3-5 hashtags';
  }

  private getPlatformTone(platform: string): string {
    const tones: Record<string, string> = {
      'instagram': 'Visual, aspirational, community-focused',
      'twitter': 'Conversational, timely, concise',
      'linkedin': 'Professional, informative, thought-leadership',
      'facebook': 'Community-oriented, conversational, relatable',
      'tiktok': 'Entertaining, trend-aware, authentic',
    };
    return tones[platform.toLowerCase()] || 'Authentic and engaging';
  }

  private generateDosAndDonts(): StyleGuideSection {
    return {
      title: 'Dos and Don\'ts',
      content: `
# Dos and Don'ts

Quick reference for common brand applications.

## Logo Usage

### DO:
✓ Use approved logo files
✓ Maintain aspect ratio
✓ Use on solid backgrounds
✓ Maintain clear space
✓ Use appropriate color version

### DON'T:
✗ Distort or skew logo
✗ Change logo colors
✗ Add effects or filters
✗ Rotate logo
✗ Place on busy backgrounds

## Color Usage

### DO:
✓ Use exact color specifications
✓ Maintain accessibility standards
✓ Test color combinations
✓ Use brand colors consistently
✓ Consider color psychology

### DON'T:
✗ Create new color combinations
✗ Use similar but incorrect colors
✗ Ignore accessibility
✗ Over-use accent colors
✗ Use colors from other brands

## Typography

### DO:
✓ Use approved fonts only
✓ Maintain hierarchy
✓ Ensure legibility
✓ Use appropriate sizes
✓ Consider line length

### DON'T:
✗ Substitute similar fonts
✗ Use too many font weights
✗ Create unreadable sizes
✗ Ignore spacing guidelines
✗ Distort or stretch text

## Imagery

### DO:
✓ Use high-quality images
✓ Maintain consistent style
✓ Ensure proper licensing
✓ Optimize for platform
✓ Include diverse representation

### DON'T:
✗ Use cliché stock photos
✗ Over-edit images
✗ Mix photography styles
✗ Use unlicensed images
✗ Compromise quality

## Communication

### DO:
✓ Use brand voice
✓ Be authentic
✓ Proofread carefully
✓ Consider your audience
✓ Stay on-brand

### DON'T:
✗ Use jargon
✗ Be inconsistent
✗ Ignore tone guidelines
✗ Copy competitor messaging
✗ Over-promise
      `.trim(),
    };
  }

  private generateExamples(): StyleGuideSection {
    return {
      title: 'Examples & Templates',
      content: `
# Brand Applications & Examples

See our brand guidelines in action across various touchpoints.

## Social Media Examples

${this.brandIdentity.socialMediaPosts.map((post, index) => `
### ${post.platform} Post Example ${index + 1}

**Headline:** ${post.headline}

**Caption:**
${post.body}

**Hashtags:** #YourBrand #${post.platform.toLowerCase()} #branding

**Image Description:** ${post.imagePrompt}
`).join('\n')}

## Email Signature

**Format:**
\`\`\`
[Your Name]
[Your Title]
[Company Name]

📧 email@company.com
🌐 www.company.com
📱 +1 (555) 123-4567
\`\`\`

## Business Card Layout

**Front:**
- Logo (top right)
- Name & Title (left aligned)
- Contact information (bottom)

**Back:**
- Tagline or brand message
- Brand color background
- Website and social handles

## Presentation Template

**Title Slide:**
- Large headline font
- Brand color background or accent
- Logo placement (bottom right)

**Content Slides:**
- Clean, minimal layout
- Consistent header style
- Brand color accents
- Readable body font

## Marketing Materials

### Brochure
- Use primary brand colors
- Include high-quality imagery
- Maintain typography hierarchy
- Include clear call-to-action

### Poster
- Bold headline in display font
- High-contrast color scheme
- Minimal text, maximum impact
- Clear brand attribution

### Digital Ad
- Eye-catching visual
- Concise message
- Strong call-to-action
- Brand logo visible

## Website Examples

### Homepage Header
- Hero image with brand colors
- Large headline (H1)
- Subheading (Body font)
- Primary CTA button

### Content Page
- Clear hierarchy
- Sufficient white space
- Brand color accents
- Consistent navigation

## Common Use Cases

1. **Product Launch:** Bold, exciting tone with primary brand colors
2. **Educational Content:** Clear, helpful tone with infographics
3. **Customer Support:** Empathetic, solution-focused messaging
4. **Thought Leadership:** Professional, authoritative voice
5. **Community Building:** Warm, inclusive language and imagery
      `.trim(),
    };
  }

  // Export as HTML
  exportHTML(sections: StyleGuideSection[]): string {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brand Style Guide</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${this.brandIdentity.fontPairings.body}, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1, h2, h3 { 
      font-family: ${this.brandIdentity.fontPairings.header}, serif;
      margin-top: 2em;
      margin-bottom: 0.5em;
      color: ${this.brandIdentity.colorPalette[0]?.hex || '#000'};
    }
    h1 { font-size: 3em; border-bottom: 4px solid ${this.brandIdentity.colorPalette[0]?.hex || '#000'}; padding-bottom: 0.3em; }
    h2 { font-size: 2em; }
    h3 { font-size: 1.5em; }
    p { margin-bottom: 1em; }
    .color-swatch {
      display: inline-block;
      width: 100px;
      height: 100px;
      border-radius: 8px;
      margin: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .section { margin-bottom: 3em; }
    pre { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
  </style>
</head>
<body>
  <header>
    ${this.generatedImages ? `<img src="${this.generatedImages.primaryLogoUrl}" alt="Brand Logo" style="max-width: 200px; margin-bottom: 2em;">` : ''}
    <h1>Brand Style Guide</h1>
    <p style="font-size: 1.2em; color: #666;">Complete brand identity and usage guidelines</p>
  </header>

  <main>
    ${sections.map(section => `
      <section class="section">
        ${this.markdownToHTML(section.content)}
      </section>
    `).join('\n')}
  </main>

  <footer style="margin-top: 4em; padding-top: 2em; border-top: 1px solid #ddd; color: #666; text-align: center;">
    <p>© ${new Date().getFullYear()} Brand Style Guide. All rights reserved.</p>
    <p style="font-size: 0.9em; margin-top: 0.5em;">This document is confidential and proprietary. Do not distribute without permission.</p>
  </footer>
</body>
</html>
    `.trim();

    return html;
  }

  private markdownToHTML(markdown: string): string {
    return markdown
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h[123]><\/p>/g, '')
      .replace(/<p><ul>/g, '<ul>')
      .replace(/<\/ul><\/p>/g, '</ul>')
      .replace(/<p><\/p>/g, '');
  }

  // Export as Markdown
  exportMarkdown(sections: StyleGuideSection[]): string {
    const markdown = sections.map(section => section.content).join('\n\n---\n\n');
    return `# Brand Style Guide\n\n*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n${markdown}`;
  }
}
