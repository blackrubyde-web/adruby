// FILE: src/pages/admin-dashboard/index.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const currencyFormat = (value = 0) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
    .format(Number(value) || 0);

const safeDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleString('de-DE');
};

function logSupabaseError(context, error) {
  console.group(`[Supabase Error] ${context}`);
  console.error('name:', error?.name);
  console.error('code:', error?.code);
  console.error('message:', error?.message);
  console.error('details:', error?.details);
  console.error('hint:', error?.hint);
  console.error('status:', error?.status);
  console.error('query:', error?.__isql);
  console.error('full error object:', error);
  console.groupEnd();
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userCount: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    totalUsers: 0,
    trialActive: 0,
    trialExpiredOrCancelled: 0,
    payingUsers: 0
  });
  const [monthlySeries, setMonthlySeries] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { count: userCount, error: userCountError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true });
      if (userCountError) {
        logSupabaseError('load userCount', userCountError);
      }

      const { data: revenueData, error: revenueError } =
        await supabase.rpc('get_revenue_stats');
      if (revenueError) {
        logSupabaseError('load revenueData', revenueError);
      }
      const statsRow = Array.isArray(revenueData) ? revenueData[0] : revenueData;

      const { data: leaderboardData, error: leaderboardError } =
        await supabase.rpc('get_affiliate_leaderboard');
      if (leaderboardError) {
        logSupabaseError('load leaderboardData', leaderboardError);
      }

      const { data: payoutData, error: payoutError } = await supabase
        .from('affiliate_payouts')
        .select(`
          id,
          affiliate_id,
          amount,
          currency,
          status,
          created_at,
          approved_at,
          paid_at,
          processed_at,
          bank_account_holder,
          bank_iban,
          bank_bic,
          note,
          admin_note
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (payoutError) {
        logSupabaseError('load payoutData', payoutError);
      }

      const { count: totalUsers, error: totalUsersError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true });
      if (totalUsersError) {
        logSupabaseError('load totalUsers', totalUsersError);
      }

      const { count: trialActiveCount, error: trialActiveError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('trial_status', 'active');
      if (trialActiveError) {
        logSupabaseError('load trialActiveCount', trialActiveError);
      }

      const { count: trialExpiredCount, error: trialExpiredError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .in('trial_status', ['expired', 'cancelled']);
      if (trialExpiredError) {
        logSupabaseError('load trialExpiredCount', trialExpiredError);
      }

      const { count: payingUsersCount, error: payingUsersError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('payment_verified', true);
      if (payingUsersError) {
        logSupabaseError('load payingUsersCount', payingUsersError);
      }

      const { data: latestUsersData, error: latestUsersError } = await supabase
        .from('user_profiles')
        .select('id, email, created_at, trial_status, payment_verified')
        .order('created_at', { ascending: false })
        .limit(10);
      if (latestUsersError) {
        logSupabaseError('load latestUsers', latestUsersError);
      }

      setStats({
        userCount: userCount || 0,
        monthlyRevenue: statsRow?.monthly_amount || 0,
        totalRevenue: statsRow?.total_amount || 0,
        totalUsers: totalUsers || 0,
        trialActive: trialActiveCount || 0,
        trialExpiredOrCancelled: trialExpiredCount || 0,
        payingUsers: payingUsersCount || 0
      });
      setMonthlySeries(statsRow?.monthly_breakdown || []);
      setLeaderboard(leaderboardData || []);
      setPayouts(payoutData || []);
      setLatestUsers(latestUsersData || []);
    } catch (err) {
      console.error('[AdminDashboard] load failed', err);
      setError(err?.message || 'Fehler beim Laden der Admin-Daten');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [user?.id, loadData]);

  const handlePayoutAction = async (payoutId, newStatus, note = null) => {
    if (!payoutId || !newStatus) return;
    try {
      await supabase.rpc('process_affiliate_payout', {
        p_payout_id: payoutId,
        p_new_status: newStatus,
        p_note: note
      });
      await loadData();
    } catch (err) {
      console.error('[AdminDashboard] payout action failed', err);
      setError(err?.message || 'Payout-Aktion fehlgeschlagen');
    }
  };

  const monthlyChartData = useMemo(
    () =>
      (monthlySeries ?? []).map((item) => {
        const labelDate = item?.month || item?.month_label || item?.month_start;
        const label = labelDate ? safeDate(labelDate) : '—';
        return {
          month: label,
          revenue: Number(item?.amount || item?.monthly_amount || 0)
        };
      }),
    [monthlySeries]
  );

  return (
    <div className="min-h-screen bg-[#050509] text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(200,0,0,0.12),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(79,70,229,0.16),transparent_40%)]" />

      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
          <div className="space-y-4 text-center">
            <div className="h-12 w-12 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-300">Lade Admin-Daten…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
          <div className="bg-[#1a0f13] border border-rose-500/60 rounded-xl p-4 shadow-[0_10px_40px_rgba(200,0,0,0.35)] flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(200,0,0,0.8)]" />
            <div>
              <p className="font-semibold text-rose-100">Fehler beim Laden</p>
              <p className="text-sm text-rose-200/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 backdrop-blur bg-black/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-400/80">AdRuby</p>
            <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">
              Übersicht über Nutzer, Umsatz und Affiliate-Performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-200 border border-emerald-400/20">
              Live
            </span>
            <div className="px-3 py-1 rounded-full text-xs bg-white/5 text-slate-200 border border-white/10">
              Production
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="text-xs text-slate-200">
                <p className="font-semibold">{user?.email || 'Admin'}</p>
                <p className="text-slate-400">Super Admin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white transition"
            >
              Aktualisieren
            </button>
            <button
              type="button"
              onClick={signOut}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-[0_10px_40px_rgba(200,0,0,0.35)] transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-rose-600 text-white shadow-[0_10px_40px_rgba(200,0,0,0.35)]'
                : 'bg-white/5 text-slate-200 border border-white/5 hover:bg-white/10'
            }`}
          >
            Übersicht
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('affiliate')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
              activeTab === 'affiliate'
                ? 'bg-rose-600 text-white shadow-[0_10px_40px_rgba(200,0,0,0.35)]'
                : 'bg-white/5 text-slate-200 border border-white/5 hover:bg-white/10'
            }`}
          >
            Affiliate
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { label: 'Nutzer gesamt', value: stats.totalUsers ?? 0, accent: 'from-rose-500 to-rose-700' },
                { label: 'Aktive Trials', value: stats.trialActive ?? 0, accent: 'from-purple-500 to-indigo-600' },
                { label: 'Zahlende User', value: stats.payingUsers ?? 0, accent: 'from-emerald-500 to-teal-500' },
                { label: 'Abgelaufene Trials', value: stats.trialExpiredOrCancelled ?? 0, accent: 'from-amber-500 to-orange-500' },
                { label: 'Monatlicher Umsatz', value: currencyFormat(stats.monthlyRevenue ?? 0), accent: 'from-cyan-500 to-blue-600' },
                { label: 'Gesamtumsatz', value: currencyFormat(stats.totalRevenue ?? 0), accent: 'from-pink-500 to-rose-600' }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-2xl p-5 bg-white/5 border border-white/10 backdrop-blur transition transform hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(200,0,0,0.25)]"
                >
                  <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${card.accent}`} />
                  <div className="relative flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</span>
                    <span className="text-3xl font-bold text-white drop-shadow-sm">{card.value}</span>
                    <div className="h-1 w-16 rounded-full bg-white/20" />
                  </div>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Revenue</p>
                    <h3 className="text-lg font-semibold text-white">Umsatzentwicklung</h3>
                    <p className="text-xs text-slate-400">Monatliche Stripe-Subscriptions</p>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChartData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0b0f1a',
                          borderColor: '#1f2937',
                          borderRadius: '0.75rem',
                          color: '#fff'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Aktivität</p>
                    <h3 className="text-lg font-semibold text-white">Neueste User</h3>
                    <p className="text-xs text-slate-400">Letzte 10 Registrierungen</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-auto pr-1">
                  {(latestUsers ?? []).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white">
                          {u.email ? u.email.slice(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div className="text-sm">
                          <p className="text-white">{u.email}</p>
                          <p className="text-xs text-slate-400">
                            {u.created_at ? new Date(u.created_at).toLocaleString('de-DE') : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p className={`px-2 py-1 rounded-full inline-block ${
                          u.payment_verified ? 'bg-emerald-500/20 text-emerald-200' : 'bg-amber-500/20 text-amber-200'
                        }`}>
                          {u.payment_verified ? 'Zahlend' : 'Nicht zahlend'}
                        </p>
                        <p className="text-slate-400 mt-1">{u.trial_status || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'affiliate' && (
          <div className="space-y-8">
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Affiliate</p>
                  <h3 className="text-lg font-semibold text-white">Affiliate Leaderboard</h3>
                  <p className="text-xs text-slate-400">Top-Performing Partner</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-white/10">
                      <th className="py-2 pr-4">#</th>
                      <th className="py-2 pr-4">Affiliate</th>
                      <th className="py-2 pr-4">Referrals</th>
                      <th className="py-2 pr-4">Umsatz</th>
                      <th className="py-2 pr-4">Provision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard && leaderboard.length > 0 ? (
                      leaderboard.map((row, index) => (
                        <tr
                          key={row.affiliate_id || index}
                          className="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td className="py-3 pr-4 text-slate-200">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              index === 0
                                ? 'bg-amber-500/20 text-amber-200'
                                : index === 1
                                  ? 'bg-slate-400/20 text-slate-200'
                                  : index === 2
                                    ? 'bg-orange-500/20 text-orange-200'
                                    : 'bg-white/10 text-slate-200'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-50 flex items-center gap-2">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                              {(row.affiliate_name || row.email || 'AF').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="leading-tight">
                              <p className="text-sm font-semibold text-white">{row.affiliate_name || row.email || 'Unbekannt'}</p>
                              <p className="text-xs text-slate-400">{row.email || '—'}</p>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-slate-200">
                            {row.total_referrals ?? row.referral_count ?? 0}
                          </td>
                          <td className="py-3 pr-4 text-slate-200">
                            {currencyFormat(row.total_revenue ?? 0)}
                          </td>
                          <td className="py-3 pr-4 text-slate-200">
                            {currencyFormat(row.total_commission ?? 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-4 pr-4 text-slate-500" colSpan={5}>
                          Noch keine Affiliate-Daten vorhanden.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Payouts</p>
                  <h3 className="text-lg font-semibold text-white">Auszahlungsanforderungen</h3>
                  <p className="text-xs text-slate-400">Status & Historie</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-white/10">
                      <th className="py-2 pr-4">Affiliate</th>
                      <th className="py-2 pr-4">Betrag</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Angefragt am</th>
                      <th className="py-2 pr-4">Ausgezahlt am</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts && payouts.length > 0 ? (
                      payouts.map((payout) => {
                        const statusClass =
                          payout.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : payout.status === 'approved'
                              ? 'bg-amber-500/20 text-amber-200'
                              : payout.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-200'
                                : 'bg-slate-500/20 text-slate-200';
                        return (
                          <tr
                            key={payout.id}
                            className="border-b border-white/5 hover:bg-white/5 transition"
                          >
                            <td className="py-3 pr-4 text-slate-50">
                              {payout.affiliate_email || payout.affiliate_name || 'Unbekannt'}
                            </td>
                            <td className="py-3 pr-4 text-slate-200">
                              {currencyFormat(payout.amount ?? 0)}{' '}
                              <span className="text-slate-500 text-xs">
                                {payout.currency || 'EUR'}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                                {payout.status || '—'}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-slate-200">
                              {safeDate(payout.created_at)}
                            </td>
                            <td className="py-3 pr-4 text-slate-200">
                              {safeDate(payout.paid_at)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="py-4 pr-4 text-slate-500" colSpan={5}>
                          Noch keine Auszahlungsanforderungen vorhanden.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
