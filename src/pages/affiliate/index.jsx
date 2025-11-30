import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { affiliateService } from '../../services/affiliateService';

const AffiliatePage = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [overview, setOverview] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [bankForm, setBankForm] = useState({
    bank_account_holder: '',
    bank_iban: '',
    bank_bic: ''
  });
  const [bankErrors, setBankErrors] = useState({});
  const [payoutAmount, setPayoutAmount] = useState('');
  const [savingBank, setSavingBank] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [affiliateCodeInput, setAffiliateCodeInput] = useState('');
  const [savingAffiliateCode, setSavingAffiliateCode] = useState(false);

  const REF_STORAGE_KEY = 'adruby_affiliate_ref_code';

  const affiliateLink = useMemo(() => {
    const code = overview?.profile?.affiliate_code || userProfile?.affiliate_code || '';
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://adruby.de';
    return code ? `${origin}/?ref=${code}` : '';
  }, [overview?.profile?.affiliate_code, userProfile?.affiliate_code]);

  const validateIban = (iban) => {
    if (!iban) return 'Bitte IBAN eingeben';
    const normalized = iban?.replace(/\s+/g, '')?.toUpperCase();
    if (normalized.length < 15 || normalized.length > 34) return 'IBAN-Länge wirkt ungültig';
    if (!/^[A-Z0-9]+$/.test(normalized)) return 'IBAN enthält ungültige Zeichen';
    return null;
  };

  const generateAffiliateCodeSuggestion = () => {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ADR-${randomPart}`;
  };

  const applyPendingReferralIfAny = async () => {
    if (!user?.id || typeof window === 'undefined') return;
    const stored = localStorage.getItem(REF_STORAGE_KEY);
    if (!stored) return;
    try {
      setApplyingReferral(true);
      await affiliateService.applyReferralCode(stored);
      setInfo('Affiliate-Code wurde angewendet.');
      localStorage.removeItem(REF_STORAGE_KEY);
      await loadData();
    } catch (err) {
      console.error('[Referral] apply pending failed', err);
      if (err?.message) setError(err.message);
    } finally {
      setApplyingReferral(false);
    }
  };

  const loadData = async () => {
    if (!user?.id || !userProfile?.affiliate_enabled) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const [overviewData, referralData, earningData] = await Promise.all([
        affiliateService.getOverview(user?.id),
        affiliateService.getReferrals(user?.id),
        affiliateService.getEarnings(user?.id, 100)
      ]);

      setOverview(overviewData);
      setReferrals(referralData);
      setEarnings(earningData);
      setBankForm({
        bank_account_holder: overviewData?.profile?.bank_account_holder || '',
        bank_iban: overviewData?.profile?.bank_iban || '',
        bank_bic: overviewData?.profile?.bank_bic || ''
      });
      setAffiliateCodeInput(
        overviewData?.profile?.affiliate_code || generateAffiliateCodeSuggestion()
      );
      setPayoutAmount(
        typeof overviewData?.profile?.affiliate_balance === 'number'
          ? overviewData.profile.affiliate_balance.toFixed(2)
          : ''
      );
      await refreshUserProfile();
    } catch (err) {
      console.error('Error loading affiliate data:', err);
      setError(err?.message || 'Fehler beim Laden der Affiliate-Daten');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && userProfile?.affiliate_enabled) {
      loadData();
      applyPendingReferralIfAny();
    } else if (user?.id && userProfile) {
      setLoading(false);
    }
  }, [user?.id, userProfile?.affiliate_enabled]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      localStorage.setItem(REF_STORAGE_KEY, refParam);
      console.log('[Referral] Stored referral code from URL', refParam);
    }
  }, []);

  const handleCopy = async () => {
    if (!affiliateLink) return;
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleApplyReferral = async () => {
    const code = (referralInput || '').trim();
    if (!code) {
      setError('Bitte einen Affiliate-Code eingeben.');
      return;
    }
    setApplyingReferral(true);
    setError(null);
    setInfo(null);
    try {
      await affiliateService.applyReferralCode(code);
      setInfo('Affiliate-Code wurde erfolgreich angewendet.');
      localStorage.removeItem(REF_STORAGE_KEY);
      setReferralInput('');
      await loadData();
    } catch (err) {
      console.error('[Referral] applyReferral error', err);
      setError(err?.message || 'Affiliate-Code konnte nicht angewendet werden.');
    } finally {
      setApplyingReferral(false);
    }
  };

  const handleSaveAffiliateCode = async () => {
    const code = (affiliateCodeInput || '').trim();
    if (!code) {
      setError('Affiliate-Code darf nicht leer sein.');
      return;
    }
    setSavingAffiliateCode(true);
    setError(null);
    setInfo(null);
    try {
      await affiliateService.updateAffiliateCode(user?.id, code);
      setInfo('Affiliate-Code aktualisiert.');
      await loadData();
    } catch (err) {
      console.error('[Affiliate] updateAffiliateCode error', err);
      setError(err?.message || 'Affiliate-Code konnte nicht gespeichert werden.');
    } finally {
      setSavingAffiliateCode(false);
    }
  };

  const handleBankSave = async () => {
    const ibanError = validateIban(bankForm?.bank_iban);
    const errors = {};
    if (ibanError) errors.bank_iban = ibanError;
    setBankErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingBank(true);
    setError(null);
    setInfo(null);
    try {
      await affiliateService.updateBankDetails(user?.id, bankForm);
      await refreshUserProfile();
      await loadData();
      setInfo('Bankdaten gespeichert.');
    } catch (err) {
      console.error('Bank update failed', err);
      setError(err?.message || 'Bankdaten konnten nicht gespeichert werden.');
    } finally {
      setSavingBank(false);
    }
  };

  const handlePayoutRequest = async () => {
    const numericAmount = Number(payoutAmount || 0);
    if (!numericAmount || numericAmount <= 0) {
      setError('Bitte einen gültigen Betrag eingeben.');
      return;
    }

    const maxAmount = overview?.profile?.affiliate_balance || 0;
    if (numericAmount > maxAmount) {
      setError('Betrag überschreitet verfügbares Guthaben.');
      return;
    }

    setPayoutLoading(true);
    setError(null);
    setInfo(null);
    try {
      await affiliateService.requestPayout(user?.id, numericAmount);
      await loadData();
      setInfo('Auszahlung angefordert. Wir prüfen die Anfrage zeitnah.');
    } catch (err) {
      console.error('Payout request failed', err);
      setError(err?.message || 'Auszahlung konnte nicht angelegt werden.');
    } finally {
      setPayoutLoading(false);
    }
  };

  const formatEuro = (value = 0) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(Number(value) || 0);

  const formatDate = (value) =>
    value
      ? new Date(value)?.toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '-';

  if (!userProfile?.affiliate_enabled) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="pt-16">
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <Icon name="Lock" size={20} />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-foreground">
                      Affiliate-Programm ist nicht freigeschaltet
                    </h1>
                    <p className="text-muted-foreground">
                      Bitte wende dich an das AdRuby-Team, um als Affiliate freigeschaltet zu werden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="pt-16">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Affiliate Dashboard</h1>
                <p className="text-muted-foreground">
                  Affiliate-Link teilen, Referrals verwalten und Auszahlungen anstoßen.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={loadData} disabled={loading}>
                  <Icon name="RefreshCw" size={18} />
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-4 p-3 rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm">
                {info}
              </div>
            )}

            {loading ? (
              <div className="space-y-6">
                <div className="h-28 bg-muted animate-pulse rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
                <div className="h-64 bg-muted animate-pulse rounded-xl" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Affiliate Link */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Dein Affiliate-Link</p>
                      <p className="font-semibold text-lg text-foreground break-all">
                        {affiliateLink || 'Kein Code hinterlegt'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Code: <span className="font-mono">{overview?.profile?.affiliate_code}</span>
                      </p>
                    </div>
                <div className="flex items-center gap-3">
                  <Button variant="secondary" onClick={handleCopy} disabled={!affiliateLink}>
                    <Icon name={copied ? 'Check' : 'Copy'} size={16} className="mr-2" />
                    {copied ? 'Kopiert' : 'Link kopieren'}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Affiliate-Code bearbeiten"
                  placeholder="ADR-XXXXXX"
                  value={affiliateCodeInput}
                  onChange={(e) => setAffiliateCodeInput(e.target.value)}
                  description="Teile diesen Code in deinem Link (?ref=CODE)."
                />
                <div className="flex items-end">
                  <Button onClick={handleSaveAffiliateCode} disabled={savingAffiliateCode}>
                    {savingAffiliateCode ? 'Speichern...' : 'Affiliate-Code speichern'}
                  </Button>
                </div>
              </div>
            </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Geworbene Nutzer</p>
                    <p className="text-2xl font-bold text-foreground">
                      {overview?.totalReferrals ?? 0}
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Aktive Referrals</p>
                    <p className="text-2xl font-bold text-foreground">
                      {overview?.activeReferrals ?? 0}
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Auszahlbares Guthaben</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatEuro(overview?.balance)}
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Lifetime Earnings</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatEuro(overview?.lifetimeEarnings)}
                    </p>
                  </div>
                </div>

                {/* Referrals */}
                <div className="bg-card border border-border rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Referrals</h2>
                    <span className="text-xs text-muted-foreground">
                      {referrals?.length || 0} Einträge
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Stripe Subscription
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Letzte Zahlung
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {referrals?.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-6 text-center text-muted-foreground">
                              Noch keine Referrals vorhanden.
                            </td>
                          </tr>
                        )}
                        {referrals?.map((ref) => (
                          <tr key={ref?.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {ref?.referred_user?.email || ref?.ref_code || 'Unbekannt'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground capitalize">
                              {ref?.current_status}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {ref?.stripe_subscription_id || '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(ref?.last_invoice_paid_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Affiliate-Code anwenden</h3>
                  <p className="text-sm text-muted-foreground">
                    Wurde dir ein Code genannt? Hier manuell eintragen.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  label="Affiliate-Code"
                  placeholder="CODE eingeben"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                />
                <Button onClick={handleApplyReferral} disabled={applyingReferral}>
                  {applyingReferral ? 'Wird angewendet...' : 'Code anwenden'}
                </Button>
              </div>
            </div>

                {/* Earnings */}
                <div className="bg-card border border-border rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Earnings</h2>
                    <span className="text-xs text-muted-foreground">
                      {earnings?.length || 0} Einträge
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Betrag
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Zeitraum
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {earnings?.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-6 text-center text-muted-foreground">
                              Noch keine Earnings vorhanden.
                            </td>
                          </tr>
                        )}
                        {earnings?.map((earning) => (
                          <tr key={earning?.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatEuro(earning?.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {formatDate(earning?.period_start)} - {formatDate(earning?.period_end)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {earning?.referred_user?.email || 'Unbekannt'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {earning?.stripe_invoice_id}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bank + Payout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Bankdaten</h3>
                        <p className="text-sm text-muted-foreground">Für Auszahlungen benötigt.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Input
                        label="Kontoinhaber"
                        placeholder="Max Mustermann"
                        value={bankForm.bank_account_holder}
                        onChange={(e) =>
                          setBankForm((prev) => ({ ...prev, bank_account_holder: e.target.value }))
                        }
                      />
                      <Input
                        label="IBAN"
                        placeholder="DE00 0000 0000 0000 0000 00"
                        value={bankForm.bank_iban}
                        onChange={(e) =>
                          setBankForm((prev) => ({ ...prev, bank_iban: e.target.value }))
                        }
                        error={bankErrors?.bank_iban}
                      />
                      <Input
                        label="BIC (optional)"
                        placeholder="BANKDEFFXXX"
                        value={bankForm.bank_bic}
                        onChange={(e) =>
                          setBankForm((prev) => ({ ...prev, bank_bic: e.target.value }))
                        }
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleBankSave} disabled={savingBank}>
                          {savingBank ? 'Speichern...' : 'Bankdaten speichern'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Auszahlung</h3>
                        <p className="text-sm text-muted-foreground">
                          Aktuelles Guthaben: {formatEuro(overview?.balance)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Input
                        label="Betrag"
                        type="number"
                        min="0"
                        step="0.01"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                      />
                      <Button onClick={handlePayoutRequest} disabled={payoutLoading}>
                        {payoutLoading ? 'Wird gesendet...' : 'Auszahlung anfordern'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
    </div>
  );
};

export default AffiliatePage;
