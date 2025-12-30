# Security Guidelines for BrandBible

## Current Security Status

⚠️ **DEVELOPMENT MODE ONLY** ⚠️

This application is currently configured for **development use only**. The following security considerations must be addressed before production deployment:

## Critical Security Issues

### 1. Exposed API Keys
- **Issue**: OpenAI API keys are exposed in the browser
- **Current State**: Using `dangerouslyAllowBrowser: true`
- **Risk**: API keys can be extracted from browser, leading to unauthorized usage and billing
- **Solution Required**: Move all API calls to a backend server

### 2. Rate Limiting
- **Issue**: No rate limiting on client-side requests
- **Risk**: API quota exhaustion, excessive billing
- **Solution Required**: Implement server-side rate limiting

### 3. Input Validation
- **Status**: ✅ Basic validation implemented
- **Location**: `services/inputValidator.ts`
- **Coverage**: Mission statements, prompts, chat messages, URLs

## Production Deployment Checklist

Before deploying to production, complete the following:

### Backend Requirements
- [ ] Create a backend API server (Node.js, Python, etc.)
- [ ] Move OpenAI API calls to backend
- [ ] Store API keys in backend environment variables (not in browser)
- [ ] Implement authentication for API endpoints
- [ ] Add rate limiting per user/IP
- [ ] Add request logging and monitoring

### Security Hardening
- [ ] Remove `dangerouslyAllowBrowser` flag
- [ ] Implement CORS policies
- [ ] Add CSRF protection
- [ ] Implement input sanitization on backend
- [ ] Add output validation
- [ ] Set up Content Security Policy (CSP)
- [ ] Enable HTTPS only

### Monitoring & Alerts
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure billing alerts in OpenAI dashboard
- [ ] Monitor API usage patterns
- [ ] Set up anomaly detection

## Recommended Architecture

```
Browser (React App)
    ↓
    ↓ (HTTPS only)
    ↓
Backend Server (Node.js/Express)
    ↓
    ↓ (with API key)
    ↓
OpenAI API
```

### Backend Example (Node.js/Express)

```javascript
// server.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Stored securely on server
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());

// Protected endpoint
app.post('/api/generate-brand', async (req, res) => {
  try {
    const { mission } = req.body;
    
    // Validate input
    if (!mission || mission.length < 10) {
      return res.status(400).json({ error: 'Invalid mission' });
    }
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: mission }]
    });
    
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Generation failed' });
  }
});

app.listen(3000);
```

## Current Mitigations

The following security measures are **already implemented**:

1. **Input Validation** (`services/inputValidator.ts`)
   - Mission statements: 10-5000 characters
   - Image prompts: 3-4000 characters
   - Chat messages: 1-2000 characters
   - XSS prevention through HTML tag removal

2. **Error Handling** (`services/errorHandler.ts`)
   - Structured error types
   - Safe error messages for users
   - Error logging for debugging
   - Retry logic with exponential backoff

3. **Model Fallbacks** (`services/modelService.ts`)
   - Automatic failover to backup models
   - Graceful degradation

## Environment Variables

### Development (.env.local)
```bash
VITE_OPENAI_API_KEY=your_key_here
```

### Production (Backend .env)
```bash
OPENAI_API_KEY=your_key_here
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Reporting Security Issues

If you discover a security vulnerability, please email: [your-email@domain.com]

**Do not** create public GitHub issues for security vulnerabilities.

## License Compliance

Ensure compliance with:
- OpenAI Terms of Service
- Data privacy regulations (GDPR, CCPA, etc.)
- API usage limits and billing

## Last Updated
November 18, 2024
