const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "netlify", "functions");
const OUT_DIR = path.join(ROOT, "netlify", "functions-build");

const EXTERNALS = ["@resvg/resvg-js", "puppeteer-core", "@sparticuz/chromium"];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function getFunctionEntries() {
  return fs
    .readdirSync(SRC_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".ts")))
    .map((entry) => entry.name);
}

async function buildAll() {
  ensureDir(OUT_DIR);
  const entries = getFunctionEntries();
  if (!entries.length) {
    console.log("No Netlify functions found.");
    return;
  }

  await Promise.all(
    entries.map((file) => {
      // Input: "openai-proxy.ts" -> Output: "openai-proxy.js"
      const outName = file.replace(/\.ts$/, ".js");
      return esbuild.build({
        entryPoints: [path.join(SRC_DIR, file)],
        bundle: true,
        platform: "node",
        target: "node18",
        format: "cjs",
        outfile: path.join(OUT_DIR, outName),
        external: EXTERNALS,
        logLevel: "silent",
      });
    }),
  );

  console.log(`Built ${entries.length} Netlify functions → ${path.relative(ROOT, OUT_DIR)}`);
}

buildAll().catch((err) => {
  console.error("Failed to build Netlify functions:", err);
  process.exit(1);
});
