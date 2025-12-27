import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  RefreshCw,
  Trash2,
  Copy,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  Activity,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageShell, HeroHeader, Card, Chip } from './layout';
import { Progress } from './ui/progress';
import { supabase } from '../lib/supabaseClient';
import { useMetaCampaigns } from '../hooks/useMetaCampaigns';
import { useStrategies } from '../hooks/useStrategies';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { applyMetaAction } from '../lib/api/meta';
import { PerformanceHeatmap } from './ai/PerformanceHeatmap';
import { StreamingAnalysis } from './ai/StreamingAnalysis';

type AIRecommendation = 'kill' | 'duplicate' | 'increase' | 'decrease';

interface AIAnalysis {
  id: string;
  recommendation: AIRecommendation;
  confidence: number;
  reason: string;
  expectedImpact: string;
  details: string[];
}

interface Ad {
  id: string;
  name: string;
  campaignId: string;
  status: 'active' | 'paused' | 'learning';
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  performanceScore: number;
  aiAnalysis: AIAnalysis;
  strategyId?: string | null;
}

interface AdSet {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'learning';
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  performanceScore: number;
  ads: Ad[];
  expanded?: boolean;
  strategyId?: string | null;
}

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'learning';
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  performanceScore: number;
  adSets: AdSet[];
  expanded?: boolean;
  strategyId?: string | null;
}

type RecommendationStyle = {
  color: string;
  bg: string;
  border: string;
  icon: JSX.Element;
  label: string;
  actionLabel: string;
  action: 'pause' | 'duplicate' | 'increase' | 'decrease';
  scalePct?: number;
  confirmText: string;
};

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
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Helper to apply AI recommendations to Meta
  const applyRecommendations = async () => {
    if (!Object.keys(aiAnalysisCache).length) return;
    setIsApplying(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        toast.error('Bitte zuerst anmelden.');
        return;
      }
      const res = await fetch('/api/ai-campaign-apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  const { strategies } = useStrategies();

  // Live Campaign Data (Meta + Analytics)
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [timeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshTick, setRefreshTick] = useState(0);

  const { campaigns: metaCampaigns, loading: campaignsLoading, error: campaignsError, refresh: refreshCampaigns } = useMetaCampaigns();
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useAnalyticsData(timeRange, false, 'meta', refreshTick);

  // Call AI analysis endpoint for real GPT-4 powered insights
  const runAIAnalysis = async (campaignsToAnalyze: typeof metaCampaigns) => {
    if (!campaignsToAnalyze?.length) return;

    setIsAnalyzingAI(true);
    try {
      const apiBase = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const apiUrl = apiBase ? `${apiBase}/api/ai-campaign-analyze` : '/api/ai-campaign-analyze';
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        toast.error('Bitte zuerst anmelden.');
        return;
      }

      // Get active strategy if any
      const activeStrategy = strategies.find(s =>
        campaignsToAnalyze.some(c => c.strategyId === s.id)
      );

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaigns: campaignsToAnalyze.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            spend: c.spend,
            revenue: c.revenue,
            roas: c.roas,
            ctr: c.ctr,
            conversions: c.conversions,
            impressions: c.impressions,
            cpc: c.clicks > 0 ? c.spend / c.clicks : 0,
          })),
          strategy: activeStrategy ? {
            name: activeStrategy.title,
            description: activeStrategy.raw_content_markdown,
            autopilot_config: activeStrategy.autopilot_config,
            industry_type: activeStrategy.industry_type,
          } : null
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'AI Analysis failed');

      // Cache the AI analyses
      const cache: Record<string, AIAnalysis> = {};
      (json.analyses || []).forEach((analysis: AIAnalysis & { campaignId?: string }) => {
        if (analysis.campaignId) {
          cache[analysis.campaignId] = analysis;
        }
      });
      setAiAnalysisCache(cache);
      setAiPowered(json.meta?.aiPowered ?? false);

      if (json.meta?.aiPowered) {
        toast.success(`AI Analyse abgeschlossen (${json.analyses?.length || 0} Kampagnen)`);
      } else {
        toast.info('Fallback-Analyse verwendet (OpenAI nicht konfiguriert)');
      }
    } catch (err) {
      console.error('[AIAnalysisPage] AI analysis failed:', err);
      toast.error(err instanceof Error ? err.message : 'AI Analyse fehlgeschlagen');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

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
    // Use cached AI analysis if available (from GPT-4 endpoint)
    const cached = aiAnalysisCache[campaignId];
    if (cached) {
      return {
        id: cached.id || id,
        recommendation: cached.recommendation,
        confidence: cached.confidence,
        reason: cached.reason,
        expectedImpact: cached.expectedImpact,
        details: cached.details || [
          `ROAS: ${metrics.roas.toFixed(2)}x`,
          `CTR: ${metrics.ctr.toFixed(2)}%`,
          `Conversions: ${metrics.conversions}`,
        ]
      };
    }

    // Fallback to rule-based analysis (Strategy-Aware)
    const strategy = strategies.find(s => s.id === strategyId);
    // Use defaults if no strategy config
    const pauseThreshold = (strategy?.autopilot_config as any)?.pause_threshold_roas ?? 1.0;
    const scaleThreshold = (strategy?.autopilot_config as any)?.scale_threshold_roas ?? 4.0;
    // Note: scale_threshold might be higher in config (e.g. target * 1.2). Default check:
    const targetRoas = (strategy?.autopilot_config as any)?.target_roas ?? 3.0;

    let recommendation: AIRecommendation = 'increase';

    // Scale Logic
    if (metrics.roas >= targetRoas && metrics.ctr >= 2.0) recommendation = 'duplicate';
    if (metrics.roas >= scaleThreshold) recommendation = 'duplicate'; // Strong scale

    // Kill Logic
    if (metrics.roas < pauseThreshold) recommendation = 'kill';

    // Decrease/Manage Logic
    if (metrics.roas >= pauseThreshold && metrics.roas < targetRoas * 0.8) recommendation = 'decrease';

    // Confidence calculation (simplified)
    const confidence = Math.max(60, Math.min(95, Math.round(50 + metrics.roas * 8 + metrics.ctr * 3)));

    const reasonMap: Record<AIRecommendation, string> = {
      duplicate: `Starke Performance (ROAS > ${targetRoas}). Skalierung empfohlen.`,
      increase: 'Solide Performance. Budget kann vorsichtig erhöht werden.',
      decrease: `ROAS unter Ziel (${targetRoas}). Budget reduzieren.`,
      kill: `Performance unter Minimum (ROAS < ${pauseThreshold}). Pause empfohlen.`
    };

    return {
      id,
      recommendation,
      confidence,
      reason: reasonMap[recommendation],
      expectedImpact: recommendation === 'duplicate' ? '+30-50% Umsatzpotenzial' : 'Budget-Optimierung',
      details: [
        `ROAS: ${metrics.roas.toFixed(2)}x`,
        `CTR: ${metrics.ctr.toFixed(2)}%`,
        `Conversions: ${metrics.conversions}`,
      ]
    } satisfies AIAnalysis;
  }, [aiAnalysisCache, strategies]);

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

      const campaignStrategyId = campaign.strategyId || null;
      const aiAnalysis = buildAiAnalysis(`analysis-${campaign.id}`, campaign.id, { roas, ctr, conversions, spend }, campaignStrategyId);
      const adSetKey = `adset:${campaign.id}-adset`;
      const adKey = `ad:${campaign.id}-ad`;
      const adSetStrategyId = assignmentMap[adSetKey] ?? campaignStrategyId;
      const adStrategyId = assignmentMap[adKey] ?? adSetStrategyId;

      const aggregateAd: Ad = {
        id: `${campaign.id}-ad`,
        name: `${campaign.name} · Gesamt`,
        campaignId: campaign.id,
        status: normalizeStatus(campaign.status),
        impressions,
        clicks,
        ctr,
        cpc,
        conversions,
        spend,
        revenue,
        roas,
        performanceScore,
        aiAnalysis,
        strategyId: adStrategyId,
      };

      const aggregateAdSet: AdSet = {
        id: `${campaign.id}-adset`,
        name: 'Gesamt',
        status: normalizeStatus(campaign.status),
        impressions,
        clicks,
        ctr,
        cpc,
        conversions,
        spend,
        revenue,
        roas,
        performanceScore,
        ads: [aggregateAd],
        expanded: false,
        strategyId: adSetStrategyId,
      };

      return {
        id: campaign.id,
        name: campaign.name,
        status: normalizeStatus(campaign.status),
        impressions,
        clicks,
        ctr,
        cpc,
        conversions,
        spend,
        revenue,
        roas,
        performanceScore,
        adSets: [aggregateAdSet],
        expanded: false,
        strategyId: campaignStrategyId,
      } satisfies Campaign;
    });

    setCampaigns(next);
  }, [metaCampaigns, assignmentMap, buildAiAnalysis]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session || cancelled) return;
      const { data: rows, error } = await supabase
        .from('meta_strategy_assignments')
        .select('entity_type,entity_id,strategy_id');
      if (cancelled || error || !rows) return;

      const map: Record<string, string | null> = {};
      rows.forEach((row) => {
        const key = `${row.entity_type}:${row.entity_id}`;
        map[key] = row.strategy_id || null;
      });
      setAssignmentMap(map);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  const totalConversions =
    analyticsData?.summary?.conversions ??
    campaigns.reduce((acc, c) => acc + Number(c.conversions || 0), 0);
  const totalAdSets = campaigns.reduce((acc, c) => acc + c.adSets.length, 0);
  const totalAds = campaigns.reduce((acc, c) => acc + c.adSets.reduce((a, s) => a + s.ads.length, 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/20';
      case 'paused': return 'text-orange-500 bg-orange-500/20';
      case 'learning': return 'text-blue-500 bg-blue-500/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRecommendationStyle = (recommendation: AIRecommendation): RecommendationStyle => {
    switch (recommendation) {
      case 'kill':
        return {
          color: '#ef4444',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: <Trash2 className="w-4 h-4" />,
          label: 'Kill Ad',
          actionLabel: 'Pause Ad',
          action: 'pause',
          confirmText: 'Diese Kampagne in Meta pausieren?'
        };
      case 'duplicate':
        return {
          color: '#10b981',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          icon: <Copy className="w-4 h-4" />,
          label: 'Duplicate Ad',
          actionLabel: 'Duplicate',
          action: 'duplicate',
          confirmText: 'Diese Kampagne in Meta duplizieren (Copy ist pausiert)?'
        };
      case 'increase':
        return {
          color: '#3b82f6',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: <TrendingUp className="w-4 h-4" />,
          label: 'Increase Budget',
          actionLabel: 'Increase +50%',
          action: 'increase',
          scalePct: 0.5,
          confirmText: 'Budget dieser Kampagne um 50% erhöhen?'
        };
      case 'decrease':
      default:
        return {
          color: '#f59e0b',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          icon: <TrendingDown className="w-4 h-4" />,
          label: 'Decrease Budget',
          actionLabel: 'Decrease -30%',
          action: 'decrease',
          scalePct: 0.3,
          confirmText: 'Budget dieser Kampagne um 30% reduzieren?'
        };
    }
  };

  const updateCampaignStatus = (campaignId: string, status: 'active' | 'paused' | 'learning') => {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId
          ? {
            ...campaign,
            status,
            adSets: campaign.adSets.map((adSet) => ({
              ...adSet,
              status,
              ads: adSet.ads.map((ad) => ({ ...ad, status })),
            })),
          }
          : campaign
      )
    );
  };

  const isMetaLinkedCampaignId = (campaignId: string) => /^\d+$/.test(campaignId);

  const toggleCampaign = (campaignId: string) => {
    setCampaigns(campaigns.map(c =>
      c.id === campaignId ? { ...c, expanded: !c.expanded } : c
    ));
  };

  const toggleAdSet = (campaignId: string, adSetId: string) => {
    setCampaigns(campaigns.map(c =>
      c.id === campaignId
        ? {
          ...c,
          adSets: c.adSets.map(as =>
            as.id === adSetId ? { ...as, expanded: !as.expanded } : as
          )
        }
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
        const { error } = await supabase
          .from('meta_campaigns')
          .update({ strategy_id: nextStrategyId })
          .or(`facebook_campaign_id.eq.${itemId},id.eq.${itemId}`);
        if (error) throw error;
      } else {
        const entityType = level === 'adset' ? 'adset' : 'ad';
        const key = `${entityType}:${itemId}`;
        if (!nextStrategyId) {
          const { error } = await supabase
            .from('meta_strategy_assignments')
            .delete()
            .eq('entity_type', entityType)
            .eq('entity_id', itemId)
            .eq('user_id', userId);
          if (error) throw error;
          setAssignmentMap((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        } else {
          const { error } = await supabase
            .from('meta_strategy_assignments')
            .upsert(
              {
                user_id: userId,
                entity_type: entityType,
                entity_id: itemId,
                strategy_id: nextStrategyId,
              },
              { onConflict: 'user_id,entity_type,entity_id' }
            );
          if (error) throw error;
          setAssignmentMap((prev) => ({
            ...prev,
            [key]: nextStrategyId,
          }));
        }
      }

      setCampaigns((prev) =>
        prev.map((campaign) => {
          if (level === 'campaign' && campaign.id === itemId) {
            return { ...campaign, strategyId: nextStrategyId || undefined };
          }
          if (level === 'adset') {
            return {
              ...campaign,
              adSets: campaign.adSets.map((adSet) =>
                adSet.id === itemId ? { ...adSet, strategyId: nextStrategyId || undefined } : adSet
              )
            };
          }
          if (level === 'ad') {
            return {
              ...campaign,
              adSets: campaign.adSets.map((adSet) => ({
                ...adSet,
                ads: adSet.ads.map((ad) =>
                  ad.id === itemId ? { ...ad, strategyId: nextStrategyId || undefined } : ad
                ),
              }))
            };
          }
          return campaign;
        })
      );
      toast.success(`Strategy updated for ${level}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Strategy update failed';
      toast.error(message);
    }
  };

  const handleAIAction = async (style: RecommendationStyle, ad: Ad) => {
    if (!ad.campaignId) {
      toast.error('Meta campaign ID fehlt.');
      return;
    }

    if (!isMetaLinkedCampaignId(ad.campaignId)) {
      toast.error('Diese Kampagne ist nicht mit Meta verknüpft. Bitte Sync ausführen.');
      return;
    }

    if (!window.confirm(style.confirmText)) return;

    const actionKey = `${ad.campaignId}:${style.action}`;
    if (applyingActions[actionKey]) return;

    setApplyingActions((prev) => ({ ...prev, [actionKey]: true }));
    try {
      const result = await applyMetaAction({
        campaignId: ad.campaignId,
        action: style.action,
        scalePct: style.scalePct,
      });
      if (style.action === 'pause') {
        updateCampaignStatus(ad.campaignId, 'paused');
      }
      let detail = '';
      if (style.action === 'duplicate' && result?.resultId) {
        detail = ` (ID ${result.resultId})`;
      }
      if ((style.action === 'increase' || style.action === 'decrease') && result?.previous && result?.next) {
        detail = ` (Budget ${result.previous} → ${result.next})`;
      }
      toast.success(`${style.actionLabel} umgesetzt für ${ad.name}${detail}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Aktion fehlgeschlagen';
      toast.error(message);
    } finally {
      setApplyingActions((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const runSync = async () => {
    if (isSyncing) return;
    const controller = new AbortController();
    syncControllerRef.current = controller;
    setIsSyncing(true);
    setSyncProgress(0);

    try {
      const apiBase = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const apiUrl = apiBase ? `${apiBase}/api/meta-sync` : '/api/meta-sync';
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error('Bitte zuerst anmelden.');
      }

      setSyncProgress(15);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ range: timeRange }),
        signal: controller.signal
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || 'Sync failed');
      }

      setSyncProgress(70);
      await refreshCampaigns();
      setRefreshTick((prev) => prev + 1);
      setSyncProgress(100);
      toast.success('Sync completed');
    } catch (err: unknown) {
      const errName = err && typeof err === 'object' && 'name' in err
        ? (err as { name?: string }).name
        : null;
      if (errName === 'AbortError') {
        toast.message('Sync cancelled');
      } else {
        const message = err instanceof Error ? err.message : 'Sync failed';
        toast.error(message);
      }
    } finally {
      setIsSyncing(false);
      syncControllerRef.current = null;
    }
  };

  const cancelSync = () => {
    if (syncControllerRef.current) {
      syncControllerRef.current.abort();
    }
  };

  const handleExportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      range: timeRange,
      totals: {
        campaigns: campaigns.length,
        adSets: totalAdSets,
        ads: totalAds,
        spend: totalSpend,
        revenue: totalRevenue,
        roas: totalRoas,
        conversions: totalConversions,
      },
      recommendations: {
        kill: killAds.length,
        duplicate: duplicateAds.length,
        increase: increaseAds.length,
        decrease: decreaseAds.length,
      },
      campaigns: filteredCampaigns,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-analysis-${timeRange}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Report exportiert');
  };

  // Get all AI recommendations for the panel
  const getAllRecommendations = () => {
    const recommendations: { ad: Ad; campaign: string; adSet: string }[] = [];
    filteredCampaigns.forEach(campaign => {
      campaign.adSets.forEach(adSet => {
        adSet.ads.forEach(ad => {
          recommendations.push({ ad, campaign: campaign.name, adSet: adSet.name });
        });
      });
    });
    return recommendations;
  };

  const allRecommendations = getAllRecommendations();
  const killAds = allRecommendations.filter(r => r.ad.aiAnalysis.recommendation === 'kill');
  const duplicateAds = allRecommendations.filter(r => r.ad.aiAnalysis.recommendation === 'duplicate');
  const increaseAds = allRecommendations.filter(r => r.ad.aiAnalysis.recommendation === 'increase');
  const decreaseAds = allRecommendations.filter(r => r.ad.aiAnalysis.recommendation === 'decrease');

  return (
    <PageShell>
      <HeroHeader
        title="AI Campaign Analysis"
        subtitle={`AI-powered insights analyzing ${campaigns.length} campaigns, ${totalAdSets} ad sets, and ${totalAds} ads`}
        chips={
          <>
            <Chip>€{(totalSpend / 1000).toFixed(1)}K Spend</Chip>
            <Chip>€{(totalRevenue / 1000).toFixed(1)}K Revenue</Chip>
            <Chip>{totalRoas.toFixed(2)}x ROAS</Chip>
            <Chip>{allRecommendations.length} AI Insights</Chip>
            {aiPowered && <Chip variant="neutral" icon={<Brain className="w-3 h-3" />}>GPT-4o Powered</Chip>}
          </>
        }
        actions={
          <>
            <button
              onClick={isSyncing ? cancelSync : runSync}
              className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{isSyncing ? 'Cancel Sync' : 'Sync Data'}</span>
            </button>
            <button
              onClick={handleExportReport}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => runAIAnalysis(metaCampaigns)}
              disabled={isAnalyzingAI}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isAnalyzingAI ? 'Analyzing…' : 'Run AI Analysis'}
            </button>
            <button
              onClick={applyRecommendations}
              disabled={isApplying || !Object.keys(aiAnalysisCache).length}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isApplying ? 'Applying…' : 'Apply Recommendations'}
            </button>
          </>
        }
      />

      {isSyncing && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Syncing data...</span>
            <span className="font-semibold text-foreground">{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-2 mt-3" />
        </Card>
      )}

      {(campaignsLoading || analyticsLoading) && (
        <Card className="p-4 mb-4 text-sm text-muted-foreground">
          Lade Kampagnen und Analytics…
        </Card>
      )}

      {(campaignsError || analyticsError) && (
        <Card className="p-4 mb-4 border border-red-500/30 bg-red-500/5 text-red-600">
          {campaignsError || analyticsError}
        </Card>
      )}

      {/* FIX 1: Outer Layout - Responsive Stack (NO calc!) */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-[100vw] overflow-x-hidden">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* FIX 2: Filters - Mobile Wrap + Full Width Controls */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search campaigns, ad sets, or ads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full max-w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="w-full sm:w-auto px-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="learning">Learning</option>
              </select>

              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${showAIPanel
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-muted hover:bg-muted/80'
                  }`}
              >
                <Brain className="w-5 h-5" />
                AI Panel
              </button>
            </div>
          </Card>

          {/* FIX 4A: Desktop Table - Hidden on Mobile */}
          <Card className="hidden lg:block overflow-hidden p-0">
            {/* Table Header */}
            <div className="bg-muted/30 border-b border-border/30 p-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground">
                <div className="col-span-3">Campaign / Ad Set / Ad</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-right">Impressions</div>
                <div className="col-span-1 text-right">CTR</div>
                <div className="col-span-1 text-right">CPC</div>
                <div className="col-span-1 text-right">Conv.</div>
                <div className="col-span-1 text-right">Spend</div>
                <div className="col-span-1 text-right">ROAS</div>
                <div className="col-span-1 text-center">Score</div>
                <div className="col-span-1 text-center">Strategy</div>
              </div>
            </div>

            {/* Campaign Rows */}
            {filteredCampaigns.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                Keine Kampagnen gefunden. Verbinde Meta oder starte einen Sync.
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id}>
                    {/* Campaign Row */}
                    <div className="hover:bg-muted/20 transition-colors">
                      <div className="p-4">
                        <div className="grid grid-cols-12 gap-4 items-center text-sm">
                          <div className="col-span-3 flex items-center gap-2">
                            <button
                              onClick={() => toggleCampaign(campaign.id)}
                              className="p-1 hover:bg-muted/50 rounded transition-colors"
                            >
                              {campaign.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <Target className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground">{campaign.name}</span>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </div>
                          <div className="col-span-1 text-right font-mono text-foreground">{(campaign.impressions / 1000000).toFixed(2)}M</div>
                          <div className="col-span-1 text-right font-mono text-foreground">{campaign.ctr.toFixed(2)}%</div>
                          <div className="col-span-1 text-right font-mono text-foreground">€{campaign.cpc.toFixed(2)}</div>
                          <div className="col-span-1 text-right font-mono text-foreground">{campaign.conversions}</div>
                          <div className="col-span-1 text-right font-mono text-foreground">€{(campaign.spend / 1000).toFixed(1)}K</div>
                          <div className="col-span-1 text-right font-mono font-bold text-foreground">{campaign.roas.toFixed(2)}x</div>
                          <div className="col-span-1 flex justify-center">
                            <span className={`font-bold ${getPerformanceColor(campaign.performanceScore)}`}>
                              {campaign.performanceScore}
                            </span>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <select
                              value={campaign.strategyId || ''}
                              onChange={(e) => handleStrategyChange(campaign.id, e.target.value, 'campaign')}
                              className="px-2 py-1 bg-muted/50 border border-border/50 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                            >
                              <option value="">No Strategy</option>
                              {strategies.map(s => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ad Sets (if expanded) */}
                    {campaign.expanded && campaign.adSets.map((adSet) => (
                      <div key={adSet.id}>
                        <div className="bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="p-4 pl-12">
                            <div className="grid grid-cols-12 gap-4 items-center text-sm">
                              <div className="col-span-3 flex items-center gap-2">
                                <button
                                  onClick={() => toggleAdSet(campaign.id, adSet.id)}
                                  className="p-1 hover:bg-muted/50 rounded transition-colors"
                                >
                                  {adSet.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                                <Users className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-foreground">{adSet.name}</span>
                              </div>
                              <div className="col-span-1 flex justify-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(adSet.status)}`}>
                                  {adSet.status}
                                </span>
                              </div>
                              <div className="col-span-1 text-right font-mono text-muted-foreground">{(adSet.impressions / 1000000).toFixed(2)}M</div>
                              <div className="col-span-1 text-right font-mono text-muted-foreground">{adSet.ctr.toFixed(2)}%</div>
                              <div className="col-span-1 text-right font-mono text-muted-foreground">€{adSet.cpc.toFixed(2)}</div>
                              <div className="col-span-1 text-right font-mono text-muted-foreground">{adSet.conversions}</div>
                              <div className="col-span-1 text-right font-mono text-muted-foreground">€{(adSet.spend / 1000).toFixed(1)}K</div>
                              <div className="col-span-1 text-right font-mono font-bold text-muted-foreground">{adSet.roas.toFixed(2)}x</div>
                              <div className="col-span-1 flex justify-center">
                                <span className={`font-bold ${getPerformanceColor(adSet.performanceScore)}`}>
                                  {adSet.performanceScore}
                                </span>
                              </div>
                              <div className="col-span-1 flex justify-center">
                                <select
                                  value={adSet.strategyId || campaign.strategyId || ''}
                                  onChange={(e) => handleStrategyChange(adSet.id, e.target.value, 'adset')}
                                  className="px-2 py-1 bg-muted/50 border border-border/50 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                                >
                                  <option value="">Inherit</option>
                                  {strategies.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Ads (if expanded) */}
                        {adSet.expanded && adSet.ads.map((ad) => {
                          const recStyle = getRecommendationStyle(ad.aiAnalysis.recommendation);

                          return (
                            <div key={ad.id} className="bg-muted/5 hover:bg-muted/15 transition-colors border-l-4" style={{ borderColor: recStyle.color }}>
                              <div className="p-4 pl-20">
                                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                                  <div className="col-span-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-green-500" />
                                    <span className="text-foreground">{ad.name}</span>
                                    <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${recStyle.bg} border ${recStyle.border}`} style={{ color: recStyle.color }}>
                                      {recStyle.icon}
                                      {recStyle.label}
                                    </div>
                                  </div>
                                  <div className="col-span-1 flex justify-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ad.status)}`}>
                                      {ad.status}
                                    </span>
                                  </div>
                                  <div className="col-span-1 text-right font-mono text-muted-foreground">{(ad.impressions / 1000).toFixed(0)}K</div>
                                  <div className="col-span-1 text-right font-mono text-muted-foreground">{ad.ctr.toFixed(2)}%</div>
                                  <div className="col-span-1 text-right font-mono text-muted-foreground">€{ad.cpc.toFixed(2)}</div>
                                  <div className="col-span-1 text-right font-mono text-muted-foreground">{ad.conversions}</div>
                                  <div className="col-span-1 text-right font-mono text-muted-foreground">€{(ad.spend / 1000).toFixed(1)}K</div>
                                  <div className="col-span-1 text-right font-mono font-bold text-muted-foreground">{ad.roas.toFixed(2)}x</div>
                                  <div className="col-span-1 flex justify-center">
                                    <span className={`font-bold ${getPerformanceColor(ad.performanceScore)}`}>
                                      {ad.performanceScore}
                                    </span>
                                  </div>
                                  <div className="col-span-1 flex justify-center">
                                    <select
                                      value={ad.strategyId || adSet.strategyId || campaign.strategyId || ''}
                                      onChange={(e) => handleStrategyChange(ad.id, e.target.value, 'ad')}
                                      className="px-2 py-1 bg-muted/50 border border-border/50 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    >
                                      <option value="">Inherit</option>
                                      {strategies.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* FIX 4B: Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredCampaigns.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Keine Kampagnen gefunden. Verbinde Meta oder starte einen Sync.
              </Card>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden p-0">
                  <div className="p-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleCampaign(campaign.id)}
                        className="p-1 hover:bg-muted/50 rounded shrink-0"
                      >
                        {campaign.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <Target className="w-4 h-4 text-primary shrink-0" />
                          <div className="font-semibold text-foreground truncate">{campaign.name}</div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                          <span className="text-xs text-muted-foreground">Impr: <span className="text-foreground font-mono">{(campaign.impressions / 1000000).toFixed(2)}M</span></span>
                          <span className="text-xs text-muted-foreground">CTR: <span className="text-foreground font-mono">{campaign.ctr.toFixed(2)}%</span></span>
                          <span className="text-xs text-muted-foreground">ROAS: <span className="text-foreground font-mono font-bold">{campaign.roas.toFixed(2)}x</span></span>
                          <span className="text-xs text-muted-foreground">Spend: <span className="text-foreground font-mono">€{(campaign.spend / 1000).toFixed(1)}K</span></span>
                        </div>

                        <div className="mt-3">
                          <select
                            value={campaign.strategyId || ''}
                            onChange={(e) => handleStrategyChange(campaign.id, e.target.value, 'campaign')}
                            className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                          >
                            <option value="">No Strategy</option>
                            {strategies.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: AdSets/Ads as Cards */}
                  {campaign.expanded && (
                    <div className="border-t border-border/30">
                      {campaign.adSets.map((adSet) => (
                        <div key={adSet.id} className="p-4 border-b border-border/20">
                          <div className="flex items-start gap-3 min-w-0">
                            <button
                              onClick={() => toggleAdSet(campaign.id, adSet.id)}
                              className="p-1 hover:bg-muted/50 rounded shrink-0"
                            >
                              {adSet.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                                <div className="font-medium text-foreground truncate">{adSet.name}</div>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(adSet.status)}`}>
                                  {adSet.status}
                                </span>
                                <span className="text-xs text-muted-foreground">ROAS: <span className="text-foreground font-mono font-bold">{adSet.roas.toFixed(2)}x</span></span>
                                <span className="text-xs text-muted-foreground">Spend: <span className="text-foreground font-mono">€{(adSet.spend / 1000).toFixed(1)}K</span></span>
                              </div>

                              <div className="mt-3">
                                <select
                                  value={adSet.strategyId || campaign.strategyId || ''}
                                  onChange={(e) => handleStrategyChange(adSet.id, e.target.value, 'adset')}
                                  className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                >
                                  <option value="">Inherit</option>
                                  {strategies.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                              </div>

                              {adSet.expanded && (
                                <div className="mt-3 space-y-2">
                                  {adSet.ads.map((ad) => {
                                    const recStyle = getRecommendationStyle(ad.aiAnalysis.recommendation);
                                    return (
                                      <div key={ad.id} className="rounded-xl border border-border/40 bg-muted/10 p-3">
                                        <div className="flex items-start gap-2 min-w-0">
                                          <Activity className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                          <div className="min-w-0 flex-1">
                                            <div className="font-medium text-foreground truncate">{ad.name}</div>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                              <span className={`px-2 py-1 rounded-full ${getStatusColor(ad.status)}`}>{ad.status}</span>
                                              <span className="text-muted-foreground">CTR <span className="text-foreground font-mono">{ad.ctr.toFixed(2)}%</span></span>
                                              <span className="text-muted-foreground">ROAS <span className="text-foreground font-mono font-bold">{ad.roas.toFixed(2)}x</span></span>
                                            </div>
                                            <div className="mt-2">
                                              <select
                                                value={ad.strategyId || adSet.strategyId || campaign.strategyId || ''}
                                                onChange={(e) => handleStrategyChange(ad.id, e.target.value, 'ad')}
                                                className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                              >
                                                <option value="">Inherit</option>
                                                {strategies.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                              </select>
                                            </div>
                                          </div>

                                          <div className="shrink-0">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${recStyle.border} ${recStyle.bg}`} style={{ color: recStyle.color }}>
                                              {recStyle.label}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* FIX 3: AI Panel - Mobile Accordion, Desktop Sidebar */}
        {showAIPanel && (
          <>
            {/* Mobile: Collapsible Accordion */}
            <div className="lg:hidden mt-4 w-full max-w-full min-w-0">
              <Card className="overflow-hidden p-0">
                <details className="overflow-hidden">
                  <summary className="px-4 py-3 cursor-pointer flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      AI Recommendations
                    </span>
                    <span className="text-xs text-muted-foreground">Tap to view</span>
                  </summary>
                  <div className="p-4 border-t border-border/30 space-y-4">
                    {/* Panel Content - Summary Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="backdrop-blur-xl bg-red-500/10 rounded-xl border border-red-500/30 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Trash2 className="w-5 h-5 text-red-500" />
                          <span className="text-2xl font-bold text-red-500">{killAds.length}</span>
                        </div>
                        <div className="text-xs font-semibold text-red-500">Kill Ads</div>
                      </div>

                      <div className="backdrop-blur-xl bg-green-500/10 rounded-xl border border-green-500/30 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Copy className="w-5 h-5 text-green-500" />
                          <span className="text-2xl font-bold text-green-500">{duplicateAds.length}</span>
                        </div>
                        <div className="text-xs font-semibold text-green-500">Duplicate</div>
                      </div>

                      <div className="backdrop-blur-xl bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                          <span className="text-2xl font-bold text-blue-500">{increaseAds.length}</span>
                        </div>
                        <div className="text-xs font-semibold text-blue-500">Increase</div>
                      </div>

                      <div className="backdrop-blur-xl bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <TrendingDown className="w-5 h-5 text-orange-500" />
                          <span className="text-2xl font-bold text-orange-500">{decreaseAds.length}</span>
                        </div>
                        <div className="text-xs font-semibold text-orange-500">Decrease</div>
                      </div>
                    </div>

                    {/* Recommendations List */}
                    <div className="space-y-3">
                      {allRecommendations.map(({ ad, campaign, adSet }) => {
                        const recStyle = getRecommendationStyle(ad.aiAnalysis.recommendation);
                        const actionKey = `${ad.campaignId}:${recStyle.action}`;
                        const isApplying = Boolean(applyingActions[actionKey]);
                        const isLinked = isMetaLinkedCampaignId(ad.campaignId);
                        const isDisabled = isApplying || !isLinked;

                        return (
                          <div
                            key={ad.id}
                            className={`backdrop-blur-xl bg-card/60 rounded-xl border-2 ${recStyle.border} shadow-xl overflow-hidden`}
                          >
                            <div className="p-4">
                              {/* Header */}
                              <div className="flex items-start gap-3 mb-3">
                                <div className={`p-2 ${recStyle.bg} rounded-lg flex-shrink-0`} style={{ color: recStyle.color }}>
                                  {recStyle.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-foreground text-sm mb-1 truncate">{ad.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {campaign} → {adSet}
                                  </div>
                                </div>
                              </div>

                              {/* Recommendation */}
                              <div className="mb-3">
                                <div className="text-xs font-semibold mb-1" style={{ color: recStyle.color }}>
                                  {recStyle.label}
                                </div>
                                <div className="text-xs text-muted-foreground leading-relaxed">
                                  {ad.aiAnalysis.reason}
                                </div>
                              </div>

                              {/* Impact */}
                              <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                                <div className="text-xs text-muted-foreground mb-1">Expected Impact</div>
                                <div className="text-sm font-bold text-foreground">{ad.aiAnalysis.expectedImpact}</div>
                              </div>

                              {/* Confidence */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">AI Confidence</span>
                                  <span className="font-bold" style={{ color: recStyle.color }}>{ad.aiAnalysis.confidence}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${ad.aiAnalysis.confidence}%`,
                                      backgroundColor: recStyle.color
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Details */}
                              <div className="mb-3 space-y-1">
                                {ad.aiAnalysis.details.slice(0, 2).map((detail, idx) => (
                                  <div key={idx} className="flex items-start gap-1 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: recStyle.color }} />
                                    <span className="leading-tight">{detail}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Action Button */}
                              <button
                                onClick={() => handleAIAction(recStyle, ad)}
                                disabled={isDisabled}
                                title={isLinked ? '' : 'Nicht mit Meta verknüpft. Bitte Sync ausführen.'}
                                className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                                style={{
                                  backgroundColor: recStyle.color,
                                  color: 'white'
                                }}
                              >
                                {isApplying ? 'Wird angewendet...' : recStyle.actionLabel}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </details>
              </Card>
            </div>

            {/* Desktop: Sidebar (unchanged) */}
            <div className="hidden lg:block w-[380px] flex-shrink-0 space-y-4 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
              {/* Panel Header */}
              <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">AI Recommendations</h3>
                    <p className="text-xs text-muted-foreground">Real-time analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-muted-foreground">Updated 30 seconds ago</span>
                </div>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="backdrop-blur-xl bg-red-500/10 rounded-xl border border-red-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <span className="text-2xl font-bold text-red-500">{killAds.length}</span>
                  </div>
                  <div className="text-xs font-semibold text-red-500">Kill Ads</div>
                </div>

                <div className="backdrop-blur-xl bg-green-500/10 rounded-xl border border-green-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Copy className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-500">{duplicateAds.length}</span>
                  </div>
                  <div className="text-xs font-semibold text-green-500">Duplicate</div>
                </div>

                <div className="backdrop-blur-xl bg-blue-500/10 rounded-xl border border-blue-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold text-blue-500">{increaseAds.length}</span>
                  </div>
                  <div className="text-xs font-semibold text-blue-500">Increase</div>
                </div>

                <div className="backdrop-blur-xl bg-orange-500/10 rounded-xl border border-orange-500/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-500">{decreaseAds.length}</span>
                  </div>
                  <div className="text-xs font-semibold text-orange-500">Decrease</div>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3">
                {allRecommendations.map(({ ad, campaign, adSet }) => {
                  const recStyle = getRecommendationStyle(ad.aiAnalysis.recommendation);
                  const actionKey = `${ad.campaignId}:${recStyle.action}`;
                  const isApplying = Boolean(applyingActions[actionKey]);
                  const isLinked = isMetaLinkedCampaignId(ad.campaignId);
                  const isDisabled = isApplying || !isLinked;

                  return (
                    <Card
                      key={ad.id}
                      className={`border-2 ${recStyle.border} overflow-hidden hover:scale-105 transition-all p-0`}
                    >
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 ${recStyle.bg} rounded-lg flex-shrink-0`} style={{ color: recStyle.color }}>
                            {recStyle.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-foreground text-sm mb-1 truncate">{ad.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {campaign} → {adSet}
                            </div>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="mb-3">
                          <div className="text-xs font-semibold mb-1" style={{ color: recStyle.color }}>
                            {recStyle.label}
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {ad.aiAnalysis.reason}
                          </div>
                        </div>

                        {/* Impact */}
                        <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">Expected Impact</div>
                          <div className="text-sm font-bold text-foreground">{ad.aiAnalysis.expectedImpact}</div>
                        </div>

                        {/* Confidence */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">AI Confidence</span>
                            <span className="font-bold" style={{ color: recStyle.color }}>{ad.aiAnalysis.confidence}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: `${ad.aiAnalysis.confidence}%`,
                                backgroundColor: recStyle.color
                              }}
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mb-3 space-y-1">
                          {ad.aiAnalysis.details.slice(0, 2).map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-1 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: recStyle.color }} />
                              <span className="leading-tight">{detail}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleAIAction(recStyle, ad)}
                          disabled={isDisabled}
                          title={isLinked ? '' : 'Nicht mit Meta verknüpft. Bitte Sync ausführen.'}
                          className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 shadow-lg ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                          style={{
                            backgroundColor: recStyle.color,
                            color: 'white'
                          }}
                        >
                          {isApplying ? 'Wird angewendet...' : recStyle.actionLabel}
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
