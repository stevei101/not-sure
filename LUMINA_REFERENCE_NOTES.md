# Lumina Search RAG - Reference Implementation Notes

This document captures useful patterns from the [Lumina Search RAG](https://github.com/principle-lgtm/lumina-search-rag) reference implementation for our Vertex AI integration.

**Source Repository:** https://github.com/principle-lgtm/lumina-search-rag

## Key Differences

### Lumina Implementation (Direct Gemini API)
- Uses **direct Gemini API** (`/v1beta/models/${modelId}:streamGenerateContent`)
- Authentication: API key (`GEMINI_API_KEY`)
- Route: Direct to `ai.googleapis.com`
- Streaming: Server-Sent Events (SSE)

### Our Implementation (Vertex AI via Gateway)
- Uses **Vertex AI** through **Cloudflare AI Gateway**
- Authentication: Service account JSON key
- Route: Through Cloudflare AI Gateway to Vertex AI
- Streaming: Not currently implemented (returns full response)

## Useful Patterns from Lumina

### 1. Message Format for Gemini

Lumina uses this format (which is standard Gemini API format):

```typescript
const contents = history.map(msg => ({
  role: msg.role,  // 'user' | 'model'
  parts: [{ text: msg.content }]
}));
```

**Our current format** (in `callVertexAI()`):
```typescript
const messages = [
  { role: "user", parts: [{ text: prompt }] }
];
```

✅ **We're already using the correct format!**

### 2. System Instruction with RAG Context

Lumina injects RAG documents into the system instruction:

```typescript
let systemContext = `You are Lumina, an intelligent AI research assistant...`;

if (documents && documents.length > 0) {
  systemContext += `\n\n### User's Knowledge Base (Context) ###\n...`;
  documents.forEach((doc, index) => {
    systemContext += `<document index="${index + 1}" title="${doc.name}">\n${doc.content}\n</document>\n\n`;
  });
}

const geminiRequestPayload = {
  contents,
  systemInstruction: {
    parts: [{ text: systemContext }]
  },
  // ...
};
```

**Potential enhancement for our implementation:**
- We could add RAG document context support
- Inject documents into system instruction for better context-aware responses

### 3. Request Body Structure

Lumina's Vertex AI request format:
```typescript
{
  contents: [...],  // Array of message objects
  systemInstruction: {
    parts: [{ text: systemContext }]
  },
  tools: useWebSearch ? [{ googleSearch: {} }] : undefined,
  generationConfig: {
    temperature: 0.7,
  }
}
```

**Our current request body:**
```typescript
{
  contents: messages  // Just messages
}
```

**Potential improvements:**
- Add `systemInstruction` support
- Add `generationConfig` (temperature, etc.)
- Consider adding tools (web search, function calling)

### 4. Response Parsing

Lumina parses Vertex AI responses:
```typescript
const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
```

**Our current parsing:**
```typescript
if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
  return data.candidates[0].content.parts[0].text;
}
```

✅ **We're already parsing correctly!**

### 5. Streaming Support (SSE)

Lumina implements Server-Sent Events for streaming:
- Uses `text/event-stream` content type
- Parses chunks incrementally
- Calls `onChunk()` callback for each piece

**We don't currently support streaming** - this could be a future enhancement.

## Actionable Insights

### ✅ Already Correct
- Message format (`role` + `parts` array)
- Response parsing (`candidates[0].content.parts[0].text`)

### 🔄 Potential Enhancements

1. **Add System Instruction Support**
   ```typescript
   requestBody = {
     contents: messages,
     systemInstruction: {
       parts: [{ text: "You are a helpful AI assistant..." }]
     },
     generationConfig: {
       temperature: 0.7,
       maxOutputTokens: 2048
     }
   };
   ```

2. **Add RAG Context Support**
   - Inject document context into system instruction
   - Support multiple documents in a structured format

3. **Add Streaming Support** (if needed)
   - Use SSE format like Lumina
   - Stream responses back to client incrementally

4. **Enhanced Error Handling**
   - Better error messages
   - Parse error responses from Vertex AI

### ⚠️ Important Differences

1. **API Endpoint**: 
   - Lumina: `ai.googleapis.com/v1beta/models/${modelId}:streamGenerateContent`
   - Ours: Vertex AI via Cloudflare AI Gateway (`google-vertex-ai` provider)

2. **Authentication**:
   - Lumina: API key in URL query parameter
   - Ours: Service account JSON via gateway (or header)

3. **Gateway Routing**:
   - We route through Cloudflare AI Gateway (for analytics, caching)
   - Lumina goes direct to Gemini API

## Conclusion

The Lumina implementation is a good reference for:
- ✅ Message format (already correct)
- ✅ Response parsing (already correct)
- 🔄 System instruction patterns (could enhance)
- 🔄 RAG context injection (could add)
- 🔄 Streaming support (future enhancement)

Our Vertex AI implementation through Cloudflare AI Gateway is architecturally different but follows the same core Gemini API patterns.

## Reference Links

- **Lumina Search RAG Repository:** https://github.com/principle-lgtm/lumina-search-rag
- **AI Studio App:** https://ai.studio/apps/drive/1vlzkl%5F1DNrDk-XQpXYf8xyn-xsP0oYer
- **Generated from:** google-gemini/aistudio-repository-template

## Notes

The Lumina implementation was generated from Google's AI Studio repository template and uses direct Gemini API calls. Our implementation differs by routing through Cloudflare AI Gateway for enhanced analytics and caching capabilities.
