import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronDown, Bot, User, Loader2, RotateCcw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface CampaignContext {
    campaigns: Array<{
        id: string;
        name: string;
        roas: number;
        spend: number;
        ctr: number;
    }>;
    summary: {
        spend: number;
        revenue: number;
        roas: number;
    };
    recommendations: {
        kill: number;
        duplicate: number;
        increase: number;
        decrease: number;
    };
}

interface AICopilotChatProps {
    campaignContext?: CampaignContext;
}

const INITIAL_SUGGESTIONS = [
    "Welche Ad soll ich skalieren?",
    "Was sind die besten Hook-Typen?",
    "Wie optimiere ich meinen ROAS?",
    "Erstelle mir einen Optimierungsplan",
];

/* ── Simple Markdown Renderer ───────────────────── */
function renderMarkdown(text: string) {
    // Split by line, process each
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    for (const line of lines) {
        let processed: React.ReactNode = line;

        // Bold **text**
        if (line.includes('**')) {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            processed = parts.map((part, j) =>
                j % 2 === 1 ? <strong key={`b-${i}-${j}`} className="font-bold text-white">{part}</strong> : part
            );
        }

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
            elements.push(
                <div key={i} className="flex gap-2 ml-2">
                    <span className="text-primary shrink-0 mt-0.5">•</span>
                    <span>{typeof processed === 'string' ? processed.slice(2) : processed}</span>
                </div>
            );
        } else if (line.startsWith('  - ')) {
            elements.push(
                <div key={i} className="flex gap-2 ml-6">
                    <span className="text-muted-foreground shrink-0 mt-0.5">◦</span>
                    <span>{typeof processed === 'string' ? processed.slice(4) : processed}</span>
                </div>
            );
        } else if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^(\d+)\./)?.[1] || '';
            const rest = line.replace(/^\d+\.\s/, '');
            elements.push(
                <div key={i} className="flex gap-2 ml-2">
                    <span className="text-primary font-bold shrink-0">{num}.</span>
                    <span>{rest.includes('**') ?
                        rest.split(/\*\*(.*?)\*\*/g).map((p, j) =>
                            j % 2 === 1 ? <strong key={`n-${i}-${j}`} className="font-bold text-white">{p}</strong> : p
                        ) : rest}</span>
                </div>
            );
        } else if (line.trim() === '') {
            elements.push(<div key={i} className="h-2" />);
        } else {
            elements.push(<div key={i}>{processed}</div>);
        }
        i++;
    }

    return <>{elements}</>;
}

export const AICopilotChat = memo(function AICopilotChat({
    campaignContext,
}: AICopilotChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(INITIAL_SUGGESTIONS);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
    useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

    const clearChat = () => {
        setMessages([]);
        setSuggestedQuestions(INITIAL_SUGGESTIONS);
    };

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            const response = await fetch('/api/ai-copilot-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message: content,
                    campaignContext,
                    conversationHistory: messages.slice(-8).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                id: `msg-${Date.now()}-ai`,
                role: 'assistant',
                content: data.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (data.suggestedQuestions) {
                setSuggestedQuestions(data.suggestedQuestions);
            }
        } catch (error) {
            console.error('[AICopilotChat] Error:', error);
            const errorMessage: Message = {
                id: `msg-${Date.now()}-error`,
                role: 'assistant',
                content: '⚠️ Es gab einen Verbindungsfehler. Bitte versuche es erneut.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, campaignContext]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center"
                style={{
                    background: isOpen
                        ? 'var(--card)'
                        : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                    border: '1px solid var(--border)',
                    boxShadow: isOpen
                        ? '0 4px 20px rgba(0,0,0,0.2)'
                        : '0 4px 30px hsl(var(--primary) / 0.3)',
                }}
            >
                {isOpen ? (
                    <ChevronDown className="w-6 h-6 text-foreground" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}

                {/* Pulse Effect when closed & no messages */}
                {!isOpen && messages.length === 0 && (
                    <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping"
                        style={{ background: 'hsl(var(--primary))' }}
                    />
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] overflow-hidden flex flex-col"
                    style={{
                        maxHeight: 'min(640px, calc(100vh - 140px))',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '1.25rem',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px hsl(var(--primary) / 0.05)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="p-4 flex items-center justify-between"
                        style={{
                            borderBottom: '1px solid var(--border)',
                            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), transparent)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                                }}
                            >
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                                    AdRuby Copilot
                                </h3>
                                <p className="text-[11px] text-muted-foreground">Marketing AI · Powered by Gemini</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    className="p-2 rounded-lg transition-colors"
                                    style={{ color: 'var(--muted-foreground)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    title="Chat leeren"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: 'var(--muted-foreground)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                        {messages.length === 0 ? (
                            <div className="text-center py-6">
                                <div
                                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                    style={{
                                        background: 'hsl(var(--primary) / 0.1)',
                                        border: '1px solid hsl(var(--primary) / 0.15)',
                                    }}
                                >
                                    <Bot className="w-8 h-8" style={{ color: 'hsl(var(--primary))' }} />
                                </div>
                                <p className="text-foreground font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                    Frag mich alles!
                                </p>
                                <p className="text-xs text-muted-foreground mb-5">
                                    Marketing-Strategien, Kampagnen-Analyse, Creative-Tipps
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(q)}
                                            className="filter-chip text-xs"
                                            style={{ fontSize: '0.6875rem' }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            background: msg.role === 'user'
                                                ? 'hsl(var(--primary) / 0.15)'
                                                : 'var(--muted)',
                                            border: `1px solid ${msg.role === 'user' ? 'hsl(var(--primary) / 0.2)' : 'var(--border)'}`,
                                        }}
                                    >
                                        {msg.role === 'user' ? (
                                            <User className="w-3.5 h-3.5" style={{ color: 'hsl(var(--primary))' }} />
                                        ) : (
                                            <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div
                                        className="max-w-[82%] p-3 text-sm"
                                        style={{
                                            borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                                            background: msg.role === 'user'
                                                ? 'hsl(var(--primary))'
                                                : 'var(--muted)',
                                            color: msg.role === 'user'
                                                ? 'white'
                                                : 'var(--foreground)',
                                            border: msg.role === 'user'
                                                ? 'none'
                                                : '1px solid var(--border)',
                                        }}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <div className="space-y-0.5 text-[13px] leading-relaxed">
                                                {renderMarkdown(msg.content)}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                                >
                                    <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                                <div
                                    className="p-3 rounded-2xl rounded-bl-sm flex items-center gap-2"
                                    style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                                >
                                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
                                    <span className="text-xs text-muted-foreground">Denkt nach...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions after conversation */}
                    {messages.length > 0 && !isLoading && suggestedQuestions.length > 0 && (
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                            {suggestedQuestions.slice(0, 3).map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q)}
                                    className="filter-chip text-xs whitespace-nowrap"
                                    style={{ fontSize: '0.625rem', padding: '0.25rem 0.625rem' }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="p-3"
                        style={{ borderTop: '1px solid var(--border)' }}
                    >
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Frag mich etwas..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm disabled:opacity-50"
                                style={{
                                    background: 'var(--muted)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--foreground)',
                                    outline: 'none',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)')}
                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-opacity disabled:opacity-40"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                                    color: 'white',
                                    border: 'none',
                                }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
});
