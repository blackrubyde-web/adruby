import { memo, useState } from 'react';
import { Layers } from 'lucide-react';
import { CampaignCanvasLayout } from './campaign-canvas';

export const CampaignCanvasPage = memo(function CampaignCanvasPage() {
    const [isCanvasOpen, setIsCanvasOpen] = useState(true);

    const handleClose = () => {
        // Navigate back to campaigns list
        const nextUrl = '/campaigns';
        window.history.pushState({}, document.title, nextUrl);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    if (!isCanvasOpen) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background p-10">
                <div className="p-6 bg-primary/10 rounded-full mb-6">
                    <Layers className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Campaign Canvas</h1>
                <p className="text-muted-foreground mb-10 text-center max-w-sm">
                    Build and visualize your campaign structure with an intuitive drag-and-drop canvas.
                </p>
                <button
                    onClick={() => setIsCanvasOpen(true)}
                    className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    Launch Canvas
                </button>
            </div>
        );
    }

    return <CampaignCanvasLayout onClose={handleClose} />;
});
