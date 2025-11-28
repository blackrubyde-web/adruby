import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const currencyFormat = (value = 0) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userCount: 0,
    monthlyRevenue: 0,
    totalRevenue: 0
  });
  const [monthlySeries, setMonthlySeries] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [payouts, setPayouts] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { count: userCount, error: userCountError } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true });
      if (userCountError) throw userCountError;

      const { data: revenueData, error: revenueError } = await supabase.rpc('get_revenue_stats');
      if (revenueError) throw revenueError;
      const statsRow = Array.isArray(revenueData) ? revenueData[0] : revenueData;

      const { data: leaderboardData, error: leaderboardError } = await supabase.rpc(
        'get_affiliate_leaderboard'
      );
      if (leaderboardError) throw leaderboardError;

      const { data: payoutData, error: payoutError } = await supabase
        .from('affiliate_payouts')
        .select(
          `
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
          `
        )
        .order('created_at', { ascending: false })
        .limit(50);
      if (payoutError) throw payoutError;

      setStats({
        userCount: userCount || 0,
        monthlyRevenue: statsRow?.monthly_amount || 0,
        totalRevenue: statsRow?.total_amount || 0
      });
      setMonthlySeries(statsRow?.monthly_breakdown || []);
      setLeaderboard(leaderboardData || []);
      setPayouts(payoutData || []);
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

  const openPayouts = useMemo(
    () => (payouts || []).filter((p) => p?.status === 'requested'),
    [payouts]
  );

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
      (monthlySeries || []).map((item) => {
        const labelDate = item?.month || item?.month_label || item?.month_start;
        const label = labelDate
          ? new Date(labelDate).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' })
          : '';
        return {
          month: label,
          revenue: Number(item?.amount || item?.monthly_amount || 0)
        };
      }),
    [monthlySeries]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-72 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-3xl mx-auto bg-destructive/10 border border-destructive/40 text-destructive p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kennzahlen, Umsätze und Affiliate-Übersicht</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Aktualisieren
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Gesamtanzahl User</p>
          <p className="text-3xl font-bold mt-2">{stats.userCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Monatsumsatz (aktuell)</p>
          <p className="text-3xl font-bold mt-2">{currencyFormat(stats.monthlyRevenue)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
          <p className="text-3xl font-bold mt-2">{currencyFormat(stats.totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Umsatz pro Monat (letzte 12 Monate)</h2>
          <span className="text-sm text-muted-foreground">{monthlyChartData.length} Monate</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#C80000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Top Affiliates</h2>
          <span className="text-sm text-muted-foreground">{leaderboard?.length || 0} Einträge</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Referrals
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ausgezahlt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Guthaben
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lifetime
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(leaderboard || []).map((row) => (
                <tr key={row?.affiliate_id}>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-semibold">
                      {row?.first_name || row?.last_name
                        ? `${row?.first_name || ''} ${row?.last_name || ''}`.trim()
                        : row?.email}
                    </div>
                    <div className="text-muted-foreground text-xs">{row?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{row?.referral_count || 0}</td>
                  <td className="px-4 py-3 text-sm">{currencyFormat(row?.paid_sum || 0)}</td>
                  <td className="px-4 py-3 text-sm">{currencyFormat(row?.affiliate_balance || 0)}</td>
                  <td className="px-4 py-3 text-sm">
                    {currencyFormat(row?.affiliate_lifetime_earnings || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Auszahlungen</h2>
          <span className="text-sm text-muted-foreground">{payouts?.length || 0} Einträge</span>
        </div>
        {openPayouts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Offene Anfragen</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Affiliate ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Betrag
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Bank (Snapshot)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {openPayouts.map((payout) => (
                    <tr key={payout?.id}>
                      <td className="px-4 py-3 text-sm font-mono">{payout?.affiliate_id}</td>
                      <td className="px-4 py-3 text-sm">
                        {currencyFormat(payout?.amount)} {payout?.currency || 'EUR'}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{payout?.status}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>{payout?.bank_account_holder || '—'}</div>
                        <div className="text-xs text-muted-foreground">{payout?.bank_iban || '—'}</div>
                        <div className="text-xs text-muted-foreground">{payout?.bank_bic || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        <button
                          className="px-3 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200"
                          onClick={() => handlePayoutAction(payout?.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 rounded-md bg-green-100 text-green-700 border border-green-200"
                          onClick={() => handlePayoutAction(payout?.id, 'paid')}
                        >
                          Mark Paid
                        </button>
                        <button
                          className="px-3 py-1 rounded-md bg-red-100 text-red-700 border border-red-200"
                          onClick={() => handlePayoutAction(payout?.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Affiliate ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Betrag
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Bank (Snapshot)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Notiz
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(payouts || []).map((payout) => (
                <tr key={payout?.id}>
                  <td className="px-4 py-3 text-sm font-mono">{payout?.affiliate_id}</td>
                  <td className="px-4 py-3 text-sm">
                    {currencyFormat(payout?.amount)} {payout?.currency || 'EUR'}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{payout?.status}</td>
                  <td className="px-4 py-3 text-sm">
                    {payout?.created_at
                      ? new Date(payout.created_at).toLocaleString('de-DE')
                      : '-'}
                  </td>
                <td className="px-4 py-3 text-sm">
                  <div>{payout?.bank_account_holder || '—'}</div>
                  <div className="text-xs text-muted-foreground">{payout?.bank_iban || '—'}</div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {payout?.note || payout?.admin_note || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
