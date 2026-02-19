import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OverviewPreview } from './OverviewPreview';
import { AIAutopilotPreview } from './AIAutopilotPreview';
import { CreativeLibraryPreview } from './CreativeLibraryPreview';

export function DashboardShowcaseSection() {
    const [activeTab, setActiveTab] = useState<'overview' | 'autopilot' | 'library'>('overview');

    const tabs = [
        { id: 'overview' as const, label: 'Übersicht', emoji: '📊' },
        { id: 'autopilot' as const, label: 'KI-Autopilot', emoji: '🤖' },
        { id: 'library' as const, label: 'Creative Library', emoji: '🎨' },
    ];

    const previewComponents = {
        overview: <OverviewPreview />,
        autopilot: <AIAutopilotPreview />,
        library: <CreativeLibraryPreview />,
    };

    return (
        <section className="py-24 sm:py-32 bg-gradient-to-b from-black via-[#0A0A0A] to-background relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#E63946]/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-12 sm:mb-16"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                        </span>
                        <span className="text-xs font-medium tracking-wide text-white/90 uppercase">Live Preview</span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight font-display">
                        Sieh dir die Plattform <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-600">in Aktion</span> an
                    </h2>
                    <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
                        Ein Blick auf das AdRuby Dashboard – genau so, wie du es nutzen wirst
                    </p>
                </motion.div>

                {/* Tabs — with sliding active indicator */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-colors duration-200 ${activeTab === tab.id
                                ? 'text-white'
                                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="dashboard-tab-indicator"
                                    className="absolute inset-0 bg-gradient-to-r from-[#c01830] via-rose-600 to-red-600 rounded-full shadow-[0_0_30px_rgba(230,57,70,0.3)]"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">
                                <span className="mr-2">{tab.emoji}</span>
                                {tab.label}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Preview Container */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* Animated Border Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#E63946] via-rose-500 to-red-600 rounded-3xl opacity-20 blur-xl animate-pulse" />

                    {/* Content — AnimatePresence slide+fade */}
                    <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                            >
                                {previewComponents[activeTab]}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <p className="text-white/60 mb-6 text-sm sm:text-base">
                        Überzeugend? Probier es selbst aus. Völlig kostenlos.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
