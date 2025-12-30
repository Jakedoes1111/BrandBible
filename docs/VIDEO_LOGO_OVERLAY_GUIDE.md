# Video Logo Overlay System - Complete Guide

## 🎬 Overview

The video logo overlay system allows you to automatically add your brand logo to any generated video content with precise control over timing, positioning, and effects.

---

## ✨ Key Features

### Display Modes
- **🔒 Static (Always On)** - Logo visible throughout entire video (corner bug)
- **▶️ Intro Only** - Logo appears only at the beginning
- **⏹️ Outro Only** - Logo appears only at the end
- **⏯️ Bookends** - Logo appears at both intro and outro

### Positioning
- 5 position options: Top-left, Top-right, Center, Bottom-left, Bottom-right
- Custom padding from edges (0-100px)
- Intelligent auto-sizing

### Effects
- ✨ Fade in/out animations
- 🎚️ Opacity control (0-100%)
- 📐 Size control (5-40% of video)
- ⏱️ Custom timing for intro/outro (1-10 seconds)

---

## 🚀 How to Use

### Step 1: Generate or Select a Video
1. Go to the Brand Generator tab
2. Generate social media content with videos, OR
3. Use the Video Suite to create custom videos

### Step 2: Access Logo Overlay
1. Click **"Edit Visual"** on any video post
2. Select the **"🎨 Add Logo"** tab
3. Choose your logo (if you have multiple uploaded)

### Step 3: Configure Logo Settings

#### Quick Start with Presets
Choose from 4 optimized presets:
- **Corner Bug** - Small logo in bottom-right, visible throughout
- **Intro Only** - Large centered logo for 3 seconds at start
- **Outro Only** - Large centered logo for 3 seconds at end
- **Bookends** - Medium centered logo at both ends

#### Custom Configuration
Fine-tune every aspect:

**Display Mode:**
- Static: Logo always visible
- Intro: Set duration (1-10s)
- Outro: Set duration (1-10s)
- Bookends: Set both durations

**Position:**
- Choose from 5 positions
- Adjust padding from edges

**Appearance:**
- Size: 5% to 40% of video
- Opacity: 0% to 100%
- Fade in/out: Toggle effects

### Step 4: Preview & Apply
1. Click **"👁️ Preview with Logo"**
2. Wait for processing (shows progress bar)
3. Review the result in the video player
4. Adjust settings if needed (click "🔄 Adjust Settings")
5. Click **"✅ Apply Logo"** when satisfied

---

## 🎯 Use Cases & Recommendations

### Social Media Videos

#### Instagram Reels/TikTok
```
Mode: Corner Bug
Position: Bottom-right
Size: 10-12%
Opacity: 85%
Fade: In/Out enabled
```
**Why:** Small, unobtrusive branding that doesn't block content

#### YouTube Videos
```
Mode: Bookends
Position: Center (intro/outro), Bottom-right (if static)
Size: 25% (bookends), 12% (static)
Opacity: 100% (bookends), 85% (static)
Fade: Enabled
```
**Why:** Professional intro/outro with optional corner bug during content

#### LinkedIn Videos
```
Mode: Intro Only
Position: Center
Size: 30%
Opacity: 100%
Duration: 2-3s
Fade: Enabled
```
**Why:** Professional brand intro, clean content body

### Product Videos

#### Product Demos
```
Mode: Static
Position: Bottom-right
Size: 12-15%
Opacity: 90%
```
**Why:** Consistent branding without distracting from demo

#### Testimonials
```
Mode: Bookends
Position: Center
Size: 25%
Duration: 2s each
Fade: Enabled
```
**Why:** Brand bookends frame the testimonial content

### Marketing Campaigns

#### Ads & Promotions
```
Mode: Static or Intro + Outro
Position: Top-left or Bottom-right
Size: 15-20%
Opacity: 100%
```
**Why:** Strong brand presence throughout ad

#### Behind-the-Scenes
```
Mode: Outro Only
Position: Center
Size: 30%
Duration: 3s
Fade: Enabled
```
**Why:** Natural content, branded ending

---

## ⚙️ Technical Details

### Video Processing
- **Technology**: Canvas API + MediaRecorder
- **Format**: WebM with VP9 codec
- **Quality**: 2.5 Mbps bitrate
- **Frame Rate**: 30 FPS
- **Real-time preview**: Progress updates during processing

### Performance
- **Processing Speed**: Real-time to 2x video length
- **Memory Usage**: Moderate (canvas-based)
- **Browser Support**: Chrome, Edge, Firefox (latest versions)

### Limitations
- Maximum recommended video length: 60 seconds (for processing speed)
- Output format: WebM (widely supported)
- Logo must be already uploaded
- Processing happens client-side (no server upload needed)

---

## 💡 Best Practices

### Logo File Requirements
1. **Format**: PNG with transparency (recommended)
2. **Size**: At least 500px width
3. **Quality**: High resolution for scaling
4. **Background**: Transparent or solid

### Positioning Guidelines

**Portrait Videos (9:16)**
- Avoid center positioning (blocks subject)
- Use top corners or bottom corners
- Smaller sizes work better (10-15%)

**Landscape Videos (16:9)**
- Corner positions work well
- Center for bookends only
- Larger sizes acceptable (15-20%)

**Square Videos (1:1)**
- Bottom-right is most common
- Top-left for professional content
- 12-15% size range

### Timing Recommendations
- **Intro**: 2-3 seconds (enough to see, not too long)
- **Outro**: 2-4 seconds (can be longer for CTA)
- **Fade duration**: 0.5-1 second (smooth, not jarring)
- **Static logo**: Always enable fade in/out

### Opacity Tips
- **90-100%**: Strong branding, clear logo
- **70-85%**: Subtle, doesn't dominate
- **30-50%**: Watermark style
- **Lower on busy backgrounds**, higher on clean ones

---

## 🔄 Workflow Examples

### Example 1: Quick Social Media Post
```
1. Generate video in Bulk Content
2. Open "Edit Visual" → "Add Logo"
3. Select "Corner Bug" preset
4. Click "Preview with Logo"
5. Apply and publish
⏱️ Time: ~2 minutes per video
```

### Example 2: Professional YouTube Video
```
1. Create video in Video Suite
2. Open "Edit Visual" → "Add Logo"
3. Select "Bookends" preset
4. Adjust intro duration to 2s
5. Adjust outro duration to 4s
6. Change position to center
7. Preview and apply
⏱️ Time: ~3-4 minutes
```

### Example 3: Custom Product Video
```
1. Upload product video
2. Open "Add Logo" tab
3. Mode: Static
4. Position: Bottom-right
5. Size: 15%
6. Opacity: 85%
7. Enable fade in/out
8. Preview and apply
⏱️ Time: ~3 minutes
```

---

## 🐛 Troubleshooting

### "Processing failed" error
**Causes:**
- Video file corrupted or unsupported format
- Browser memory limitations
- Very long video (>2 minutes)

**Solutions:**
- Try a shorter video clip
- Close other browser tabs
- Refresh the page and try again
- Use a different video format

### Logo not visible
**Check:**
- Opacity not set to 0%
- Display mode matches video length (intro duration < video length)
- Logo file loaded correctly
- Position not off-screen

### Video plays without logo
**Reasons:**
- Preview not generated yet (click "Preview with Logo")
- Applied the original instead of processed version
- Processing was interrupted

### Slow processing
**Tips:**
- Shorter videos process faster
- Close unnecessary applications
- Use Chrome for best performance
- Reduce video resolution if possible

### Logo looks pixelated
**Fixes:**
- Upload higher resolution logo
- Reduce logo size percentage
- Use PNG format with transparency

---

## 🔮 Advanced Tips

### Multiple Logo Styles
Create variations for different platforms:
1. Save configuration screenshots
2. Apply different presets per platform
3. Document your brand's video logo standards

### A/B Testing
Test different configurations:
- Corner bug vs bookends
- Different positions
- Various opacity levels
- Measure engagement metrics

### Accessibility
- Keep logos outside of caption areas (bottom third)
- Use high contrast logos
- Don't block faces or key content
- Test on mobile screens

### Performance Optimization
- Process during off-hours for long videos
- Use preset configs for consistency
- Batch process similar videos with same settings

---

## 📊 Comparison: Image vs Video Logo Overlay

| Feature | Image Overlay | Video Overlay |
|---------|---------------|---------------|
| **Processing Speed** | Instant | 1-2x video length |
| **Complexity** | Simple | Advanced |
| **File Size Impact** | Minimal | Moderate |
| **Animation Support** | No | Yes (fade in/out) |
| **Timing Control** | N/A | Full control |
| **Use Cases** | Static content | Motion content |
| **Browser Support** | Universal | Modern browsers |

---

## 🎓 Learning Resources

### Video Branding Principles
1. **Consistency**: Use same position/size across videos
2. **Subtlety**: Logo should enhance, not dominate
3. **Context**: Adjust for content type
4. **Platform**: Different rules for different platforms
5. **Testing**: Always preview before publishing

### Platform-Specific Guidelines

**YouTube:**
- Corner bugs common for long-form
- Intro animations for branded content
- Outro cards with logo + CTA

**Instagram/TikTok:**
- Minimal, small corner logos
- Quick intro splash (1-2s)
- Don't block trending format areas

**LinkedIn:**
- Professional intro (2-3s)
- Subtle corner bug
- Branded outro with CTA

**Twitter/X:**
- Small, consistent positioning
- Quick branding (1-2s intro)
- Clean execution

---

## 📝 Summary

### What You Can Do
✅ Add logos to any video with full customization
✅ Choose from 4 optimized presets
✅ Control timing (intro, outro, static, bookends)
✅ Adjust size, position, opacity, and padding
✅ Apply fade in/out effects
✅ Real-time preview before applying
✅ Process entirely in-browser (no upload needed)

### Benefits
🚀 **Automate**: Branded videos in minutes
🎨 **Customize**: Full creative control
📊 **Scale**: Apply to bulk-generated content
💼 **Professional**: Consistent brand presence
⚡ **Fast**: Quick processing and preview
🔒 **Private**: Client-side processing (no server upload)

---

## 🔗 Related Documentation
- [Logo Integration Guide](./LOGO_INTEGRATION_GUIDE.md) - Image logo overlay
- [Video Suite Guide](./docs/VIDEO_SUITE.md) - Video generation
- [Bulk Content Guide](./docs/BULK_CONTENT.md) - Mass content creation

---

**Ready to brand your videos?** Upload a logo and generate some videos to get started! 🎬
