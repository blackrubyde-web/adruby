import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
    onNavigate?: (page: string) => void;
}

export function DatenschutzPage({ onNavigate }: LegalPageProps) {
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
                    Datenschutzerklärung
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-[#E63946] to-rose-500 rounded-full mb-12" />

                <div className="space-y-10 text-white/60 leading-relaxed text-[15px]">
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">1. Verantwortlicher</h2>
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-1">
                            <p className="text-white font-semibold">Black Ruby GbR</p>
                            <p>Talweg 1, 53547 Roßbach</p>
                            <p>
                                E-Mail:{' '}
                                <a href="mailto:blackruby.de@gmail.com" className="text-[#E63946] hover:underline">blackruby.de@gmail.com</a>
                            </p>
                            <p>
                                Telefon:{' '}
                                <a href="tel:+491639641240" className="text-[#E63946] hover:underline">+49 163 964 1240</a>
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">2. Erhebung und Speicherung personenbezogener Daten</h2>
                        <p>
                            Beim Besuch unserer Website werden automatisch Informationen durch den Browser übermittelt und in Server-Logfiles gespeichert. Diese Daten umfassen:
                        </p>
                        <ul className="list-disc pl-6 mt-3 space-y-1">
                            <li>IP-Adresse des anfragenden Rechners</li>
                            <li>Datum und Uhrzeit des Zugriffs</li>
                            <li>Name und URL der abgerufenen Datei</li>
                            <li>Verwendeter Browser und Betriebssystem</li>
                            <li>Referrer-URL</li>
                        </ul>
                        <p className="mt-3">
                            Diese Daten sind nicht bestimmten Personen zuordenbar und dienen ausschließlich der Sicherstellung eines störungsfreien Betriebs sowie der Verbesserung unseres Angebots.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">3. Registrierung und Nutzerkonto</h2>
                        <p>
                            Bei der Registrierung erheben wir folgende Daten: Name, E-Mail-Adresse und ggf. Zahlungsinformationen. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO zur Vertragserfüllung.
                        </p>
                        <p className="mt-3">
                            Die Daten werden gelöscht, sobald der Zweck der Speicherung entfällt und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">4. Nutzung von Cookies</h2>
                        <p>
                            Unsere Website verwendet Cookies. Dabei handelt es sich um kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Einige Cookies sind technisch notwendig (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO), andere dienen der Analyse des Nutzerverhaltens und werden nur mit Ihrer Einwilligung gesetzt (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO).
                        </p>
                        <p className="mt-3">
                            Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und diese einzeln erlauben oder ablehnen können.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">5. Zahlungsabwicklung</h2>
                        <p>
                            Für die Zahlungsabwicklung nutzen wir den Dienst <strong className="text-white">Stripe</strong> (Stripe, Inc., 354 Oyster Point Blvd, South San Francisco, CA 94080, USA). Im Rahmen der Zahlungsabwicklung werden Zahlungsdaten direkt an Stripe übermittelt und dort verarbeitet. Weitere Informationen finden Sie in der{' '}
                            <a href="https://stripe.com/de/privacy" className="text-[#E63946] hover:underline" target="_blank" rel="noopener noreferrer">
                                Datenschutzerklärung von Stripe
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">6. Drittanbieter und Auftragsverarbeitung</h2>
                        <p>Wir nutzen folgende Drittanbieter zur Bereitstellung unserer Dienste:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-1">
                            <li><strong className="text-white">Supabase</strong> — Datenbankhosting und Authentifizierung</li>
                            <li><strong className="text-white">Netlify</strong> — Website-Hosting und Serverless Functions</li>
                            <li><strong className="text-white">Stripe</strong> — Zahlungsabwicklung</li>
                            <li><strong className="text-white">Meta (Facebook/Instagram)</strong> — API-Integration für Werbekampagnen</li>
                            <li><strong className="text-white">Google Gemini / OpenAI</strong> — KI-gestützte Textgenerierung</li>
                        </ul>
                        <p className="mt-3">
                            Mit allen Auftragsverarbeitern wurden entsprechende Vereinbarungen gemäß Art. 28 DSGVO geschlossen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">7. Ihre Rechte</h2>
                        <p>Sie haben gemäß DSGVO folgende Rechte:</p>
                        <ul className="list-disc pl-6 mt-3 space-y-1">
                            <li><strong className="text-white">Auskunftsrecht</strong> (Art. 15 DSGVO)</li>
                            <li><strong className="text-white">Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
                            <li><strong className="text-white">Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
                            <li><strong className="text-white">Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
                            <li><strong className="text-white">Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
                            <li><strong className="text-white">Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
                        </ul>
                        <p className="mt-3">
                            Sie haben zudem das Recht, sich bei einer Aufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen die DSGVO verstößt.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">8. Änderungen dieser Datenschutzerklärung</h2>
                        <p>
                            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie stets den aktuellen rechtlichen Anforderungen anzupassen oder Änderungen unserer Leistungen umzusetzen.
                        </p>
                    </section>

                    <p className="text-white/20 text-xs pt-6 border-t border-white/[0.06]">
                        Stand: März 2024 · Black Ruby GbR
                    </p>
                </div>
            </div>
        </div>
    );
}
