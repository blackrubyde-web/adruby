import { Star, TrendingUp, Users, ArrowRight } from 'lucide-react';

export function AffiliateSuccessStories() {
    const stories = [
        {
            name: "Sarah M.",
            role: "E-Commerce Content Creator",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
            earnings: "€4.250+",
            quote: "AdRuby hat meine Community komplett überzeugt. Der beste Teil? Die Churn-Rate ist extrem niedrig, weil das Produkt wirklich hilft.",
            stats: { label: "Conversion Rate", value: "12%" }
        },
        {
            name: "Markus W.",
            role: "Performance Marketing Agentur",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
            earnings: "€12.800+",
            quote: "Ich empfehle AdRuby jedem meiner Kunden. Es spart ihnen Geld und mir Zeit. Die 30% Lifetime-Commission sind ein echtes passives Einkommen.",
            stats: { label: "Ref. Kunden", value: "45+" }
        },
        {
            name: "Lisa K.",
            role: "Dropshipping Coach",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
            earnings: "€8.900+",
            quote: "Endlich ein Tool, das meine Students sofort verstehen. Der Support für Partner ist erstklassig und Auszahlungen kommen immer pünktlich.",
            stats: { label: "Community", value: "5k+" }
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-rose-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="landing-container relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Star className="w-3 h-3" /> Partner Stories
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                        Erfolgsgeschichten <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">unserer Partner</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {stories.map((story, index) => (
                        <div
                            key={index}
                            className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Profile */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-rose-500/50 transition-colors">
                                        <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] border-2 border-[#0A0A0A]">
                                        <Star className="w-3 h-3 fill-current" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{story.name}</h4>
                                    <p className="text-white/40 text-sm">{story.role}</p>
                                </div>
                            </div>

                            {/* Earnings Badge */}
                            <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Einnahmen</div>
                                    <div className="text-xl font-bold text-green-400">{story.earnings}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">{story.stats.label}</div>
                                    <div className="text-white font-semibold">{story.stats.value}</div>
                                </div>
                            </div>

                            {/* Quote */}
                            <p className="text-white/80 leading-relaxed italic relative">
                                <span className="text-4xl text-rose-500/20 absolute -top-4 -left-2 font-serif">"</span>
                                {story.quote}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
        </section >
    );
}
