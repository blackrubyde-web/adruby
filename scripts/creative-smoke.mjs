#!/usr/bin/env node
import http from 'http';
import https from 'https';
import { URL } from 'url';

const NETLIFY_DEV = process.env.NETLIFY_DEV_URL || 'http://localhost:8888';
const endpoint = `${NETLIFY_DEV}/.netlify/functions/creative-generate`;

function tryFetch(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runRemote() {
  console.log('Attempting to call remote creative-generate:', endpoint);
  const body = JSON.stringify({ brief: { productName: 'Test Product', audience: 'small business', tone: 'direct' }, hasImage: false });
  try {
    const res = await tryFetch(endpoint, body);
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    return true;
  } catch (err) {
    console.warn('Remote call failed:', err.message || err);
    return false;
  }
}

async function runMock() {
  console.log('Netlify dev not available, running mocked creative-generate flow...');

  // Mocked placeholder DB
  const db = {
    generated_creatives: [],
    ad_research_ads: [
      { id: 'r1', page_name: 'Page A', primary_text: 'Great product', headline: 'Buy now', description: 'Limited', image_url: null, raw_payload: {} },
    ],
    strategy_blueprints: [{ id: 's1', raw_content_markdown: '# Strategy' }],
  };

  // Mock supabaseAdmin minimal functions used by creative-generate
  const supabaseAdmin = {
    from(table) {
      const ctx = {
        async select() {
          return { data: db[table], error: null };
        },
        in(col, vals) {
          return this;
        },
        order() { return this; },
        limit() { return this; },
        eq(col, val) {
          return { single: async () => ({ data: db[table].find(r => r.id === val) || null, error: null }) };
        },
        single: async () => ({ data: db[table][0] || null, error: null }),
        async insert(row) {
          const id = `g_${Math.random().toString(36).slice(2,9)}`;
          const record = { id, ...row };
          db[table].push(record);
          return { data: record, error: null };
        },
        async update(row) {
          // naive: apply to last inserted record
          const last = db[table][db[table].length - 1];
          if (last) Object.assign(last, row);
          return { data: row, error: null };
        },
      };
      return ctx;
    },
  };

  // Mock OpenAI client
  const openai = {
    responses: {
      create: async () => ({ output_text: JSON.stringify({ creatives: [{ headline: 'Amazing', primary_text: 'Try it!' }] }) }),
    },
  };

  function parseWithRepair({ schema, initial }) {
    // very naive: assume initial is JSON string or object
    try {
      const parsed = typeof initial === 'string' ? JSON.parse(initial) : initial;
      return { data: parsed, repaired: false };
    } catch (e) {
      return { data: null, repaired: false };
    }
  }

  // Minimal flow
  const brief = { productName: 'Test Product', audience: 'small business' };
  const researchContext = db.ad_research_ads.map(a => ({ id: a.id, headline: a.headline, primary_text: a.primary_text }));

  console.log('Creating placeholder row...');
  const insertRes = await supabaseAdmin.from('generated_creatives').insert({ user_id: 'u1', inputs: { brief }, outputs: null, status: 'pending', research_snapshot: researchContext, progress: 0 });
  const placeholderId = insertRes?.data?.id || 'mock';
  console.log('placeholderId:', placeholderId);

  console.log('Calling mock OpenAI...');
  const res = await openai.responses.create({});
  const text = res.output_text;
  const repaired = parseWithRepair({ initial: text });
  const best = repaired.data;

  console.log('Evaluating (mock)');
  const bestEval = { satisfaction: 85, issues: [] };

  console.log('Finalizing placeholder...');
  await supabaseAdmin.from('generated_creatives').update({ outputs: best, score: bestEval.satisfaction, status: 'complete', progress: 100 }).eq?.( 'id', placeholderId );

  console.log('Mock generate complete. Output:', best);
  return true;
}

(async function main(){
  const ok = await runRemote();
  if (!ok) await runMock();
})();
