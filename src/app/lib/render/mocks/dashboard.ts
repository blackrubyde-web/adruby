/**
 * DASHBOARD CARD RENDERER
 * 
 * Renders dashboard-style UI cards for SaaS analytics/metrics displays
 * Returns data URL (SVG format)
 */

export interface DashboardMetric {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export interface DashboardCardParams {
    title: string;
    metrics: DashboardMetric[];
    theme?: 'light' | 'dark';
    width?: number;
    height?: number;
}

/**
 * Render a dashboard card with metrics
 */
export function renderDashboardCard(params: DashboardCardParams): string {
    const {
        title,
        metrics,
        theme = 'light',
        width = 400,
        height = 300
    } = params;

    const colors = theme === 'light'
        ? {
            bg: '#FFFFFF',
            cardBg: '#F8F9FA',
            text: '#000000',
            subtext: '#6C757D',
            trendUp: '#34C759',
            trendDown: '#FF3B30',
            border: '#E9ECEF'
        }
        : {
            bg: '#1C1C1E',
            cardBg: '#2C2C2E',
            text: '#FFFFFF',
            subtext: '#8E8E93',
            trendUp: '#30D158',
            trendDown: '#FF453A',
            border: '#3A3A3C'
        };

    const headerHeight = 50;
    const metricHeight = (height - headerHeight - 40) / metrics.length;

    const metricsMarkup = metrics.map((metric, index) => {
        const y = headerHeight + 20 + (index * metricHeight);
        const trendColor = metric.trend === 'up'
            ? colors.trendUp
            : metric.trend === 'down'
                ? colors.trendDown
                : colors.subtext;

        return `
    <g>
      <text 
        x="20" 
        y="${y}" 
        font-family="Inter, Arial, sans-serif" 
        font-size="12" 
        fill="${colors.subtext}"
      >${escapeXml(metric.label)}</text>
      <text 
        x="20" 
        y="${y + 25}" 
        font-family="Inter, Arial, sans-serif" 
        font-size="28" 
        font-weight="700" 
        fill="${colors.text}"
      >${escapeXml(metric.value)}</text>
      ${metric.trendValue ? `
      <text 
        x="20" 
        y="${y + 50}" 
        font-family="Inter, Arial, sans-serif" 
        font-size="12" 
        font-weight="600" 
        fill="${trendColor}"
      >${metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : ''} ${escapeXml(metric.trendValue)}</text>
      ` : ''}
    </g>`;
    }).join('');

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="dashboard-shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-opacity="0.08"/>
    </filter>
  </defs>
  
  <!-- Card Background -->
  <rect 
    width="${width}" 
    height="${height}" 
    rx="16" 
    fill="${colors.bg}" 
    stroke="${colors.border}"
    stroke-width="1"
    filter="url(#dashboard-shadow)"
  />
  
  <!-- Header -->
  <text 
    x="20" 
    y="30" 
    font-family="Inter, Arial, sans-serif" 
    font-size="16" 
    font-weight="600" 
    fill="${colors.text}"
  >${escapeXml(title)}</text>
  
  <!-- Metrics -->
  ${metricsMarkup}
</svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Render a simple stats card
 */
export function renderStatsCard(params: {
    stat: string;
    label: string;
    width?: number;
    height?: number;
}): string {
    return renderDashboardCard({
        title: params.label,
        metrics: [
            {
                label: '',
                value: params.stat
            }
        ],
        width: params.width || 200,
        height: params.height || 150
    });
}
