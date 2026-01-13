/**
 * BADGE RENDERER
 * 
 * Renders promotional badges (offer, discount, urgency, etc.)
 * Returns data URL (base64 encoded PNG)
 */

export interface BadgeParams {
    text: string;
    type?: 'offer' | 'discount' | 'urgency' | 'new' | 'bestseller';
    width?: number;
    height?: number;
    backgroundColor?: string;
    textColor?: string;
    rotation?: number;
}

/**
 * Render a badge as SVG data URL
 * 
 * Note: In production, this would use a proper SVG-to-PNG converter
 * like sharp or node-canvas. For now, returns SVG data URL.
 */
export function renderBadge(params: BadgeParams): string {
    const {
        text,
        type = 'offer',
        width = 200,
        height = 100,
        backgroundColor,
        textColor,
        rotation = -5
    } = params;

    // Color schemes by type
    const colorSchemes = {
        offer: { bg: '#FF3B30', text: '#FFFFFF' },
        discount: { bg: '#FF9500', text: '#FFFFFF' },
        urgency: { bg: '#FF2D55', text: '#FFFFFF' },
        new: { bg: '#34C759', text: '#FFFFFF' },
        bestseller: { bg: '#FFD60A', text: '#000000' }
    };

    const colors = colorSchemes[type];
    const bg = backgroundColor || colors.bg;
    const fg = textColor || colors.text;

    // Calculate font size based on text length and badge size
    const fontSize = Math.min(width / (text.length * 0.6), height * 0.4);

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3"/>
    </filter>
  </defs>
  <g transform="rotate(${rotation} ${width / 2} ${height / 2})">
    <rect 
      x="0" 
      y="0" 
      width="${width}" 
      height="${height}" 
      rx="12" 
      fill="${bg}"
      filter="url(#shadow)"
    />
    <text 
      x="${width / 2}" 
      y="${height / 2}" 
      font-family="Inter, Arial, sans-serif" 
      font-size="${fontSize}" 
      font-weight="900" 
      fill="${fg}" 
      text-anchor="middle" 
      dominant-baseline="middle"
    >${text}</text>
  </g>
</svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Render an offer badge specifically (e.g. "20% OFF")
 */
export function renderOfferBadge(
    discount: string,
    params?: Partial<BadgeParams>
): string {
    return renderBadge({
        text: discount,
        type: 'offer',
        width: 240,
        height: 100,
        ...params
    });
}

/**
 * Render an urgency badge (e.g. "NUR HEUTE")
 */
export function renderUrgencyBadge(
    text: string,
    params?: Partial<BadgeParams>
): string {
    return renderBadge({
        text,
        type: 'urgency',
        width: 200,
        height: 80,
        ...params
    });
}
