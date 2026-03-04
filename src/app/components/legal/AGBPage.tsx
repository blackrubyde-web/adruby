import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
    onNavigate?: (page: string) => void;
}

export function AGBPage({ onNavigate }: LegalPageProps) {
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
                    Allgemeine Geschäftsbedingungen
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-[#E63946] to-rose-500 rounded-full mb-12" />

                <div className="space-y-10 text-white/60 leading-relaxed text-[15px]">
                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 1 Geltungsbereich</h2>
                        <p>
                            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen der Black Ruby GbR, Talweg 1, 53547 Roßbach (nachfolgend „Anbieter") und dem Kunden (nachfolgend „Nutzer") über die Nutzung der SaaS-Plattform AdRuby unter der Domain blackruby.de.
                        </p>
                        <p className="mt-3">
                            Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 2 Vertragsgegenstand</h2>
                        <p>
                            Der Anbieter stellt dem Nutzer eine webbasierte Software-as-a-Service (SaaS)-Plattform zur Erstellung, Verwaltung und Optimierung von Online-Werbeanzeigen zur Verfügung. Der genaue Leistungsumfang ergibt sich aus der jeweiligen Leistungsbeschreibung und dem gewählten Tarif.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 3 Vertragsschluss und Registrierung</h2>
                        <p>
                            Die Registrierung auf der Plattform stellt ein verbindliches Angebot des Nutzers auf Abschluss eines Nutzungsvertrags dar. Der Vertrag kommt zustande, wenn der Anbieter die Registrierung durch Freischaltung des Nutzerkontos bestätigt.
                        </p>
                        <p className="mt-3">
                            Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen und diese aktuell zu halten.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 4 Leistungen und Verfügbarkeit</h2>
                        <p>
                            Der Anbieter bemüht sich um eine Verfügbarkeit der Plattform von 99,5 % im Jahresmittel. Hiervon ausgenommen sind Zeiten geplanter Wartungsarbeiten, die der Anbieter nach Möglichkeit vorab ankündigt.
                        </p>
                        <p className="mt-3">
                            Der Anbieter behält sich vor, den Funktionsumfang der Plattform jederzeit zu ändern, zu erweitern oder einzuschränken, sofern dies dem Nutzer zumutbar ist.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 5 Preise und Zahlung</h2>
                        <p>
                            Die Nutzung der Plattform kann kostenlos oder kostenpflichtig sein, abhängig vom gewählten Tarif. Die aktuellen Preise sind auf der Website des Anbieters einsehbar.
                        </p>
                        <p className="mt-3">
                            Kostenpflichtige Tarife werden im Voraus in Rechnung gestellt. Die Zahlung erfolgt über die auf der Plattform angebotenen Zahlungsmethoden (z. B. Kreditkarte, Stripe).
                        </p>
                        <p className="mt-3">
                            Alle Preise verstehen sich als Endpreise inkl. der gesetzlichen Mehrwertsteuer, sofern diese anfällt.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 6 Laufzeit und Kündigung</h2>
                        <p>
                            Kostenlose Tarife können jederzeit ohne Einhaltung einer Frist gekündigt werden. Kostenpflichtige Tarife haben eine Mindestlaufzeit von einem Monat und verlängern sich automatisch um einen weiteren Monat, sofern sie nicht vor Ablauf des jeweiligen Abrechnungszeitraums gekündigt werden.
                        </p>
                        <p className="mt-3">
                            Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 7 Pflichten des Nutzers</h2>
                        <p>Der Nutzer verpflichtet sich:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>seine Zugangsdaten vertraulich zu behandeln und vor dem Zugriff Dritter zu schützen;</li>
                            <li>die Plattform nicht missbräuchlich zu verwenden oder für rechtswidrige Zwecke einzusetzen;</li>
                            <li>keine Inhalte hochzuladen, die gegen geltendes Recht verstoßen;</li>
                            <li>den Anbieter unverzüglich über Sicherheitsvorfälle oder den Verdacht unbefugter Nutzung zu informieren.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 8 Haftung</h2>
                        <p>
                            Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie bei vorsätzlichem oder grob fahrlässigem Handeln.
                        </p>
                        <p className="mt-3">
                            Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden beschränkt. Im Übrigen ist die Haftung bei leichter Fahrlässigkeit ausgeschlossen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 9 Datenschutz</h2>
                        <p>
                            Die Erhebung und Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzgrundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG). Einzelheiten sind der{' '}
                            <button
                                onClick={() => onNavigate?.('datenschutz')}
                                className="text-[#E63946] hover:underline"
                            >
                                Datenschutzerklärung
                            </button>{' '}
                            zu entnehmen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">§ 10 Schlussbestimmungen</h2>
                        <p>
                            Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Anbieters.
                        </p>
                        <p className="mt-3">
                            Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.
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
