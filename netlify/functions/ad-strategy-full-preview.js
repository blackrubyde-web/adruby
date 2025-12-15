// netlify/functions/ad-strategy-full-preview.js

const { getSupabaseClient } = require('./_shared/supabaseClient');
const { getOpenAIClient } = require('./_shared/openaiClient');

exports.handler = async (event) => {
  console.log('[FullFlow] Incoming request', { method: event.httpMethod, hasBody: !!event.body });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    console.error('[FullFlow] Failed to parse JSON body', err);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { adVariantId, userId, answers } = payload;
  if (!adVariantId || !userId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing adVariantId or userId' }) };
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error('[FullFlow] Supabase init failed', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Supabase init failed' }) };
  }

  const { data: adVariant, error: adError } = await supabase
    .from('saved_ad_variants')
    .select(`
      id,
      user_id,
      *,
      generated_ad:generated_ads(
        *,
        product:products(*)
      )
    `)
    .eq('id', adVariantId)
    .single();

  if (adError) {
    console.error('[FullFlow] Failed to load adVariant:', adError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load saved ad variant', details: adError.message || adError }),
    };
  }

  const industry = adVariant?.generated_ad?.product?.industry || 'generic';
  const goal = answers?.goal || 'sales';

  const fetchBlueprints = async (ind, g) =>
    supabase
      .from('strategy_blueprints')
      .select('*')
      .eq('industry', ind)
      .eq('primary_goal', g)
      .order('blueprint_key', { ascending: true });

  let blueprint = null;
  try {
    const attempts = [
      { ind: industry, g: goal },
      { ind: industry, g: 'sales' },
      { ind: 'generic', g: goal },
      { ind: 'generic', g: 'sales' },
    ];

    for (const attempt of attempts) {
      const { data: bpData, error: bpError } = await fetchBlueprints(attempt.ind, attempt.g);
      if (bpError) {
        console.error('[FullFlow] Blueprint fetch error', attempt, bpError);
        continue;
      }
      if (Array.isArray(bpData) && bpData.length > 0) {
        blueprint = bpData[0];
        break;
      }
    }
  } catch (err) {
    console.error('[FullFlow] Blueprint lookup crashed', err);
  }

  if (!blueprint) {
    console.warn('[FullFlow] No matching blueprint found, using fallback', { industry, goal });
    blueprint = {
      id: 'fallback-default',
      industry: industry || 'generic',
      primary_goal: goal || 'sales',
      blueprint_key: 'fallback_default',
      title: 'Fallback Strategy Blueprint',
      sections: [],
      testing_plan: [],
      creative_guidelines: [],
      audience_templates: [],
    };
  }

  const product = adVariant?.generated_ad?.product || {};
  const generatedAd = adVariant?.generated_ad || {};

  const fullFlowSchema = {
    name: 'full_strategy_and_meta_setup',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        strategyResult: {
          type: 'object',
          additionalProperties: false,
          properties: {
            strategy: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                budget_recommendations: {
                  type: 'object',
                  additionalProperties: false,
                  properties: { daily_budget: { type: 'string' } },
                  required: ['daily_budget'],
                },
              },
              required: ['title', 'description', 'budget_recommendations'],
            },
            score: { type: 'number' },
            confidence: { type: 'string' },
            key_alignments: { type: 'array', items: { type: 'string' } },
            implementation_recommendations: { type: 'array', items: { type: 'string' } },
            deep_dive_sections: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  section_id: { type: 'string' },
                  chapter: { type: 'string' },
                  title: { type: 'string' },
                  reason: { type: 'string' },
                  priority: { type: 'number' },
                },
                required: ['section_id', 'chapter', 'title', 'reason', 'priority'],
              },
            },
            diagnosis: {
              type: 'object',
              additionalProperties: false,
              properties: {
                primary_problem: { type: 'string' },
                kpi_snapshot: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    ctr: { type: 'number' },
                    atc_rate: { type: 'number' },
                    purchase_cvr: { type: 'number' },
                    roas: { type: 'number' },
                    frequency: { type: 'number' },
                    cpm: { type: 'number' },
                  },
                  required: ['ctr', 'atc_rate', 'purchase_cvr', 'roas', 'frequency', 'cpm'],
                },
              },
              required: ['primary_problem', 'kpi_snapshot'],
            },
            alternatives: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  score: { type: 'number' },
                  reason: { type: 'string' },
                },
                required: ['title', 'description', 'score', 'reason'],
              },
            },
            reasoning: { type: 'string' },
            blueprint_key: { type: 'string' },
          },
          required: [
            'strategy',
            'score',
            'confidence',
            'key_alignments',
            'implementation_recommendations',
            'deep_dive_sections',
            'diagnosis',
            'alternatives',
            'reasoning',
            'blueprint_key',
          ],
        },
        metaAdsSetup: {
          type: 'object',
          additionalProperties: false,
          properties: {
            campaign_config: {
              type: 'object',
              additionalProperties: false,
              properties: {
                campaign_name: { type: 'string' },
                objective: { type: 'string' },
                budget: { type: 'string' },
                optimization_goal: { type: 'string' },
                duration: { type: 'string' },
                notes: { type: 'string' },
              },
              required: ['campaign_name', 'objective', 'budget', 'optimization_goal', 'duration', 'notes'],
            },
            adsets_config: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  name: { type: 'string' },
                  budget: { type: 'string' },
                  placements: { type: 'string' },
                  target_audience: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      age: { type: 'string' },
                      locations: { type: 'array', items: { type: 'string' } },
                      interests: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['age', 'locations', 'interests'],
                  },
                },
                required: ['name', 'budget', 'placements', 'target_audience'],
              },
            },
            ads_config: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  name: { type: 'string' },
                  format: { type: 'string' },
                  headline: { type: 'string' },
                  primary_text: { type: 'string' },
                  cta: { type: 'string' },
                  tracking: { type: 'string' },
                },
                required: ['name', 'format', 'headline', 'primary_text', 'cta', 'tracking'],
              },
            },
            recommendations: {
              type: 'object',
              additionalProperties: false,
              properties: {
                testing: { type: 'string' },
                scaling: { type: 'string' },
                reporting: { type: 'string' },
              },
              required: ['testing', 'scaling', 'reporting'],
            },
          },
          required: ['campaign_config', 'adsets_config', 'ads_config', 'recommendations'],
        },
      },
      required: ['strategyResult', 'metaAdsSetup'],
    },
  };

  const systemPrompt = `Du bist ein Elite-Full-Funnel-Meta-Ads-Stratege (DACH). Erstelle Werbestrategie und Meta-Ads-Setup streng als JSON nach Schema.`;

  const userPrompt = {
    blueprint,
    product: {
      name: product.product_name,
      industry: product.industry,
      target_audience: product.target_audience,
      tonality: product.tonality,
      price_point: product.price_point,
    },
    generatedAd: {
      headline: generatedAd.headline,
      primary_text: generatedAd.primary_text,
      hook: generatedAd.hook,
      cta: generatedAd.cta,
    },
    questionnaire_answers: answers || {},
  };

  let aiResult;
  try {
    const openai = getOpenAIClient();
    const response = await openai.responses.create({
      model: process.env.ADSTRATEGY_MODEL || 'gpt-4.1-mini',
      input: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Erstelle eine vollstaendige Werbestrategie + Meta Ads Setup. Nur JSON.' },
            { type: 'input_text', text: `Daten:\n${JSON.stringify(userPrompt)}` },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: fullFlowSchema.name,
          strict: fullFlowSchema.strict,
          schema: fullFlowSchema.schema,
        },
      },
    });

    const firstOutput = response.output?.[0] || null;
    const contents = firstOutput?.content || [];
    let parsedJson = null;

    for (const item of contents) {
      if (item && typeof item === 'object' && item.json) {
        parsedJson = item.json;
        break;
      }
    }

    if (!parsedJson) {
      for (const item of contents) {
        if (!item || item.type !== 'output_text' || !item.text) continue;
        let raw = null;
        if (typeof item.text === 'string') raw = item.text;
        else if (typeof item.text?.value === 'string') raw = item.text.value;
        else if (Array.isArray(item.text) && item.text.length > 0) {
          if (typeof item.text[0] === 'string') raw = item.text[0];
          else if (typeof item.text[0]?.text === 'string') raw = item.text[0].text;
          else if (typeof item.text[0]?.value === 'string') raw = item.text[0].value;
        }
        if (!raw) continue;
        try {
          parsedJson = JSON.parse(raw.trim());
          break;
        } catch (err) {
          console.warn('[FullFlow] Failed to parse output_text', err.message);
        }
      }
    }

    aiResult = parsedJson;
  } catch (openAiError) {
    console.error('[FullFlow] OpenAI error', openAiError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenAI full strategy generation failed', details: openAiError.message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      strategyResult: aiResult?.strategyResult || null,
      metaAdsSetup: aiResult?.metaAdsSetup || null,
    }),
  };
};
