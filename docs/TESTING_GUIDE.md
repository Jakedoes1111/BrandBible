# Testing Guide - Phase 0 Features
**Version**: 1.0  
**Last Updated**: November 18, 2024

---

## 🧪 Quick Test Checklist

Use this guide to verify all Phase 0 features are working correctly.

---

## Test 1: Navigation System

### Test 1.1: Logo Click
1. ✅ Open the app
2. ✅ Navigate to any tab (e.g., Bulk Content)
3. ✅ Click the "🎨 BrandBible" logo
4. **Expected**: Returns to Brand Generator page

### Test 1.2: Dropdown Menus
1. ✅ Click "Create" dropdown
2. **Expected**: Shows Bulk Content, Templates, Media Editor, Video Suite
3. ✅ Click "Schedule" dropdown
4. **Expected**: Shows Content Calendar, Scheduler
5. ✅ Click "Analyze" dropdown
6. **Expected**: Shows Analytics, Brand Health, Competitors, Hashtags, A/B Testing
7. ✅ Click "Tools" dropdown
8. **Expected**: Shows Style Guide, Guidelines, Asset Manager, Batch Processing

### Test 1.3: Active States
1. ✅ Click any menu item
2. **Expected**: Item highlights with green background and border
3. ✅ Open dropdown for parent of active item
4. **Expected**: Parent dropdown also highlights

### Test 1.4: Click Outside
1. ✅ Open any dropdown
2. ✅ Click outside the dropdown
3. **Expected**: Dropdown closes

### Test 1.5: Mobile Responsive
1. ✅ Resize browser to mobile width (<768px)
2. **Expected**: Navigation still visible and functional
3. **Expected**: Dropdowns work on mobile

---

## Test 2: Smart Aspect Ratios

### Test 2.1: Instagram Post
1. ✅ Generate brand identity
2. ✅ In social media posts, click "Manage Visual" on any post
3. ✅ Change platform dropdown to "Instagram Post" (if not already)
4. **Expected**: Aspect ratio auto-selects to "1:1" with ⭐
5. **Expected**: Shows message "Recommended for Instagram Post: 1:1"

### Test 2.2: TikTok
1. ✅ In visual modal, switch to "Generate Video" tab
2. ✅ Check platform (should be from post)
3. **Expected**: If platform contains "TikTok", aspect ratio is "9:16" with ⭐

### Test 2.3: YouTube
1. ✅ Change platform to "YouTube"
2. **Expected**: Aspect ratio auto-selects to "16:9" with ⭐
3. **Expected**: Shows description "Widescreen format"

### Test 2.4: Manual Override
1. ✅ With any platform selected and recommended ratio shown
2. ✅ Click a different aspect ratio button
3. **Expected**: Selection changes (overrides recommendation)
4. **Expected**: Star (⭐) still shows on recommended option

### Test 2.5: Re-open Modal
1. ✅ Close and reopen the visual modal for the same post
2. **Expected**: Aspect ratio resets to recommended based on platform

---

## Test 3: Asset Upload System

### Test 3.1: Collapsible Section
1. ✅ Go to Brand Generator tab
2. ✅ Look for "0. Upload Brand Assets (Optional)" section
3. ✅ Click the ▶ arrow to expand
4. **Expected**: Upload interface appears
5. ✅ Click the ▼ arrow to collapse
6. **Expected**: Upload interface hides

### Test 3.2: Category Selection
1. ✅ Expand asset upload section
2. ✅ Click each category button (Logo, Product, Lifestyle, Marketing, Other)
3. **Expected**: Selected category highlights in green
4. **Expected**: Message shows "Uploading as: [Category]"

### Test 3.3: Drag & Drop Upload
1. ✅ Select "Logo" category
2. ✅ Drag an image file from your computer
3. ✅ Drop it on the upload zone
4. **Expected**: Upload zone highlights in green when dragging over
5. **Expected**: File appears in grid below with thumbnail
6. **Expected**: Shows category badge "Logo"

### Test 3.4: Click to Upload
1. ✅ Click on the upload zone (or click directly)
2. **Expected**: File browser opens
3. ✅ Select multiple images
4. **Expected**: All files appear in grid

### Test 3.5: Multiple Categories
1. ✅ Select "Product" category
2. ✅ Upload 2 product images
3. ✅ Select "Logo" category
4. ✅ Upload 1 logo
5. **Expected**: Shows "3 assets uploaded" summary
6. **Expected**: Each asset shows correct category badge

### Test 3.6: Remove Asset
1. ✅ Hover over any uploaded asset card
2. **Expected**: Red "×" button appears in top-right
3. ✅ Click the "×" button
4. **Expected**: Asset is removed from grid
5. **Expected**: Asset count updates

### Test 3.7: Persistence
1. ✅ Upload several assets
2. ✅ Refresh the page (F5)
3. ✅ Expand asset upload section
4. **Expected**: Message shows "X assets uploaded"
5. ✅ Click "View/Edit"
6. **Expected**: All previously uploaded assets are still there

### Test 3.8: File Size Display
1. ✅ Upload assets of different sizes
2. **Expected**: Each shows file size (e.g., "2.5 MB", "150 KB")

---

## Test 4: Bulk Content Generator

### Test 4.1: Basic Generation (Small Campaign)
1. ✅ Generate a brand identity first
2. ✅ Go to "Create" → "Bulk Content"
3. ✅ Set duration to 30 days
4. ✅ Set posts per day to 1
5. ✅ Select platforms: Instagram, Twitter
6. ✅ Keep "Include image prompts" checked
7. ✅ Click "⚡ Generate 30 Posts"
8. **Expected**: Progress bar appears
9. **Expected**: Status message shows:
   - "Starting content generation..."
   - "Generating post ideas and captions..."
   - "Generated 10/30 post ideas..."
   - "Generating images for posts..."
   - "Generated visual 5/30..."
   - "Campaign complete!"
10. **Expected**: Progress bar reaches 100%
11. **Expected**: Grid of 9 posts appears with actual images

### Test 4.2: Content Mix Validation
1. ✅ Set content mix percentages to: 30, 30, 20, 10 (total = 90%)
2. **Expected**: Shows "Must equal 100%" in red
3. ✅ Try to click "Generate"
4. **Expected**: Button is disabled
5. ✅ Adjust to 25, 25, 25, 25 (total = 100%)
6. **Expected**: Shows "Total: 100%" in green
7. **Expected**: Generate button is enabled

### Test 4.3: Platform Selection
1. ✅ Deselect all platforms
2. **Expected**: Shows "Select at least one platform" error
3. **Expected**: Generate button is disabled
4. ✅ Select at least one platform
5. **Expected**: Generate button is enabled

### Test 4.4: Generated Post Display
After generation completes:
1. ✅ Look at post cards in grid
2. **Expected**: Each card shows:
   - Generated image at top
   - "✓ Ready" badge (or "✗ Failed" if generation failed)
   - Platform badge (green)
   - Content type badge (gray)
   - Headline
   - Caption preview
   - Date and time
   - Hashtags (first 3)

### Test 4.5: Statistics
1. **Expected**: Shows total post count
2. **Expected**: Shows breakdown by platform
3. **Expected**: All numbers add up correctly

### Test 4.6: Export CSV
1. ✅ After campaign generation
2. ✅ Click "📥 Export CSV" button
3. **Expected**: CSV file downloads
4. ✅ Open CSV in Excel/Google Sheets
5. **Expected**: Contains all posts with columns:
   - Date, Time, Platform, Type, Headline, Body, Hashtags, Image Prompt, CTA

### Test 4.7: Large Campaign (Optional - Takes Time!)
1. ✅ Set duration to 30 days
2. ✅ Set posts per day to 3
3. ✅ Select 3 platforms
4. **Expected**: Shows "⚡ Generate 90 Posts"
5. ✅ Click generate
6. **Expected**: Progress tracking works for all 90 posts
7. **Expected**: Takes approximately 45-60 minutes
8. **Note**: This uses significant API credits (~$2.70)

### Test 4.8: Failed Image Generation
1. ✅ Generate a small campaign (5-10 posts)
2. ✅ Watch for any "failed" posts
3. **Expected**: Posts with failed images show "✗ Failed" badge
4. **Expected**: Post still displays with text content
5. **Expected**: Progress continues despite failures

### Test 4.9: Without Images
1. ✅ Uncheck "Include image prompts"
2. ✅ Generate campaign
3. **Expected**: Skips image generation step
4. **Expected**: Completes much faster (~30 seconds for 30 posts)
5. **Expected**: Posts display without visual previews

---

## Test 5: Integration Tests

### Test 5.1: Asset Upload → Bulk Generator
1. ✅ Upload brand assets (logo, products)
2. ✅ Generate brand identity
3. ✅ Generate bulk content
4. **Expected**: Content generation completes successfully
5. **Note**: Assets are stored but not yet used in generation (Phase 2 feature)

### Test 5.2: Navigation → Asset Upload → Navigation
1. ✅ Upload assets in Brand Generator
2. ✅ Navigate to different tab
3. ✅ Return to Brand Generator
4. **Expected**: Asset upload section remembers state
5. **Expected**: Asset count shows correctly

### Test 5.3: Multiple Brand Identities
1. ✅ Generate brand identity #1
2. ✅ Generate bulk content for it
3. ✅ Generate brand identity #2 (different mission)
4. ✅ Generate bulk content for #2
5. **Expected**: Each campaign uses correct brand identity

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. **Image Generation Time**: ~30 seconds per image (DALL-E 3 speed)
2. **Rate Limits**: 500ms delay between images to avoid API limits
3. **Storage**: Assets stored in browser (IndexedDB, not cloud)
4. **No Video**: Video generation not yet implemented
5. **No Backend**: API keys exposed in browser (dev only)

### Expected Behaviors:
1. **Some images may fail**: DALL-E occasionally fails, this is normal
2. **Progress can pause**: During image generation, progress updates every 30 seconds
3. **First load slower**: IndexedDB initialization takes a moment

---

## 🚨 Critical Tests

These tests MUST pass before considering Phase 0 complete:

- [ ] Logo returns to Brand Generator
- [ ] At least 3 aspect ratios auto-select correctly
- [ ] Can upload and view assets after refresh
- [ ] Can generate 10-post campaign with images successfully
- [ ] Progress bar shows real progress (not fake animation)
- [ ] Generated images actually display in preview grid

---

## 📊 Test Results Template

```
Date: [DATE]
Tester: [NAME]
Browser: [Chrome/Firefox/Safari/Edge]
OS: [Windows/Mac/Linux]

Navigation Tests: [PASS/FAIL]
Aspect Ratio Tests: [PASS/FAIL]
Asset Upload Tests: [PASS/FAIL]
Bulk Generator Tests: [PASS/FAIL]
Integration Tests: [PASS/FAIL]

Issues Found:
1. [Description]
2. [Description]

Notes:
- [Any additional observations]
```

---

## 🎯 Next Steps After Testing

**If all tests pass**:
✅ Phase 0 is complete!
→ Proceed to Phase 5 (Creatomate) or Phase 1 (Full Asset Management)

**If tests fail**:
🐛 Document bugs
→ Prioritize fixes
→ Re-test after fixes

---

**Happy Testing!** 🧪
