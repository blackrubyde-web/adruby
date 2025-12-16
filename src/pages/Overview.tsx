import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';



import { Column } from 'react-table';



import {



  Download,



  RefreshCw,



  Sparkles,



  Activity,



  Clock3,



  Flame,



  Search,



  BarChart3,



  Rocket,



  Lightbulb,



  Zap,



  Play,



  AlertTriangle,



  Command,



  X



} from 'lucide-react';



import { AnimatePresence, motion } from 'framer-motion';



import { useNavigate } from 'react-router-dom';



import DashboardLayout from '../layouts/DashboardLayout';



import DataTable from '../components/DataTable';



import LineChartAnimated from '../components/LineChartAnimated';



import DonutChart from '../components/DonutChart';



import DateRangePicker from '../components/DateRangePicker';



import { DateRangeValue } from '../api/types';



import { buildPresetRange } from '../utils/dateUtils';



import { exportNodeToPng } from '../utils/export';



import { useAuth } from '../contexts/AuthContext';



import { cxCard, cxCardHeader, cxCardTitle, cxButtonPrimary, cxButtonSecondary, cxButtonQuiet, cxPill, cxPillActive } from '../components/ui/uiPrimitives';
import Delta from '../components/ui/Delta';
import PageShell from '../components/ui/PageShell';















































import { getOverviewDashboard } from '../services/overviewDashboardService';















type DashboardData = Awaited<ReturnType<typeof getOverviewDashboard>>;















const RANGE_STORAGE_KEY = 'overview_range';







const AUTO_REFRESH_MS = 90000;















const metricsList = [







  { key: 'roas', label: 'ROAS' },







  { key: 'cpa', label: 'CPA' },







  { key: 'spend', label: 'Spend' },







  { key: 'revenue', label: 'Revenue' },







  { key: 'ctr', label: 'CTR' }







] as const;







const CX = {

  section: '{CX.section}',

  emptyNote: 'mt-3 {CX.emptyNote}',

  loadingNote: '{CX.loadingNote}',

  selectSmall: '{CX.selectSmall}',

  filterChip: '{CX.filterChip}',

  filterChipActive: 'rounded-full border border-border/60 bg-accent/40 px-3 py-1 text-xs text-foreground'

};

































const safeNumber = (value: number | null | undefined, fallback = '') => {







  if (value === null || value === undefined) return fallback;







  const num = Number(value);







  if (Number.isNaN(num)) return fallback;







  return num;







};















const formatCompact = (value: number | null | undefined, fallback = '??�????????') => {







  const num = safeNumber(value, fallback);







  if (typeof num !== 'number') return num;







  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);







};















const formatCurrency = (value: number | null | undefined, fallback = '??�????????') => {







  const num = safeNumber(value, fallback);







  if (typeof num !== 'number') return num;







  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);







};















const formatPct = (value: number | null | undefined, fallback = '??�????????') => {







  const num = safeNumber(value, fallback);







  if (typeof num !== 'number') return num;







  return `${num.toFixed(2)}%`;







};















const CardShell: React.FC<{ className?: string; title?: string; actions?: React.ReactNode; children: React.ReactNode }> = ({







  className = '',







  title,







  actions,







  children







}) => (







  <div className={`${cxCard} ${className}`}>







    {(title || actions) && (







      <div className={cxCardHeader}>







        {title && <h3 className={cxCardTitle}>{title}</h3>}







        {actions && <div className="flex items-center gap-2">{actions}</div>}







      </div>







    )}







    <div className={"p-4"}>{children}</div>







  </div>







);















const KpiCard = ({







  title,







  value,







  delta,







  icon,







  hint,







  onClick







}: {







  title: string;







  value: string;







  delta?: number;







  icon?: React.ReactNode;







  hint?: string;







  onClick?: () => void;







}) => (







  <CardShell className="cursor-pointer" title="" actions={null}>







    <button type="button" onClick={onClick} className="w-full text-left">







      <div className="flex items-start justify-between">







        <div>







          <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>







          <div className="mt-2 flex items-end gap-2">







            <p className="text-2xl font-semibold text-foreground">{value}</p>







            {typeof delta === 'number' && <Delta value={delta} suffix="%" />}






          </div>







          {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}







        </div>






        {icon ? <div className="rounded-xl border border-border bg-card px-2 py-1 text-foreground/80">{icon}</div> : null}







      </div>







    </button>







  </CardShell>







);















const InsightPill = ({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) => (







  <button







    type="button"







    onClick={onClick}







    className="flex w-full items-center justify-between rounded-xl border border-border bg-card/80 px-3 py-2 hover:bg-accent/10"







  >







    <span className="text-sm text-muted-foreground">{label}</span>







    <span className="cxCardTitle">{value}</span>







  </button>







);















const KpiSkeleton = () => (







  <div className="rounded-2xl border border-border/60 bg-card p-5 animate-pulse space-y-3">







    <div className="h-3 w-24 rounded bg-card" />







    <div className="h-7 w-20 rounded bg-card" />







    <div className="h-3 w-32 rounded bg-card" />







  </div>







);















const ChartSkeleton = () => (







  <div className="h-[320px] rounded-xl border border-border/60 bg-gradient-to-b from-white/5 to-transparent animate-pulse" />







);















const TableSkeleton = () => (







  <div className="space-y-2">







    {Array.from({ length: 4 }).map((_, idx) => (







      <div key={idx} className="h-10 rounded border border-border/60 bg-card animate-pulse" />







    ))}







  </div>







);















const CommandPalette = ({







  open,







  onClose,







  onCommand







}: {







  open: boolean;







  onClose: () => void;







  onCommand: (cmd: string) => void;







}) => {







  const [query, setQuery] = useState('');







  const commands = [







    { label: 'Open Ad Builder', action: () => onCommand('builder') },







    { label: 'Generate Strategy', action: () => onCommand('strategy') },







    { label: 'Run AI Analysis', action: () => onCommand('analysis') },







    { label: 'Go to Strategies', action: () => onCommand('go-strategies') },







    { label: 'Go to Ads', action: () => onCommand('go-ads') },







    { label: 'Refresh Dashboard', action: () => onCommand('refresh') }







  ];







  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));















  useEffect(() => {







    const onKey = (e: KeyboardEvent) => {







      if (e.key === 'Escape') onClose();







    };







    if (open) window.addEventListener('keydown', onKey);







    return () => window.removeEventListener('keydown', onKey);







  }, [open, onClose]);















  return (







    <AnimatePresence>







      {open && (







        <motion.div







          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20"







          initial={{ opacity: 0 }}







          animate={{ opacity: 1 }}







          exit={{ opacity: 0 }}







          onClick={onClose}







        >







          <motion.div







            onClick={(e) => e.stopPropagation()}







            initial={{ opacity: 0, scale: 0.96, y: -10 }}







            animate={{ opacity: 1, scale: 1, y: 0 }}







            exit={{ opacity: 0, scale: 0.95, y: -10 }}







            transition={{ duration: 0.15 }}







            className="w-full max-w-xl rounded-2xl border border-border/60 bg-[#0c0f1a] p-4 shadow-2xl"







          >







            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2">







              <Command size={16} className="text-foreground" />







              <input







                autoFocus







                value={query}







                onChange={(e) => setQuery(e.target.value)}







                placeholder="Search commands..."







                className="w-full bg-transparent text-white focus:outline-none text-sm"







              />







              <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close palette">







                <X size={16} />







              </button>







            </div>







            <div className="mt-3 max-h-64 overflow-y-auto space-y-1">







              {filtered.map((c) => (







                <button







                  key={c.label}







                  onClick={() => {







                    c.action();







                    onClose();







                  }}







                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card/80 px-3 py-2 text-left text-sm text-foreground hover:bg-accent/10"







                >







                  {c.label}







                </button>







              ))}







              {!filtered.length && <p className="text-xs text-muted-foreground px-2">No commands found.</p>}







            </div>







          </motion.div>







        </motion.div>







      )}







    </AnimatePresence>







  );







};















const RightDrawer = ({ open, onClose, title, body }: { open: boolean; onClose: () => void; title: string; body: React.ReactNode }) => {







  useEffect(() => {







    const onKey = (e: KeyboardEvent) => {







      if (e.key === 'Escape') onClose();







    };







    if (open) window.addEventListener('keydown', onKey);







    return () => window.removeEventListener('keydown', onKey);







  }, [open, onClose]);















  return (







    <AnimatePresence>







      {open && (







        <motion.div







          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"







          initial={{ opacity: 0 }}







          animate={{ opacity: 1 }}







          exit={{ opacity: 0 }}







          onClick={onClose}







        >







          <motion.div







            initial={{ x: 420 }}







            animate={{ x: 0 }}







            exit={{ x: 420 }}







            transition={{ type: 'spring', stiffness: 240, damping: 28 }}







            className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"







            onClick={(e) => e.stopPropagation()}







          >







            <div className="flex items-center justify-between border-b border-border px-4 py-3">







              <h3 className="cxCardTitle">{title}</h3>







              <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close drawer">







                <X size={16} />







              </button>







            </div>







            <div className="flex-1 overflow-y-auto p-4 text-foreground/80 text-sm">{body}</div>







          </motion.div>







        </motion.div>







      )}







    </AnimatePresence>







  );







};







const OverviewPage: React.FC = () => {







  const navigate = useNavigate();







  const { user, isAuthReady, loading: authLoading, isSubscribed } = useAuth();







  const [range, setRange] = useState<DateRangeValue>(() => {







    const stored = localStorage.getItem(RANGE_STORAGE_KEY);







    if (stored) {







      try {







        const parsed = JSON.parse(stored);







        const start = new Date(parsed.start);







        const end = new Date(parsed.end);







        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {







          return buildPresetRange('30d', 'Europe/Berlin');







        }







        return {







          start,







          end,







          preset: parsed.preset || '30d',







          timezone: parsed.timezone || 'Europe/Berlin'







        } as DateRangeValue;







      } catch {







        return buildPresetRange('30d', 'Europe/Berlin');







      }







    }







    return buildPresetRange('30d', 'Europe/Berlin');







  });















  const [data, setData] = useState<DashboardData | null>(null);







  const [loading, setLoading] = useState(false);







  const [error, setError] = useState<string | null>(null);







  const [activeMetric, setActiveMetric] = useState<(typeof metricsList)[number]['key']>('roas');







  const [activeTableTab, setActiveTableTab] = useState<'ads' | 'strategies' | 'analyses'>('ads');







  const [searchTerm, setSearchTerm] = useState('');







  const [statusFilter, setStatusFilter] = useState<string>('all');







  const [chipFilters, setChipFilters] = useState<string[]>([]);







  const [isPaletteOpen, setPaletteOpen] = useState(false);







  const [drawerContent, setDrawerContent] = useState<{ title: string; body: React.ReactNode } | null>(null);







  const lineRef = useRef<HTMLDivElement | null>(null);







  const autoRefreshRef = useRef<number | null>(null);







  const requestIdRef = useRef<symbol | null>(null);







  const mountedRef = useRef(true);















  useEffect(







    () => () => {







      mountedRef.current = false;







      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);







    },







    []







  );















  useEffect(() => {







    localStorage.setItem(







      RANGE_STORAGE_KEY,







      JSON.stringify({







        start: range.start,







        end: range.end,







        preset: range.preset,







        timezone: range.timezone







      })







    );







  }, [range]);















  const daysInRange = useMemo(







    () => Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24))),







    [range.end, range.start]







  );















  const fetchData = useCallback(async () => {







    if (!user?.id) return;







    setLoading(true);







    setError(null);







    const rid = Symbol('overview');







    requestIdRef.current = rid;







    try {







      const result = await getOverviewDashboard({







        userId: user.id,







        range,







        timezone: range.timezone







      });







      if (!mountedRef.current || requestIdRef.current !== rid) return;







      setData(result);







    } catch (err: any) {







      if (!mountedRef.current || requestIdRef.current !== rid) return;







      setError(err?.message || 'Konnte Dashboard-Daten nicht laden.');







    } finally {







      if (mountedRef.current && requestIdRef.current === rid) setLoading(false);







    }







  }, [user?.id, range]);















  useEffect(() => {







    if (authLoading || !isAuthReady || !user) return;







    const hasActive = typeof isSubscribed === 'function' ? isSubscribed() : true;







    if (!hasActive) {







      navigate('/payment-verification');







      return;







    }







    fetchData();







  }, [authLoading, isAuthReady, user, isSubscribed, range, fetchData, navigate]);















  useEffect(() => {







    if (autoRefreshRef.current) {







      clearInterval(autoRefreshRef.current);







    }







    autoRefreshRef.current = window.setInterval(() => {







      if (document.visibilityState === 'visible') {







        fetchData();







      }







    }, AUTO_REFRESH_MS);







    return () => {







      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);







    };







  }, [fetchData]);















  useEffect(() => {







    const handler = (e: KeyboardEvent) => {







      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {







        e.preventDefault();







        setPaletteOpen(true);







      }







    };







    window.addEventListener('keydown', handler);







    return () => window.removeEventListener('keydown', handler);







  }, []);















  const tableColumns: Column<any>[] = useMemo(







    () => [







      { Header: 'Name', accessor: 'name' },







      { Header: 'Typ', accessor: 'type' },







      {







        Header: 'Status',







        accessor: 'status',







        Cell: ({ value }) => (







          <span







            className={`rounded-full px-2 py-0.5 text-xs ${







              value === 'completed'







                ? 'bg-secondary/70 text-foreground'







                : value === 'active'







                  ? 'bg-sky-500/15 text-sky-200'







                  : value === 'failed'







                    ? 'bg-accent/50 text-foreground'







                    : 'bg-card text-foreground'







            }`}







          >







            {value || '??�????????'}







          </span>







        )







      },







      {







        Header: 'Tags',







        accessor: 'tags',







        Cell: ({ value }) => (Array.isArray(value) ? value.join(', ') : value || '??�????????')







      },







      { Header: 'Erstellt', accessor: 'created_at' }







    ],







    []







  );















  const tableRows = useMemo(() => {







    if (!data?.table?.rows) return [];







    return data.table.rows







      .filter((row) => {







        if (activeTableTab === 'ads') return row.type === 'ad';







        if (activeTableTab === 'strategies') return row.type === 'strategy';







        if (activeTableTab === 'analyses') return row.type === 'analysis';







        return true;







      })







      .filter((row) => (statusFilter === 'all' ? true : row.status === statusFilter))







      .filter((row) => (searchTerm ? row.name?.toLowerCase().includes(searchTerm.toLowerCase()) : true))







      .filter((row) => {







        if (chipFilters.includes('last24h')) {







          const created = new Date(row.created_at);







          if (Number.isNaN(created.getTime())) return false;







          return Date.now() - created.getTime() <= 24 * 60 * 60 * 1000;







        }







        return true;







      })







      .filter((row) => {







        if (chipFilters.includes('completed')) return row.status === 'completed';







        if (chipFilters.includes('review')) return row.status === 'pending' || row.status === 'draft';







        if (chipFilters.includes('high')) return row.tags?.includes('high') || false;







        return true;







      });







  }, [data?.table?.rows, activeTableTab, statusFilter, searchTerm, chipFilters]);















  const filteredPerformanceSeries = useMemo(() => data?.performanceSeries || [], [data?.performanceSeries]);















  const metricToChartSeries = useMemo(() => {







    switch (activeMetric) {







      case 'spend':







        return [{ dataKey: 'spend', name: 'Spend', color: '#22c55e', type: 'line' }];







      case 'revenue':







        return [{ dataKey: 'revenue', name: 'Revenue', color: '#38bdf8', type: 'line' }];







      case 'cpa':







        return [{ dataKey: 'cpa', name: 'CPA', color: '#f97316', type: 'line' }];







      case 'ctr':







        return [{ dataKey: 'ctr', name: 'CTR', color: '#a855f7', type: 'line' }];







      case 'roas':







      default:







        return [{ dataKey: 'roas', name: 'ROAS', color: '#f43f5e', type: 'line' }];







    }







  }, [activeMetric]);















  const creativeInsights = data?.creativeInsights || {







    topHooks: [],







    winningAngles: [],







    fatigueAlerts: [],







    sessionsByDevice: []







  };















  const kpis = data?.kpis;







  const timeSavedMinutes = useMemo(() => {







    if (!kpis) return 0;







    return kpis.adsGenerated * 12 + kpis.strategiesCreated * 25 + kpis.analysesRun * 8;







  }, [kpis]);







  const iterationVelocity = useMemo(() => {







    if (!kpis) return 0;







    return +(kpis.adsGenerated / daysInRange).toFixed(2);







  }, [kpis, daysInRange]);















  const openDrawer = useCallback((title: string, body: React.ReactNode) => {







    setDrawerContent({ title, body });







  }, []);















  const closeDrawer = useCallback(() => setDrawerContent(null), []);















  const handleCommand = useCallback(







    (cmd: string) => {







      switch (cmd) {







        case 'builder':







        case 'go-ads':







          navigate('/ad-ruby-ad-builder');







          break;







        case 'strategy':







        case 'go-strategies':







          navigate('/ad-strategy');







          break;







        case 'analysis':







          navigate('/ai-analysis');







          break;







        case 'refresh':







          fetchData();







          break;







        default:







          break;







      }







    },







    [fetchData, navigate]







  );















  const sessionsByDevice = creativeInsights.sessionsByDevice?.map((s: any) => ({ name: s.name || s.device, value: s.value || s.sessions })) || [];















  return (







    <DashboardLayout>



      <PageShell title="Overview" subtitle="Meta Performance + Creative Engine" rightActions={null}>







      <div className="{CX.section}">



        <CardShell className="p-0">



        <div className="flex flex-wrap items-center justify-between gap-4 p-5">







          <div className="space-y-1">







            <p className="text-xs uppercase tracking-wide text-muted-foreground">Overview</p>







            <h1 className="text-2xl font-semibold">Meta Performance + Creative Engine</h1>







            <p className="text-sm text-muted-foreground">SaaS Usage, Creative Insights und Meta-ready KPIs.</p>







          </div>







          <div className="flex flex-wrap items-center gap-2">







            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 h-10">







              <Search size={16} className="text-muted-foreground" aria-hidden="true" />







              <input







                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-[220px]"







                placeholder="Search assets..."







                value={searchTerm}







                onChange={(e) => setSearchTerm(e.target.value)}







              />







            </div>







            <button







              type="button"







              onClick={() => navigate('/ad-ruby-ad-builder')}







              className={cxButtonPrimary}







            >







              New Ad







            </button>







            <button







              type="button"







              onClick={fetchData}







              className={`${cxButtonSecondary}`}







            >







              <RefreshCw size={14} /> Refresh







            </button>







          </div>







        </div>
        </CardShell>














        {error && (







          <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground flex items-center justify-between">







            <span>{error}</span>







            <button







              type="button"







              onClick={fetchData}







              className="rounded-lg border border-border/60 px-3 py-1 text-foreground hover:bg-card/80"







            >







              Retry







            </button>







          </div>







        )}















        <CardShell>







          <div className="flex flex-wrap items-center gap-2">







            {[







              { label: 'Letzte 7 Tage', preset: '7d' as const },







              { label: 'Letzte 30 Tage', preset: '30d' as const },







              { label: 'Letzte 90 Tage', preset: '90d' as const },







              { label: 'YTD', preset: 'custom' as const }







            ].map((p) => (







              <button







                key={p.preset}







                type="button"







                onClick={() =>







                  setRange(







                    p.preset === 'custom' ? { ...buildPresetRange('90d', range.timezone), preset: 'custom' } : buildPresetRange(p.preset, range.timezone)







                  )







                }







                className={`${cxPill} ${range.preset === p.preset ? cxPillActive : ''}`}







              >







                {p.label}







              </button>







            ))}







          </div>







          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">







            <DateRangePicker value={range} onChange={setRange} />







          </div>







        </CardShell>







        <CardShell className="relative overflow-hidden">



          <div className="pointer-events-none absolute inset-0 opacity-60">



            <div className="absolute left-6 top-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />



            <div className="absolute right-4 bottom-4 h-24 w-24 rounded-full bg-accent/10 blur-3xl" />



          </div>



          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">



            {[



              { label: 'System Health', value: '99.9%', icon: <Sparkles size={14} /> },



              { label: 'Avg. Response', value: '142ms', icon: <Clock3 size={14} /> },



              {



                label: 'Spend / Conv.',



                value: data?.kpis?.spend ? formatCurrency(data.kpis.spend) : '?',



                icon: <Activity size={14} />



              },



              { label: 'Lift vs. last week', value: kpis ? formatPct(kpis.ctr ?? 0) : '?', icon: <Flame size={14} /> },



            ].map((stat) => (



              <div



                key={stat.label}



                className="flex items-center justify-between rounded-2xl border border-border bg-card/80 px-4 py-3 text-foreground"



              >



                <div>



                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>



                  <p className="text-lg font-semibold">{stat.value}</p>



                </div>



                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-foreground">{stat.icon}</span>



              </div>



            ))}



          </div>



        </CardShell>















        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">







          {loading ? (







            <>







              <KpiSkeleton />







              <KpiSkeleton />







              <KpiSkeleton />







              <KpiSkeleton />







              <KpiSkeleton />







              <KpiSkeleton />







            </>







          ) : (







            <>







              <KpiCard







                title="Ads Generated"







                value={kpis ? `${kpis.adsGenerated}` : '??�????????'}







                delta={0}







                icon={<Rocket size={16} />}







                hint="im gew??????�hlten Zeitraum"







                onClick={() => openDrawer('Ads Generated', <p>Summe der generierten Ads im Zeitraum.</p>)}







              />







              <KpiCard







                title="Strategies Created"







                value={kpis ? `${kpis.strategiesCreated}` : '??�????????'}







                delta={0}







                icon={<Lightbulb size={16} />}







                hint="Strategien"







                onClick={() => openDrawer('Strategies Created', <p>Strategien erstellt oder gespeichert.</p>)}







              />







              <KpiCard







                title="Analyses Run"







                value={kpis ? `${kpis.analysesRun}` : '??�????????'}







                delta={0}







                icon={<BarChart3 size={16} />}







                hint="Research / AI Checks"







                onClick={() => openDrawer('Analyses', <p>Analysen im Zeitraum.</p>)}







              />







              <KpiCard







                title="Credits Used"







                value={kpis ? `${kpis.creditsUsed}` : '??�????????'}







                delta={0}







                icon={<Zap size={16} />}







                hint="Nutzung"







                onClick={() => openDrawer('Credits Used', <p>Credits Nutzung im Zeitraum.</p>)}







              />







              <KpiCard







                title="Time Saved"







                value={`${Math.round(timeSavedMinutes / 60)}h`}







                delta={0}







                icon={<Clock3 size={16} />}







                hint="Sch??????�tzung"







                onClick={() => openDrawer('Time Saved', <p>Berechnet als Ads*12min + Strategies*25min + Analyses*8min im Zeitraum.</p>)}







              />







              <KpiCard







                title="Iteration Velocity"







                value={`${iterationVelocity} ads/Tag`}







                delta={0}







                icon={<Activity size={16} />}







                hint={`${daysInRange} Tage`}







                onClick={() => openDrawer('Iteration Velocity', <p>Ads pro Tag im gew??????�hlten Zeitraum.</p>)}







              />







            </>







          )}







        </div>















        {!kpis?.spend && (







          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex items-center justify-between">







            <div className="flex items-center gap-2">







              <AlertTriangle size={16} />







              <span>Connect Meta to unlock live KPIs (Spend/Revenue/ROAS/CPA/CTR).</span>







            </div>







            <button







              type="button"







              onClick={() => navigate('/settings-configuration')}







              className="rounded-lg border border-amber-300/60 px-3 py-1 text-amber-50 hover:bg-amber-500/20"







            >







              Connect Meta







            </button>







          </div>







        )}















        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">







          <CardShell







            className="lg:col-span-2"







            title="Performance"







            actions={







              <div className="flex items-center gap-2">







                {metricsList.map((m) => (







                  <button







                    key={m.key}







                    onClick={() => setActiveMetric(m.key)}







                    className={`rounded-full px-3 py-1 text-xs ${







                      activeMetric === m.key ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-card'







                    }`}







                  >







                    {m.label}







                  </button>







                ))}







                <button







                  type="button"







                  onClick={() => exportNodeToPng(lineRef.current, 'performance.png')}







                  className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-foreground hover:border-border"







                >







                  <Download size={14} />







                </button>







              </div>







            }







          >







            {loading ? (







              <ChartSkeleton />







            ) : (







              <div ref={lineRef}>







                <LineChartAnimated data={filteredPerformanceSeries} timezone={range.timezone} series={metricToChartSeries} />







              </div>







            )}







          </CardShell>















          <CardShell title="Creative Engine">







            <div className="space-y-2">







              <h3 className="text-xs uppercase tracking-wide text-foreground">Top Hooks</h3>







              {creativeInsights.topHooks?.length ? (







                creativeInsights.topHooks.map((hook: any) => (







                  <InsightPill







                    key={hook.hook}







                    label={hook.hook}







                    value={`Score ${hook.score ?? hook.usageCount}`}







                    onClick={() =>







                      openDrawer(







                        'Hook Details',







                        <div className="space-y-2">







                          <p className="text-sm">Hook: {hook.hook}</p>







                          <p className="text-sm">Usage: {hook.usageCount ?? 'n/a'}</p>







                          <p className="text-sm">Score: {hook.score ?? 'n/a'}</p>







                        </div>







                      )







                    }







                  />







                ))







              ) : (







                <p className="text-sm text-foreground">No hooks found in this range.</p>







              )}







            </div>







            <div className="space-y-2 mt-3">







              <h3 className="text-xs uppercase tracking-wide text-foreground">Winning Angles</h3>







              {creativeInsights.winningAngles?.length ? (







                creativeInsights.winningAngles.map((angle: any) => <InsightPill key={angle.angle} label={angle.angle} value={`+${angle.liftPct}%`} />)







              ) : (







                <p className="text-sm text-foreground">No angles yet.</p>







              )}







            </div>







            <div className="space-y-2 mt-3">







              <h3 className="text-xs uppercase tracking-wide text-foreground">Fatigue Alerts</h3>







              {creativeInsights.fatigueAlerts?.length ? (







                creativeInsights.fatigueAlerts.map((a: any) => <InsightPill key={a.creativeName} label={a.creativeName} value={a.reason} />)







              ) : (







                <p className="text-sm text-foreground">No fatigue detected.</p>







              )}







            </div>







          </CardShell>







        </div>















        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">







          <CardShell className="lg:col-span-2" title="Activity Feed">







            {loading ? (







              <TableSkeleton />







            ) : data?.activityFeed?.length ? (







              <div className="space-y-3">







                {data.activityFeed.map((item: any) => (







                  <button







                    key={item.id}







                    onClick={() =>







                      openDrawer(







                        item.title,







                        <div className="space-y-2">







                          <p className="text-sm">Type: {item.type}</p>







                          <p className="text-sm">Created: {item.created_at}</p>







                        </div>







                      )







                    }







                    className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-black/20 px-3 py-3 hover:border-border/60"







                  >







                    <div>







                      <p className="text-sm font-semibold text-white">{item.title}</p>







                      <p className="text-xs text-foreground">{item.type}</p>







                    </div>







                    <p className="text-xs text-foreground">{item.created_at}</p>







                  </button>







                ))}







              </div>







            ) : (







              <p className="text-sm text-foreground">Keine Aktivit??????�ten im Zeitraum.</p>







            )}







          </CardShell>















          <CardShell title="Quick Actions">







            <div className="grid grid-cols-1 gap-2">







              <button







                onClick={() => navigate('/ad-ruby-ad-builder')}







                className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-3 text-foreground hover:bg-card/80"







              >







                <span>Open Ad Builder</span>







                <Play size={16} />







              </button>







              <button







                onClick={() => navigate('/ai-analysis')}







                className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-3 text-white hover:border-border/60"







              >







                <span>Run AI Analysis</span>







                <Sparkles size={16} />







              </button>







              <button







                onClick={() => navigate('/ad-strategy')}







                className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-3 text-white hover:border-border/60"







              >







                <span>Generate Strategy</span>







                <Lightbulb size={16} />







              </button>







            </div>







          </CardShell>







        </div>















        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">







          <CardShell title="Sessions nach Device">







            <DonutChart data={sessionsByDevice} title="Device Breakdown" />







          </CardShell>







          <CardShell className="lg:col-span-2" title="Assets">







            <div className="flex flex-wrap items-center gap-2 justify-between mb-3">







              <div className="flex items-center gap-2">







                {['ads', 'strategies', 'analyses'].map((tab) => (







                  <button







                    key={tab}







                    onClick={() => setActiveTableTab(tab as any)}







                    className={`rounded-full px-3 py-1 text-xs ${







                      activeTableTab === tab ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-card'







                    }`}







                  >







                    {tab}







                  </button>







                ))}







              </div>







              <div className="flex items-center gap-2">







                {[{ key: 'last24h', label: 'Last 24h' }, { key: 'completed', label: 'Only completed' }, { key: 'review', label: 'Needs review' }, { key: 'high', label: 'High value' }].map((chip) => (







                  <button







                    key={chip.key}







                    onClick={() => setChipFilters((prev) => (prev.includes(chip.key) ? prev.filter((c) => c !== chip.key) : [...prev, chip.key]))}







                    className={`rounded-full border px-3 py-1 text-xs ${







                      chipFilters.includes(chip.key) ? 'border-border/60 bg-accent/40' : 'border-border/60 bg-card'







                    }`}







                  >







                    {chip.label}







                  </button>







                ))}







                <select







                  value={statusFilter}







                  onChange={(e) => setStatusFilter(e.target.value)}







                  className="rounded-lg border border-border/60 bg-card px-2 py-1 text-xs text-white"







                >







                  <option value="all">Status: Alle</option>







                  <option value="draft">Draft</option>







                  <option value="active">Active</option>







                  <option value="completed">Completed</option>







                </select>







              </div>







            </div>







            {loading ? <TableSkeleton /> : <DataTable data={tableRows} columns={tableColumns} summary={undefined} title="Assets" />}







            {tableRows.length === 0 && !loading && (







              <div className="mt-3 rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground">







                No assets in this view ??�???????? generate your first Ad Variant oder Strategy.







              </div>







            )}







          </CardShell>







        </div>















        {loading && (







          <div className="rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground">







            <RefreshCw className="mr-2 inline animate-spin" size={16} /> L??????�dt...







          </div>







        )}







      </div>







      </PageShell>







      <CommandPalette open={isPaletteOpen} onClose={() => setPaletteOpen(false)} onCommand={handleCommand} />







      <RightDrawer open={Boolean(drawerContent)} onClose={closeDrawer} title={drawerContent?.title || ''} body={drawerContent?.body || null} />







    </DashboardLayout>







  );







};















export default OverviewPage;
