# BrandBible - Quick Start Guide

## Running the Application

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Key Features

### 1. Generate Brand Identity
Navigate to the "Brand Generator" tab and enter your company mission to generate:
- Color palette (5 colors)
- Font pairings
- Social media posts
- Logo and brand marks

### 2. Access Your Projects
All generated brands are automatically saved to IndexedDB and accessible across sessions.

### 3. Offline Mode
The app works offline after first load. Generate brands without internet (using cached data).

### 4. PWA Installation
Click the install prompt to add BrandBible to your home screen/desktop for a native app experience.

## Developer Tools

### View State
```javascript
// In browser console
window.__REACT_DEVTOOLS_GLOBAL_HOOK__
```

### View Performance Metrics
```javascript
import { performanceService } from './services/performanceService';
console.log(performanceService.generateReport());
```

### View Stored Data
```javascript
// Browser DevTools → Application → IndexedDB → BrandBibleDB
```

### Clear All Data
```javascript
localStorage.clear();
// Then refresh the page
```

## API Configuration

Set your Gemini API key in `.env.local`:
```env
GEMINI_API_KEY=your_key_here
```

## Troubleshooting

### App Not Loading
1. Check browser console for errors
2. Verify `.env.local` has valid API key
3. Clear cache and reload

### Service Worker Issues
1. Unregister old service workers in DevTools
2. Hard refresh (Ctrl+Shift+R)
3. Clear application cache

### IndexedDB Errors
1. Check browser supports IndexedDB
2. Check storage quota not exceeded
3. Fallback to localStorage is automatic

## Architecture Overview

```
BrandBible
├── State Management (Context API)
├── Data Persistence (IndexedDB)
├── API Layer (Retry + Cache)
├── Error Handling (Boundaries)
├── Performance Monitoring
├── Media Optimization
└── Offline Support (Service Worker)
```

## Common Tasks

### Save a Project
Projects auto-save after generation. Manual save:
```typescript
await indexedDBService.saveProject(project);
```

### Load Projects
```typescript
const projects = await indexedDBService.getProjects();
```

### Track Custom Event
```typescript
performanceService.trackInteraction('action', 'category', 'label');
```

### Optimize Image
```typescript
import { optimizeImage } from './utils/mediaOptimization';
const optimized = await optimizeImage(file, { maxWidth: 1920, quality: 0.85 });
```

## Next Steps

1. **Generate Your First Brand** - Try the brand generator
2. **Explore Tabs** - Check out all 10 feature tabs
3. **Install as PWA** - Add to home screen
4. **View Analytics** - Check the Analytics tab
5. **Schedule Posts** - Use the Scheduler tab

For detailed documentation, see `IMPROVEMENTS.md`.
