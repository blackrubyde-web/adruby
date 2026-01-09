import { useState } from 'react';
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

    return (
        <section className="py-24 sm:py-32 bg-gradient-to-b from-black via-[#0A0A0A] to-background relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#FF1F1F]/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                        <span className="text-xs font-medium tracking-wide text-white/90 uppercase">Live Preview</span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Sieh dir die Plattform <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1F1F] to-rose-600">in Aktion</span> an
                    </h2>
                    <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
                        Ein Blick auf das AdRuby Dashboard – genau so, wie du es nutzen wirst
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white shadow-[0_0_30px_rgba(255,31,31,0.3)]'
                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="mr-2">{tab.emoji}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Preview Container */}
                <div className="relative">
                    {/* Animated Border Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FF1F1F] via-rose-500 to-red-600 rounded-3xl opacity-20 blur-xl" />

                    {/* Content */}
                    <div className="relative">
                        {activeTab === 'overview' && (
                            <div className="animate-in fade-in-50 duration-500">
                                <OverviewPreview />
                            </div>
                        )}
                        {activeTab === 'autopilot' && (
                            <div className="animate-in fade-in-50 duration-500">
                                <AIAutopilotPreview />
                            </div>
                        )}
                        {activeTab === 'library' && (
                            <div className="animate-in fade-in-50 duration-500">
                                <CreativeLibraryPreview />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <p className="text-white/60 mb-6 text-sm sm:text-base">
                        Überzeugend? Probier es selbst aus. Völlig kostenlos.
                    </p>
                </div>
            </div>
        </section>
    );
}
