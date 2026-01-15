# AI Ad Builder

Eine KI-gestützte Plattform zur automatischen Generierung von professionellen Werbeanzeigen (Bilder, Videos und Texte) auf Agentur-Niveau.

## Features

- 🎨 **Automatische Ad-Generierung**: Bilder, Videos und Werbetexte mit einem Klick
- 🌍 **Zweisprachig**: Deutsch/Englisch UI
- 📝 **Zwei Eingabemodi**: Strukturiertes Formular oder natürliche Spracheingabe
- 🎯 **Template-System**: Vordefinierte Templates für verschiedene Anwendungsfälle
- 🔊 **Spracherkennung**: Voice-to-Text mit Whisper
- 📥 **Export**: Download als PNG/JPG (Bilder) oder MP4 (Videos)

## Technologie-Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- React

### Backend
- Node.js + Express
- OpenAI SDK (GPT-4, DALL-E, Whisper, Sora)
- Sharp (Bildbearbeitung)
- Multer (File Uploads)

## Installation

### Voraussetzungen
- Node.js 18+ 
- OpenAI API Key

### Setup

1. **Projekt klonen und Dependencies installieren**
```bash
cd ai-ad-builder

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Umgebungsvariablen konfigurieren**

Backend `.env` erstellen:
```env
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
FRONTEND_URL=http://localhost:3000
```

Frontend `.env.local` erstellen:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. **Anwendung starten**

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

4. **Öffnen Sie http://localhost:3000**

## Verwendung

### Formular-Modus
1. Wählen Sie ein Template aus
2. Füllen Sie die Felder aus (Branche, Zielgruppe, USP, etc.)
3. Klicken Sie auf "Anzeige generieren"
4. Vorschau ansehen und herunterladen

### Freitext-Modus
1. Beschreiben Sie Ihr Vorhaben in natürlicher Sprache
2. Klicken Sie auf "Anzeige generieren"
3. Vorschau ansehen und herunterladen

### Spracherkennung (Optional)
1. Klicken Sie auf Mikrofon-Symbol
2. Sprechen Sie Ihre Anforderung
3. Text wird automatisch transkribiert

## API-Kosten

⚠️ **Wichtig**: Die Nutzung verursacht Kosten bei OpenAI:
- GPT-4: ~$0.03-0.06 pro Anfrage
- DALL-E 3: ~$0.04-0.08 pro Bild
- Sora: Pricing noch nicht final
- Whisper: ~$0.006 pro Minute

Empfehlung: Setzen Sie API-Limits in Ihrem OpenAI Account.

## Struktur

```
ai-ad-builder/
├── backend/
│   ├── server.js           # Express Server
│   ├── routes/
│   │   ├── generate.js     # Ad-Generierung Endpoint
│   │   └── transcribe.js   # Whisper Endpoint
│   ├── services/
│   │   ├── openai.js       # OpenAI API Integration
│   │   └── imageComposer.js # Bildbearbeitung
│   ├── utils/
│   │   └── promptBuilder.js # Prompt Engineering
│   └── config/
│       └── templates.js    # Ad Templates
├── frontend/
│   ├── app/
│   │   ├── layout.js       # Root Layout
│   │   └── page.js         # Hauptseite
│   ├── components/
│   │   ├── LanguageSwitcher.js
│   │   ├── FormMode.js
│   │   ├── FreetextMode.js
│   │   ├── PreviewArea.js
│   │   └── ExportButtons.js
│   └── lib/
│       └── translations.js # i18n
└── README.md
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend (Railway)
```bash
cd backend
railway init
railway up
```

Vergessen Sie nicht, die Umgebungsvariablen in den Deployment-Plattformen zu setzen!

## Lizenz

MIT
