# Model Configuration Guide

BrandBible uses a **model-agnostic architecture** that allows you to easily switch between different AI models, configure fallbacks, and optimize for your specific needs.

---

## 🎯 Overview

The system automatically:
- ✅ Selects the best model for each task
- ✅ Falls back to alternative models if primary fails
- ✅ Handles rate limits and availability issues
- ✅ Logs which models are used for debugging
- ✅ Supports custom model preferences via environment variables

---

## 📋 Available Models

### Text Generation Models

| Model | RPM | RPD | Tokens/Min | Cost Tier | Best For |
|-------|-----|-----|------------|-----------|----------|
| `gemini-2.5-flash` | 10 | 250 | 250K | Free | Fast responses, high volume |
| `gemini-2.5-pro` | 2 | 50 | 125K | Medium | Quality, complex tasks |
| `gemini-1.5-flash` | 15 | 1,500 | 1M | Free | Legacy, high availability |
| `gemini-1.5-pro` | 2 | 50 | 32K | Medium | Advanced AI features |
| `gemini-2.0-flash-exp` | 10 | 1,500 | 4M | Free | Experimental, fast |

### Media Generation Models

| Model | RPM | RPD | Cost Tier | Best For |
|-------|-----|-----|-----------|----------|
| `imagen-4.0-generate-001` | 5 | 100 | High | Logo & brand imagery |
| `veo-3.1-fast-generate-preview` | 2 | 20 | High | Video content |

---

## ⚙️ Configuration

### Method 1: Environment Variables (Recommended)

Add to your `.env.local` file:

```bash
# Override specific task models
BRAND_GENERATION_MODEL=gemini-2.5-flash
BULK_CONTENT_MODEL=gemini-2.0-flash-exp
CHAT_MODEL=gemini-2.5-flash
CONTENT_REC_MODEL=gemini-2.0-flash-exp
ADVANCED_AI_MODEL=gemini-1.5-pro
IMAGE_MODEL=imagen-4.0-generate-001
VIDEO_MODEL=veo-3.1-fast-generate-preview
```

### Method 2: Code Configuration

Edit `config/modelConfig.ts`:

```typescript
export const TASK_MODELS = {
  brandGeneration: {
    primary: 'gemini-2.5-flash',
    fallbacks: ['gemini-1.5-flash', 'gemini-2.0-flash-exp'],
  },
  // ... other tasks
};
```

---

## 🔄 Automatic Fallback System

When a model fails (503, 429, 404 errors), the system automatically tries fallback models:

```
Primary: gemini-2.5-flash (fails due to rate limit)
  ↓
Fallback 1: gemini-1.5-flash (tries)
  ↓
Fallback 2: gemini-2.0-flash-exp (succeeds) ✅
```

### Example Log Output:

```
[ModelService] Attempting with model: gemini-2.5-flash
[ModelService] ❌ Primary model failed: gemini-2.5-flash
[ModelService] Attempting with model: gemini-1.5-flash
[ModelService] ✅ Success with fallback model: gemini-1.5-flash
[BrandGeneration] Model used: gemini-1.5-flash, Fallbacks attempted: 1
```

---

## 🎨 Task-Specific Models

Different tasks are optimized for different models:

### Brand Generation
- **Default:** `gemini-2.5-flash`
- **Why:** Fast, structured output, good for JSON generation
- **Fallbacks:** gemini-1.5-flash, gemini-2.0-flash-exp

### Bulk Content Generation
- **Default:** `gemini-2.0-flash-exp`
- **Why:** High token limit (4M/min), fast for large batches
- **Fallbacks:** gemini-2.5-flash, gemini-1.5-flash

### Chat Assistant
- **Default:** `gemini-2.5-flash`
- **Why:** Quick responses, natural conversation
- **Fallbacks:** gemini-1.5-flash

### Advanced AI (A/B Testing, Analytics)
- **Default:** `gemini-1.5-pro`
- **Why:** Better quality for complex analysis
- **Fallbacks:** gemini-2.5-flash

---

## 🚀 Usage Examples

### In Your Code

```typescript
import { generateWithFallback } from './services/modelService';

// Automatic model selection with fallback
const response = await generateWithFallback({
  task: 'brandGeneration',
  prompt: 'Create a brand for...',
  config: { responseMimeType: 'application/json' },
  requireStructuredOutput: true,
});

console.log(`Model used: ${response.modelUsed}`);
console.log(`Fallbacks tried: ${response.fallbacksAttempted.length}`);
```

### Prefer Specific Model

```typescript
const response = await generateWithFallback({
  task: 'brandGeneration',
  prompt: 'Create a brand for...',
  preferredModel: 'gemini-1.5-pro', // Override default
});
```

### Get Recommended Model

```typescript
import { getRecommendedModel } from './services/modelService';

// Get model optimized for speed
const fastModel = getRecommendedModel('brandGeneration', {
  preferSpeed: true,
});

// Get model optimized for quality
const qualityModel = getRecommendedModel('advancedAI', {
  preferQuality: true,
});

// Get cheapest model
const cheapModel = getRecommendedModel('bulkContent', {
  preferCost: true,
});
```

---

## 🔍 Model Selection Criteria

The system selects models based on:

1. **Task Requirements**
   - Structured output needed?
   - Text, image, or video generation?
   - Token limits required?

2. **Current Conditions**
   - Rate limits
   - Model availability
   - Previous failures

3. **User Preferences**
   - Speed vs quality
   - Cost optimization
   - Custom overrides

---

## 💡 Best Practices

### For Development
```bash
# Use fast, free models
BRAND_GENERATION_MODEL=gemini-2.5-flash
BULK_CONTENT_MODEL=gemini-2.0-flash-exp
```

### For Production (Free Tier)
```bash
# Balanced approach with good fallbacks
BRAND_GENERATION_MODEL=gemini-2.5-flash
ADVANCED_AI_MODEL=gemini-1.5-pro
```

### For Production (Paid Tier)
```bash
# Quality-first with Pro models
BRAND_GENERATION_MODEL=gemini-2.5-pro
ADVANCED_AI_MODEL=gemini-1.5-pro
IMAGE_MODEL=imagen-4.0-generate-001
```

---

## 🛠️ Troubleshooting

### Issue: "All models failed"

**Solution:** Check your API key and rate limits
```bash
# View your quota
https://aistudio.google.com/app/usage
```

### Issue: Model not found (404)

**Solution:** Model might not be available on your tier
```typescript
// Check available models
import { isModelAvailable } from './config/modelConfig';
console.log(isModelAvailable('gemini-2.5-flash')); // true/false
```

### Issue: Too many 429 errors

**Solution:** Switch to model with higher rate limits
```bash
# Use model with higher RPM
BRAND_GENERATION_MODEL=gemini-1.5-flash  # 15 RPM vs 10 RPM
```

---

## 📊 Monitoring

### Check Model Health

```typescript
import { checkModelHealth } from './services/modelService';

const isHealthy = await checkModelHealth('gemini-2.5-flash');
console.log(`Model healthy: ${isHealthy}`);
```

### Get Model Stats

```typescript
import { getModelStats } from './services/modelService';

const stats = getModelStats('gemini-2.5-flash');
console.log(stats);
// {
//   name: 'gemini-2.5-flash',
//   provider: 'google',
//   capabilities: { ... },
//   rateLimits: { requestsPerMinute: 10, ... }
// }
```

---

## 🎓 Advanced Configuration

### Add Custom Model

Edit `config/modelConfig.ts`:

```typescript
export const AVAILABLE_MODELS: ModelConfigMap = {
  // ... existing models
  'my-custom-model': {
    name: 'my-custom-model',
    provider: 'custom',
    capabilities: {
      supportsText: true,
      supportsImages: false,
      supportsVideo: false,
      supportsStructuredOutput: true,
      maxTokens: 8192,
      costTier: 'medium',
    },
    rateLimits: {
      requestsPerMinute: 10,
      requestsPerDay: 500,
      tokensPerMinute: 100000,
    },
  },
};
```

### Smart Model Selection

```typescript
import { selectBestModel } from './config/modelConfig';

// Find best model for requirements
const bestModel = selectBestModel({
  supportsText: true,
  supportsStructuredOutput: true,
  preferLowCost: true,
  minRequestsPerMinute: 10,
});

console.log(`Best model: ${bestModel}`);
```

---

## 📝 Summary

The model-agnostic system provides:

✅ **Flexibility** - Easy to switch models
✅ **Reliability** - Automatic fallbacks
✅ **Performance** - Task-optimized selection
✅ **Observability** - Logging and monitoring
✅ **Cost Control** - Optimize for your budget

Your app will automatically adapt to API availability, rate limits, and failures! 🚀
