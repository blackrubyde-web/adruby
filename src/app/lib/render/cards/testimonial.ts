/**
 * TESTIMONIAL CARD RENDERER
 * 
 * Renders testimonial/review cards for social proof
 * Returns data URL (SVG format)
 */

export interface TestimonialCardParams {
    quote: string;
    author: string;
    title?: string;
    rating?: number;
    width?: number;
    height?: number;
    theme?: 'light' | 'dark';
}

/**
 * Render a testimonial card
 */
export function renderTestimonialCard(params: TestimonialCardParams): string {
    const {
        quote,
        author,
        title,
        rating,
        width = 400,
        height = 200,
        theme = 'light'
    } = params;

    const colors = theme === 'light'
        ? {
            bg: '#FFFFFF',
            text: '#000000',
            subtext: '#6C757D',
            stars: '#FFD60A',
            border: '#E9ECEF'
        }
        : {
            bg: '#1C1C1E',
            text: '#FFFFFF',
            subtext: '#8E8E93',
            stars: '#FFD60A',
            border: '#3A3A3C'
        };

    // Star rating markup
    const starsMarkup = rating ? Array.from({ length: 5 }, (_, i) => {
        const filled = i < rating;
        return `<text 
      x="${20 + i * 20}" 
      y="30" 
      font-size="16" 
      fill="${filled ? colors.stars : colors.border}"
    >★</text>`;
    }).join('') : '';

    const quoteY = rating ? 60 : 30;
    const authorY = height - 40;

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="testimonial-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="8" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <!-- Card Background -->
  <rect 
    width="${width}" 
    height="${height}" 
    rx="12" 
    fill="${colors.bg}" 
    stroke="${colors.border}"
    stroke-width="1"
    filter="url(#testimonial-shadow)"
  />
  
  <!-- Star Rating -->
  ${starsMarkup}
  
  <!-- Quote Icon -->
  <text 
    x="20" 
    y="${quoteY}" 
    font-size="32" 
    fill="${colors.subtext}" 
    opacity="0.3"
  >"</text>
  
  <!-- Quote Text -->
  <text 
    x="20" 
    y="${quoteY + 35}" 
    font-family="Inter, Arial, sans-serif" 
    font-size="14" 
    font-style="italic" 
    fill="${colors.text}"
  >
    <tspan x="20" dy="0">${wrapText(quote, width - 40, 14)[0]}</tspan>
    ${wrapText(quote, width - 40, 14).slice(1, 3).map((line, _i) =>
        `<tspan x="20" dy="20">${escapeXml(line)}</tspan>`
    ).join('')}
  </text>
  
  <!-- Author -->
  <text 
    x="20" 
    y="${authorY}" 
    font-family="Inter, Arial, sans-serif" 
    font-size="12" 
    font-weight="600" 
    fill="${colors.text}"
  >${escapeXml(author)}</text>
  
  ${title ? `
  <text 
    x="20" 
    y="${authorY + 18}" 
    font-family="Inter, Arial, sans-serif" 
    font-size="11" 
    fill="${colors.subtext}"
  >${escapeXml(title)}</text>
  ` : ''}
</svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Wrap text to fit within width
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    const avgCharWidth = fontSize * 0.6;
    const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
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
