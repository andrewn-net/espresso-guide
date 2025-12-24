# Secure API Key Implementation

## Summary
Moved Gemini API calls from client-side to server-side to keep the API key secure.

## Changes Made

### 1. Created Serverless API Function
- **File**: `/api/analyze.ts`
- This serverless function handles all Gemini API calls server-side
- The API key is accessed via `process.env.GEMINI_API` (server-side only)
- Accepts frame data from the client and returns analysis results

### 2. Updated Client Code
- **File**: `/src/lib/gemini.ts`
  - Removed direct Gemini API calls
  - Now extracts frames from video and sends them to `/api/analyze`
  - Removed unused imports and constants
  
- **File**: `/src/components/AnalysisMode.tsx`
  - Removed API key input/validation
  - Now calls the serverless function instead of Gemini directly

### 3. Configuration
- **File**: `vercel.json` - Added API routing configuration
- **Package**: Installed `@vercel/node` for TypeScript types

## Vercel Environment Variable Setup

In your Vercel project settings:

1. **Variable Name**: `GEMINI_API` (no prefix needed for server-side)
2. **Value**: Your Gemini API key
3. **Environment**: Production, Preview, Development (select all)

⚠️ **Important**: Do NOT use `VITE_` prefix - that would expose it to the browser!

## How It Works

1. User uploads video in browser
2. Client extracts 3 frames from video (20%, 50%, 80%)
3. Client sends frames to `/api/analyze` endpoint
4. Serverless function calls Gemini API with your secure API key
5. Results are returned to client

## Security Benefits

✅ API key never exposed to browser  
✅ API key not in client-side bundle  
✅ API key only accessible server-side  
✅ No risk of key theft from browser DevTools  

## Testing Locally

To test the serverless function locally, you'll need to use Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

This will run your app with serverless functions at `http://localhost:3000`
