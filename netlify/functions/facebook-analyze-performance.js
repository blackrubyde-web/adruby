const { getOpenAIClient } = require('./_shared/openaiClient');

exports.handler = async (event, context) => {
  console.log('[FacebookAnalyze] Single analysis', { body: event.body });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { item, type, strategy, product, ad, answers } = JSON.parse(event.body || '{}');

    if (!item || !type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing item or type' }),
      };
    }

    const ctr = Number(item.ctr || 0);
    const roas = Number(item.roas || 0);
    const cpm = Number(item.cpm || 0);
    const spend = Number(item.spend || 0);
    const frequency = Number(item.frequency || 1.2);

    const baseAnalysis = {
      overall_score: Math.min(
        100,
        Math.max(
          0,
          (ctr * 10) + (roas * 15) - (cpm * 1.2) - (frequency > 3 ? (frequency - 3) * 5 : 0)
        )
      ),
      key_insights: [
        'Analyse basiert auf CTR, ROAS, CPM und Frequenz.',
        'Score ist nur ein Richtwert und sollte im Kontext der Gesamtstrategie betrachtet werden.',
      ],
      kpi_evaluations: {
        ctr: {
          value: ctr.toFixed(2),
          icon: ctr >= 2 ? 'TrendingUp' : ctr >= 1 ? 'Minus' : 'TrendingDown',
          color: ctr >= 2 ? '#22c55e' : ctr >= 1 ? '#eab308' : '#ef4444',
          status: ctr >= 2 ? 'green' : ctr >= 1 ? 'yellow' : 'red',
          priority: ctr < 1 ? 'high' : ctr < 2 ? 'medium' : 'low',
          recommendation:
            ctr >= 2 ? 'CTR ist stark – Creatives funktionieren.' :
            ctr >= 1 ? 'CTR ist okay – Creative Testing fortsetzen.' :
            'CTR ist schwach – Creatives überarbeiten.',
          impact: 'CTR beeinflusst Effizienz von Budgeteinsatz und Skalierungspotenzial direkt.',
        },
        roas: {
          value: roas.toFixed(2),
          icon: roas >= 3 ? 'TrendingUp' : roas >= 2 ? 'Minus' : 'TrendingDown',
          color: roas >= 3 ? '#22c55e' : roas >= 2 ? '#eab308' : '#ef4444',
          status: roas >= 3 ? 'green' : roas >= 2 ? 'yellow' : 'red',
          priority: roas < 2 ? 'high' : roas < 3 ? 'medium' : 'low',
          recommendation:
            roas >= 3 ? 'ROAS ist sehr gut – Budget kann skaliert werden.' :
            roas >= 2 ? 'ROAS ist solide – vorsichtige Skalierung möglich.' :
            'ROAS ist schlecht – Kampagne stabilisieren, bevor skaliert wird.',
          impact: 'ROAS bestimmt, ob dein Werbebudget profitabel eingesetzt wird.',
        },
        cpm: {
          value: cpm.toFixed(2),
          icon: cpm <= 10 ? 'TrendingUp' : cpm <= 15 ? 'Minus' : 'TrendingDown',
          color: cpm <= 10 ? '#22c55e' : cpm <= 15 ? '#eab308' : '#ef4444',
          status: cpm <= 10 ? 'green' : cpm <= 15 ? 'yellow' : 'red',
          priority: cpm > 15 ? 'medium' : 'low',
          recommendation:
            cpm <= 10 ? 'CPM ist effizient – Ausspielung ist kostengünstig.' :
            cpm <= 15 ? 'CPM ist akzeptabel – Optimierungen beobachten.' :
            'CPM ist hoch – Zielgruppen & Placements prüfen.',
          impact: 'CPM beeinflusst, wie viele Menschen du mit deinem Budget erreichst.',
        },
        frequency: {
          value: frequency.toFixed(2),
          icon: frequency <= 2.5 ? 'TrendingUp' : 'AlertTriangle',
          color: frequency <= 2.5 ? '#22c55e' : '#eab308',
          status: frequency <= 2.5 ? 'green' : 'yellow',
          priority: frequency > 3 ? 'medium' : 'low',
          recommendation:
            frequency <= 2.5 ? 'Frequenz ist gesund – kaum Abnutzungserscheinungen.' :
            'Frequenz steigt – Anzeigenabnutzung beobachten.',
          impact: 'Hohe Frequenz kann zu Werbemüdigkeit und sinkender Performance führen.',
        },
      },
      recommendations: [
        {
          action:
            roas >= 3 && ctr >= 2
              ? 'Budget in dieser Struktur schrittweise skalieren (+20–30% alle 2–3 Tage).'
              : roas >= 2
                ? 'Vorsichtig skalieren und mehr Creative-Varianten testen.'
                : 'Budget stabil halten oder reduzieren, bis neue Creatives und Zielgruppen getestet sind.',
          priority: roas < 2 ? 'high' : roas < 3 ? 'medium' : 'low',
          impact: 'Direkter Einfluss auf Umsatz- und Profitentwicklung.',
          timeline: 'Nächste 3–7 Tage überwachen und datenbasiert nachjustieren.',
        },
        {
          action:
            ctr < 1.5
              ? 'Neue Creatives mit klarerem Hook, stärkerem Offer und Social Proof testen.'
              : 'Bestehende Winner-Creatives in neue Zielgruppen ausrollen.',
          priority: ctr < 1.5 ? 'high' : 'medium',
          impact: 'Creatives sind der größte Hebel im Meta-Ads-System.',
          timeline: 'Creative-Testing in Sprints von 7–14 Tagen planen.',
        },
      ],
      strategy_context: {
        has_strategy: !!strategy,
        has_answers: !!answers,
        has_product: !!product,
        has_ad: !!ad,
        strategy_title:
          typeof strategy === 'object'
            ? strategy.title || strategy.name || null
            : null,
        strategy_snippet:
          typeof strategy === 'string'
            ? strategy.slice(0, 300)
            : strategy?.description
              ? String(strategy.description).slice(0, 300)
              : null,
        meta: {
          type,
          item_id: item.id,
        },
        raw: {
          strategy: strategy || null,
          product: product || null,
          ad: ad || null,
          answers: answers || null,
        },
      },
    };

    let analysis = {
      ...baseAnalysis,
      ai_summary: null,
      ai_actions: [],
    };

    // 2) OpenAI-Aufruf: Strategie + KPIs + Antworten zu konkreten Aktionen verarbeiten
    try {
      const client = getOpenAIClient();

      const kpiSnapshot = {
        ctr,
        roas,
        cpm,
        frequency,
        spend,
        impressions,
        clicks,
        conversions,
      };

      const response = await client.responses.create({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content:
              'Du bist ein erfahrener Meta-Ads Media Buyer. Du erhältst Live-Kampagnen-KPIs (CTR, CPM, ROAS, Frequency, Spend usw.), ' +
              'eine strategische Beschreibung (Blueprint) und optional Produkt-/Ad-Informationen sowie Fragebogen-Antworten des Users. ' +
              'Deine Aufgabe ist es, eine klare, umsetzbare Handlungsempfehlung für genau EINE Entität (Campaign, AdSet oder Ad) zu liefern: ' +
              'Skalieren, Pausieren/Stoppen, Weiter testen oder Struktur anpassen. Sei präzise und priorisiere Umsatz & Profitabilität.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              item_type: type,
              item: item,
              kpis: kpiSnapshot,
              strategy_context: baseAnalysis.strategy_context,
            }),
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'meta_ai_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                summary: {
                  type: 'string',
                  description:
                    'Kurze Zusammenfassung der Performance und der wichtigsten Erkenntnisse in 2–4 Sätzen auf Deutsch.',
                },
                decision: {
                  type: 'string',
                  description:
                    'Hauptentscheidung für diese Kampagne/dieses AdSet/diese Ad.',
                  enum: ['scale', 'kill', 'test', 'hold'],
                },
                confidence: {
                  type: 'string',
                  description: 'Subjektive Sicherheit der Empfehlung.',
                  enum: ['low', 'medium', 'high'],
                },
                actions: {
                  type: 'array',
                  description:
                    'Konkrete, umsetzbare Handlungsschritte für diese Entität.',
                  items: {
                    type: 'object',
                    properties: {
                      label: {
                        type: 'string',
                        description: 'Kurzbeschreibung der Aktion (Button-Label Style).',
                      },
                      description: {
                        type: 'string',
                        description:
                          'Ausführlichere Erklärung, was genau gemacht werden soll.',
                      },
                      priority: {
                        type: 'string',
                        enum: ['low', 'medium', 'high'],
                      },
                      budget_change: {
                        type: 'string',
                        description:
                          'Empfohlene Budgetänderung in Alltagssprache, z.B. "+20% alle 2 Tage" oder "Budget halbieren".',
                      },
                      risk_level: {
                        type: 'string',
                        enum: ['low', 'medium', 'high'],
                      },
                      timeframe: {
                        type: 'string',
                        description:
                          'Zeitrahmen, in dem die Aktion umgesetzt und beobachtet werden soll.',
                      },
                    },
                    required: ['label', 'description', 'priority'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['summary', 'decision', 'actions'],
              additionalProperties: false,
            },
          },
        },
      });

      const parsed = response.output?.[0]?.content?.[0]?.json || null;

      if (parsed) {
        analysis.ai_summary = parsed.summary || null;
        analysis.ai_actions = parsed.actions || [];
        analysis.decision = parsed.decision || null;
        analysis.decision_confidence = parsed.confidence || null;
      }
    } catch (llmError) {
      console.error('[FacebookAnalyze] OpenAI error', llmError);
      // Kein Hard-Fail – wir geben einfach nur die Heuristik zurück
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ analysis }),
    };
  } catch (err) {
    console.error('[FacebookAnalyze] exception', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
};
