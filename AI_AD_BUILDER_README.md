# AI Ad Builder - Quick Start

## 🚀 Was ist das?

Ein vollständig integrierter KI-Werbeanzeigen-Generator in AdRuby. Automatische Erstellung von professionellen Ads (Bild + Text) mit GPT-4 und DALL-E.

## 📋 Features

✅ **Zweisprachig** (DE/EN)  
✅ **Zwei Modi**: Formular oder Freitext  
✅ **Voice Input** mit Whisper  
✅ **7 Templates**: Product Launch, Limited Offer, Testimonial, etc.  
✅ **Credit-System** integriert (10 Credits/Ad)  
✅ **Premium Design** matching AdRuby Theme  

## 🔧 Installation & Start

### 1. Environment Variables

Stelle sicher, dass `OPENAI_API_KEY` gesetzt ist:

```bash
# .env
OPENAI_API_KEY=sk-...
```

### 2. Local Development

```bash
# Start Netlify Dev Server
netlify dev

# Navigate to
open http://localhost:8888/aibuilder
```

## 📁 Datei-Struktur

**Backend (Netlify Functions)**:
- `netlify/functions/ai-ad-generate.js` - Haupt-Generierungs-Logic
- `netlify/functions/ai-ad-transcribe.js` - Whisper Speech-to-Text
- `netlify/functions/_shared/aiAdTemplates.js` - 7 Ad-Templates
- `netlify/functions/_shared/aiAdPromptBuilder.js` - Prompt-Engineering

**Frontend (React)**:
- `src/app/components/AIAdBuilderPage.tsx` - Main Page
- `src/app/components/aibuilder/FormInputMode.tsx`
- `src/app/components/aibuilder/FreeTextInputMode.tsx`
- `src/app/components/aibuilder/PreviewArea.tsx`
- `src/app/lib/api/aibuilder.ts` - API Client
- `src/app/lib/aibuilder/translations.ts` - DE/EN Translations

## 🎯 Usage

### Formular-Modus
1. Template auswählen (z.B. "Product Launch")
2. Felder ausfüllen (Branche, Zielgruppe, USP, etc.)
3. "Anzeige generieren" klicken
4. Preview ansehen → Download/Save to Library

### Freitext-Modus
1. Beschreibung eingeben: "Ich bin Friseur in München..."
2. Optional: Mikrofon-Button für Voice Input
3. "Anzeige generieren" klicken

## 🎨 Templates

1. **Product Launch** - Exciting, innovative
2. **Limited Offer** - Urgent, persuasive (PAS)
3. **Testimonial** - Authentic stories
4. **Before/After** - Transformations
5. **Seasonal** - Holidays, events
6. **B2B Solution** - Professional, ROI-focused
7. **Lifestyle** - Inspirational

## 💰 API Costs

Pro Generierung:
- GPT-4: ~$0.03
- DALL-E 3 (HD): ~$0.08
- **Total**: ~$0.11

Credit-Mapping: **10 Credits = 1 Ad**

## 🔗 Integration Points

### Route
`/aibuilder` ist aktiviert in `App.tsx`

### Credit-System
Nutzt bestehendes `deductCredits()` aus `_shared/credits.js`

### Storage
Bilder werden in Supabase Storage (`creative-images` bucket) gespeichert

### Auth
Protected route via `getUserProfile()` aus `_shared/auth.js`

## 📝 Next Steps (Optional)

- [ ] Sidebar Menu Link hinzufügen
- [ ] "Save to Library" Integration komplettieren
- [ ] Video-Generierung (Sora) wenn API verfügbar
- [ ] A/B-Testing (mehrere Varianten generieren)

## 📚 Weitere Dokumentation

Siehe [walkthrough.md](file:///Users/home/.gemini/antigravity/brain/83d17ec5-e41d-4d4e-8c05-65fbd195c762/walkthrough.md) für vollständige Dokumentation.
