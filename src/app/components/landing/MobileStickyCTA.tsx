import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface MobileStickyCTAProps {
    onGetStarted: () => void;
    showAfterRef?: React.RefObject<HTMLElement>;
}

export function MobileStickyCTA({ onGetStarted, showAfterRef }: MobileStickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!showAfterRef?.current) {
                // Fallback if no ref provided: show after scrolling 800px
                setIsVisible(window.scrollY > 800);
                return;
            }

            const rect = showAfterRef.current.getBoundingClientRect();
            // Show when the bottom of the ref element (hero) passes the top of the viewport
            // Add a small buffer (e.g. 100px) so it doesn't appear immediately
            const passedHero = rect.bottom < 100;
            setIsVisible(passedHero);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [showAfterRef]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 md:hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="bg-background/80 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl rounded-2xl p-1.5 flex items-center gap-3">
                {/* Mini Value Prop */}
                <div className="flex-1 pl-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                        <span>7 Tage kostenlos testen</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                        Jederzeit kündbar
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onGetStarted}
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5"
                >
                    Testen
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
