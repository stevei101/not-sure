# Not Sure V2 Migration Plan

## Overview
Rebuild the "Not Sure" application with Spark UI design while preserving RAG search and AI Gateway functionality.

## Architecture

### Current State
- **Backend**: Cloudflare Worker (`src/index.ts`)
  - RAG functionality with KV caching
  - AI Gateway integration
  - Serves static assets from `/public`
  - API endpoints: `/query`, `/status`

### Target State
- **Backend**: Cloudflare Worker (unchanged)
  - Keep existing RAG and AI Gateway logic
  - Serve built React app as static assets
  - API endpoints remain: `/query`, `/status`
  
- **Frontend**: React/Vite app (Spark design)
  - Modern UI with Spark design system
  - Search/Chat interface
  - Calls Worker API endpoints
  - Built and served from Worker

## Implementation Steps

### Phase 1: Frontend Setup
1. ✅ Create feature branch
2. Install React/Vite dependencies (Bun)
3. Set up Tailwind CSS with Spark design tokens
4. Copy Spark UI components
5. Create Search/Chat interface components

### Phase 2: Backend Integration
1. Keep existing Worker backend
2. Update Worker to serve built React app
3. Ensure CORS is configured for API calls
4. Test API endpoints

### Phase 3: Frontend-Backend Connection
1. Create API client for Worker endpoints
2. Implement search/query functionality
3. Add streaming response support (if needed)
4. Error handling and loading states

### Phase 4: Testing & Polish
1. Add tests (70% coverage requirement)
2. Performance optimization
3. UI/UX refinements
4. Documentation

## File Structure

```
not-sure/
├── src/
│   ├── index.ts              # Cloudflare Worker (backend - keep as is)
│   ├── main.tsx              # React entry point (new)
│   ├── App.tsx               # Main React app (new - Spark design)
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (from Spark)
│   │   ├── Search.tsx        # Search interface (new)
│   │   └── Chat.tsx          # Chat interface (new)
│   └── lib/
│       └── api.ts            # API client for Worker (new)
├── public/                    # Static assets (will be replaced by build output)
├── dist/                      # Built React app (served by Worker)
├── package.json               # Updated with React/Vite deps
├── vite.config.ts             # Vite config (new)
├── tailwind.config.js         # Tailwind config (from Spark)
└── wrangler.jsonc             # Worker config (update assets path)
```

## Design System (from Spark)

- **Colors**: Deep Navy Blue, Teal/Cyan, Lime/Chartreuse
- **Typography**: Inter (primary), JetBrains Mono (code)
- **Components**: shadcn/ui with Spark customizations
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS v4

## API Endpoints (Worker)

- `GET /status` - Health check
- `POST /query` - RAG search query
  ```json
  {
    "prompt": "your question",
    "model": "cloudflare"
  }
  ```

## Success Criteria

- ✅ Visual parity with Spark project
- ✅ RAG functionality preserved
- ✅ AI Gateway integration working
- ✅ Search latency < 2s
- ✅ 70% test coverage
- ✅ Responsive design

