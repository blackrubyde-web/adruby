/**
 * MESSENGER MOCK RENDERER
 * 
 * Renders chat-style UI mockups for SaaS automation/communication tools
 * Returns data URL (SVG format)
 */

export interface MessengerMessage {
    sender: 'bot' | 'user';
    text: string;
    timestamp?: string;
}

export interface MessengerMockParams {
    messages: MessengerMessage[];
    theme?: 'light' | 'dark';
    width?: number;
    height?: number;
    title?: string;
}

/**
 * Render a messenger-style mock interface
 */
export function renderMessengerMock(params: MessengerMockParams): string {
    const {
        messages,
        theme = 'light',
        width = 400,
        height = 500,
        title = 'Chat'
    } = params;

    const colors = theme === 'light'
        ? {
            bg: '#FFFFFF',
            headerBg: '#F8F9FA',
            userBubble: '#007AFF',
            botBubble: '#E9ECEF',
            userText: '#FFFFFF',
            botText: '#000000',
            headerText: '#000000'
        }
        : {
            bg: '#1C1C1E',
            headerBg: '#2C2C2E',
            userBubble: '#0A84FF',
            botBubble: '#3A3A3C',
            userText: '#FFFFFF',
            botText: '#FFFFFF',
            headerText: '#FFFFFF'
        };

    const headerHeight = 60;
    const messageSpacing = 15;
    const bubblePadding = 12;
    const maxBubbleWidth = width * 0.7;

    let yPosition = headerHeight + 20;

    const messageBubbles = messages.map((msg, _index) => {
        const isUser = msg.sender === 'user';
        const bubbleBg = isUser ? colors.userBubble : colors.botBubble;
        const textColor = isUser ? colors.userText : colors.botText;

        // Estimate bubble width based on text length
        const estimatedWidth = Math.min(msg.text.length * 8 + bubblePadding * 2, maxBubbleWidth);
        const bubbleHeight = 40;

        const bubbleX = isUser ? width - estimatedWidth - 20 : 20;
        const currentY = yPosition;

        yPosition += bubbleHeight + messageSpacing;

        return `
    <g>
      <rect 
        x="${bubbleX}" 
        y="${currentY}" 
        width="${estimatedWidth}" 
        height="${bubbleHeight}" 
        rx="18" 
        fill="${bubbleBg}"
      />
      <text 
        x="${bubbleX + bubblePadding}" 
        y="${currentY + bubbleHeight / 2}" 
        font-family="Inter, Arial, sans-serif" 
        font-size="14" 
        fill="${textColor}" 
        dominant-baseline="middle"
      >${escapeXml(msg.text)}</text>
    </g>`;
    }).join('');

    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="card-shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="8" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" rx="12" fill="${colors.bg}" filter="url(#card-shadow)"/>
  
  <!-- Header -->
  <rect width="${width}" height="${headerHeight}" rx="12" fill="${colors.headerBg}"/>
  <text 
    x="20" 
    y="${headerHeight / 2}" 
    font-family="Inter, Arial, sans-serif" 
    font-size="16" 
    font-weight="600" 
    fill="${colors.headerText}" 
    dominant-baseline="middle"
  >${escapeXml(title)}</text>
  
  <!-- Messages -->
  ${messageBubbles}
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
 * Render a WhatsApp-style automation flow mock
 */
export function renderWhatsAppFlowMock(params: {
    steps: string[];
    width?: number;
    height?: number;
}): string {
    const { steps, width = 400, height = 500 } = params;

    const messages: MessengerMessage[] = steps.map((step, index) => ({
        sender: index % 2 === 0 ? 'bot' : 'user',
        text: step
    }));

    return renderMessengerMock({
        messages,
        theme: 'light',
        width,
        height,
        title: 'WhatsApp Automation'
    });
}
