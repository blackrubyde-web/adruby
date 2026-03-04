/**
 * Video Preview Area — Video player, progress, download, score rings
 * Dark Editorial Studio style matching existing PreviewArea
 */

import { useState, useRef, useEffect } from 'react';
import {
    Play, Pause, Volume2, VolumeX, RotateCcw, Download,
    BookmarkPlus, RefreshCw, Film, Clock, MonitorSmartphone, Sparkles,
    Wand2, Layers
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { Language, VideoGenerationResult } from '../../types/aibuilder';

// ── Score Ring (reused from PreviewArea) ──────────────────────
function ScoreRing({ value, max, label, color, delay = 0 }: {
    value: number; max: number; label: string; color: string; delay?: number;
}) {
    const r = 28, c = 2 * Math.PI * r;
    const pct = Math.min(value / max, 1);
    return (
        <div style={{ textAlign: 'center' }}>
            <svg width="72" height="72" viewBox="0 0 64 64" className="score-ring-svg">
                <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
                <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4"
                    strokeLinecap="round" strokeDasharray={c}
                    strokeDashoffset={c * (1 - pct)}
                    style={{
                        '--circumference': c, '--target-offset': c * (1 - pct),
                        animation: `ring-draw 1.2s ${delay}ms ease-out forwards`,
                        transformOrigin: '50% 50%', transform: 'rotate(-90deg)',
                    } as React.CSSProperties} />
                <text x="32" y="34" textAnchor="middle" dominantBaseline="middle"
                    fill="var(--foreground)" fontSize="14" fontWeight="700"
                    fontFamily="var(--font-display)">{value}</text>
            </svg>
            <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                {label}
            </div>
        </div>
    );
}

// ── Video Pipeline Steps ─────────────────────────────────────
const VIDEO_PIPELINE_STEPS = {
    de: [
        { label: 'Produkt analysieren', step: 'script_generating', icon: '🔍' },
        { label: 'Video-Script schreiben', step: 'script_complete', icon: '📝' },
        { label: 'Szene generieren', step: 'veo_starting', icon: '🎬' },
        { label: 'Video rendern', step: 'veo_rendering', icon: '🎥' },
        { label: 'Audio synchronisieren', step: 'downloading', icon: '🔊' },
        { label: 'Video speichern', step: 'uploading', icon: '💾' },
    ],
    en: [
        { label: 'Analyzing product', step: 'script_generating', icon: '🔍' },
        { label: 'Writing video script', step: 'script_complete', icon: '📝' },
        { label: 'Generating scene', step: 'veo_starting', icon: '🎬' },
        { label: 'Rendering video', step: 'veo_rendering', icon: '🎥' },
        { label: 'Syncing audio', step: 'downloading', icon: '🔊' },
        { label: 'Saving video', step: 'uploading', icon: '💾' },
    ],
};

const STEP_ORDER = ['pending', 'script_generating', 'script_complete', 'veo_starting', 'veo_generating', 'veo_rendering', 'downloading', 'uploading', 'complete'];

interface VideoPreviewAreaProps {
    language: Language;
    result: VideoGenerationResult | null;
    loading: boolean;
    error: string | null;
    progress?: number;
    currentStep?: string;
    progressMessage?: string;
    onDownload?: () => void;
    onSaveToLibrary?: () => void;
    onRegenerate?: () => void;
    onRefine?: (prompt: string) => void;
}

export default function VideoPreviewArea({
    language, result, loading, error,
    progress = 0, currentStep = '', progressMessage = '',
    onDownload, onSaveToLibrary, onRegenerate, onRefine,
}: VideoPreviewAreaProps) {
    const t = language === 'de';
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLooping, setIsLooping] = useState(true);
    const [refinePrompt, setRefinePrompt] = useState('');

    useEffect(() => {
        if (result?.videoUrl && videoRef.current) {
            videoRef.current.load();
        }
    }, [result?.videoUrl]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const steps = VIDEO_PIPELINE_STEPS[language] || VIDEO_PIPELINE_STEPS.de;
    const stepIdx = STEP_ORDER.indexOf(currentStep);

    // ── Error State ──
    if (error) {
        return (
            <div className="ad-builder-canvas" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '520px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--destructive)', marginBottom: '0.5rem' }}>
                    {t ? 'Video-Generierung fehlgeschlagen' : 'Video generation failed'}
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', maxWidth: '400px', textAlign: 'center' }}>
                    {error}
                </p>
                {onRegenerate && (
                    <button className="generate-btn" onClick={onRegenerate}
                        style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', borderRadius: '0.75rem', fontSize: '0.875rem' }}>
                        <RefreshCw size={14} /> {t ? 'Erneut versuchen' : 'Try again'}
                    </button>
                )}
            </div>
        );
    }

    // ── Loading / Theater State ──
    if (loading) {
        return (
            <div className="ai-empty-state" style={{ minHeight: '520px' }}>
                {/* Aurora gradient background */}
                <div className="ai-empty-aurora" />

                {/* Particles */}
                <div className="ai-empty-particles">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className={`ai-particle ai-particle-${(i % 4) + 1}`} style={{
                            left: `${10 + Math.random() * 80}%`,
                            animationDelay: `${i * 0.4}s`,
                            width: `${2 + Math.random() * 4}px`,
                            height: `${2 + Math.random() * 4}px`,
                        }} />
                    ))}
                </div>

                {/* Neural Core */}
                <div className="ai-core-container">
                    <div className="ai-orbit-ring ai-orbit-ring-3"><div className="ai-orbit-dot" /></div>
                    <div className="ai-orbit-ring ai-orbit-ring-2"><div className="ai-orbit-dot" /><div className="ai-orbit-dot ai-orbit-dot-2" /></div>
                    <div className="ai-orbit-ring ai-orbit-ring-1"><div className="ai-orbit-dot ai-orbit-dot-lg" /></div>
                    <div className="ai-core-glow ai-core-glow-outer" />
                    <div className="ai-core-glow ai-core-glow-mid" />
                    <div className="ai-core-icon">
                        <Film className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-xl text-foreground ai-text-glow">
                    {t ? 'KI generiert dein Video…' : 'AI is generating your video…'}
                </h3>

                {/* Progress Bar */}
                <div style={{ width: '100%', maxWidth: '340px', margin: '1rem 0' }}>
                    <div style={{
                        height: '4px', borderRadius: '2px', background: 'var(--muted)',
                        overflow: 'hidden', position: 'relative',
                    }}>
                        <div style={{
                            height: '100%', borderRadius: '2px',
                            background: 'linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #fff))',
                            width: `${Math.max(progress, 5)}%`,
                            transition: 'width 0.8s ease',
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        <span>{progressMessage || (t ? 'Bitte warten...' : 'Please wait...')}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Pipeline Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '280px' }}>
                    {steps.map((s, i) => {
                        const sIdx = STEP_ORDER.indexOf(s.step);
                        const isDone = stepIdx > sIdx;
                        const isActive = stepIdx === sIdx || currentStep === s.step;
                        return (
                            <div key={s.step}
                                className="stagger-in"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                                    opacity: isDone ? 1 : isActive ? 1 : 0.35,
                                    fontSize: '0.8125rem',
                                    color: isDone ? 'var(--primary)' : isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    transition: 'all 0.4s ease',
                                    animationDelay: `${i * 200}ms`,
                                }}>
                                <span style={{ fontSize: '0.875rem', width: '1.25rem', textAlign: 'center' }}>
                                    {isDone ? '✅' : isActive ? '🔄' : s.icon}
                                </span>
                                <span style={{ fontWeight: isDone || isActive ? 600 : 400 }}>{s.label}</span>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.6875rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.375rem', opacity: 0.6 }}>
                    <Clock size={11} />
                    {t ? 'Geschätzt: ~30-90 Sekunden' : 'Estimated: ~30-90 seconds'}
                </div>
            </div>
        );
    }

    // ── Empty State — Premium AI Visual (matching image PreviewArea) ──
    if (!result) {
        return (
            <div className="ai-empty-state">
                {/* Aurora gradient background */}
                <div className="ai-empty-aurora" />

                {/* Floating particles */}
                <div className="ai-empty-particles">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className={`ai-particle ai-particle-${(i % 4) + 1}`} style={{
                            left: `${10 + Math.random() * 80}%`,
                            animationDelay: `${i * 0.4}s`,
                            width: `${2 + Math.random() * 4}px`,
                            height: `${2 + Math.random() * 4}px`,
                        }} />
                    ))}
                </div>

                {/* Neural Core */}
                <div className="ai-core-container">
                    <div className="ai-orbit-ring ai-orbit-ring-3"><div className="ai-orbit-dot" /></div>
                    <div className="ai-orbit-ring ai-orbit-ring-2"><div className="ai-orbit-dot" /><div className="ai-orbit-dot ai-orbit-dot-2" /></div>
                    <div className="ai-orbit-ring ai-orbit-ring-1"><div className="ai-orbit-dot ai-orbit-dot-lg" /></div>
                    <div className="ai-core-glow ai-core-glow-outer" />
                    <div className="ai-core-glow ai-core-glow-mid" />
                    <div className="ai-core-icon">
                        <Film className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Text */}
                <h3 className="font-display font-bold text-lg text-foreground ai-text-glow">
                    {t ? 'Bereit für dein Video-Ad' : 'Ready for your video ad'}
                </h3>
                <p className="text-sm text-muted-foreground/60 mt-1 max-w-[260px] leading-relaxed text-center">
                    {t ? 'Wähle einen Stil und die KI erstellt dein Video in Sekunden' : 'Choose a style and AI creates your video in seconds'}
                </p>

                {/* Animated feature chips */}
                <div className="flex items-center gap-2.5 mt-6">
                    {[
                        { icon: Film, label: t ? 'Veo 3.1' : 'Veo 3.1' },
                        { icon: Layers, label: t ? '5 Archetypen' : '5 Archetypes' },
                        { icon: Wand2, label: t ? 'AI Scoring' : 'AI Scoring' },
                    ].map((feat, i) => {
                        const FeatIcon = feat.icon;
                        return (
                            <div
                                key={i}
                                className="ai-feature-chip stagger-in"
                                style={{ animationDelay: `${400 + i * 150}ms` }}
                            >
                                <FeatIcon className="w-3 h-3" />
                                {feat.label}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── Video Player ──
    return (
        <div className="ad-builder-canvas" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Video Container */}
            <div className="video-player-container">
                <video
                    ref={videoRef}
                    src={result.videoUrl}
                    loop={isLooping}
                    muted={isMuted}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={togglePlay}
                    style={{
                        width: '100%',
                        maxHeight: '420px',
                        objectFit: 'contain',
                        background: '#000',
                        cursor: 'pointer',
                    }}
                />
                {/* Controls Overlay */}
                <div className="video-controls">
                    <button className="video-control-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button className="video-control-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button
                        className={cn('video-control-btn', isLooping && 'video-control-btn--active')}
                        onClick={() => { setIsLooping(!isLooping); if (videoRef.current) videoRef.current.loop = !isLooping; }}
                        title="Loop"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Meta Info + Scores */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
                {/* Scores */}
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <ScoreRing value={result.qualityScore || 82} max={100} label="Quality" color="var(--primary)" delay={0} />
                    <ScoreRing value={result.engagementScore || 88} max={100} label="Engagement" color="#10b981" delay={200} />
                </div>

                {/* Meta Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <Badge variant="outline" className="stat-pill">
                        <Film size={11} /> {result.archetype?.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="stat-pill">
                        <Clock size={11} /> {(result.durationMs / 1000).toFixed(0)}s
                    </Badge>
                    <Badge variant="outline" className="stat-pill">
                        <MonitorSmartphone size={11} /> {result.resolution || '1080p'}
                    </Badge>
                    {result.hasAudio && (
                        <Badge variant="outline" className="stat-pill stat-pill-accent">
                            <Volume2 size={11} /> Audio
                        </Badge>
                    )}
                    <Badge variant="outline" className="stat-pill">
                        {result.aspectRatio}
                    </Badge>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {onDownload && (
                        <button className="filter-chip filter-chip--active" onClick={onDownload}
                            style={{ flex: 1, justifyContent: 'center', gap: '0.375rem', padding: '0.625rem' }}>
                            <Download size={14} /> MP4
                        </button>
                    )}
                    {onSaveToLibrary && (
                        <button className="filter-chip" onClick={onSaveToLibrary}
                            style={{ flex: 1, justifyContent: 'center', gap: '0.375rem', padding: '0.625rem' }}>
                            <BookmarkPlus size={14} /> {t ? 'Bibliothek' : 'Library'}
                        </button>
                    )}
                    {onRegenerate && (
                        <button className="filter-chip" onClick={onRegenerate}
                            style={{ flex: 1, justifyContent: 'center', gap: '0.375rem', padding: '0.625rem' }}>
                            <RefreshCw size={14} /> {t ? 'Neu' : 'New'}
                        </button>
                    )}
                </div>

                {/* Refine Input */}
                {onRefine && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={refinePrompt}
                            onChange={e => setRefinePrompt(e.target.value)}
                            placeholder={t ? 'Video verfeinern...' : 'Refine video...'}
                            onKeyDown={e => { if (e.key === 'Enter' && refinePrompt.trim()) { onRefine(refinePrompt); setRefinePrompt(''); } }}
                            style={{
                                flex: 1, padding: '0.625rem 0.875rem',
                                background: 'var(--muted)', border: '1px solid var(--border)',
                                borderRadius: '0.75rem', color: 'var(--foreground)',
                                fontSize: '0.8125rem', outline: 'none',
                            }}
                        />
                        <button
                            className="generate-btn"
                            disabled={!refinePrompt.trim()}
                            onClick={() => { if (refinePrompt.trim()) { onRefine(refinePrompt); setRefinePrompt(''); } }}
                            style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', fontSize: '0.8125rem' }}
                        >
                            <Sparkles size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
