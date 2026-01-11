import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const idx = args.indexOf(name);
  if (idx === -1) return fallback;
  const value = args[idx + 1];
  return value && !value.startsWith('--') ? value : fallback;
};

const dirArg =
  getArg('--dir', '3500+Social Media Templates/3. Fashion Social Media Templates');
const outArg = getArg('--out', 'src/app/lib/ai/design/template-cache.json');
const publicSubdirArg = getArg('--public-subdir', 'template-catalog/fashion');
const limitArg = getArg('--limit', '');
const limit = limitArg ? Number(limitArg) : Infinity;

const sourceDir = path.resolve(ROOT, dirArg);
const outPath = path.resolve(ROOT, outArg);
const publicSubdir = publicSubdirArg.replace(/^\/+/, '').replace(/\/+$/, '');
const publicDir = path.resolve(ROOT, 'public', publicSubdir);

const isImageFile = (file) => /\.(png|jpe?g)$/i.test(file);

const listImages = (dir) => {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listImages(fullPath));
    } else if (entry.isFile() && isImageFile(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const hslToHex = (h, s, l) => {
  const sat = s / 100;
  const light = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n) =>
    light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => {
    const hex = Math.round(255 * x).toString(16).padStart(2, '0');
    return hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const inferCategory = (name) => {
  const n = name.toLowerCase();
  if (n.includes('travel')) return 'travel';
  if (n.includes('furniture')) return 'furniture';
  if (n.includes('fashion')) return 'fashion';
  if (n.includes('restaurant')) return 'restaurant';
  if (n.includes('podcast')) return 'podcast';
  if (n.includes('real estate')) return 'real-estate';
  if (n.includes('sport')) return 'sport';
  if (n.includes('business')) return 'business';
  if (n.includes('beauty')) return 'beauty';
  if (n.includes('food')) return 'food';
  if (n.includes('fitness')) return 'fitness';
  if (n.includes('skincare')) return 'skincare';
  if (n.includes('healthy')) return 'healthy';
  if (n.includes('interior')) return 'interior-design';
  if (n.includes('hair')) return 'hair-salon';
  if (n.includes('pet')) return 'pet-shop';
  if (n.includes('dessert')) return 'dessert';
  if (n.includes('yoga')) return 'yoga';
  if (n.includes('car rental') || n.includes('car-rental')) return 'car-rental';
  return 'other';
};

const inferStyle = (name) => {
  const n = name.toLowerCase();
  if (n.includes('retro')) return 'retro-vintage';
  if (n.includes('luxury')) return 'luxury-premium';
  if (n.includes('tech')) return 'modern-tech';
  if (n.includes('sport') || n.includes('fitness')) return 'sporty-dynamic';
  if (n.includes('organic') || n.includes('natural')) return 'organic-natural';
  if (n.includes('bold') || n.includes('sale')) return 'maximal-bold';
  return 'minimal-clean';
};

const inferLayout = (name) => {
  const n = name.toLowerCase();
  if (n.includes('grid')) return 'grid-3col';
  if (n.includes('collage')) return 'collage';
  if (n.includes('asymmetric')) return 'asymmetric';
  return 'single-focus';
};

const inferTypography = (name) => {
  const n = name.toLowerCase();
  if (n.includes('luxury')) return 'elegant';
  if (n.includes('bold') || n.includes('sport')) return 'bold';
  if (n.includes('retro')) return 'playful';
  return 'minimal';
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const toPublicFilename = (filePath) => {
  const rel = path.relative(sourceDir, filePath);
  const ext = path.extname(rel).toLowerCase();
  const base = rel.slice(0, rel.length - ext.length);
  const safeBase = slugify(base.replace(/[\\/]+/g, '-'));
  return `${safeBase}${ext}`;
};

const buildTemplate = (filePath, folderName) => {
    const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
    const baseName = path.basename(filePath, path.extname(filePath));
    const label = `${folderName} ${baseName}`;
  const hash = hashString(relPath);
  const hue = hash % 360;
  const dominant = hslToHex(hue, 55, 45);
  const accent = hslToHex((hue + 40) % 360, 65, 55);
  const background = hslToHex((hue + 180) % 360, 20, 95);

  const category = inferCategory(folderName);
  const style = inferStyle(`${folderName} ${baseName}`);
  const structure = inferLayout(`${folderName} ${baseName}`);
  const headlineStyle = inferTypography(`${folderName} ${baseName}`);

  const publicFile = toPublicFilename(filePath);
  const imageUrl = `/${publicSubdir}/${publicFile}`.replace(/\\/g, '/');

  return {
    id: `tmpl-${hash}`,
    sourceFile: relPath,
    imageUrl,
    category,
    style,
    layout: {
      structure,
      hierarchy: 'balanced',
      zones: []
    },
    colors: {
      palette: [dominant, accent, background],
      dominantColor: dominant,
      accentColor: accent,
      temperature: 'neutral',
      vibrancy: 'normal'
    },
    typography: {
      headlineStyle,
      fontPairing: ['Inter', 'Inter'],
      textProminence: 'moderate',
      textPlacement: 'center'
    },
    elements: {
      hasShapes: false,
      hasGradients: false,
      hasTextures: false,
      hasPatterns: false,
      hasIllustrations: false
    },
    complexity: {
      overall: 5,
      visual: 5,
      textual: 5
    },
    performance: {
      suitableFor: [category],
      estimatedCTR: 2.4,
      conversionPotential: 'medium'
    }
  };
};

if (!fs.existsSync(sourceDir)) {
  console.error(`Template folder not found: ${sourceDir}`);
  process.exit(1);
}

const folderName = path.basename(sourceDir);
const files = listImages(sourceDir).slice(0, Number.isFinite(limit) ? limit : Infinity);

fs.mkdirSync(publicDir, { recursive: true });

const templates = files.map((file) => {
  const entry = buildTemplate(file, folderName);
  const publicFile = entry.imageUrl.replace(`/${publicSubdir}/`, '');
  const destPath = path.join(publicDir, publicFile);
  fs.copyFileSync(file, destPath);
  return entry;
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(templates, null, 2));

console.log(`Wrote ${templates.length} templates to ${outPath}`);
