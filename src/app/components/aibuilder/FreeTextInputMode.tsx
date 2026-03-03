/**
 * AI Ad Builder – Freitext-Modus (Visual Overhaul V4)
 * Uses input-section CSS classes, context-dependent chips, voice recording,
 * character progress bar, generate-btn-glow.
 */

import { useState } from 'react';
import { t } from '../../lib/aibuilder/translations';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Sparkles, Mic, MicOff, Zap, Loader2 } from 'lucide-react';
import { transcribeAudio } from '../../lib/api/aibuilder';
import { toast } from 'sonner';
import { useAuthState } from '../../contexts/AuthContext';
import type { AIAdBuilderComponentProps, FreeTextInputData } from '../../types/aibuilder';

const EXAMPLE_PROMPTS = [
    {
        label: '💪 Protein-Pulver',
        text: 'Erstelle eine Ad für mein neues Protein-Pulver. Zielgruppe: Fitness-Fans 25-40, die Wert auf natürliche Zutaten legen.',
    },
    {
        label: '✨ Beauty-Serum',
        text: 'Beauty-Serum gegen Falten, luxuriöse Positionierung, für Frauen 35+. Ton: elegant und vertrauenswürdig.',
    },
    {
        label: '📊 SaaS-Tool',
        text: 'SaaS-Tool für E-Commerce Händler, steigert Conversion-Rate um 30%. Moderner, datengetriebener Stil.',
    },
];

const RECOMMENDED_CHARS = 300;

export function FreeTextInputMode({ language, onGenerate, loading }: AIAdBuilderComponentProps) {
    const { profile } = useAuthState();
    const credits = profile?.credits ?? 0;

    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const charCount = text.length;
    const charPct = Math.min(charCount / RECOMMENDED_CHARS, 1) * 100;
    const isValid = text.trim().length >= 20;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            toast.error('Bitte gib eine Beschreibung ein');
            return;
        }
        const data: FreeTextInputData = { text, template: 'ai_automatic' };
        onGenerate(data);
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                stream.getTracks().forEach((track) => track.stop());
                setIsTranscribing(true);
                try {
                    const response = await transcribeAudio(blob);
                    if (response.success) {
                        setText((prev) => (prev ? prev + ' ' : '') + response.data.text);
                        toast.success('Transkription abgeschlossen');
                    }
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
                    toast.error('Transkription fehlgeschlagen: ' + errorMessage);
                } finally {
                    setIsTranscribing(false);
                }
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch {
            toast.error('Mikrofon-Zugriff fehlgeschlagen');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setMediaRecorder(null);
            setIsRecording(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="input-section">
                {/* Header + Voice Button */}
                <div className="input-section-header justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/15 to-red-500/10 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-semibold tracking-wide uppercase">Freitext-Briefing</span>
                    </div>

                    {/* Voice button */}
                    <button
                        type="button"
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        disabled={isTranscribing || loading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${isRecording
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 pulse-ring-red'
                            : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-border/20'
                            }`}
                    >
                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>
                            {isTranscribing ? 'Transkribiere...' : isRecording ? 'Stopp' : 'Spracheingabe'}
                        </span>
                    </button>
                </div>

                <div className="input-section-body">
                    {/* Example Prompt Chips */}
                    <div>
                        <p className="text-[10px] text-muted-foreground/50 mb-2 uppercase tracking-wider font-medium">
                            {text.trim() ? 'Beispiel-Prompts' : 'Wähle ein Beispiel oder schreibe selbst'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {EXAMPLE_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setText(prompt.text)}
                                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-300 border cursor-pointer ${text.trim()
                                        ? 'bg-muted/15 text-muted-foreground/50 border-border/15 hover:bg-muted/30 hover:text-muted-foreground'
                                        : 'bg-gradient-to-br from-primary/8 to-red-500/4 text-foreground/80 border-primary/15 hover:border-primary/30 hover:from-primary/12 hover:to-red-500/8'
                                        }`}
                                >
                                    {prompt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div className="space-y-2">
                        <Textarea
                            id="freetext"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Beschreibe dein Produkt, deine Zielgruppe und deinen gewünschten Stil in 2-3 Sätzen..."
                            rows={8}
                            disabled={loading || isTranscribing}
                            className="text-sm resize-none bg-muted/20 border-border/30 focus:bg-background transition-all"
                        />
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] text-muted-foreground/50">
                                    Je detaillierter, desto besser das Ergebnis.
                                </p>
                                <span className={`text-[10px] font-medium tabular-nums ${charCount >= RECOMMENDED_CHARS ? 'text-green-500' : charCount > 0 ? 'text-muted-foreground/50' : 'text-muted-foreground/25'
                                    }`}>
                                    {charCount}/{RECOMMENDED_CHARS}
                                </span>
                            </div>
                            {/* Visual progress bar */}
                            <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full char-progress ${charCount >= RECOMMENDED_CHARS
                                        ? 'bg-green-500'
                                        : charCount > 100
                                            ? 'bg-primary/50'
                                            : 'bg-muted-foreground/15'
                                        }`}
                                    style={{ width: `${charPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Generate Button ──────────────────────────────── */}
            <div className="generate-btn-glow">
                <Button
                    type="submit"
                    disabled={loading || isTranscribing || !isValid}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90 h-12 text-sm font-semibold shadow-lg shadow-primary/15"
                    size="lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('generating', language)}
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" />
                            Ad generieren
                            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-[10px] font-medium">
                                1 Credit
                            </span>
                        </>
                    )}
                </Button>
            </div>

            {/* Credits info */}
            <p className="text-center text-[11px] text-muted-foreground/50">
                {credits} {credits === 1 ? 'Credit' : 'Credits'} verbleibend
            </p>
        </form>
    );
}
