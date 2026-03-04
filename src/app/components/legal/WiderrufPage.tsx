import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
    onNavigate?: (page: string) => void;
}

export function WiderrufPage({ onNavigate }: LegalPageProps) {
    return (
        <div className="min-h-screen bg-[#050507] text-white">
            <div className="max-w-3xl mx-auto px-6 py-24 sm:py-32">
                <button
                    onClick={() => onNavigate?.('landing')}
                    className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-12"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zur Startseite
                </button>

                <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    Widerrufsbelehrung
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-[#E63946] to-rose-500 rounded-full mb-12" />

                <div className="space-y-10 text-white/60 leading-relaxed text-[15px]">
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Widerrufsrecht</h2>
                        <p>
                            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                        </p>
                        <p className="mt-3">
                            Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
                        </p>
                        <p className="mt-3">
                            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
                        </p>
                    </section>

                    <section>
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-1">
                            <p className="text-white font-semibold">Anschrift für den Widerruf:</p>
                            <p>Black Ruby GbR</p>
                            <p>Talweg 1</p>
                            <p>53547 Roßbach</p>
                            <p className="pt-2">
                                E-Mail:{' '}
                                <a href="mailto:blackruby.de@gmail.com" className="text-[#E63946] hover:underline">blackruby.de@gmail.com</a>
                            </p>
                        </div>
                    </section>

                    <section>
                        <p>
                            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Folgen des Widerrufs</h2>
                        <p>
                            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
                        </p>
                        <p className="mt-3">
                            Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Vorzeitiges Erlöschen des Widerrufsrechts</h2>
                        <p>
                            Das Widerrufsrecht erlischt vorzeitig, wenn der Anbieter mit der Ausführung des Vertrags erst begonnen hat, nachdem der Nutzer dazu seine ausdrückliche Zustimmung gegeben und gleichzeitig seine Kenntnis davon bestätigt hat, dass er sein Widerrufsrecht bei vollständiger Vertragserfüllung verliert.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">Muster-Widerrufsformular</h2>
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-3 text-white/50 italic">
                            <p>(Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
                            <div className="space-y-2 not-italic text-white/60">
                                <p>An: Black Ruby GbR, Talweg 1, 53547 Roßbach</p>
                                <p>E-Mail: blackruby.de@gmail.com</p>
                                <p className="pt-2">Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:</p>
                                <p>Bestellt am / erhalten am (*): _______________</p>
                                <p>Name des/der Verbraucher(s): _______________</p>
                                <p>Anschrift des/der Verbraucher(s): _______________</p>
                                <p>Datum: _______________</p>
                                <p className="text-white/30 text-xs mt-4">(*) Unzutreffendes streichen</p>
                            </div>
                        </div>
                    </section>

                    <p className="text-white/20 text-xs pt-6 border-t border-white/[0.06]">
                        Stand: März 2024 · Black Ruby GbR
                    </p>
                </div>
            </div>
        </div>
    );
}
