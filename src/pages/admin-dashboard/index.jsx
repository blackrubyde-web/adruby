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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <span className="text-sm text-slate-400">Lade Admin-Daten…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
        <span className="text-sm">Fehler beim Laden der Admin-Daten: {error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <button
        type="button"
        onClick={signOut}
        className="fixed top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition text-sm font-medium z-50"
      >
        Logout
      </button>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">Admin Dashboard</h1>
              <p className="text-sm text-slate-400">
                Eingeloggt als{' '}
                <span className="font-medium text-slate-200">
                  {user?.email || 'Admin'}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-50 hover:bg-slate-700 border border-slate-700 transition"
            >
              Aktualisieren
            </button>
          </div>

          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Übersicht
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('affiliate')}
              className={`px-3 py-1.5 rounded-md text-sm ${
                activeTab === 'affiliate'
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Affiliate
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">Gesamt-User</span>
                    <span className="text-2xl font-semibold">{stats.totalUsers ?? 0}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">Aktive Trials</span>
                    <span className="text-2xl font-semibold">{stats.trialActive ?? 0}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">Zahlende User</span>
                    <span className="text-2xl font-semibold">{stats.payingUsers ?? 0}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      Abgelaufene / nicht verlängerte Trials
                    </span>
                    <span className="text-2xl font-semibold">{stats.trialExpiredOrCancelled ?? 0}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">Monatlicher Umsatz</span>
                    <span className="text-2xl font-semibold">
                      {currencyFormat(stats.monthlyRevenue ?? 0)}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-slate-400">Gesamtumsatz</span>
                    <span className="text-2xl font-semibold">
                      {currencyFormat(stats.totalRevenue ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h3 className="text-sm font-medium mb-4 text-slate-200">Monatlicher Umsatz</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyChartData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#020617',
                            borderColor: '#1e293b',
                            borderRadius: '0.75rem'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h3 className="text-sm font-medium mb-4 text-slate-200">Neueste User</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 border-b border-slate-800">
                          <th className="py-2 pr-4">E-Mail</th>
                          <th className="py-2 pr-4">Registriert am</th>
                          <th className="py-2 pr-4">Trial-Status</th>
                          <th className="py-2 pr-4">Zahlend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(latestUsers ?? []).map((u) => (
                          <tr key={u.id} className="border-b border-slate-900/60">
                            <td className="py-2 pr-4 text-slate-200">{u.email}</td>
                            <td className="py-2 pr-4 text-slate-300">
                              {u.created_at ? new Date(u.created_at).toLocaleString('de-DE') : '-'}
                            </td>
                            <td className="py-2 pr-4 text-slate-300">
                              {u.trial_status || '—'}
                            </td>
                            <td className="py-2 pr-4 text-slate-300">
                              {u.payment_verified ? 'Ja' : 'Nein'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'affiliate' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h3 className="text-sm font-medium mb-4 text-slate-200">Affiliate Leaderboard</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 border-b border-slate-800">
                          <th className="py-2 pr-4">Rang</th>
                          <th className="py-2 pr-4">Affiliate</th>
                          <th className="py-2 pr-4">Referrals</th>
                          <th className="py-2 pr-4">Umsatz</th>
                          <th className="py-2 pr-4">Provision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard && leaderboard.length > 0 ? (
                          leaderboard.map((row, index) => (
                            <tr key={row.affiliate_id || index} className="border-b border-slate-900/60">
                              <td className="py-2 pr-4 text-slate-300">{index + 1}</td>
                              <td className="py-2 pr-4 text-slate-200">
                                {row.affiliate_name || row.email || 'Unbekannt'}
                              </td>
                              <td className="py-2 pr-4 text-slate-300">
                                {row.total_referrals ?? row.referral_count ?? 0}
                              </td>
                              <td className="py-2 pr-4 text-slate-300">
                                {currencyFormat(row.total_revenue ?? 0)}
                              </td>
                              <td className="py-2 pr-4 text-slate-300">
                                {currencyFormat(row.total_commission ?? 0)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="py-4 pr-4 text-slate-500"
                              colSpan={5}
                            >
                              Noch keine Affiliate-Daten vorhanden.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h3 className="text-sm font-medium mb-4 text-slate-200">Auszahlungen</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 border-b border-slate-800">
                          <th className="py-2 pr-4">Affiliate</th>
                          <th className="py-2 pr-4">Betrag</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Angefragt am</th>
                          <th className="py-2 pr-4">Ausgezahlt am</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payouts && payouts.length > 0 ? (
                          payouts.map((payout) => (
                            <tr key={payout.id} className="border-b border-slate-900/60">
                              <td className="py-2 pr-4 text-slate-200">
                                {payout.affiliate_email || payout.affiliate_name || 'Unbekannt'}
                              </td>
                              <td className="py-2 pr-4 text-slate-300">
                                {currencyFormat(payout.amount ?? 0)}{' '}
                                <span className="text-slate-500 text-xs">
                                  {payout.currency || 'EUR'}
                                </span>
                              </td>
                              <td className="py-2 pr-4 text-slate-300">
                                {payout.status || '—'}
                              </td>
                              <td className="py-2 pr-4 text-slate-300">
                                {payout.created_at
                                  ? new Date(payout.created_at).toLocaleString('de-DE')
                                  : '—'}
                              </td>
                              <td className="py-2 pr-4 text-slate-300">
                                {payout.paid_at
                                  ? new Date(payout.paid_at).toLocaleString('de-DE')
                                  : '—'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="py-4 pr-4 text-slate-500"
                              colSpan={5}
                            >
                              Noch keine Auszahlungsanforderungen vorhanden.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
