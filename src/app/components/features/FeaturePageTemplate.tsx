import { motion } from 'motion/react';
import {
    ArrowRight,
    CheckCircle,
    Sparkles,
    Shield,
    Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlobalNav } from '../landing/GlobalNav';

// ─── Motion variants ────────────────────────────────────
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

// ─── Types ──────────────────────────────────────────────
interface Capability {
    icon: LucideIcon;
    title: string;
    description: string;
}

interface Step {
    step: string;
    title: string;
    desc: string;
}

interface FeaturePageTemplateProps {
    /** e.g. 'feature-ai-generator' — matches routing IDs */
    currentPage: string;
    /** Badge text, e.g. 'AI Ad Generator' */
    badge: string;
    /** Icon for the badge pill */
    badgeIcon: LucideIcon;
    /** Headline line 1 */
    headlineTop: string;
    /** Headline line 2 (gradient text) */
    headlineGradient: string;
    /** Optional headline line 3 */
    headlineBottom?: string;
    /** Subtitle paragraph */
    subtitle: string;
    /** Gradient CSS for accents, e.g. 'from-[#E63946] to-rose-400' */
    accentGradient: string;
    /** Solid hex for the accent badge/icon color, e.g. '#E63946' */
    accentColor: string;
    /** Capability cards */
    capabilities: Capability[];
    /** How-it-works steps */
    steps: Step[];
    /** Router callbacks */
    onNavigate: (page: string) => void;
    onSignIn: () => void;
    onGetStarted: () => void;
}

export function FeaturePageTemplate({
    currentPage,
    badge,
    badgeIcon: BadgeIcon,
    headlineTop,
    headlineGradient,
    headlineBottom,
    subtitle,
    accentGradient,
    accentColor,
    capabilities,
    steps,
    onNavigate,
    onSignIn,
    onGetStarted,
}: FeaturePageTemplateProps) {
    return (
        <div className="landing-theme-root min-h-screen bg-[#050507] font-body text-white overflow-x-hidden selection:bg-rose-500/30">
            <GlobalNav
                currentPage={currentPage}
                onNavigate={onNavigate}
                onSignIn={onSignIn}
                onGetStarted={onGetStarted}
            />

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[20%] left-[40%] w-[600px] h-[600px] rounded-full blur-[150px]"
                    style={{ background: `radial-gradient(circle, ${accentColor}15, transparent 70%)` }} />
                <div className="absolute bottom-[20%] right-[25%] w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />
            </div>

            {/* ── Hero ─────────────────────────────── */}
            <section className="relative z-10 pt-36 pb-20 sm:pt-48 sm:pb-28">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
                    <motion.div initial="hidden" animate="visible" variants={stagger}>
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
                            style={{ background: `${accentColor}12`, borderColor: `${accentColor}25` }}>
                            <BadgeIcon className="w-4 h-4" style={{ color: accentColor }} />
                            <span className="text-sm font-semibold" style={{ color: accentColor }}>{badge}</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] mb-6">
                            <span className="text-white">{headlineTop}</span>
                            <br />
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accentGradient}`}>
                                {headlineGradient}
                            </span>
                            {headlineBottom && (
                                <>
                                    <br />
                                    <span className="text-white">{headlineBottom}</span>
                                </>
                            )}
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {subtitle}
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                onClick={onGetStarted}
                                whileHover={{ scale: 1.03, boxShadow: `0 0 50px ${accentColor}40` }}
                                whileTap={{ scale: 0.97 }}
                                className={`group px-8 py-4 bg-gradient-to-r ${accentGradient} text-white rounded-2xl font-bold text-lg shadow-lg inline-flex items-center gap-3`}
                            >
                                Jetzt kostenlos testen
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Capabilities Grid ────────────────── */}
            <section className="relative z-10 py-20 sm:py-28">
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={stagger}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                            Alles was du brauchst
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-lg text-white/40 max-w-xl mx-auto">
                            Modernste Technologie trifft auf Marketing-Expertise
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-40px' }}
                        variants={stagger}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {capabilities.map((cap, i) => {
                            const Icon = cap.icon;
                            return (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    className="group bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500"
                                >
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accentGradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-display text-lg font-bold text-white mb-2">{cap.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed">{cap.description}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ── How It Works ─────────────────────── */}
            <section className="relative z-10 py-20 sm:py-28">
                <div className="max-w-4xl mx-auto px-5 sm:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        variants={stagger}
                    >
                        <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-16">
                            So einfach <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accentGradient}`}>geht's</span>
                        </motion.h2>

                        <div className="space-y-6">
                            {steps.map((item, i) => (
                                <motion.div key={i} variants={fadeUp} className="flex gap-6 items-start bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 hover:border-white/[0.12] transition-all">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white font-display font-bold text-lg shrink-0 shadow-lg`}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-bold text-white mb-1">{item.title}</h3>
                                        <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────── */}
            <section className="relative z-10 py-24 sm:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ background: `linear-gradient(135deg, ${accentColor}, transparent 50%)` }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none"
                    style={{ background: `${accentColor}10` }} />

                <div className="max-w-3xl mx-auto px-5 sm:px-8 relative z-10 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
                            Bereit loszulegen?
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-lg text-white/40 mb-10">
                            Starte jetzt mit 7 Tagen kostenlosem Zugang zu allen Features.
                        </motion.p>
                        <motion.div variants={fadeUp}>
                            <button
                                onClick={onGetStarted}
                                className={`group px-10 py-5 bg-gradient-to-r ${accentGradient} text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-3`}
                            >
                                Kostenlos starten
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-8">
                            {['Keine Kreditkarte nötig', 'Jederzeit kündbar', '100+ Vorlagen'].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-white/40">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    {item}
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ──────────────────────────── */}
            <footer className="relative z-10 border-t border-white/[0.06]">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E63946] to-red-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-display font-bold text-lg text-white">AdRuby</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {[
                                { icon: <Shield className="w-3.5 h-3.5" />, label: 'DSGVO-konform' },
                                { icon: <CheckCircle className="w-3.5 h-3.5" />, label: '99.9% Uptime' },
                            ].map(({ icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5 text-xs text-white/25">
                                    <span className="text-[#E63946]/40">{icon}</span>
                                    {label}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/20">
                            <span>© {new Date().getFullYear()} BLACKRUBY UG</span>
                            <Heart className="w-3 h-3 text-[#E63946] fill-[#E63946]" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
