#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const targets = ['src/pages', 'src/components'];
const forbidden = [
  /text-white\//,
  /bg-white\//,
  /border-white\//,
  /bg-emerald/,
  /bg-green/,
  /bg-rose/,
  /bg-red/,
  /#[0-9a-fA-F]{3,8}/,
  /rgb\\s*\\(/i,
  /hsl\\s*\\(/i,
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && full.match(/\\.(jsx?|tsx?)$/)) {
      checkFile(full);
    }
  }
}

let violations = [];

function checkFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  let count = 0;
  forbidden.forEach((re) => {
    const matches = content.match(new RegExp(re, 'g'));
    if (matches) count += matches.length;
  });
  if (count > 0) {
    violations.push({ file: path.relative(ROOT, file), count });
  }
}

targets.map((t) => path.join(ROOT, t)).forEach((dir) => {
  if (fs.existsSync(dir)) walk(dir);
});

if (violations.length) {
  console.error('UI hardcode check failed:');
  violations.forEach((v) => {
    console.error(` - ${v.file}: ${v.count} forbidden patterns`);
  });
  process.exit(1);
} else {
  console.log('UI hardcode check passed.');
}
