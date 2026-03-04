import { Sparkles, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';

export function FullScreenLoader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <div className="flex items-center justify-center gap-2 mb-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-bold text-2xl">AdRuby</span>
                </div>

                <div className="mb-6 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>

                <h2 className="text-2xl font-bold mb-3">{title}</h2>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    );
}

export function FullScreenError({
    title,
    message,
    onRetry,
    onSignOut,
}: {
    title: string;
    message: string;
    onRetry: () => void;
    onSignOut: () => void;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <div className="flex items-center justify-center gap-2 mb-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-bold text-2xl">AdRuby</span>
                </div>

                <div className="mb-6 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-3">{title}</h2>
                <p className="text-muted-foreground mb-8">{message}</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Erneut versuchen
                    </button>
                    <button
                        onClick={onSignOut}
                        className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Abmelden
                    </button>
                </div>
            </div>
        </div>
    );
}
