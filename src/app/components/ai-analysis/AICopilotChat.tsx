import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronDown, Bot, User, Loader2 } from 'lucide-react';
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
    "Wie ist mein ROAS insgesamt?",
    "Was sind meine Top 3 Performer?",
];

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

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

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
                    conversationHistory: messages.slice(-6).map(m => ({
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
                content: 'Es gab einen Fehler. Bitte versuche es erneut.',
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

    const handleSuggestionClick = (question: string) => {
        sendMessage(question);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${isOpen
                        ? 'bg-zinc-800 rotate-0 scale-90'
                        : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:scale-110 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]'
                    }`}
            >
                {isOpen ? (
                    <ChevronDown className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}

                {/* Pulse Effect when closed */}
                {!isOpen && messages.length === 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping" />
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    style={{ maxHeight: 'min(600px, calc(100vh - 140px))' }}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">AdRuby Copilot</h3>
                                    <p className="text-xs text-white/50">AI Performance Advisor</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                        {messages.length === 0 ? (
                            <div className="text-center py-8">
                                <Bot className="w-12 h-12 text-violet-400 mx-auto mb-4 opacity-50" />
                                <p className="text-white/60 text-sm mb-4">
                                    Frag mich zu deinen Kampagnen!
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(q)}
                                            className="px-3 py-1.5 text-xs bg-violet-500/20 text-violet-300 rounded-full hover:bg-violet-500/30 transition-colors border border-violet-500/20"
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
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user'
                                            ? 'bg-blue-500/20'
                                            : 'bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            <User className="w-4 h-4 text-blue-400" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-violet-400" />
                                        )}
                                    </div>
                                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-white/5 text-white/90 rounded-bl-md border border-white/5'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-violet-400" />
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md p-3">
                                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions after conversation */}
                    {messages.length > 0 && !isLoading && suggestedQuestions.length > 0 && (
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                            {suggestedQuestions.slice(0, 2).map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(q)}
                                    className="px-3 py-1 text-xs bg-white/5 text-white/60 rounded-full hover:bg-white/10 transition-colors whitespace-nowrap border border-white/5"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-white/5">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Frag mich etwas..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
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
