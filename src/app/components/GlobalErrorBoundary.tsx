import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 bg-grid-pattern">
                    <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-red-500/10 p-8 flex justify-center border-b border-red-500/20">
                            <div className="h-20 w-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                                <AlertTriangle className="h-10 w-10 text-red-500" />
                            </div>
                        </div>

                        <div className="p-8 text-center space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
                                <p className="text-muted-foreground text-sm">
                                    We encountered an unexpected error. Our team has been notified.
                                </p>
                            </div>

                            {this.state.error && (
                                <div className="p-4 bg-muted/50 rounded-xl border border-border text-left overflow-auto max-h-32">
                                    <code className="text-[10px] font-mono text-muted-foreground break-all">
                                        {this.state.error.toString()}
                                    </code>
                                </div>
                            )}

                            <div className="flex gap-4 justify-center pt-2">
                                <button
                                    onClick={this.handleReload}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all hover:scale-105"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reload App
                                </button>
                                <button
                                    onClick={this.handleGoHome}
                                    className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold text-sm transition-all"
                                >
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/20 border-t border-border text-center">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">AdRuby System Diagnostics</p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
