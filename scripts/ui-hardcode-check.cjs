#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = ['src/pages', 'src/components'];
const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', '.netlify']);
const FILE_PATTERN = /\.(jsx?|tsx?)$/;
const FORBIDDEN = [
  /text-white\//,
  /bg-white\//,
  /border-white\//,
  /bg-emerald/,
  /bg-green/,
  /bg-rose/,
  /bg-red/,
  /#[0-9a-fA-F]{3,8}/,
  /rgb\s*\(/i,
  /hsl\s*\(/i,
];

let violations = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && FILE_PATTERN.test(full)) {
      checkFile(full);
    }
  }
}

function checkFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    FORBIDDEN.forEach((re) => {
      const m = line.match(re);
      if (m) {
        violations.push({
          file: path.relative(ROOT, file),
          line: idx + 1,
          token: m[0],
        });
      }
    });
  });
}

TARGETS.map((t) => path.join(ROOT, t)).forEach((dir) => {
  if (fs.existsSync(dir)) walk(dir);
});

if (violations.length) {
  console.error('UI hardcode check failed:');
  violations.forEach((v) => {
    console.error(` - ${v.file}:${v.line} -> ${v.token}`);
  });
  process.exit(1);
} else {
  console.log('UI hardcode check passed.');
}
