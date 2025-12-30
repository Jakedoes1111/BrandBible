// Brand Consistency Checker - Ensure all content follows brand guidelines
import { BrandIdentity, Color } from '../types';

export interface ConsistencyCheckResult {
  overall: {
    score: number; // 0-100
    status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    passedChecks: number;
    totalChecks: number;
  };
  colorCompliance: ColorComplianceResult;
  fontCompliance: FontComplianceResult;
  toneCompliance: ToneComplianceResult;
  recommendations: string[];
}

export interface ColorComplianceResult {
  compliant: boolean;
  score: number;
  usedColors: string[];
  offBrandColors: string[];
  suggestions: string[];
}

export interface FontComplianceResult {
  compliant: boolean;
  score: number;
  detectedFonts: string[];
  recommendations: string[];
}

export interface ToneComplianceResult {
  score: number; // 0-100
  alignment: 'high' | 'medium' | 'low';
  issues: string[];
  suggestions: string[];
}

export class BrandConsistencyChecker {
  private brandIdentity: BrandIdentity;

  constructor(brandIdentity: BrandIdentity) {
    this.brandIdentity = brandIdentity;
  }

  // Check content image colors
  checkColorUsage(imageDataUrl: string): ColorComplianceResult {
    // In a real implementation, this would analyze image pixels
    // For now, we'll provide a structure that would work with image analysis
    
    const brandColors = this.brandIdentity.colorPalette.map(c => c.hex.toLowerCase());
    
    // Mock implementation
    const mockUsedColors = brandColors.slice(0, 3); // Simulating detected colors
    const offBrandColors: string[] = []; // Would be populated by actual image analysis
    
    const compliant = offBrandColors.length === 0;
    const score = compliant ? 100 : Math.max(0, 100 - (offBrandColors.length * 20));
    
    const suggestions: string[] = [];
    if (!compliant) {
      suggestions.push('Replace off-brand colors with approved palette colors');
      suggestions.push(`Use ${brandColors[0]} instead of detected off-brand colors`);
    } else {
      suggestions.push('Great job maintaining brand colors!');
    }

    return {
      compliant,
      score,
      usedColors: mockUsedColors,
      offBrandColors,
      suggestions,
    };
  }

  // Check text for font usage
  checkFontUsage(htmlContent: string): FontComplianceResult {
    const approvedFonts = [
      this.brandIdentity.fontPairings.header.toLowerCase(),
      this.brandIdentity.fontPairings.body.toLowerCase(),
    ];

    // Extract font families from HTML or CSS
    const fontPattern = /font-family:\s*([^;]+)/gi;
    const matches = htmlContent.matchAll(fontPattern);
    const detectedFonts: Set<string> = new Set();

    for (const match of matches) {
      const fonts = match[1].split(',').map(f => f.trim().replace(/['"]/g, '').toLowerCase());
      fonts.forEach(font => detectedFonts.add(font));
    }

    const detectedFontsArray = Array.from(detectedFonts);
    const unapprovedFonts = detectedFontsArray.filter(font => 
      !approvedFonts.some(approved => font.includes(approved) || approved.includes(font))
    );

    const compliant = unapprovedFonts.length === 0;
    const score = compliant ? 100 : Math.max(0, 100 - (unapprovedFonts.length * 25));

    const recommendations: string[] = [];
    if (!compliant) {
      recommendations.push(`Replace unapproved fonts: ${unapprovedFonts.join(', ')}`);
      recommendations.push(`Use ${this.brandIdentity.fontPairings.header} for headers`);
      recommendations.push(`Use ${this.brandIdentity.fontPairings.body} for body text`);
    } else {
      recommendations.push('Font usage is consistent with brand guidelines!');
    }

    return {
      compliant,
      score,
      detectedFonts: detectedFontsArray,
      recommendations,
    };
  }

  // Check tone of voice
  async checkToneOfVoice(text: string): Promise<ToneComplianceResult> {
    // Analyze text tone characteristics
    const brandTone = this.extractBrandTone();
    const textCharacteristics = this.analyzeTextTone(text);

    // Score based on alignment with brand tone
    let score = 70; // Base score
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for brand voice attributes
    if (brandTone.includes('professional') && this.hasInformalLanguage(text)) {
      score -= 20;
      issues.push('Text contains informal language not aligned with professional brand voice');
      suggestions.push('Use more formal, professional language');
    }

    if (brandTone.includes('friendly') && this.hasColdLanguage(text)) {
      score -= 15;
      issues.push('Text feels too formal for friendly brand voice');
      suggestions.push('Add warmth and personality to the messaging');
    }

    if (brandTone.includes('innovative') && this.hasGenericLanguage(text)) {
      score -= 15;
      issues.push('Text lacks innovative, forward-thinking language');
      suggestions.push('Use more dynamic, innovative terminology');
    }

    // Check length and clarity
    if (text.length > 500 && text.split('. ').length < 3) {
      score -= 10;
      issues.push('Long sentences may reduce readability');
      suggestions.push('Break content into shorter, clearer sentences');
    }

    const alignment = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';

    if (issues.length === 0) {
      suggestions.push('Tone aligns well with brand voice!');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      alignment,
      issues,
      suggestions,
    };
  }

  // Comprehensive brand check
  async performCompleteCheck(content: {
    text?: string;
    htmlContent?: string;
    imageDataUrl?: string;
  }): Promise<ConsistencyCheckResult> {
    const checks: Promise<any>[] = [];
    let colorScore = 0;
    let fontScore = 0;
    let toneScore = 0;

    let colorCompliance: ColorComplianceResult = {
      compliant: true,
      score: 100,
      usedColors: [],
      offBrandColors: [],
      suggestions: [],
    };

    let fontCompliance: FontComplianceResult = {
      compliant: true,
      score: 100,
      detectedFonts: [],
      recommendations: [],
    };

    let toneCompliance: ToneComplianceResult = {
      score: 100,
      alignment: 'high',
      issues: [],
      suggestions: [],
    };

    // Check colors if image provided
    if (content.imageDataUrl) {
      colorCompliance = this.checkColorUsage(content.imageDataUrl);
      colorScore = colorCompliance.score;
    }

    // Check fonts if HTML provided
    if (content.htmlContent) {
      fontCompliance = this.checkFontUsage(content.htmlContent);
      fontScore = fontCompliance.score;
    }

    // Check tone if text provided
    if (content.text) {
      toneCompliance = await this.checkToneOfVoice(content.text);
      toneScore = toneCompliance.score;
    }

    // Calculate overall score
    const scores = [colorScore, fontScore, toneScore].filter(s => s > 0);
    const overallScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const passedChecks = [colorCompliance.compliant, fontCompliance.compliant, toneCompliance.score >= 70]
      .filter(Boolean).length;
    const totalChecks = 3;

    const status = overallScore >= 90 ? 'excellent' 
      : overallScore >= 75 ? 'good'
      : overallScore >= 60 ? 'needs-improvement'
      : 'poor';

    // Compile recommendations
    const recommendations: string[] = [
      ...colorCompliance.suggestions,
      ...fontCompliance.recommendations,
      ...toneCompliance.suggestions,
    ];

    return {
      overall: {
        score: overallScore,
        status,
        passedChecks,
        totalChecks,
      },
      colorCompliance,
      fontCompliance,
      toneCompliance,
      recommendations,
    };
  }

  // Helper methods
  private extractBrandTone(): string[] {
    // Extract tone keywords from social media posts
    const tones: Set<string> = new Set();
    
    this.brandIdentity.socialMediaPosts.forEach(post => {
      const body = post.body.toLowerCase();
      
      if (body.includes('professional') || body.includes('expertise')) tones.add('professional');
      if (body.includes('friendly') || body.includes('warm')) tones.add('friendly');
      if (body.includes('innovative') || body.includes('cutting-edge')) tones.add('innovative');
      if (body.includes('authentic') || body.includes('genuine')) tones.add('authentic');
      if (body.includes('fun') || body.includes('exciting')) tones.add('playful');
    });

    return Array.from(tones);
  }

  private analyzeTextTone(text: string): {
    formal: boolean;
    friendly: boolean;
    innovative: boolean;
  } {
    const lower = text.toLowerCase();
    
    return {
      formal: /\b(therefore|furthermore|consequently|thus)\b/.test(lower),
      friendly: /\b(hi|hey|awesome|great|love|enjoy)\b/.test(lower),
      innovative: /\b(innovative|cutting-edge|revolutionary|transform|future)\b/.test(lower),
    };
  }

  private hasInformalLanguage(text: string): boolean {
    const informalWords = /\b(gonna|wanna|yeah|nah|cool|stuff|things|kinda|sorta)\b/i;
    return informalWords.test(text);
  }

  private hasColdLanguage(text: string): boolean {
    const coldIndicators = text.match(/\b(hereby|herein|aforementioned|pursuant)\b/gi);
    return coldIndicators !== null && coldIndicators.length > 0;
  }

  private hasGenericLanguage(text: string): boolean {
    const genericPhrases = /\b(best in class|world-class|leading|premier|top-tier)\b/gi;
    const matches = text.match(genericPhrases);
    return matches !== null && matches.length > 2; // Too many generic terms
  }

  // Generate compliance report
  generateComplianceReport(results: ConsistencyCheckResult): string {
    return `
# Brand Compliance Report

## Overall Score: ${results.overall.score}/100
**Status:** ${results.overall.status.toUpperCase()}
**Checks Passed:** ${results.overall.passedChecks}/${results.overall.totalChecks}

---

## Color Compliance
**Score:** ${results.colorCompliance.score}/100
**Status:** ${results.colorCompliance.compliant ? '✓ PASS' : '✗ FAIL'}

**Used Colors:** ${results.colorCompliance.usedColors.join(', ') || 'None detected'}
**Off-Brand Colors:** ${results.colorCompliance.offBrandColors.join(', ') || 'None'}

**Suggestions:**
${results.colorCompliance.suggestions.map(s => `- ${s}`).join('\n')}

---

## Font Compliance
**Score:** ${results.fontCompliance.score}/100
**Status:** ${results.fontCompliance.compliant ? '✓ PASS' : '✗ FAIL'}

**Detected Fonts:** ${results.fontCompliance.detectedFonts.join(', ') || 'None detected'}

**Recommendations:**
${results.fontCompliance.recommendations.map(r => `- ${r}`).join('\n')}

---

## Tone of Voice Compliance
**Score:** ${results.toneCompliance.score}/100
**Alignment:** ${results.toneCompliance.alignment.toUpperCase()}

${results.toneCompliance.issues.length > 0 ? `
**Issues:**
${results.toneCompliance.issues.map(i => `- ${i}`).join('\n')}
` : ''}

**Suggestions:**
${results.toneCompliance.suggestions.map(s => `- ${s}`).join('\n')}

---

## Action Items
${results.recommendations.slice(0, 5).map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

*Report generated on ${new Date().toLocaleString()}*
    `.trim();
  }
}

// Utility function to check single color against palette
export function isColorInPalette(hexColor: string, palette: Color[]): boolean {
  const normalizedColor = hexColor.toLowerCase().replace('#', '');
  return palette.some(c => c.hex.toLowerCase().replace('#', '') === normalizedColor);
}

// Calculate color similarity (simple RGB distance)
export function colorSimilarity(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  const rDiff = Math.abs(rgb1.r - rgb2.r);
  const gDiff = Math.abs(rgb1.g - rgb2.g);
  const bDiff = Math.abs(rgb1.b - rgb2.b);
  
  const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  const maxDistance = Math.sqrt(255 * 255 * 3);
  
  return (1 - distance / maxDistance) * 100;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}
