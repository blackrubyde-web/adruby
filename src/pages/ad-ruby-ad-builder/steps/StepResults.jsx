import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import { supabase } from '../../../lib/supabaseClient';
import AdVariantCard from '../components/AdVariantCard';
import MetaAdPreview from '../components/MetaAdPreview';
import ResultsToolbar from '../components/ResultsToolbar';
import EmptyState from '../../../components/ui/EmptyState';

const makeId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

const sanitizeVariant = (ad) => ({
  ...ad,
  headline: ad?.headline || 'Headline',
  primaryText: ad?.primaryText || ad?.primary_text || ad?.text || '',
  description: ad?.description || '',
  cta: ad?.cta || 'Jetzt kaufen',
  __id: ad?.__id || makeId(),
});

const punchyOpeners = [
  'Stop scrolling. ',
  'Big news: ',
  'Neu: ',
  'Schnell erklärt: ',
  'Kurz & knapp: ',
  'Pro-Tipp: ',
  "Don't miss: ",
  'Heads up: ',
];

const tonePresets = {
  serious: (text) => `Faktenbasiert: ${text}`,
  casual: (text) => `Hey, kurz: ${text}`,
  aggressive: (text) => `Stop Budget zu verbrennen: ${text}`,
};

const ctas = ['Jetzt kaufen', 'Mehr erfahren', 'Angebot sichern', 'Jetzt testen'];

const StepResults = ({ ads, userId, briefing = {}, creativeDNA = {} }) => {
  const [variants, setVariants] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const editsRef = useRef({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState('');
  const savedFingerprintsRef = useRef(new Set());

  useEffect(() => {
    const mapped = (ads || []).map(sanitizeVariant);
    setVariants(mapped);
    setActiveId(mapped[0]?.__id || null);
    mapped.forEach((v) => {
      editsRef.current[v.__id] = { history: [{ ...v }], idx: 0 };
    });
  }, [ads]);

  const active = useMemo(
    () => variants.find((v) => v.__id === activeId) || variants[0] || null,
    [variants, activeId]
  );

  const updateVariant = (nextVariant) => {
    setVariants((prev) => prev.map((v) => (v.__id === nextVariant.__id ? nextVariant : v)));
  };

  const ensureHistory = (variant) => {
    if (!variant?.__id) return;
    if (!editsRef.current[variant.__id]) {
      editsRef.current[variant.__id] = { history: [{ ...variant }], idx: 0 };
    }
  };

  const applyTransform = (transformer) => {
    if (!active) return;
    ensureHistory(active);
    const next = transformer(active);
    if (!next) return;
    const entry = editsRef.current[active.__id];
    const newVariant = { ...active, ...next };
    entry.history = [...entry.history.slice(0, entry.idx + 1), { ...newVariant }];
    entry.idx = entry.history.length - 1;
    editsRef.current[active.__id] = entry;
    updateVariant(newVariant);
  };

  const handleUndo = () => {
    if (!active?.__id) return;
    const entry = editsRef.current[active.__id];
    if (!entry || entry.idx <= 0) return;
    const prevIdx = entry.idx - 1;
    entry.idx = prevIdx;
    editsRef.current[active.__id] = entry;
    updateVariant({ ...entry.history[prevIdx] });
  };

  const handleRedo = () => {
    if (!active?.__id) return;
    const entry = editsRef.current[active.__id];
    if (!entry || entry.idx >= entry.history.length - 1) return;
    const nextIdx = entry.idx + 1;
    entry.idx = nextIdx;
    editsRef.current[active.__id] = entry;
    updateVariant({ ...entry.history[nextIdx] });
  };

  const applyHookShorter = () => {
    applyTransform((v) => {
      const text = v.primaryText || '';
      if (!text) return null;
      const firstSentence = text.split(/[\.\!\?]/)[0];
      const target = firstSentence?.length > 0 ? firstSentence : text.slice(0, 120);
      const shortened = target.trim();
      const suffix = text.length > shortened.length ? '…' : '';
      return { primaryText: `${shortened}${suffix}` };
    });
  };

  const applyHookStronger = () => {
    applyTransform((v) => {
      const opener = punchyOpeners[Math.floor(Math.random() * punchyOpeners.length)];
      return { primaryText: `${opener}${v.primaryText || ''}`.trim() };
    });
  };

  const applyTone = (tone) => {
    applyTransform((v) => {
      const fn = tonePresets[tone];
      if (!fn) return null;
      return { primaryText: fn(v.primaryText || '') };
    });
  };

  const applyCtaCycle = () => {
    applyTransform((v) => {
      const current = v.cta || ctas[0];
      const idx = ctas.indexOf(current);
      const next = ctas[(idx + 1) % ctas.length];
      return { cta: next };
    });
  };

  const handleDuplicate = (variant = active) => {
    if (!variant) return;
    const clone = sanitizeVariant({
      ...variant,
      headline: `${variant.headline || 'Headline'} (Copy)`,
      __id: makeId(),
    });
    editsRef.current[clone.__id] = { history: [{ ...clone }], idx: 0 };
    setVariants((prev) => [...prev, clone]);
    setActiveId(clone.__id);
  };

  const handleCopyPack = (variant) => {
    if (!variant) return;
    const block = `Headline: ${variant.headline || '—'}\nPrimary Text: ${variant.primaryText || '—'}\nDescription: ${variant.description || '—'}\nCTA: ${variant.cta || '—'}`;
    navigator?.clipboard?.writeText?.(block);
    setCopied('pack');
    setTimeout(() => setCopied(''), 1500);
  };

  const handleCopySheet = (variant) => {
    if (!variant) return;
    const line = [
      variant.headline || '',
      variant.primaryText || '',
      variant.description || '',
      variant.cta || '',
    ]
      .map((val) => `"${String(val || '').replace(/"/g, '""')}"`)
      .join('\t');
    navigator?.clipboard?.writeText?.(line);
    setCopied('sheet');
    setTimeout(() => setCopied(''), 1500);
  };

  const handleDownloadJson = (variant) => {
    if (!variant) return;
    const blob = new Blob([JSON.stringify(variant, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${variant.headline || 'ad-variant'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    if (!variants?.length) return;
    const header = ['headline', 'primary_text', 'description', 'cta'];
    const rows = variants.map((v) =>
      [v.headline || '', v.primaryText || '', v.description || '', v.cta || '']
        .map((val) => `"${String(val || '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ad-variants.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (variant) => {
    if (!variant) return;
    const text = `${variant.headline || ''}\n${variant.primaryText || ''}\nCTA: ${variant.cta || ''}`;
    navigator?.clipboard?.writeText?.(text);
    setCopied('simple');
    setTimeout(() => setCopied(''), 1200);
  };

  const canUndo = (() => {
    if (!active?.__id) return false;
    const entry = editsRef.current[active.__id];
    return !!entry && entry.idx > 0;
  })();
  const canRedo = (() => {
    if (!active?.__id) return false;
    const entry = editsRef.current[active.__id];
    return !!entry && entry.idx < entry.history.length - 1;
  })();

  const handleSave = async () => {
    if (!active) return;
    setSaving(true);
    setSaveError('');
    setSaveMessage('');
    if (!userId) {
      setSaveError('Bitte einloggen, um Varianten zu speichern.');
      setSaving(false);
      return;
    }

    const fingerprint = `${(active.headline || '').trim().toLowerCase()}|${(active.primaryText || '').trim().toLowerCase()}|${(active.cta || '').trim().toLowerCase()}`;
    if (savedFingerprintsRef.current.has(fingerprint)) {
      setSaveMessage('Bereits gespeichert.');
      setSaving(false);
      return;
    }

    const headline = active.headline || 'Headline';
    const primaryText = active.primaryText || '';
    const cta = active.cta || 'Jetzt kaufen';
    try {
      const { data: existing } = await supabase
        ?.from('generated_ads')
        ?.select('id')
        ?.eq('user_id', userId)
        ?.eq('headline', headline)
        ?.eq('primary_text', primaryText)
        ?.eq('cta', cta)
        ?.limit(1);

      let adId = existing?.[0]?.id;
      if (!adId) {
        const { data: inserted, error: insertError } = await supabase
          ?.from('generated_ads')
          ?.insert({
            user_id: userId,
            headline,
            primary_text: primaryText || '—',
            cta,
            status: 'generated',
            facebook_preview_data: {
              source: 'ad_builder',
              briefing,
              creativeDNA,
            },
          })
          ?.select('id')
          ?.single();
        if (insertError) throw insertError;
        adId = inserted?.id;
      }

      if (!adId) throw new Error('Konnte Variante nicht sichern.');

      const variantName = `${headline.slice(0, 40)} - ${new Date().toLocaleDateString('de-DE')}`;
      const { error: saveVariantError } = await supabase
        ?.from('saved_ad_variants')
        ?.insert({
          user_id: userId,
          generated_ad_id: adId,
          variant_name: variantName,
          performance_data: {
            source: 'ad_builder',
            briefing,
            creativeDNA,
          },
        });
      if (saveVariantError) throw saveVariantError;

      setSaveMessage('Gespeichert. Zur Bibliothek wechseln?');
      savedFingerprintsRef.current.add(fingerprint);
    } catch (e) {
      setSaveError(e?.message || 'Speichern nicht möglich.');
    } finally {
      setSaving(false);
    }
  };

  if (!variants?.length) {
    return <EmptyState title="Keine Varianten" description="Starte den Lauf oder lade Samples." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <p className={UI.meta}>Varianten</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {variants.map((ad, idx) => (
            <AdVariantCard
              key={ad.__id}
              ad={ad}
              index={idx}
              active={active?.__id === ad.__id}
              onSelect={() => setActiveId(ad.__id)}
              onDuplicate={() => handleDuplicate(ad)}
              onCopy={() => handleCopy(ad)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <MetaAdPreview ad={active} />
        <ResultsToolbar
          onCopyPack={() => handleCopyPack(active)}
          onCopySheet={() => handleCopySheet(active)}
          onDownloadJson={() => handleDownloadJson(active)}
          onDownloadCsv={handleDownloadCsv}
          onSave={handleSave}
          saving={saving}
          saveMessage={saveMessage}
          saveError={saveError}
          copied={copied}
          onDuplicate={handleDuplicate}
          onHookShorter={applyHookShorter}
          onHookStronger={applyHookStronger}
          onToneChange={applyTone}
          onCtaChange={applyCtaCycle}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>
    </div>
  );
};

export default StepResults;
