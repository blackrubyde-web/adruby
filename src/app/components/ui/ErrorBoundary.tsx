import { Component, type ReactNode } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackTitle?: string;
    onReset?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary — catches render errors and shows a branded
 * error page instead of a white screen. Tech-startup grade.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo);
        // TODO: send to Sentry/telemetry when available
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
                <div className="text-center max-w-lg">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-10">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <span className="font-bold text-2xl">AdRuby</span>
                    </div>

                    {/* Error Icon */}
                    <div className="mb-6 flex items-center justify-center">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-red-500/5 animate-ping" />
                        </div>
                    </div>

                    {/* Title + Message */}
                    <h2 className="text-2xl font-bold mb-3">
                        {this.props.fallbackTitle || 'Etwas ist schiefgelaufen'}
                    </h2>
                    <p className="text-muted-foreground mb-2">
                        Ein unerwarteter Fehler ist aufgetreten. Bitte lade die Seite neu oder versuche es später erneut.
                    </p>

                    {/* Error detail (collapsed) */}
                    {this.state.error && (
                        <details className="mb-8 text-left">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                Technische Details anzeigen
                            </summary>
                            <pre className="mt-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-4 overflow-x-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={this.handleReload}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Seite neu laden
                        </button>
                        <button
                            onClick={this.handleGoHome}
                            className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Zur Startseite
                        </button>
                    </div>

                    {/* Support Link */}
                    <p className="mt-10 text-xs text-muted-foreground">
                        Das Problem bleibt bestehen?{' '}
                        <a href="mailto:support@adruby.de" className="text-primary hover:underline">
                            Support kontaktieren
                        </a>
                    </p>
                </div>
            </div>
        );
    }
}
