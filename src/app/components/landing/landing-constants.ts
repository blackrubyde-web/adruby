import { Target, BarChart3, Brain, Eye, Sparkles, Zap, LineChart, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================
// PIPELINE STEPS
// ============================================
export interface PipelineStep {
  id: number;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: 1, title: 'Strategie', desc: 'Deep-Dive Analyse', icon: Target, color: 'from-blue-500 to-cyan-500' },
  { id: 2, title: 'Tokens', desc: 'Brand DNA Extrakt', icon: BarChart3, color: 'from-indigo-500 to-purple-500' },
  { id: 3, title: 'Hooks', desc: 'Psychologie-Layer', icon: Brain, color: 'from-purple-500 to-pink-500' },
  { id: 4, title: 'Cutout', desc: 'WASM Freisteller', icon: Eye, color: 'from-pink-500 to-rose-500' },
  { id: 5, title: 'Szene', desc: 'KI-Komposition', icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
  { id: 6, title: 'Varianten', desc: 'Stil-Mutationen', icon: Zap, color: 'from-green-500 to-emerald-500' },
  { id: 7, title: 'Prognose', desc: 'RoAS Vorhersage', icon: LineChart, color: 'from-teal-500 to-cyan-500' },
  { id: 8, title: 'Export', desc: 'Meta API Push', icon: Rocket, color: 'from-[#E63946] to-rose-600' },
];

// ============================================
// TESTIMONIALS
// ============================================
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  gradient: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Von Produktfoto zu 12 fertigen Varianten in unter 90 Sekunden. Das hat unseren Launch komplett verändert.',
    author: 'Tobias Wendt',
    role: 'Founder, D2C Skincare Brand',
    avatar: 'TW',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    quote: 'Die Auto-Scaling-Regeln haben uns geholfen, unsere Top-Creatives 3x schneller zu identifizieren und zu skalieren.',
    author: 'Laura Berger',
    role: 'Head of Paid Social, E-Commerce Agentur',
    avatar: 'LB',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    quote: 'Erste Plattform, die KI-Generierung und Meta-Kampagnen in einem Workflow verbindet. Kein Copy-Paste mehr.',
    author: 'Nico Hartmann',
    role: 'Performance Marketer, SaaS',
    avatar: 'NH',
    gradient: 'from-green-500 to-emerald-500',
  },
];

// ============================================
// STATS
// ============================================
export interface Stat {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

// ============================================
// FAQs
// ============================================
export interface FAQ {
  question: string;
  answer: string;
}

export const FAQS: FAQ[] = [
  {
    question: 'Wie generiert die KI Ads?',
    answer: 'AdRuby nutzt Google Gemini 2.5 — Googles neuestes multimodales AI-Modell. Es versteht Bilder, Text und Kontext gleichzeitig. Beschreibe dein Produkt oder lade ein Foto hoch, und Gemini generiert Headlines, Ad Copy und Creatives in Sekunden. Jede Variante wird auf Conversion-Potenzial gescored, bevor du sie launchst.',
  },
  {
    question: 'Welche Plattformen werden unterstützt?',
    answer: 'Wir unterstützen aktuell Facebook, Instagram und LinkedIn Ads. Exportieren Sie Ihre Creatives direkt in den Meta Ads Manager oder laden Sie sie für manuellen Upload herunter.',
  },
  {
    question: 'Wie viele Credits erhalte ich?',
    answer: 'Unser Standard-Plan enthält 1.000 Credits pro Monat. Jede KI-Generierung verbraucht ~10 Credits, sodass Sie ca. 100 Ad-Varianten erstellen können. Mehr benötigt? Kaufen Sie jederzeit zusätzliche Credits.',
  },
  {
    question: 'Kann ich jederzeit kündigen?',
    answer: 'Ja! Jederzeit kündbar in Ihren Account-Einstellungen. Keine Fragen gestellt. Ihr Abo bleibt bis zum Ende des Abrechnungszeitraums aktiv.',
  },
  {
    question: 'Bieten Sie Agentur-Pläne an?',
    answer: 'Ja! Kontaktieren Sie unser Sales-Team für individuelle Agentur-Pläne mit unbegrenzten Seats, White-Label-Optionen und Priority-Support.',
  },
];

// ============================================
// PERSONAS
// ============================================
export interface Persona {
  icon: LucideIcon;
  title: string;
  pain: string;
  solution: string;
  outcome: string;
}

export const PERSONAS: Persona[] = [
  {
    icon: Rocket,
    title: 'Solo-Gründer',
    pain: 'Keine Zeit für manuelle Ad-Erstellung',
    solution: '10+ Varianten in Minuten generieren',
    outcome: 'Kampagnen 10x schneller launchen',
  },
  {
    icon: BarChart3,
    title: 'Performance Marketer',
    pain: 'Benötigen datengetriebenes Creative-Testing',
    solution: 'KI sagt best-performende Ads voraus',
    outcome: 'ROAS um 3-5x steigern',
  },
  {
    icon: Brain,
    title: 'Agenturen',
    pain: '50+ Kunden-Accounts verwalten',
    solution: 'Creative-Produktion automatisieren',
    outcome: 'Skalieren ohne neues Personal',
  },
];
