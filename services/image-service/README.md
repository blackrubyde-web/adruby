# AdRuby Image Service

Dedicated image generation service for premium Meta ads.

## Why separate service?

Netlify Functions have limitations:
- No font support (Fontconfig)
- Memory limits (1GB)
- Bundle size restrictions

This service runs on Railway with:
- ✅ Proper fonts installed
- ✅ 2GB+ memory
- ✅ No timeout limits
- ✅ Full Sharp support

## Local Development

```bash
cd services/image-service
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

## Deploy to Railway

1. Create new Railway project
2. Connect GitHub repo
3. Set root directory: `services/image-service`
4. Add environment variables
5. Deploy!

## API Endpoints

### `GET /health`
Health check endpoint.

### `POST /generate`
Generate an ad.

**Request:**
```json
{
  "productImageUrl": "https://...",
  "headline": "Your Headline",
  "tagline": "Optional tagline",
  "cta": "Shop Now",
  "industry": "tech",
  "accentColor": "#FF4757"
}
```

**Response:**
```json
{
  "success": true,
  "imageBase64": "...",
  "metadata": {
    "duration": 2500,
    "template": "hero_product"
  }
}
```
