import { Check, X } from 'lucide-react';

export function PricingComparisonTable() {
    const features = [
        {
            category: 'Credits & Limits',
            items: [
                { name: 'Credits pro Monat', starter: '100', pro: '2.500', agency: '10.000' },
                { name: 'Ads generieren', starter: '~10', pro: '~250', agency: '~1.000' },
                { name: 'Brand-Personas', starter: '3', pro: 'Unbegrenzt', agency: 'Unbegrenzt' },
            ]
        },
        {
            category: 'KI-Modelle',
            items: [
                { name: 'GPT-4o (Premium)', starter: false, pro: true, agency: true },
                { name: 'GPT-4o-mini (Basis)', starter: true, pro: true, agency: true },
                { name: 'DALL·E 3', starter: false, pro: true, agency: true },
            ]
        },
        {
            category: 'Features',
            items: [
                { name: 'Standard Templates', starter: true, pro: true, agency: true },
                { name: 'Premium Templates', starter: false, pro: true, agency: true },
                { name: 'Video Ads', starter: false, pro: true, agency: true },
                { name: 'Auto-Resize', starter: false, pro: true, agency: true },
                { name: 'Background Removal', starter: false, pro: true, agency: true },
                { name: 'Performance Prediction', starter: '3x/Tag', pro: 'Unbegrenzt', agency: 'Unbegrenzt' },
            ]
        },
        {
            category: 'Team & Collaboration',
            items: [
                { name: 'Team-Mitglieder', starter: '1', pro: '3', agency: '10+' },
                { name: 'White-Labeling', starter: false, pro: false, agency: true },
                { name: 'API Zugriff', starter: false, pro: false, agency: true },
            ]
        },
        {
            category: 'Support',
            items: [
                { name: 'Community Support', starter: true, pro: true, agency: true },
                { name: 'Priority Support', starter: false, pro: true, agency: true },
                { name: 'Dedicated Manager', starter: false, pro: false, agency: true },
            ]
        },
    ];

    const renderCell = (value: string | boolean | number) => {
        if (typeof value === 'boolean') {
            return value ? (
                <Check className="w-5 h-5 text-green-500 mx-auto" />
            ) : (
                <X className="w-5 h-5 text-white/20 mx-auto" />
            );
        }
        return <span className="text-white/80 text-sm font-medium">{value}</span>;
    };

    return (
        <section className="py-24 sm:py-32 relative z-10">
            <div className="landing-container">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                        Alle Features <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">im Vergleich</span>
                    </h2>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        Wähle den Plan, der zu deinen Zielen passt
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="max-w-6xl mx-auto overflow-x-auto">
                    <div className="min-w-[600px] bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/10 bg-white/5">
                        <div></div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-white mb-1">Starter</div>
                            <div className="text-sm text-white/60">€0/Monat</div>
                        </div>
                        <div className="text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 -m-3">
                            <div className="text-lg font-bold text-white mb-1">Pro</div>
                            <div className="text-sm text-rose-400">€49/Monat</div>
                            <div className="text-xs text-rose-400/60 mt-1">BELIEBTESTE</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-white mb-1">Agency</div>
                            <div className="text-sm text-white/60">€199/Monat</div>
                        </div>
                    </div>

                    {/* Feature Categories */}
                    {features.map((category, catIndex) => (
                        <div key={catIndex}>
                            <div className="px-6 py-4 bg-white/5">
                                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">{category.category}</h4>
                            </div>
                            {category.items.map((item, itemIndex) => (
                                <div
                                    key={itemIndex}
                                    className="grid grid-cols-4 gap-4 p-6 border-t border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <div className="text-sm text-white/70 font-medium">{item.name}</div>
                                    <div className="text-center">{renderCell(item.starter)}</div>
                                    <div className="text-center bg-rose-500/5 rounded-lg -m-2 p-2">{renderCell(item.pro)}</div>
                                    <div className="text-center">{renderCell(item.agency)}</div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* CTA Row */}
                    <div className="grid grid-cols-4 gap-4 p-6 border-t border-white/10 bg-white/5">
                        <div></div>
                        <div className="text-center">
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg font-semibold text-sm transition-all">
                                Starten
                            </button>
                        </div>
                        <div className="text-center">
                            <button className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-rose-600/20">
                                7 Tage testen
                            </button>
                        </div>
                        <div className="text-center">
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg font-semibold text-sm transition-all">
                                Sales kontaktieren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
