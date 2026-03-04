import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
    onNavigate?: (page: string) => void;
}

export function ImpressumPage({ onNavigate }: LegalPageProps) {
    return (
        <div className="min-h-screen bg-[#050507] text-white">
            <div className="max-w-3xl mx-auto px-6 py-24 sm:py-32">
                {/* Back link */}
                <button
                    onClick={() => onNavigate?.('landing')}
                    className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-12"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zur Startseite
                </button>

                <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    Impressum
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-[#E63946] to-rose-500 rounded-full mb-12" />

                <div className="space-y-10 text-white/60 leading-relaxed text-[15px]">
                    {/* Website */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Website</h2>
                        <p>
                            Dieses Impressum gilt für alle Angebote unter der Domain{' '}
                            <a href="https://www.blackruby.de" className="text-[#E63946] hover:underline" target="_blank" rel="noopener noreferrer">
                                https://www.blackruby.de
                            </a>{' '}
                            inklusive aller Subdomains (Unterseiten).
                        </p>
                    </section>

                    {/* Soziale Medien */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Soziale Medien</h2>
                        <p className="mb-3">Dieses Impressum gilt auch für unsere Auftritte in den folgenden sozialen Medien:</p>
                        <ul className="space-y-2 pl-1">
                            <li>
                                <span className="text-white/40">Instagram: </span>
                                <a href="https://www.instagram.com/blackruby.de/" className="text-[#E63946] hover:underline" target="_blank" rel="noopener noreferrer">
                                    https://www.instagram.com/blackruby.de/
                                </a>
                            </li>
                            <li>
                                <span className="text-white/40">TikTok: </span>
                                <a href="https://www.tiktok.com/@blackruby.de" className="text-[#E63946] hover:underline" target="_blank" rel="noopener noreferrer">
                                    https://www.tiktok.com/@blackruby.de
                                </a>
                            </li>
                            <li>
                                <span className="text-white/40">YouTube: </span>
                                <a href="https://www.youtube.com/channel/UCafbiv_XFML6WsBtPIaW7cA" className="text-[#E63946] hover:underline" target="_blank" rel="noopener noreferrer">
                                    https://www.youtube.com/channel/UCafbiv_XFML6WsBtPIaW7cA
                                </a>
                            </li>
                        </ul>
                    </section>

                    {/* Angaben gemäß § 5 TMG */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Angaben gemäß § 5 TMG</h2>
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-1">
                            <p className="text-white font-semibold">Black Ruby GbR</p>
                            <p>Talweg 1</p>
                            <p>53547 Roßbach</p>
                            <p className="pt-3">
                                Telefon:{' '}
                                <a href="tel:+491639641240" className="text-[#E63946] hover:underline">+49 163 964 1240</a>
                            </p>
                            <p>
                                E-Mail:{' '}
                                <a href="mailto:blackruby.de@gmail.com" className="text-[#E63946] hover:underline">blackruby.de@gmail.com</a>
                            </p>
                        </div>
                    </section>

                    {/* Vertretungsberechtigte Personen */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Vertretungsberechtigte Personen</h2>
                        <p>Alexander Blawat</p>
                        <p>Thomas Rüdiger</p>
                    </section>

                    {/* Audiovisuelle Mediendienste */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Audiovisuelle Mediendienste</h2>
                        <p>Sitzland: Deutschland</p>
                        <p>Zuständige Aufsichtsbehörde: Rheinland-Pfalz</p>
                    </section>

                    {/* Gültigkeit */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Gültigkeit</h2>
                        <p>Dieses Impressum gilt ab dem 27. März 2024.</p>
                    </section>

                    <p className="text-white/20 text-xs pt-6 border-t border-white/[0.06]">
                        ©2002–2024 RECHTSDOKUMENTE (Sequiter Inc.)
                    </p>
                </div>
            </div>
        </div>
    );
}
