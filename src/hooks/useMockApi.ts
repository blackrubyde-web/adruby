import { useCallback, useEffect, useRef, useState } from 'react';
import { addDays, eachDayOfInterval, formatISO, subHours } from 'date-fns';
import { OverviewFilters, OverviewResponse, WebSocketEvent, DateRangeValue } from '../api/types';
import { toUtcIso } from '../utils/dateUtils';

const randomBetween = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));

const buildMockResponse = (range: DateRangeValue): OverviewResponse => {
  const days = eachDayOfInterval({ start: range.start, end: range.end });

  const timeSeries = days.map((day, idx) => {
    const ctr = randomBetween(2.6, 5.4);
    const conversions = Math.floor(60 + Math.random() * 120);
    const roas = randomBetween(2.2, 5.8);
    const impressions = 75000 + Math.floor(Math.random() * 75000);
    const cost = randomBetween(2400, 5200);

    return {
      timestamp: formatISO(day),
      ctr,
      conversions,
      roas,
      impressions,
      cost
    };
  });

  const kpis = {
    ctr: { value: Number((timeSeries.reduce((a, b) => a + b.ctr, 0) / timeSeries.length).toFixed(2)), delta: randomBetween(-0.5, 0.8) },
    conversion_rate: { value: randomBetween(3.2, 5.8), delta: randomBetween(-0.6, 0.9) },
    roas: { value: randomBetween(3.1, 6.5), delta: randomBetween(-0.4, 0.7) }
  };

  const topCampaigns = Array.from({ length: 6 }).map((_, i) => ({
    id: `c${i + 1}`,
    name: `Campaign ${i + 1}`,
    spend: randomBetween(800, 4200),
    revenue: randomBetween(3200, 12400),
    ctr: randomBetween(2.2, 5.9),
    conversions: Math.floor(40 + Math.random() * 160)
  }));

  const sessionsByDevice = [
    { device: 'mobile', sessions: Math.floor(12000 + Math.random() * 6000) },
    { device: 'desktop', sessions: Math.floor(8000 + Math.random() * 4000) },
    { device: 'tablet', sessions: Math.floor(2000 + Math.random() * 1200) }
  ];

  return { kpis, timeSeries, topCampaigns, sessionsByDevice };
};

class MockWebSocket {
  private listeners = new Set<(event: WebSocketEvent) => void>();
  private timer: number | undefined;
  private range: DateRangeValue;

  constructor(range: DateRangeValue) {
    this.range = range;
    this.start();
  }

  private start() {
    this.timer = window.setInterval(() => {
      const next = this.randomEvent();
      this.listeners.forEach((cb) => cb(next));
    }, 4500);
  }

  private randomEvent(): WebSocketEvent {
    const typeRoll = Math.random();

    if (typeRoll < 0.5) {
      const timestamp = formatISO(subHours(this.range.end, Math.floor(Math.random() * 24)));
      return {
        type: 'updateTimeseries',
        payload: {
          timestamp,
          ctr: randomBetween(2.6, 5.8),
          conversions: Math.floor(10 + Math.random() * 40),
          roas: randomBetween(2.5, 6.1),
          impressions: 1200 + Math.floor(Math.random() * 2400),
          cost: randomBetween(80, 240)
        }
      };
    }

    if (typeRoll < 0.8) {
      return {
        type: 'metricsUpdate',
        payload: {
          ctr: { value: randomBetween(2.8, 5.6), delta: randomBetween(-0.4, 0.6) },
          conversion_rate: { value: randomBetween(3.1, 6.2), delta: randomBetween(-0.5, 0.7) },
          roas: { value: randomBetween(3.3, 6.7), delta: randomBetween(-0.3, 0.6) }
        }
      };
    }

    return {
      type: 'tableUpdate',
      payload: {
        id: 'c1',
        name: 'Campaign 1',
        spend: randomBetween(900, 5000),
        revenue: randomBetween(4200, 13800),
        ctr: randomBetween(2.5, 5.9),
        conversions: Math.floor(60 + Math.random() * 80)
      }
    };
  }

  subscribe(cb: (event: WebSocketEvent) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  close() {
    if (this.timer) window.clearInterval(this.timer);
    this.listeners.clear();
  }
}

export const useMockApi = (range: DateRangeValue) => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<MockWebSocket | null>(null);

  const fetchOverview = useCallback(
    async (filters: OverviewFilters) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: INTEGRATE REAL API -> replace this mock with fetch(`${apiBase}/overview/metrics?...`)
        await new Promise((resolve) => setTimeout(resolve, 450));
        const mocked = buildMockResponse(range);
        setData(mocked);
        return mocked;
      } catch (err: any) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [range]
  );

  const applyWebSocketEvent = useCallback((evt: WebSocketEvent) => {
    setData((prev) => {
      if (!prev) return prev;
      if (evt.type === 'updateTimeseries') {
        const withoutDup = prev.timeSeries.filter((p) => p.timestamp !== evt.payload.timestamp);
        const nextSeries = [...withoutDup, evt.payload].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        return { ...prev, timeSeries: nextSeries };
      }
      if (evt.type === 'metricsUpdate') {
        return { ...prev, kpis: { ...prev.kpis, ...evt.payload } };
      }
      if (evt.type === 'tableUpdate') {
        const existingIdx = prev.topCampaigns.findIndex((c) => c.id === evt.payload.id);
        if (existingIdx >= 0) {
          const updated = [...prev.topCampaigns];
          updated[existingIdx] = { ...updated[existingIdx], ...evt.payload };
          return { ...prev, topCampaigns: updated };
        }
        return { ...prev, topCampaigns: [evt.payload, ...prev.topCampaigns] };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const filters: OverviewFilters = {
      start: toUtcIso(range.start, range.timezone),
      end: toUtcIso(range.end, range.timezone),
      timezone: range.timezone
    };

    fetchOverview(filters);
  }, [range, fetchOverview]);

  useEffect(() => {
    wsRef.current?.close();
    const ws = new MockWebSocket(range);
    wsRef.current = ws;
    const unsub = ws.subscribe((evt) => {
      // TODO: INTEGRATE REAL API -> replace with real WebSocket event handler
      applyWebSocketEvent(evt);
    });
    return () => {
      unsub();
      ws.close();
    };
  }, [range, applyWebSocketEvent]);

  const refresh = useCallback(() => {
    const filters: OverviewFilters = {
      start: toUtcIso(range.start, range.timezone),
      end: toUtcIso(range.end, range.timezone),
      timezone: range.timezone
    };
    return fetchOverview(filters);
  }, [fetchOverview, range]);

  return { data, loading, error, refresh };
};
