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
const catalogBaseArg = getArg('--catalog-base', 'template-catalog');
const pathPrefixArg = getArg('--path-prefix', '');
const limitArg = getArg('--limit', '');
const shouldCopyPublic = !args.includes('--no-copy-public') && !args.includes('--no-copy');
const shouldUploadSupabase = args.includes('--upload-supabase') || args.includes('--upload');
const bucketArg = getArg('--bucket', process.env.TEMPLATE_CATALOG_BUCKET || 'template-catalog');
const limit = limitArg ? Number(limitArg) : Infinity;
const catalogBase = catalogBaseArg.replace(/^\/+/, '').replace(/\/+$/, '');

const sourceDir = path.resolve(ROOT, dirArg);
const outPath = path.resolve(ROOT, outArg);

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
  if (n.includes('e-commerce') || n.includes('ecommerce') || n.includes('shop') || n.includes('store')) return 'ecommerce';
  if (n.includes('dropship')) return 'dropshipping';
  if (n.includes('tech') || n.includes('saas') || n.includes('software') || n.includes('app')) return 'tech';
  if (n.includes('marketing') || n.includes('sales') || n.includes('lead')) return 'marketing';
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

const folderName = path.basename(sourceDir);
const defaultPrefix = inferCategory(folderName);
const pathPrefix = pathPrefixArg || (defaultPrefix !== 'other' ? defaultPrefix : slugify(folderName));
const publicDir = path.resolve(ROOT, 'public', catalogBase, pathPrefix);

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

const joinUrl = (base, filePath) =>
  `${base.replace(/\/+$/, '')}/${filePath.replace(/^\/+/, '')}`;

const resolveBaseUrl = () => {
  if (process.env.TEMPLATE_CATALOG_BASE_URL) {
    return process.env.TEMPLATE_CATALOG_BASE_URL;
  }
  if (shouldUploadSupabase && process.env.SUPABASE_URL) {
    return `${process.env.SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${bucketArg}`;
  }
  return `/${catalogBase}`;
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
  const imagePath = `${pathPrefix}/${publicFile}`.replace(/\\/g, '/');
  const imageUrl = joinUrl(resolveBaseUrl(), imagePath);

  return {
    id: `tmpl-${hash}`,
    sourceFile: relPath,
    imagePath,
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

const files = listImages(sourceDir).slice(0, Number.isFinite(limit) ? limit : Infinity);

if (shouldCopyPublic) {
  fs.mkdirSync(publicDir, { recursive: true });
}

let supabase = null;
if (shouldUploadSupabase) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for upload.');
    process.exit(1);
  }
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(supabaseUrl, supabaseKey);
}

const contentTypeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
};

const templates = [];
for (const file of files) {
  const entry = buildTemplate(file, folderName);
  const publicFile = toPublicFilename(file);
  if (shouldCopyPublic) {
    const destPath = path.join(publicDir, publicFile);
    fs.copyFileSync(file, destPath);
  }
  if (supabase) {
    const fileBuffer = fs.readFileSync(file);
    const uploadPath = `${pathPrefix}/${publicFile}`.replace(/\\/g, '/');
    const { error } = await supabase.storage.from(bucketArg).upload(uploadPath, fileBuffer, {
      contentType: contentTypeFor(file),
      cacheControl: '31536000',
      upsert: true
    });
    if (error) {
      console.error(`Supabase upload failed for ${uploadPath}: ${error.message || error}`);
      process.exit(1);
    }
  }
  templates.push(entry);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(templates, null, 2));

console.log(`Wrote ${templates.length} templates to ${outPath}`);
