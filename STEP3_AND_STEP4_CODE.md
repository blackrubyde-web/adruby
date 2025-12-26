# Step 3 & Step 4 Code für AdWizard

## Füge dies nach Step 2 ein (nach Zeile ~488):

```typescript
                    {/* Step 3: Copy & Hooks */}
                    {step === 3 && (
                        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
                            <div className="text-center space-y-2 mb-8">
                                <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                                    Beschreibe dein Produkt <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">genauer</span>
                                </h3>
                                <p className="text-sm md:text-base text-muted-foreground">
                                    Die KI erstellt daraus perfekte Headlines, Beschreibungen & CTAs
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Pain Points */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Zap className="w-4 h-4 text-rose-500" />
                                        Welche Probleme löst dein Produkt?
                                    </label>
                                    <textarea
                                        value={formData.painPoints}
                                        onChange={(e) => updateField('painPoints', e.target.value)}
                                        placeholder="z.B. 'Zeitverschwendung bei manueller Dateneingabe, hohe Fehlerquote, komplizierte Tools'"
                                        rows={4}
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50 resize-none"
                                    />
                                </div>

                                {/* USPs */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        Was macht dein Produkt einzigartig?
                                    </label>
                                    <textarea
                                        value={formData.usps}
                                        onChange={(e) => updateField('usps', e.target.value)}
                                        placeholder="z.B. '10x schneller als Konkurrenz, KI-powered, 99.9% Genauigkeit, keine Vorkenntnisse nötig'"
                                        rows={4}
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50 resize-none"
                                    />
                                </div>

                                {/* Target Audience */}
                                <div className="space-y-3 group">
                                    <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        Wer ist deine Zielgruppe?
                                    </label>
                                    <input
                                        value={formData.targetAudience}
                                        onChange={(e) => updateField('targetAudience', e.target.value)}
                                        placeholder="z.B. 'Marketing Manager in B2B SaaS, 25-45 Jahre, technik-affin'"
                                        className="w-full bg-muted/50 dark:bg-muted/30 border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-muted/70 dark:hover:bg-muted/50"
                                    />
                                </div>

                                <div className="pt-4 flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200/50 dark:border-cyan-800/30 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-cyan-500 shrink-0" />
                                    <p className="text-xs text-cyan-900 dark:text-cyan-100">
                                        Je detaillierter deine Angaben, desto bessere Headlines und Texte generiert die KI!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Preview & Hook Selection */}
                    {step === 4 && generatedDoc && generatedHooks && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in fade-in duration-500 h-full">
                            {/* Left: Ad Preview */}
                            <div className="lg:col-span-7 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg md:text-xl font-black text-foreground flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        Live Vorschau
                                    </h3>
                                    <span className="text-xs font-bold text-muted-foreground px-3 py-1.5 bg-muted rounded-full">
                                        1080×1080
                                    </span>
                                </div>
                                
                                {/* Ad Preview Container */}
                                <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-border shadow-2xl bg-zinc-100 dark:bg-zinc-950">
                                    <div className="absolute inset-0 flex items-center justify-center text-primary">
                                        {/* Simplified preview - render headline, description, CTA */}
                                        <div className="w-full h-full relative" style={{ 
                                            backgroundColor: generatedDoc.backgroundColor 
                                        }}>
                                            {/* Image Layer */}
                                            {generatedDoc.layers.find(l => l.type === 'product') && (
                                                <div className="absolute inset-0 flex items-center justify-center p-20">
                                                    <img 
                                                        src={(generatedDoc.layers.find(l => l.type === 'product') as any)?.src}
                                                        alt="Product"
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Headline */}
                                            <div className="absolute top-24 left-16 right-16">
                                                <h2 className="text-6xl font-black text-white leading-tight drop-shadow-2xl">
                                                    {generatedHooks.headlines[selectedHookIndex]}
                                                </h2>
                                            </div>
                                            
                                            {/* Description */}
                                            <div className="absolute top-96 left-16 right-16">
                                                <p className="text-2xl text-white/90 leading-relaxed">
                                                    {generatedHooks.descriptions[selectedHookIndex]}
                                                </p>
                                            </div>
                                            
                                            {/* CTA */}
                                            <div className="absolute bottom-20 left-16">
                                                <div className="px-12 py-6 bg-black text-white rounded-full text-2xl font-bold shadow-2xl">
                                                    {generatedHooks.ctas[selectedHookIndex]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Hooks Panel */}
                            <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[600px] pr-2">
                                {/* Headlines */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-rose-500" />
                                            Headlines ({generatedHooks.headlines.length})
                                        </h4>
                                        <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                                            Neu generieren
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {generatedHooks.headlines.map((headline, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSelectedHookIndex(i);
                                                    // Update generatedDoc headline layer
                                                    const headlineLayer = generatedDoc.layers.find(l => l.type === 'text' && l.name === 'Headline');
                                                    if (headlineLayer && 'text' in headlineLayer) {
                                                        headlineLayer.text = headline;
                                                        setGeneratedDoc({ ...generatedDoc });
                                                    }
                                                }}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    selectedHookIndex === i
                                                        ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20'
                                                        : 'border-border hover:border-primary/50 bg-muted/30 dark:bg-muted/10'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                                        selectedHookIndex === i
                                                            ? 'border-primary bg-primary'
                                                            : 'border-border bg-background'
                                                    }`}>
                                                        {selectedHookIndex === i && (
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground leading-relaxed">
                                                        {headline}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Descriptions */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        Descriptions ({generatedHooks.descriptions.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {generatedHooks.descriptions.slice(0, 3).map((desc, i) => (
                                            <div
                                                key={i}
                                                className="p-3 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground leading-relaxed"
                                            >
                                                {desc}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTAs */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        CTAs ({generatedHooks.ctas.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedHooks.ctas.map((cta, i) => (
                                            <div
                                                key={i}
                                                className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold"
                                            >
                                                {cta}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => onComplete(generatedDoc)}
                                    className="w-full mt-8 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-red-600 text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-primary/30 transition-all group"
                                >
                                    <span>Zur Bearbeitung im Canvas</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}
```

## Ändere handleGenerate() um Hooks zu generieren:

Füge nach der Image Enhancement (Zeile ~120) hinzu:

```typescript
// HOOK GENERATION
const hookPrompt = `You are an expert copywriter. Generate premium ad copy for this product:

PRODUCT: ${formData.productName}
${formData.brandName ? `BRAND: ${formData.brandName}` : ''}
DESCRIPTION: ${formData.productDescription}
PAIN POINTS: ${formData.painPoints || 'N/A'}
USPS: ${formData.usps || 'N/A'}
TARGET AUDIENCE: ${formData.targetAudience || 'General public'}
TONE: ${formData.tone}

Generate this JSON:
{
  "headlines": [10 attention-grabbing headlines],
  "descriptions": [5 compelling short descriptions, max 15 words each],
  "ctas": [5 action-oriented CTAs, max 3 words each]
}

Make it PREMIUM, conversion-optimized, and aligned with the ${formData.tone} tone.`;

const hooksResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: hookPrompt }],
        temperature: 0.9,
        response_format: { type: 'json_object' }
    })
});

const hooksData = await hooksResponse.json();
const hooks: GeneratedHooks = JSON.parse(hooksData.choices[0].message.content);
setGeneratedHooks(hooks);
```

## Wichtig: Am Ende von handleGenerate():

Ersetze:
```typescript
setIsGenerating(false);
onComplete(doc);
```

Mit:
```typescript
setGeneratedDoc(doc);
setIsGenerating(false);
setStep(4); // Gehe zu Preview statt direkt zu Canvas
```

Das ist der KRASSE Code! Soll ich ihn jetzt einbauen? 🚀
