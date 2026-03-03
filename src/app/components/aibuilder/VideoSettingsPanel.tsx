/**
 * Video Settings Panel — Archetype selection, duration, audio, quality, format
 * Dark Editorial Studio style matching existing Ad Builder UI
 */

import { useState } from 'react';
import { Film, Zap, Diamond, Volume2, VolumeX, Monitor, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { calculateVideoCreditCost } from '../../lib/api/videoApi';
import type { VideoSettings, VideoArchetype, VideoQuality } from '../../types/aibuilder';

// ── Archetype Card Data ──────────────────────────────────────
const ARCHETYPE_CARDS: {
    id: VideoArchetype;
    icon: string;
    name: { de: string; en: string };
    desc: { de: string; en: string };
}[] = [
        {
            id: 'product_reveal',
            icon: '✨',
            name: { de: 'Product Reveal', en: 'Product Reveal' },
            desc: { de: 'Dramatische Enthüllung mit Zoom & Licht', en: 'Dramatic reveal with zoom & light' },
        },
        {
            id: 'before_after',
            icon: '🔄',
            name: { de: 'Vorher/Nachher', en: 'Before/After' },
            desc: { de: 'Transformation visuell zeigen', en: 'Show transformation visually' },
        },
        {
            id: 'dynamic_showcase',
            icon: '🎥',
            name: { de: 'Dynamischer Showcase', en: 'Dynamic Showcase' },
            desc: { de: 'Schnelle Schnitte, 360° Ansicht', en: 'Fast cuts, 360° view' },
        },
        {
            id: 'lifestyle_scene',
            icon: '🏡',
            name: { de: 'Lifestyle Szene', en: 'Lifestyle Scene' },
            desc: { de: 'Produkt im echten Kontext', en: 'Product in real context' },
        },
        {
            id: 'social_proof',
            icon: '⭐',
            name: { de: 'Social Proof', en: 'Social Proof' },
            desc: { de: 'Bewertungen, Sterne, Zahlen', en: 'Reviews, stars, numbers' },
        },
    ];

const DURATION_OPTIONS = [
    { value: 4, label: '4s' },
    { value: 6, label: '6s' },
    { value: 8, label: '8s' },
] as const;

const ASPECT_OPTIONS = [
    { value: '9:16' as const, label: '9:16', icon: Smartphone, desc: 'Reels/Story' },
    { value: '16:9' as const, label: '16:9', icon: Monitor, desc: 'Feed/In-Stream' },
] as const;

interface VideoSettingsPanelProps {
    language: 'de' | 'en';
    settings: VideoSettings;
    onSettingsChange: (settings: VideoSettings) => void;
    disabled?: boolean;
}

export default function VideoSettingsPanel({ language, settings, onSettingsChange, disabled }: VideoSettingsPanelProps) {
    const t = language === 'de';
    const creditCost = calculateVideoCreditCost(settings.quality, settings.durationSeconds);

    const updateSetting = <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className="video-settings-panel">
            {/* ── Archetype Selection ── */}
            <div className="input-section" style={{ marginBottom: '1rem' }}>
                <div className="input-section-header">
                    <Film size={14} />
                    <span>{t ? 'Video-Stil wählen' : 'Choose Video Style'}</span>
                </div>
                <div style={{ padding: '0.75rem' }}>
                    <div className="archetype-grid">
                        {ARCHETYPE_CARDS.map(card => (
                            <button
                                key={card.id}
                                type="button"
                                disabled={disabled}
                                className={cn(
                                    'archetype-card',
                                    settings.archetype === card.id && 'archetype-card--active'
                                )}
                                onClick={() => updateSetting('archetype', card.id)}
                            >
                                <span className="archetype-card__icon">{card.icon}</span>
                                <span className="archetype-card__name">{t ? card.name.de : card.name.en}</span>
                                <span className="archetype-card__desc">{t ? card.desc.de : card.desc.en}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Duration ── */}
            <div className="input-section" style={{ marginBottom: '1rem' }}>
                <div className="input-section-header">
                    <span style={{ fontSize: '14px' }}>⏱</span>
                    <span>{t ? 'Dauer' : 'Duration'}</span>
                </div>
                <div style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    {DURATION_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            disabled={disabled}
                            className={cn(
                                'filter-chip',
                                settings.durationSeconds === opt.value && 'filter-chip--active'
                            )}
                            onClick={() => updateSetting('durationSeconds', opt.value as 4 | 6 | 8)}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Audio + Quality Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Audio Toggle */}
                <div className="input-section">
                    <div className="input-section-header">
                        {settings.includeAudio ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        <span>Audio</span>
                    </div>
                    <div style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            disabled={disabled}
                            className={cn('filter-chip', settings.includeAudio && 'filter-chip--active')}
                            onClick={() => updateSetting('includeAudio', true)}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            🔊 {t ? 'An' : 'On'}
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            className={cn('filter-chip', !settings.includeAudio && 'filter-chip--active')}
                            onClick={() => updateSetting('includeAudio', false)}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            🔇 {t ? 'Aus' : 'Off'}
                        </button>
                    </div>
                </div>

                {/* Quality Switch */}
                <div className="input-section">
                    <div className="input-section-header">
                        {settings.quality === 'premium' ? <Diamond size={14} /> : <Zap size={14} />}
                        <span>{t ? 'Qualität' : 'Quality'}</span>
                    </div>
                    <div style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            disabled={disabled}
                            className={cn('filter-chip', settings.quality === 'fast' && 'filter-chip--active')}
                            onClick={() => updateSetting('quality', 'fast')}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            ⚡ Fast
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            className={cn('filter-chip', settings.quality === 'premium' && 'filter-chip--active')}
                            onClick={() => updateSetting('quality', 'premium')}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            💎 Premium
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Aspect Ratio ── */}
            <div className="input-section" style={{ marginBottom: '1rem' }}>
                <div className="input-section-header">
                    <span style={{ fontSize: '14px' }}>📐</span>
                    <span>{t ? 'Format' : 'Aspect Ratio'}</span>
                </div>
                <div style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    {ASPECT_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                className={cn(
                                    'filter-chip',
                                    settings.aspectRatio === opt.value && 'filter-chip--active'
                                )}
                                onClick={() => updateSetting('aspectRatio', opt.value)}
                                style={{ flex: 1, justifyContent: 'center', gap: '0.375rem' }}
                            >
                                <Icon size={13} />
                                {opt.label}
                                <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{opt.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Credit Cost Display ── */}
            <div className="video-credit-display">
                <span className="video-credit-display__label">
                    {t ? 'Kosten' : 'Cost'}:
                </span>
                <span className="video-credit-display__value">
                    {creditCost} Credits
                </span>
                <span className="video-credit-display__detail">
                    ({settings.quality === 'premium' ? '💎 Premium' : '⚡ Fast'} · {settings.durationSeconds}s · {settings.aspectRatio})
                </span>
            </div>
        </div>
    );
}
