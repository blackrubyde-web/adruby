import { useState, useEffect } from 'react';
import { Brain, Loader2, Sparkles } from 'lucide-react';

interface StreamingAnalysisProps {
    campaigns: unknown[];
    onComplete: (analyses: unknown[]) => void;
    isAnalyzing: boolean;
}

export function StreamingAnalysis({ campaigns, onComplete, isAnalyzing }: StreamingAnalysisProps) {
    const [streamingText, setStreamingText] = useState('');
    const [currentCampaign, setCurrentCampaign] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        const startStreaming = async () => {
            if (!campaigns.length) return;

            setIsStreaming(true);
            setStreamingText('');

            try {
                const response = await fetch('/api/ai-analyze-stream', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaigns })
                });

                if (!response.body) throw new Error('No response body');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                let done = false;
                while (!done) {
                    const { done: streamDone, value } = await reader.read();
                    done = streamDone;

                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    // Update streaming text
                    setStreamingText(prev => prev + chunk);

                    // Check for campaign markers
                    const campaignMatch = chunk.match(/\[CAMPAIGN:(\d+)\]/);
                    if (campaignMatch) {
                        setCurrentCampaign(parseInt(campaignMatch[1]));
                    }
                }

                // Parse final result
                try {
                    const result = JSON.parse(buffer);
                    onComplete(result.analyses || []);
                } catch (e) {
                    console.error('Failed to parse streaming result:', e);
                }
            } catch (error) {
                console.error('Streaming error:', error);
            } finally {
                setIsStreaming(false);
            }
        };

        if (!isAnalyzing) {
            setStreamingText('');
            setCurrentCampaign(0);
            setIsStreaming(false);
        } else {
            startStreaming();
        }
    }, [isAnalyzing, campaigns, onComplete]);


    if (!isAnalyzing) return null;

    return (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
                {/* Animated Brain Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                    <div className="relative p-3 bg-blue-500/20 rounded-full">
                        <Brain className="w-6 h-6 text-blue-500 animate-pulse" />
                    </div>
                </div>

                {/* Streaming Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-lg">AI Analysis in Progress</h3>
                        <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                                Analyzing campaign {currentCampaign + 1} of {campaigns.length}
                            </span>
                            <span className="font-medium">
                                {Math.round(((currentCampaign + 1) / campaigns.length) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${((currentCampaign + 1) / campaigns.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Streaming Text */}
                    <div className="bg-card/50 border border-border rounded-xl p-4 max-h-[300px] overflow-y-auto">
                        <div className="text-sm font-mono whitespace-pre-wrap">
                            {streamingText}
                            {isStreaming && <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1">▊</span>}
                        </div>
                    </div>

                    {/* Status Messages */}
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                            {currentCampaign === 0 && 'Initializing AI analysis...'}
                            {currentCampaign > 0 && currentCampaign < campaigns.length && 'Analyzing campaigns...'}
                            {currentCampaign === campaigns.length && 'Finalizing insights...'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
