# AdRuby Image Service v2.0

Premium ad generation service with template-based architecture.

## Features

✅ **5 Template Types**
- `feature_callout` - Product with dotted lines pointing to feature labels
- `hero_product` - Bold, dramatic product shot with headline
- `stats_grid` - Product surrounded by statistics
- `comparison_split` - Before/After or Us vs. Them
- `lifestyle_context` - Product in real-world use

✅ **8 Industry Presets**
- Tech, Food, Fashion, Beauty, Eco, Fitness, SaaS, Home
- Industry-specific colors, typography, and effects

✅ **Intelligent Template Selection**
- GPT-4 powered auto-selection based on content

✅ **Post-Processing Effects**
- Neon glow, soft shadow, vignette, grain, tints

✅ **Quality Validation**
- Optional GPT-4 Vision quality check

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
4. Add environment variables:
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY`
5. Deploy!

## API Endpoints

### `GET /health`
Service health and capabilities.

### `GET /templates`
List all available templates and industries.

### `GET /templates/:industry`
Get recommended templates for an industry.

### `POST /generate`
Generate an ad (auto-selects template).

```json
{
  "productImageUrl": "https://...",
  "headline": "Your Headline",
  "tagline": "Optional tagline",
  "cta": "Shop Now",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "stats": [
    {"value": "20g", "label": "PROTEIN"},
    {"value": "900k+", "label": "CUSTOMERS"}
  ],
  "industry": "food",
  "template": "stats_grid",
  "style": "light",
  "accentColor": "#E67E22"
}
```

### `POST /generate/:template`
Generate with specific template.

## Response

```json
{
  "success": true,
  "imageBase64": "...",
  "metadata": {
    "duration": 2500,
    "template": "stats_grid",
    "industry": "food",
    "dimensions": { "width": 1080, "height": 1080 }
  }
}
```
