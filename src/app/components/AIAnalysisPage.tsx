import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Brain,
  Search,
  Download,
  RefreshCw,
  Trash2,
  Copy,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from './layout/DashboardShell';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { SelectField } from './ui/select-field';
import { supabase } from '../lib/supabaseClient';
import { env } from '../lib/env';
import { useMetaCampaigns } from '../hooks/useMetaCampaigns';
import { useStrategies } from '../hooks/useStrategies';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { applyMetaAction } from '../lib/api/meta';

// Sub-components (already extracted)
import { AICopilotChat } from './ai-analysis/AICopilotChat';
import { InsightSummaryCards } from './ai-analysis/InsightSummaryCards';
import { QuickActionsBar } from './ai-analysis/QuickActionsBar';
import { PerformanceTrendChart } from './ai-analysis/PerformanceTrendChart';
import { CreativeIntelligencePanel } from './ai-analysis/CreativeIntelligencePanel';
import { AgencySettingsMenu } from './ai-analysis/AgencySettingsMenu';

// Sub-components (newly extracted)
import { StrategyConfigDialog } from './ai-analysis/StrategyConfigDialog';
import { CampaignTable } from './ai-analysis/CampaignTable';
import { CampaignCardList } from './ai-analysis/CampaignCardList';
import { AIRecommendationsPanel } from './ai-analysis/AIRecommendationsPanel';
import { PredictiveInsightsSection } from './ai-analysis/PredictiveInsightsSection';
import { AutomatedRulesPanel, type AutomationRule } from './ai-analysis/AutomatedRulesPanel';

// Shared types
import type { AIRecommendation, AIAnalysis, Ad, AdSet, Campaign, RecommendationStyle } from './ai-analysis/types';
// getStatusColor and getPerformanceColor are used by sub-components directly

export function AIAnalysisPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'learning'>('all');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const syncControllerRef = useRef<AbortController | null>(null);
  const [assignmentMap, setAssignmentMap] = useState<Record<string, string | null>>({});
  const [applyingActions, setApplyingActions] = useState<Record<string, boolean>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [aiAnalysisCache, setAiAnalysisCache] = useState<Record<string, AIAnalysis>>({});
  const [aiPowered, setAiPowered] = useState(false);

  // Strategy Config
  const [showStrategyParams, setShowStrategyParams] = useState(false);
  const [strategyConfig, setStrategyConfig] = useState({
    risk_tolerance: 'medium',
    scale_speed: 'medium',
    target_roas: 3.0,
    max_daily_budget_increase: 20,
  });

  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const { strategies } = useStrategies();

  // Live Campaign Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [timeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshTick, setRefreshTick] = useState(0);

  const { campaigns: metaCampaigns, loading: campaignsLoading, error: campaignsError, refresh: refreshCampaigns } = useMetaCampaigns();
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useAnalyticsData(timeRange, false, 'meta', refreshTick);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────

  const toggleAutopilot = useCallback(async () => {
    const next = !autopilotEnabled;
    setAutopilotEnabled(next);
    toast.success(next ? 'Autopilot aktiv & optimiert' : 'Autopilot pausiert');
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;
      if (uid) {
        await supabase.from('profiles').update({ autopilot_enabled: next }).eq('id', uid);
      }
    } catch (err) {
      console.error('[Autopilot] Failed to persist state:', err);
    }
  }, [autopilotEnabled]);

  // Load autopilot state from profile
  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) return;
      const { data } = await supabase.from('profiles').select('autopilot_enabled').eq('id', uid).single();
      if (data?.autopilot_enabled != null) setAutopilotEnabled(!!data.autopilot_enabled);
    })();
  }, []);

  const applyRecommendations = async () => {
    if (!Object.keys(aiAnalysisCache).length) return;
    setIsApplying(true);
    try {
      if (env.demoMode) {
        toast.loading("Applying changes to Meta (Simulation)...");
        await new Promise(r => setTimeout(r, 2000));
        toast.dismiss();
        toast.success('Empfohlene Änderungen wurden auf Meta angewendet (Demo).');
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { toast.error('Bitte zuerst anmelden.'); return; }
      const res = await fetch('/api/ai-campaign-apply', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyses: Object.values(aiAnalysisCache) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Apply failed');
      toast.success('Empfohlene Änderungen wurden auf Meta angewendet.');
    } catch (err) {
      console.error('[AIAnalysisPage] Apply error:', err);
      toast.error(err instanceof Error ? err.message : 'Apply fehlgeschlagen');
    } finally {
      setIsApplying(false);
    }
  };

  const runAIAnalysis = async (campaignsToAnalyze: typeof metaCampaigns) => {
    if (!campaignsToAnalyze?.length) return;
    setIsAnalyzingAI(true);
    try {
      if (env.demoMode) {
        await new Promise(r => setTimeout(r, 1500));
        const cache: Record<string, AIAnalysis> = {};
        campaignsToAnalyze.forEach(c => {
          cache[c.id] = {
            id: `mock-ana-${c.id}`,
            recommendation: c.roas > 3 ? 'duplicate' : c.roas < 1.5 ? 'kill' : 'increase',
            confidence: 90,
            reason: "Mock AI Insight based on ROAS benchark.",
            expectedImpact: "+20% Efficiency",
            details: ["ROAS: " + c.roas, "CTR: " + c.ctr]
          };
        });
        setAiAnalysisCache(cache);
        setAiPowered(true);
        toast.success(`AI Analyse abgeschlossen (Demo: ${campaignsToAnalyze.length} Kampagnen)`);
        return;
      }

      const apiBase = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const apiUrl = apiBase ? `${apiBase}/api/ai-campaign-analyze` : '/api/ai-campaign-analyze';
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { toast.error('Bitte zuerst anmelden.'); return; }

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaigns: campaignsToAnalyze.map(c => ({
            id: c.id, name: c.name, status: c.status, spend: c.spend,
            revenue: c.revenue, roas: c.roas, ctr: c.ctr,
            conversions: c.conversions, impressions: c.impressions,
            cpc: c.clicks > 0 ? c.spend / c.clicks : 0,
          })),
          strategy: { name: 'Custom AdRuby Pro Analysis', description: 'AdRuby Pro Strategy Engine', autopilot_config: strategyConfig, industry_type: 'general' },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'AI Analysis failed');

      const cache: Record<string, AIAnalysis> = {};
      (json.analyses || []).forEach((analysis: AIAnalysis & { campaignId?: string }) => {
        if (analysis.campaignId) cache[analysis.campaignId] = analysis;
      });
      setAiAnalysisCache(cache);
      setAiPowered(json.meta?.aiPowered ?? false);

      if (json.meta?.aiPowered) toast.success(`AI Analyse abgeschlossen (${json.analyses?.length || 0} Kampagnen)`);
      else toast.info('Fallback-Analyse verwendet (OpenAI nicht konfiguriert)');
    } catch (err) {
      console.error('[AIAnalysisPage] AI analysis failed:', err);
      toast.error(err instanceof Error ? err.message : 'AI Analyse fehlgeschlagen');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // ── Data Building ─────────────────────────────────────────────────

  const normalizeStatus = (status: string | null | undefined): 'active' | 'paused' | 'learning' => {
    const value = String(status || '').toLowerCase();
    if (value.includes('pause')) return 'paused';
    if (value.includes('learn')) return 'learning';
    return 'active';
  };

  const buildPerformanceScore = (metrics: { roas: number; ctr: number; conversions: number }) => {
    const roasScore = Math.min(60, metrics.roas * 12);
    const ctrScore = Math.min(25, metrics.ctr * 8);
    const convScore = metrics.conversions > 0 ? Math.min(15, Math.log10(metrics.conversions + 1) * 10) : 0;
    return Math.max(20, Math.min(100, Math.round(roasScore + ctrScore + convScore)));
  };

  const buildAiAnalysis = useCallback((id: string, campaignId: string, metrics: { roas: number; ctr: number; conversions: number; spend: number }, strategyId?: string | null): AIAnalysis => {
    const cached = aiAnalysisCache[campaignId];
    if (cached) {
      return {
        id: cached.id || id, recommendation: cached.recommendation, confidence: cached.confidence,
        reason: cached.reason, expectedImpact: cached.expectedImpact,
        details: cached.details || [`ROAS: ${metrics.roas.toFixed(2)}x`, `CTR: ${metrics.ctr.toFixed(2)}%`, `Conversions: ${metrics.conversions}`],
      };
    }

    const strategy = strategies.find(s => s.id === strategyId);
    const autopilotConfig = strategy?.autopilot_config as Record<string, unknown> | undefined;
    const pauseThreshold = (autopilotConfig?.pause_threshold_roas as number) ?? 1.0;
    const scaleThreshold = (autopilotConfig?.scale_threshold_roas as number) ?? 4.0;
    const targetRoas = (autopilotConfig?.target_roas as number) ?? 3.0;

    let recommendation: AIRecommendation = 'increase';
    if (metrics.roas >= targetRoas && metrics.ctr >= 2.0) recommendation = 'duplicate';
    if (metrics.roas >= scaleThreshold) recommendation = 'duplicate';
    if (metrics.roas < pauseThreshold) recommendation = 'kill';
    if (metrics.roas >= pauseThreshold && metrics.roas < targetRoas * 0.8) recommendation = 'decrease';

    const confidence = Math.max(60, Math.min(95, Math.round(50 + metrics.roas * 8 + metrics.ctr * 3)));
    const reasonMap: Record<AIRecommendation, string> = {
      duplicate: `Starke Performance (ROAS > ${targetRoas}). Skalierung empfohlen.`,
      increase: 'Solide Performance. Budget kann vorsichtig erhöht werden.',
      decrease: `ROAS unter Ziel (${targetRoas}). Budget reduzieren.`,
      kill: `Performance unter Minimum (ROAS < ${pauseThreshold}). Pause empfohlen.`,
    };

    return {
      id, recommendation, confidence, reason: reasonMap[recommendation],
      expectedImpact: recommendation === 'duplicate' ? '+30-50% Umsatzpotenzial' : 'Budget-Optimierung',
      details: [`ROAS: ${metrics.roas.toFixed(2)}x`, `CTR: ${metrics.ctr.toFixed(2)}%`, `Conversions: ${metrics.conversions}`],
    } satisfies AIAnalysis;
  }, [aiAnalysisCache, strategies]);

  // ── Effects ───────────────────────────────────────────────────────

  useEffect(() => {
    const next = (metaCampaigns || []).map((campaign) => {
      const impressions = Number(campaign.impressions || 0);
      const clicks = Number(campaign.clicks || 0);
      const spend = Number(campaign.spend || 0);
      const revenue = Number(campaign.revenue || 0);
      const ctr = Number(campaign.ctr || 0);
      const roas = Number(campaign.roas || 0);
      const conversions = Number(campaign.conversions || 0);
      const cpc = clicks > 0 ? spend / clicks : 0;
      const performanceScore = buildPerformanceScore({ roas, ctr, conversions });

      const campaignStrategyId = campaign.strategyId || null;
      const aiAnalysis = buildAiAnalysis(`analysis-${campaign.id}`, campaign.id, { roas, ctr, conversions, spend }, campaignStrategyId);
      const adSetStrategyId = assignmentMap[`adset:${campaign.id}-adset`] ?? campaignStrategyId;
      const adStrategyId = assignmentMap[`ad:${campaign.id}-ad`] ?? adSetStrategyId;

      const aggregateAd: Ad = {
        id: `${campaign.id}-ad`, name: `${campaign.name} · Gesamt`, campaignId: campaign.id,
        status: normalizeStatus(campaign.status), impressions, clicks, ctr, cpc, conversions,
        spend, revenue, roas, performanceScore, aiAnalysis, strategyId: adStrategyId,
      };

      const aggregateAdSet: AdSet = {
        id: `${campaign.id}-adset`, name: 'Gesamt', status: normalizeStatus(campaign.status),
        impressions, clicks, ctr, cpc, conversions, spend, revenue, roas, performanceScore,
        ads: [aggregateAd], expanded: false, strategyId: adSetStrategyId,
      };

      return {
        id: campaign.id, name: campaign.name, status: normalizeStatus(campaign.status),
        impressions, clicks, ctr, cpc, conversions, spend, revenue, roas, performanceScore,
        adSets: [aggregateAdSet], expanded: false, strategyId: campaignStrategyId,
      } satisfies Campaign;
    });
    setCampaigns(next);
  }, [metaCampaigns, assignmentMap, buildAiAnalysis]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session || cancelled) return;
      const { data: rows, error } = await supabase.from('meta_strategy_assignments').select('entity_type,entity_id,strategy_id');
      if (cancelled || error || !rows) return;
      const map: Record<string, string | null> = {};
      rows.forEach((row) => { map[`${row.entity_type}:${row.entity_id}`] = row.strategy_id || null; });
      setAssignmentMap(map);
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Computed ──────────────────────────────────────────────────────

  const filteredCampaigns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      if (filterStatus !== 'all' && campaign.status !== filterStatus) return false;
      if (!query) return true;
      if (campaign.name.toLowerCase().includes(query)) return true;
      return campaign.adSets.some((adSet) => {
        if (adSet.name.toLowerCase().includes(query)) return true;
        return adSet.ads.some((ad) => ad.name.toLowerCase().includes(query));
      });
    });
  }, [campaigns, filterStatus, searchQuery]);

  const totalSpend = analyticsData?.summary?.spend ?? campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = analyticsData?.summary?.revenue ?? campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalRoas = analyticsData?.summary?.roas ?? (totalSpend > 0 ? totalRevenue / totalSpend : 0);
  const _totalConversions = analyticsData?.summary?.conversions ?? campaigns.reduce((acc, c) => acc + Number(c.conversions || 0), 0);
  const totalAdSets = campaigns.reduce((acc, c) => acc + c.adSets.length, 0);
  const totalAds = campaigns.reduce((acc, c) => acc + c.adSets.reduce((a, s) => a + s.ads.length, 0), 0);

  const getRecommendationStyle = (recommendation: AIRecommendation | string): RecommendationStyle => {
    switch (recommendation) {
      case 'kill': return { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <Trash2 className="w-4 h-4" />, label: 'Kill Ad', actionLabel: 'Pause Ad', action: 'pause', confirmText: 'Diese Kampagne in Meta pausieren?' };
      case 'duplicate': return { color: '#10b981', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: <Copy className="w-4 h-4" />, label: 'Duplicate Ad', actionLabel: 'Duplicate', action: 'duplicate', confirmText: 'Diese Kampagne in Meta duplizieren (Copy ist pausiert)?' };
      case 'increase': return { color: '#3b82f6', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: <TrendingUp className="w-4 h-4" />, label: 'Increase Budget', actionLabel: 'Increase +50%', action: 'increase', scalePct: 0.5, confirmText: 'Budget dieser Kampagne um 50% erhöhen?' };
      case 'decrease': default: return { color: '#f59e0b', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: <TrendingDown className="w-4 h-4" />, label: 'Decrease Budget', actionLabel: 'Decrease -30%', action: 'decrease', scalePct: 0.3, confirmText: 'Budget dieser Kampagne um 30% reduzieren?' };
    }
  };

  // ── Campaign Actions ──────────────────────────────────────────────

  const isMetaLinkedCampaignId = (campaignId: string) => /^\d+$/.test(campaignId);

  const updateCampaignStatus = (campaignId: string, status: 'active' | 'paused' | 'learning') => {
    setCampaigns((prev) => prev.map((c) => c.id === campaignId
      ? { ...c, status, adSets: c.adSets.map((as) => ({ ...as, status, ads: as.ads.map((ad) => ({ ...ad, status })) })) }
      : c
    ));
  };

  const toggleCampaign = (campaignId: string) => setCampaigns(campaigns.map(c => c.id === campaignId ? { ...c, expanded: !c.expanded } : c));

  const toggleAdSet = (campaignId: string, adSetId: string) => {
    setCampaigns(campaigns.map(c => c.id === campaignId
      ? { ...c, adSets: c.adSets.map(as => as.id === adSetId ? { ...as, expanded: !as.expanded } : as) }
      : c
    ));
  };

  const handleStrategyChange = async (itemId: string, strategyId: string, level: 'campaign' | 'adset' | 'ad') => {
    const nextStrategyId = strategyId || null;
    try {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) throw new Error('Bitte zuerst anmelden.');

      if (level === 'campaign') {
        const { error } = await supabase.from('meta_campaigns').update({ strategy_id: nextStrategyId }).or(`facebook_campaign_id.eq.${itemId},id.eq.${itemId}`);
        if (error) throw error;
      } else {
        const entityType = level === 'adset' ? 'adset' : 'ad';
        const key = `${entityType}:${itemId}`;
        if (!nextStrategyId) {
          const { error } = await supabase.from('meta_strategy_assignments').delete().eq('entity_type', entityType).eq('entity_id', itemId).eq('user_id', userId);
          if (error) throw error;
          setAssignmentMap((prev) => { const next = { ...prev }; delete next[key]; return next; });
        } else {
          const { error } = await supabase.from('meta_strategy_assignments').upsert({ user_id: userId, entity_type: entityType, entity_id: itemId, strategy_id: nextStrategyId }, { onConflict: 'user_id,entity_type,entity_id' });
          if (error) throw error;
          setAssignmentMap((prev) => ({ ...prev, [key]: nextStrategyId }));
        }
      }

      setCampaigns((prev) => prev.map((campaign) => {
        if (level === 'campaign' && campaign.id === itemId) return { ...campaign, strategyId: nextStrategyId || undefined };
        if (level === 'adset') return { ...campaign, adSets: campaign.adSets.map((as) => as.id === itemId ? { ...as, strategyId: nextStrategyId || undefined } : as) };
        if (level === 'ad') return { ...campaign, adSets: campaign.adSets.map((as) => ({ ...as, ads: as.ads.map((ad) => ad.id === itemId ? { ...ad, strategyId: nextStrategyId || undefined } : ad) })) };
        return campaign;
      }));
      toast.success(`Strategy updated for ${level}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Strategy update failed');
    }
  };

  const handleAIAction = async (style: RecommendationStyle, ad: Ad) => {
    if (!ad.campaignId) { toast.error('Meta campaign ID fehlt.'); return; }
    if (!isMetaLinkedCampaignId(ad.campaignId)) { toast.error('Diese Kampagne ist nicht mit Meta verknüpft. Bitte Sync ausführen.'); return; }
    if (!window.confirm(style.confirmText)) return;

    const actionKey = `${ad.campaignId}:${style.action}`;
    if (applyingActions[actionKey]) return;

    setApplyingActions((prev) => ({ ...prev, [actionKey]: true }));
    try {
      const result = await applyMetaAction({ campaignId: ad.campaignId, action: style.action, scalePct: style.scalePct });
      if (style.action === 'pause') updateCampaignStatus(ad.campaignId, 'paused');
      let detail = '';
      if (style.action === 'duplicate' && result?.resultId) detail = ` (ID ${result.resultId})`;
      if ((style.action === 'increase' || style.action === 'decrease') && result?.previous && result?.next) detail = ` (Budget ${result.previous} → ${result.next})`;
      toast.success(`${style.actionLabel} umgesetzt für ${ad.name}${detail}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Aktion fehlgeschlagen');
    } finally {
      setApplyingActions((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  // ── Sync & Export ─────────────────────────────────────────────────

  const runSync = async () => {
    if (isSyncing) return;
    const controller = new AbortController();
    syncControllerRef.current = controller;
    setIsSyncing(true);
    setSyncProgress(0);

    try {
      if (env.demoMode) {
        setSyncProgress(15); await new Promise(r => setTimeout(r, 800));
        setSyncProgress(45); await new Promise(r => setTimeout(r, 1000));
        setSyncProgress(85); await new Promise(r => setTimeout(r, 1200));
        setSyncProgress(100); toast.success('Sync completed (Demo)'); return;
      }

      const apiBase = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const apiUrl = apiBase ? `${apiBase}/api/meta-sync` : '/api/meta-sync';
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error('Bitte zuerst anmelden.');

      setSyncProgress(15);
      const res = await fetch(apiUrl, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ range: timeRange }), signal: controller.signal });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Sync failed');

      setSyncProgress(70);
      await refreshCampaigns();
      setRefreshTick((prev) => prev + 1);
      setSyncProgress(100);
      toast.success('Sync completed');
    } catch (err: unknown) {
      const errName = err && typeof err === 'object' && 'name' in err ? (err as { name?: string }).name : null;
      if (errName === 'AbortError') toast.message('Sync cancelled');
      else toast.error(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
      syncControllerRef.current = null;
    }
  };

  const cancelSync = () => { syncControllerRef.current?.abort(); syncControllerRef.current = null; };

  const handleExportReport = () => {
    const csvRows: string[] = ['Campaign,Status,Impressions,CTR,CPC,Conversions,Spend,Revenue,ROAS,Score,AI Recommendation'];
    campaigns.forEach((campaign) => {
      campaign.adSets.forEach((adSet) => {
        adSet.ads.forEach((ad) => {
          csvRows.push([
            `"${ad.name}"`, ad.status, ad.impressions, ad.ctr.toFixed(2), ad.cpc.toFixed(2),
            ad.conversions, ad.spend.toFixed(2), ad.revenue.toFixed(2), ad.roas.toFixed(2),
            ad.performanceScore, ad.aiAnalysis.recommendation,
          ].join(','));
        });
      });
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `adruby-ai-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Report exported');
  };

  // ── Computed: Recommendations ─────────────────────────────────────

  const getAllRecommendations = (source: Campaign[]) => {
    const recommendations: { ad: Ad; campaign: string; adSet: string }[] = [];
    source.forEach(campaign => {
      campaign.adSets.forEach(adSet => {
        adSet.ads.forEach(ad => { recommendations.push({ ad, campaign: campaign.name, adSet: adSet.name }); });
      });
    });
    return recommendations;
  };

  const allRecommendations = getAllRecommendations(filteredCampaigns);
  const killAds = allRecommendations.filter(r => r.ad.aiAnalysis.recommendation === 'kill');
  const duplicateAds = allRecommendations.filter(r => r.ad.aiAnalysis.recommendation === 'duplicate');
  const increaseAds = allRecommendations.filter(r => r.ad.aiAnalysis.recommendation === 'increase');
  const decreaseAds = allRecommendations.filter(r => r.ad.aiAnalysis.recommendation === 'decrease');
  const hasAutopilotData = campaigns.length > 0;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <DashboardShell
      title="AI Analysis & Autopilot"
      subtitle={`AI-powered insights analyzing ${campaigns.length} campaigns, ${totalAdSets} ad sets, and ${totalAds} ads`}
      headerChips={
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className="text-xs">€{(totalSpend / 1000).toFixed(1)}K Spend</Badge>
          <Badge variant="outline" className="text-xs">€{(totalRevenue / 1000).toFixed(1)}K Revenue</Badge>
          <Badge variant="outline" className="text-xs">{totalRoas.toFixed(2)}x ROAS</Badge>
          <Badge variant="outline" className="text-xs">{allRecommendations.length} AI Insights</Badge>
          {aiPowered && <Badge variant="secondary" className="gap-1"><Brain className="w-3 h-3" /> GPT-4o Powered</Badge>}
          <button
            onClick={toggleAutopilot}
            disabled={!hasAutopilotData}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${autopilotEnabled
              ? 'bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30'
              : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50'
              } ${!hasAutopilotData ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{autopilotEnabled ? 'Autopilot ON' : 'Autopilot OFF'}</span>
            <div className={`w-8 h-4 rounded-full relative ${autopilotEnabled ? 'bg-violet-500/30' : 'bg-muted/50'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${autopilotEnabled ? 'left-4 bg-violet-400' : 'left-0.5 bg-muted-foreground'}`} />
            </div>
          </button>
          <AgencySettingsMenu campaigns={campaigns} />
        </div>
      }
      headerActions={
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowStrategyParams(true)} className="gap-2 hidden md:flex">
            <Sliders className="w-4 h-4 text-muted-foreground" /> Strategy Config
          </Button>
          <Button variant="outline" size="sm" onClick={isSyncing ? cancelSync : runSync} className="gap-2 w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Sync abbrechen' : 'Daten synchronisieren'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportReport} className="gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button size="sm" onClick={() => runAIAnalysis(metaCampaigns)} disabled={isAnalyzingAI} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
            {isAnalyzingAI ? 'Analyzing…' : 'Run AI Analysis'}
          </Button>
          <Button size="sm" onClick={applyRecommendations} disabled={isApplying || !Object.keys(aiAnalysisCache).length} className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full sm:w-auto">
            {isApplying ? 'Wird angewendet…' : 'Empfehlungen anwenden'}
          </Button>
        </div>
      }
    >
      <InsightSummaryCards
        campaigns={campaigns.map(c => ({ id: c.id, name: c.name, roas: c.roas, spend: c.spend, ctr: c.ctr, conversions: c.conversions, performanceScore: c.performanceScore }))}
        totalSpend={totalSpend} totalRevenue={totalRevenue} totalRoas={totalRoas}
      />

      {campaigns.length > 0 && (
        <div className="mb-6">
          <PerformanceTrendChart
            data={(() => {
              // Use real timeseries data from analytics API
              const ts = analyticsData?.timeseries?.current;
              if (ts && ts.length > 0) {
                return ts.map(day => ({
                  date: new Date(day.ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
                  roas: day.roas ?? 0,
                  ctr: day.ctr ?? 0,
                  spend: day.spend ?? 0,
                  revenue: day.revenue ?? 0,
                }));
              }
              // Fallback: derive from campaign-level aggregates if no daily data
              const days = 30;
              const baseRoas = totalRoas || 2;
              const baseCtr = campaigns.reduce((sum, c) => sum + c.ctr, 0) / (campaigns.length || 1);
              const baseSpend = totalSpend / days;
              return Array.from({ length: days }, (_, i) => {
                const date = new Date(); date.setDate(date.getDate() - (days - 1 - i));
                return {
                  date: date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
                  roas: baseRoas,
                  ctr: baseCtr,
                  spend: baseSpend,
                  revenue: baseSpend * baseRoas,
                };
              });
            })()}
            title="Performance Trend"
          />
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="mb-6">
          <CreativeIntelligencePanel
            creatives={campaigns.map(c => ({ id: c.id, name: c.name, status: c.status, roas: c.roas, ctr: c.ctr, spend: c.spend, impressions: c.impressions, conversions: c.conversions, daysRunning: 7 }))}
            onActionClick={(action, ids) => toast.info(`Action: ${action} für ${ids.length} Creatives`)}
          />
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="mb-6">
          <AutomatedRulesPanel
            onSaveRule={async (rule: AutomationRule) => {
              const { data: session } = await supabase.auth.getSession();
              const uid = session.session?.user?.id;
              if (!uid) return;
              await supabase.from('automation_rules').upsert({
                id: rule.id,
                user_id: uid,
                name: rule.name,
                enabled: rule.enabled,
                condition: rule.condition,
                action: rule.action,
                trigger_count: rule.triggerCount,
                created_at: rule.createdAt,
              }, { onConflict: 'id' });
            }}
            onDeleteRule={async (id: string) => {
              await supabase.from('automation_rules').delete().eq('id', id);
            }}
            onToggleRule={async (id: string, enabled: boolean) => {
              await supabase.from('automation_rules').update({ enabled }).eq('id', id);
            }}
          />
        </div>
      )}

      <QuickActionsBar
        killCount={killAds.length}
        duplicateCount={duplicateAds.length}
        fatigueCount={decreaseAds.length}
        onScaleWinners={async () => {
          if (!duplicateAds.length) { toast.info('Keine Top Performer gefunden.'); return; }
          const targets = duplicateAds.filter(r => isMetaLinkedCampaignId(r.ad.campaignId));
          if (!targets.length) { toast.info('Keine mit Meta verknüpften Top-Kampagnen gefunden.'); return; }
          toast.loading(`Skaliere ${targets.length} Top Performer...`);
          let ok = 0;
          for (const r of targets) {
            try {
              await applyMetaAction({ campaignId: r.ad.campaignId, action: 'increase', scalePct: 0.2 });
              ok++;
            } catch { /* individual fail is ok */ }
          }
          toast.dismiss();
          toast.success(`${ok}/${targets.length} Kampagnen: Budget +20%!`);
        }}
        onPauseLosers={async () => {
          if (!killAds.length) { toast.info('Keine unprofitablen Ads gefunden.'); return; }
          const targets = killAds.filter(r => isMetaLinkedCampaignId(r.ad.campaignId));
          if (!targets.length) { toast.info('Keine mit Meta verknüpften Kampagnen zu pausieren.'); return; }
          toast.loading(`Pausiere ${targets.length} unprofitable Ads...`);
          let ok = 0;
          for (const r of targets) {
            try {
              await applyMetaAction({ campaignId: r.ad.campaignId, action: 'pause' });
              updateCampaignStatus(r.ad.campaignId, 'paused');
              ok++;
            } catch { /* individual fail is ok */ }
          }
          toast.dismiss();
          toast.success(`${ok}/${targets.length} Ads pausiert!`);
        }}
      />

      {campaigns.length > 0 && (
        <PredictiveInsightsSection
          killAds={killAds} decreaseAds={decreaseAds} duplicateAds={duplicateAds}
          getRecommendationStyle={getRecommendationStyle} onAIAction={handleAIAction}
        />
      )}

      {isSyncing && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Syncing data...</span>
            <span className="font-semibold text-foreground">{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-2 mt-3" />
        </Card>
      )}

      {(campaignsLoading || analyticsLoading) && <Card className="p-4 mb-4 text-sm text-muted-foreground">Lade Kampagnen und Analytics…</Card>}
      {(campaignsError || analyticsError) && <Card className="p-4 mb-4 border border-red-500/30 bg-red-500/5 text-red-600">{campaignsError || analyticsError}</Card>}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-[100vw] overflow-x-hidden">
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 min-w-0">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text" placeholder="Search campaigns, ad sets, or ads..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-sm transition-all"
              />
            </div>
            <SelectField value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} wrapperClassName="w-full sm:w-auto" className="bg-muted/30 border-border/50 text-sm py-2.5 px-4 rounded-xl">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="learning">Learning</option>
            </SelectField>
            <button onClick={() => setShowAIPanel(!showAIPanel)} className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${showAIPanel ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30' : 'bg-muted/30 border border-border/50 hover:bg-muted/50 text-foreground'}`}>
              <Brain className="w-4 h-4" /> AI Panel
            </button>
          </div>

          <StrategyConfigDialog
            open={showStrategyParams} onOpenChange={setShowStrategyParams}
            strategyConfig={strategyConfig}
            onConfigChange={(update) => setStrategyConfig(p => ({ ...p, ...update }))}
            onSaveAndRun={() => { setShowStrategyParams(false); runAIAnalysis(metaCampaigns); }}
          />

          <CampaignTable
            campaigns={filteredCampaigns} strategies={strategies}
            onToggleCampaign={toggleCampaign} onToggleAdSet={toggleAdSet}
            onStrategyChange={handleStrategyChange} getRecommendationStyle={getRecommendationStyle}
          />

          <CampaignCardList
            campaigns={filteredCampaigns} strategies={strategies}
            onToggleCampaign={toggleCampaign} onToggleAdSet={toggleAdSet}
            onStrategyChange={handleStrategyChange} getRecommendationStyle={getRecommendationStyle}
          />
        </div>

        {showAIPanel && (
          <AIRecommendationsPanel
            recommendations={allRecommendations}
            killCount={killAds.length} duplicateCount={duplicateAds.length}
            increaseCount={increaseAds.length} decreaseCount={decreaseAds.length}
            applyingActions={applyingActions}
            getRecommendationStyle={getRecommendationStyle}
            isMetaLinked={isMetaLinkedCampaignId}
            onAction={handleAIAction}
          />
        )}
      </div>

      <AICopilotChat
        campaignContext={{
          campaigns: campaigns.map(c => ({ id: c.id, name: c.name, roas: c.roas, spend: c.spend, ctr: c.ctr })),
          summary: { spend: totalSpend, revenue: totalRevenue, roas: totalRoas },
          recommendations: { kill: killAds.length, duplicate: duplicateAds.length, increase: increaseAds.length, decrease: decreaseAds.length },
        }}
      />
    </DashboardShell>
  );
}
