import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface MobileStickyCTAProps {
    onGetStarted: () => void;
    showAfterRef?: React.RefObject<HTMLElement>;
    isHidden?: boolean;
}

export function MobileStickyCTA({ onGetStarted, showAfterRef, isHidden }: MobileStickyCTAProps) {
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

    return (
        <AnimatePresence>
            {isVisible && !isHidden && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-50 md:hidden"
                    style={{
                        bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
                    }}
                >
                    <div className="bg-black/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full p-2 pl-5 flex items-center justify-between gap-3">
                        {/* Micro Value Prop */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <Sparkles className="w-3.5 h-3.5 text-[#E63946] animate-pulse" />
                                <span>Wirklich kostenlos.</span>
                            </div>
                        </div>

                        {/* CTA Button — 44px min height for thumb tap */}
                        <button
                            onClick={onGetStarted}
                            className="bg-[#E63946] text-white px-6 py-2.5 min-h-[44px] rounded-full font-bold text-sm shadow-[0_0_15px_rgba(230,57,70,0.5)] active:scale-95 active:brightness-90 transition-all flex items-center gap-2"
                        >
                            Testen
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
