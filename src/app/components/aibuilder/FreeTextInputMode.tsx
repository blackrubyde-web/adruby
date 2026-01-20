/**
 * AI Ad Builder - Free Text Input Mode Component
 * Template selection removed - AI Creative Director decides automatically
 */

import { useState } from 'react';
import { t } from '../../lib/aibuilder/translations';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Sparkles, Mic, MicOff } from 'lucide-react';
import { transcribeAudio } from '../../lib/api/aibuilder';
import { toast } from 'sonner';
import type { AIAdBuilderComponentProps, FreeTextInputData } from '../../types/aibuilder';

export function FreeTextInputMode({ language, onGenerate, loading }: AIAdBuilderComponentProps) {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            toast.error('Please enter some text');
            return;
        }
        // Template is always ai_automatic - AI Creative Director decides
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

                // Transcribe
                setIsTranscribing(true);
                try {
                    const response = await transcribeAudio(blob);
                    if (response.success) {
                        setText((prev) => (prev ? prev + ' ' : '') + response.data.text);
                        toast.success('Transcription complete');
                    }
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    toast.error('Transcription failed: ' + errorMessage);
                } finally {
                    setIsTranscribing(false);
                }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Recording error:', err);
            toast.error('Could not access microphone');
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur p-6 space-y-4">
                {/* Free Text Input */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="freetext">
                            {language === 'de' ? 'Beschreibung' : 'Description'}
                        </Label>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={isRecording ? handleStopRecording : handleStartRecording}
                            disabled={isTranscribing || loading}
                            className="gap-2"
                        >
                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            {isTranscribing
                                ? t('voiceTranscribing', language)
                                : isRecording
                                    ? t('voiceStop', language)
                                    : t('voiceInputButton', language)}
                        </Button>
                    </div>

                    <Textarea
                        id="freetext"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t('freeTextPlaceholder', language)}
                        rows={10}
                        disabled={loading || isTranscribing}
                    />
                </div>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={loading || isTranscribing || !text.trim()}
                className="w-full gap-2 bg-gradient-to-r from-primary to-red-600 hover:from-primary/90 hover:to-red-600/90"
                size="lg"
            >
                <Sparkles className="w-4 h-4" />
                {loading ? t('generating', language) : t('generateButton', language)}
            </Button>
        </form>
    );
}

