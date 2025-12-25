"use client";
import { memo, useState } from 'react';
import { Palette } from 'lucide-react';
import { EditorLayout } from './studio/EditorLayout';

export const StudioPage = memo(function StudioPage() {
    const [isLaunchOpen, setIsLaunchOpen] = useState(true);

    const handleClose = () => {
        // For Vite: just close the studio overlay
        setIsLaunchOpen(false);
        // If using react-router, you could do: navigate('/dashboard');
        // For now, we'll just toggle the state
    };

    if (!isLaunchOpen) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-10">
                <div className="p-6 bg-primary/10 rounded-full mb-6">
                    <Palette className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">AdBuilder Studio</h1>
                <p className="text-muted-foreground mb-10 text-center max-w-sm">
                    Generate high-performance creatives with AI and professional templates.
                </p>
                <button
                    onClick={() => setIsLaunchOpen(true)}
                    className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    Launch Studio
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* The Overlay is actually the whole page when open */}
            <div className="flex-1 bg-zinc-950 flex flex-col h-full relative">
                <EditorLayout onClose={handleClose} onSave={(doc) => {
                    handleClose();
                }} />
            </div>
        </div>
    );
});
