import { Resvg } from "@resvg/resvg-js";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getViewport(format) {
  switch (format) {
    case "9:16":
      return { width: 1080, height: 1920 };
    case "4:5":
      return { width: 1080, height: 1350 };
    case "1:1":
    default:
      return { width: 1080, height: 1080 };
  }
}

function buildHtml({ creative, brandName, format, heroDataUri }) {
  const hook = escapeHtml(creative?.copy?.hook);
  const primary = escapeHtml(creative?.copy?.primary_text);
  const cta = escapeHtml(creative?.copy?.cta);
  const badge = escapeHtml(brandName || "");
  const bgImage = heroDataUri
    ? `url('${heroDataUri}')`
    : "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #fdf2f8 100%)";

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
      }
      .canvas {
        width: 100%;
        height: 100%;
        position: relative;
        background: ${bgImage};
        background-size: cover;
        background-position: center;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(8,10,12,0.0) 0%, rgba(8,10,12,0.35) 55%, rgba(8,10,12,0.7) 100%);
      }
      .content {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 64px 72px 72px 72px;
        gap: 20px;
        color: white;
        text-shadow: 0 2px 8px rgba(0,0,0,0.35);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.9);
        color: #0f172a;
        font-weight: 600;
        font-size: 22px;
        max-width: 70%;
      }
      .headline {
        font-size: 60px;
        line-height: 1.05;
        font-weight: 700;
        max-width: 90%;
      }
      .primary {
        font-size: 30px;
        line-height: 1.3;
        max-width: 92%;
        opacity: 0.95;
      }
      .cta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 18px 28px;
        border-radius: 18px;
        background: #2563eb;
        color: white;
        font-weight: 700;
        font-size: 26px;
        width: fit-content;
        box-shadow: 0 12px 24px rgba(37,99,235,0.35);
      }
      .format {
        position: absolute;
        top: 24px;
        right: 24px;
        background: rgba(15,23,42,0.8);
        color: #e2e8f0;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 14px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div class="canvas">
      <div class="overlay"></div>
      <div class="format">${escapeHtml(format)}</div>
      <div class="content">
        ${badge ? `<div class="badge">${badge}</div>` : ""}
        <div class="headline">${hook}</div>
        <div class="primary">${primary}</div>
        <div class="cta">${cta || "Mehr erfahren"}</div>
      </div>
    </div>
  </body>
</html>
`;
}

function buildSvg({ creative, brandName, format, heroDataUri }) {
  const { width, height } = getViewport(format);
  const hook = escapeHtml(creative?.copy?.hook);
  const primary = escapeHtml(creative?.copy?.primary_text);
  const cta = escapeHtml(creative?.copy?.cta || "Mehr erfahren");
  const badge = escapeHtml(brandName || "");

  const safeHook = splitText(hook, 28, 3);
  const safePrimary = splitText(primary, 42, 4);

  const hero = heroDataUri
    ? `<image href="${heroDataUri}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />`
    : `<rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg)" />`;

  const badgeMarkup = badge
    ? `<rect x="80" y="${height - 470}" rx="999" ry="999" width="${Math.min(700, badge.length * 16 + 50)}" height="56" fill="rgba(255,255,255,0.92)" />
       <text x="110" y="${height - 432}" font-size="26" font-weight="600" fill="#0f172a">${badge}</text>`
    : "";

  const ctaWidth = Math.min(360, cta.length * 16 + 90);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#eef2ff"/>
      <stop offset="100%" stop-color="#fdf2f8"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="rgba(8,10,12,0)"/>
      <stop offset="55%" stop-color="rgba(8,10,12,0.35)"/>
      <stop offset="100%" stop-color="rgba(8,10,12,0.75)"/>
    </linearGradient>
  </defs>
  ${hero}
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#overlay)"/>
  ${badgeMarkup}
  ${renderTextBlock(safeHook, 80, height - 360, 64, 1.1, "#ffffff", 700)}
  ${renderTextBlock(safePrimary, 80, height - 200, 30, 1.3, "#f1f5f9", 400)}
  <rect x="80" y="${height - 120}" rx="18" ry="18" width="${ctaWidth}" height="64" fill="#2563eb"/>
  <text x="${100}" y="${height - 80}" font-size="28" font-weight="700" fill="#ffffff">${cta}</text>
</svg>`;
}

function splitText(text, maxChars, maxLines) {
  if (!text) return [""];
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      lines.push(current);
      current = w;
    }
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function renderTextBlock(lines, x, y, fontSize, lineHeight, color, weight) {
  return lines
    .map((line, idx) => {
      const dy = idx * fontSize * lineHeight;
      return `<text x="${x}" y="${y + dy}" font-size="${fontSize}" font-weight="${weight}" fill="${color}">${escapeHtml(line)}</text>`;
    })
    .join("\n");
}

export async function renderAdImage({ creative, brief, format, heroBase64 }) {
  const { width, height } = getViewport(format);
  const heroDataUri = heroBase64 ? `data:image/png;base64,${heroBase64}` : null;
  const renderEngine = process.env.CREATIVE_RENDER_ENGINE || "svg";
  const brandName = brief?.brand?.name || "";

  if (renderEngine === "chromium") {
    const html = buildHtml({ creative, brandName, format, heroDataUri });
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: chromium.headless,
      defaultViewport: { width, height, deviceScaleFactor: 2 },
      ignoreHTTPSErrors: true,
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: "networkidle0" });
      const buffer = await page.screenshot({ type: "png" });
      await page.close();
      return {
        buffer,
        width,
        height,
        renderVersion: process.env.CREATIVE_RENDER_VERSION || "v1",
      };
    } finally {
      await browser.close();
    }
  }

  const svg = buildSvg({ creative, brandName, format, heroDataUri });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  const pngData = resvg.render();
  const buffer = pngData.asPng();
  return {
    buffer,
    width,
    height,
    renderVersion: process.env.CREATIVE_RENDER_VERSION || "v1",
  };

}
