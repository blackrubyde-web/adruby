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

export async function renderAdImage({ creative, brief, format, heroBase64 }) {
  const { width, height } = getViewport(format);
  const heroDataUri = heroBase64 ? `data:image/png;base64,${heroBase64}` : null;
  const html = buildHtml({
    creative,
    brandName: brief?.brand?.name || "",
    format,
    heroDataUri,
  });

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
