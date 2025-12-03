import { supabasePublic as supabase } from '../lib/supabaseClient';
import openai from '../lib/openai';

/**
 * Service for managing ad strategy operations with Supabase and OpenAI
 */
export class AdStrategyService {

  // Get ad with product data
  static async getAdWithProduct(adId) {
    try {
      const { data, error } = await supabase?.from('generated_ads')?.select(`
          *,
          product:products(
            id,
            product_name,
            product_description,
            industry,
            target_audience,
            main_benefits,
            pain_points,
            usp,
            price_offer,
            tonality,
            cta_text
          )
        `)?.eq('id', adId)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching ad with product:', error);
      return { data: null, error };
    }
  }

  // Get all available strategies
  static async getAllStrategies() {
    try {
      const { data, error } = await supabase?.from('strategies')?.select('*')?.eq('platform', 'facebook')?.order('performance_score', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching strategies:', error);
      return { data: null, error };
    }
  }

  // Get strategies by goal type
  static async getStrategiesByGoal(goalType) {
    try {
      const { data, error } = await supabase?.from('strategies')?.select('*')?.eq('platform', 'facebook')?.eq('goal_type', goalType)?.order('performance_score', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching strategies by goal:', error);
      return { data: null, error };
    }
  }

  // AI-powered strategy analysis and recommendation
  static async analyzeAndRecommendStrategy(adData, availableStrategies) {
    try {
      const product = adData?.product;
      if (!product || !availableStrategies?.length) {
        throw new Error('Unvollständige Daten für Strategieanalyse');
      }

      // Create strategy analysis prompt in German
      const analysisPrompt = `
Du bist ein Elite-Performance-Marketing-Experte, spezialisiert auf Facebook Ads Strategie-Optimierung.

Analysiere die folgende Ad und wähle die beste Strategie aus den verfügbaren Optionen:

ANZEIGEN-DATEN:
- Produkt: ${product?.product_name}
- Beschreibung: ${product?.product_description}
- Branche: ${product?.industry}
- Zielgruppe: ${product?.target_audience}
- Hauptnutzen: ${product?.main_benefits}
- Schmerzpunkte: ${product?.pain_points}
- USP: ${product?.usp}
- Preis/Angebot: ${product?.price_offer}
- Tonalität: ${product?.tonality}
- CTA: ${adData?.cta}
- Headline: ${adData?.headline}
- Text: ${adData?.primary_text}
- Conversion Score: ${adData?.conversion_score}

VERFÜGBARE STRATEGIEN:
${availableStrategies?.map((strategy, index) => `
${index + 1}. ${strategy?.title} (ID: ${strategy?.id})
   - Ziel: ${strategy?.goal_type}
   - Beschreibung: ${strategy?.description}
   - Performance Score: ${strategy?.performance_score}
   - Ideal für: ${strategy?.ideal_tone}
   - Tags: ${strategy?.tags?.join(', ')}
`)?.join('\n')}

Bewerte jede Strategie basierend auf:
1. Übereinstimmung mit Produkttyp und Zielgruppe
2. Kompatibilität mit aktueller Ad-Performance
3. Eignung für die gewählte Tonalität
4. Potenzial für Conversion-Optimierung

Wähle die BESTE Strategie aus und erkläre detailliert warum.
`;

      const analysisResponse = await openai?.chat?.completions?.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Experte für Facebook Ads Performance Marketing. Analysiere Anzeigen und empfiehl die optimale Strategie. Antworte nur auf Deutsch und im JSON-Format.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'strategy_analysis',
            schema: {
              type: 'object',
              properties: {
                recommended_strategy_id: {
                  type: 'string',
                  description: 'ID der empfohlenen Strategie'
                },
                confidence_score: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  description: 'Vertrauensscore der Empfehlung (0-100)'
                },
                reasoning: {
                  type: 'string',
                  description: 'Detaillierte Begründung für die Strategieauswahl'
                },
                expected_improvements: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Liste der erwarteten Verbesserungen'
                },
                implementation_priority: {
                  type: 'string',
                  enum: ['high', 'medium', 'low'],
                  description: 'Priorität der Umsetzung'
                }
              },
              required: ['recommended_strategy_id', 'confidence_score', 'reasoning', 'expected_improvements', 'implementation_priority'],
              additionalProperties: false
            }
          }
        },
        reasoning_effort: 'high',
        verbosity: 'medium'
      });

      const aiAnalysis = JSON.parse(analysisResponse?.choices?.[0]?.message?.content);

      // Find the recommended strategy
      const recommendedStrategy = availableStrategies?.find(
        strategy => strategy?.id === aiAnalysis?.recommended_strategy_id
      );

      if (!recommendedStrategy) {
        throw new Error('Empfohlene Strategie nicht gefunden');
      }

      return {
        data: {
          ...aiAnalysis,
          recommended_strategy: recommendedStrategy
        },
        error: null
      };

    } catch (error) {
      console.error('Strategy analysis error:', error);
      return { data: null, error };
    }
  }

  // Apply strategy to ad
  static async applyStrategyToAd(adId, strategyId) {
    try {
      const { data, error } = await supabase?.from('generated_ads')?.update({
          selected_strategy_id: strategyId,
          updated_at: new Date()?.toISOString()
        })?.eq('id', adId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error applying strategy to ad:', error);
      return { data: null, error };
    }
  }

  // Get ads with their strategies
  static async getAdsWithStrategies(userId) {
    try {
      const { data, error } = await supabase?.from('generated_ads')?.select(`
          *,
          strategy:strategies(
            id,
            title,
            goal_type,
            description,
            performance_score
          ),
          product:products(
            id,
            product_name,
            industry
          )
        `)?.eq('user_id', userId)?.order('updated_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching ads with strategies:', error);
      return { data: null, error };
    }
  }

  // Generate strategy recommendations for existing ads
  static async generateStrategyRecommendations(productId) {
    try {
      // Get all ads for the product
      const { data: ads, error: adsError } = await supabase?.from('generated_ads')?.select(`
          *,
          product:products(*)
        `)?.eq('product_id', productId);

      if (adsError) throw adsError;

      // Get available strategies
      const { data: strategies, error: strategiesError } = await this.getAllStrategies();
      if (strategiesError) throw strategiesError;

      // Analyze each ad and recommend strategies
      const recommendations = [];
      
      for (const ad of ads || []) {
        if (!ad?.selected_strategy_id) { // Only for ads without strategies
          const { data: analysis, error: analysisError } = await this.analyzeAndRecommendStrategy(ad, strategies?.data);
          
          if (!analysisError && analysis?.recommended_strategy) {
            recommendations?.push({
              ad_id: ad?.id,
              recommended_strategy: analysis?.recommended_strategy,
              confidence_score: analysis?.confidence_score,
              reasoning: analysis?.reasoning
            });
          }
        }
      }

      return { data: recommendations, error: null };
    } catch (error) {
      console.error('Error generating strategy recommendations:', error);
      return { data: null, error };
    }
  }

  // Determine goal type based on product data
  static determineGoalType(productData) {
    const industry = productData?.industry?.toLowerCase();
    const description = productData?.product_description?.toLowerCase() || '';
    const benefits = productData?.main_benefits?.toLowerCase() || '';

    // E-commerce indicators
    if (industry === 'e_commerce' || description?.includes('kaufen') || 
        description?.includes('shop') ||
        productData?.price_offer) {
      return 'e_commerce';
    }

    // SaaS indicators
    if (industry === 'tech' || description?.includes('software') || 
        description?.includes('app') ||
        description?.includes('saas') ||
        benefits?.includes('automatisier')) {
      return 'saas';
    }

    // Coaching indicators
    if (description?.includes('coaching') ||
        description?.includes('beratung') ||
        benefits?.includes('transformation') ||
        benefits?.includes('entwicklung')) {
      return 'coaching';
    }

    // Lead generation (default for services)
    return 'leads';
  }

  // NEW: Save ad variant (for "Ad übernehmen" functionality)
  static async saveAdVariant(adData, productData, customData = {}) {
    try {
      // ✅ FIX: Use consistent authentication method
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user?.id) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      // First, ensure the ad exists in generated_ads table
      let adId = adData?.id;
      
      if (!adId) {
        // Create new ad entry if it doesn't exist
        const newAdData = {
          user_id: user?.id,
          product_id: productData?.id,
          headline: adData?.headline || 'Generierte Anzeige',
          primary_text: adData?.primary_text || '',
          cta: adData?.cta || 'Jetzt kaufen', 
          conversion_score: adData?.conversion_score || 0,
          estimated_ctr: adData?.estimated_ctr || 0,
          emotional_trigger: adData?.emotional_trigger || null,
          visual_suggestion: adData?.visual_suggestion || null,
          facebook_preview_data: adData?.facebook_preview_data || {},
          status: 'generated',
          selected_strategy_id: adData?.selected_strategy_id || null
        };

        const { data: createdAd, error: createError } = await supabase
          ?.from('generated_ads')
          ?.insert(newAdData)
          ?.select('*')
          ?.single();

        if (createError) throw createError;
        adId = createdAd?.id;
      }

      // Generate meaningful variant name
      const variantName = `${adData?.headline?.substring(0, 50) || 'Anzeige'} - ${new Date()?.toLocaleDateString('de-DE')}`;

      // Save to saved_ad_variants table
      const savedVariantData = {
        user_id: user?.id,
        generated_ad_id: adId,
        variant_name: variantName,
        notes: customData?.notes || `Übernommen am ${new Date()?.toLocaleDateString('de-DE')}`,
        is_favorite: customData?.isFavorite || false,
        performance_data: {
          ...adData,
          saved_timestamp: new Date()?.toISOString(),
          custom_image_url: customData?.customImageUrl || null,
          product_data: {
            product_name: productData?.product_name,
            industry: productData?.industry,
            target_audience: productData?.target_audience
          }
        }
      };

      const { data: savedVariant, error: saveError } = await supabase
        ?.from('saved_ad_variants')
        ?.insert(savedVariantData)
        ?.select(`
          *,
          generated_ad:generated_ads(
            *,
            product:products(*)
          )
        `)
        ?.single();

      if (saveError) throw saveError;

      return { data: savedVariant, error: null };
    } catch (error) {
      console.error('Error saving ad variant:', error);
      return { data: null, error };
    }
  }

  // NEW: Update saved ad variant
  static async updateSavedAdVariant(variantId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('saved_ad_variants')
        ?.update(updates)
        ?.eq('id', variantId)
        ?.select(`
          *,
          generated_ad:generated_ads(
            *,
            product:products(*),
            strategy:strategies(*)
          )
        `)
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating saved ad variant:', error);
      return { data: null, error };
    }
  }

  // NEW: Delete saved ad variant
  static async deleteSavedAdVariant(variantId) {
    try {
      const { error } = await supabase
        ?.from('saved_ad_variants')
        ?.delete()
        ?.eq('id', variantId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting saved ad variant:', error);
      return { error };
    }
  }

  // NEW: Upload custom ad image to Supabase Storage
  static async uploadAdImage(file, userId) {
    try {
      if (!file || !userId) {
        throw new Error('Datei und Benutzer-ID sind erforderlich');
      }

      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes?.includes(file?.type)) {
        throw new Error('Nur JPEG, PNG und WebP Dateien sind erlaubt');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file?.size > maxSize) {
        throw new Error('Datei ist zu groß. Maximum: 5MB');
      }

      // Generate unique filename
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${userId}/ad-images/${Date.now()}-${Math.random()?.toString(36)?.substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase?.storage
        ?.from('ad-images')
        ?.upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase?.storage
        ?.from('ad-images')
        ?.getPublicUrl(fileName);

      return { 
        data: { 
          path: uploadData?.path,
          publicUrl: publicUrl,
          fileName: fileName
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error uploading ad image:', error);
      return { data: null, error };
    }
  }

  // ENHANCED: Get comprehensive 7-step strategy questionnaire
  static async getStrategyQuestionnaire() {
    try {
      const questions = [
        {
          id: 'goal',
          category: 'Ziele & Ausrichtung',
          step: 1,
          question: 'Welches Hauptziel verfolgst du mit dieser Anzeige?',
          description: 'Definiere das primäre Geschäftsziel für diese Kampagne',
          type: 'select',
          options: [
            { 
              value: 'leads', 
              label: 'Lead-Generierung', 
              description: 'Kontaktdaten und Interessenten sammeln für zukünftige Verkäufe' 
            },
            { 
              value: 'sales', 
              label: 'Direktverkäufe', 
              description: 'Sofortige Käufe und Transaktionen über die Anzeige generieren' 
            },
            { 
              value: 'awareness', 
              label: 'Markenbekanntheit', 
              description: 'Reichweite und Sichtbarkeit der Marke erhöhen' 
            },
            { 
              value: 'traffic', 
              label: 'Website-Traffic', 
              description: 'Qualifizierten Traffic auf die Website lenken' 
            },
            { 
              value: 'app', 
              label: 'App-Downloads', 
              description: 'Mobile App Installation und Nutzung fördern' 
            },
            { 
              value: 'engagement', 
              label: 'Community-Engagement', 
              description: 'Interaktion, Likes, Comments und Follower aufbauen' 
            }
          ]
        },
        {
          id: 'budget_scaling',
          category: 'Budget & Skalierung',
          step: 2,
          question: 'Wie planst du dein Werbebudget und die Skalierung?',
          description: 'Budget-Strategie und Wachstumspläne definieren für optimale Performance',
          type: 'select',
          options: [
            { 
              value: '50-150-conservative', 
              label: '50-150 EUR/Tag - Konservativ', 
              description: 'Langsame, sichere Skalierung mit geringem Risiko und kontrollierten Ausgaben' 
            },
            { 
              value: '150-300-moderate', 
              label: '150-300 EUR/Tag - Moderat', 
              description: 'Ausgewogenes Wachstum mit mittlerem Risiko für stabile Ergebnisse' 
            },
            { 
              value: '300-500-aggressive', 
              label: '300-500 EUR/Tag - Aggressiv', 
              description: 'Schnelle Skalierung bei guter Performance mit höherem Budget' 
            },
            { 
              value: '500plus-enterprise', 
              label: 'Über 500 EUR/Tag - Enterprise', 
              description: 'Maximale Reichweite und Dominanz mit unbegrenztem Skalierungspotential' 
            }
          ]
        },
        {
          id: 'performance_goals',
          category: 'Performance & KPIs',
          step: 3,
          question: 'Welche Kennzahlen sind für dich am wichtigsten?',
          description: 'Priorisiere die Metriken für deinen Erfolg und Kampagnen-Optimierung',
          type: 'select',
          options: [
            { 
              value: 'roas-focused', 
              label: 'ROAS (Return on Ad Spend)', 
              description: 'Umsatz pro investiertem Euro maximieren - ideal für E-Commerce' 
            },
            { 
              value: 'cpa-focused', 
              label: 'CPA (Cost per Acquisition)', 
              description: 'Kosten pro Conversion minimieren für effiziente Lead-Generierung' 
            },
            { 
              value: 'ctr-focused', 
              label: 'CTR (Click-Through Rate)', 
              description: 'Engagement und Relevanz steigern durch höhere Klickraten' 
            },
            { 
              value: 'reach-focused', 
              label: 'Reichweite & Impressions', 
              description: 'Maximale Sichtbarkeit und Brand Awareness erreichen' 
            },
            { 
              value: 'quality-focused', 
              label: 'Lead-Qualität', 
              description: 'Hochwertige, kaufbereite Leads statt hoher Quantität generieren' 
            }
          ]
        },
        {
          id: 'target_audience',
          category: 'Zielgruppen & Targeting',
          step: 4,
          question: 'Wie möchtest du deine Zielgruppe ansprechen?',
          description: 'Targeting-Strategie und Zielgruppenfokus für optimale Reichweite',
          type: 'select',
          options: [
            { 
              value: 'broad-expansion', 
              label: 'Breite Zielgruppe', 
              description: 'Neue Märkte erschließen und große Reichweite für Brand Awareness' 
            },
            { 
              value: 'lookalike-similar', 
              label: 'Lookalike Audiences', 
              description: 'Ähnliche Kunden wie bestehende finden für höhere Conversion-Raten' 
            },
            { 
              value: 'retargeting-warm', 
              label: 'Retargeting', 
              description: 'Warme Zielgruppen und Website-Besucher für bessere Performance' 
            },
            { 
              value: 'interest-specific', 
              label: 'Interesse-basiert', 
              description: 'Spezifische Interessen und Verhaltensweisen der Zielgruppe nutzen' 
            },
            { 
              value: 'demographic-precise', 
              label: 'Demografisch präzise', 
              description: 'Alter, Geschlecht, Standort fokussiert für exakte Zielgruppen-Ansprache' 
            }
          ]
        },
        {
          id: 'creative_strategy',
          category: 'Kreativ & Content',
          step: 5,
          question: 'Welche Content-Strategie passt zu deiner Marke?',
          description: 'Art der Werbemittel und kreativen Ansatz für maximale Wirkung wählen',
          type: 'select',
          options: [
            { 
              value: 'video-storytelling', 
              label: 'Video & Storytelling', 
              description: 'Emotionale Videos und Geschichten für starke Markenbindung' 
            },
            { 
              value: 'ugc-authentic', 
              label: 'User Generated Content', 
              description: 'Authentische Kundenerfahrungen und echte Testimonials nutzen' 
            },
            { 
              value: 'product-showcase', 
              label: 'Produkt-Showcase', 
              description: 'Direkte Produktpräsentation mit Features und Benefits' 
            },
            { 
              value: 'educational-howto', 
              label: 'Educational Content', 
              description: 'Tutorials, How-Tos und Wissensvermittlung für Expertise-Aufbau' 
            },
            { 
              value: 'testimonial-social', 
              label: 'Testimonials & Social Proof', 
              description: 'Kundenbewertungen und Erfolgsgeschichten für Vertrauen und Glaubwürdigkeit' 
            }
          ]
        },
        {
          id: 'timeline_commitment',
          category: 'Zeitplanung & Engagement',
          step: 6,
          question: 'Wie ist deine zeitliche Planung und dein Engagement?',
          description: 'Kampagnendauer und Management-Intensität für realistische Zielsetzung',
          type: 'select',
          options: [
            { 
              value: 'sprint-1week', 
              label: '1-2 Wochen Sprint', 
              description: 'Kurze, intensive Kampagne für schnelle Ergebnisse und Tests' 
            },
            { 
              value: 'campaign-1month', 
              label: '1 Monat Kampagne', 
              description: 'Mittelfristige Zielerreichung mit ausreichend Optimierungszeit' 
            },
            { 
              value: 'growth-3months', 
              label: '3 Monate Wachstum', 
              description: 'Nachhaltiges Business-Wachstum mit kontinuierlicher Optimierung' 
            },
            { 
              value: 'ongoing-always', 
              label: 'Dauerhaft aktiv', 
              description: 'Kontinuierliche Präsenz und Optimierung für langfristigen Erfolg' 
            },
            { 
              value: 'seasonal-specific', 
              label: 'Saisonal/Event-basiert', 
              description: 'Bestimmte Zeiträume und Events nutzen für maximale Wirkung' 
            }
          ]
        },
        {
          id: 'risk_innovation',
          category: 'Risiko & Innovation',
          step: 7,
          question: 'Wie ist deine Risikobereitschaft und Innovationsneigung?',
          description: 'Experimentierfreude und Risikotoleranz für optimale Strategieauswahl bestimmen',
          type: 'select',
          options: [
            { 
              value: 'conservative-safe', 
              label: 'Konservativ & Sicher', 
              description: 'Bewährte Strategien mit geringem Risiko und vorhersagbaren Ergebnissen' 
            },
            { 
              value: 'balanced-steady', 
              label: 'Ausgewogen & Stetig', 
              description: 'Kontrolliertes Wachstum mit moderatem Risiko für stabile Performance' 
            },
            { 
              value: 'aggressive-fast', 
              label: 'Aggressiv & Schnell', 
              description: 'Schnelle Skalierung mit höherem Risiko für maximale Ergebnisse' 
            },
            { 
              value: 'innovative-experimental', 
              label: 'Innovativ & Experimentell', 
              description: 'Neue Ansätze testen mit hoher Risikobereitschaft für Durchbrüche' 
            },
            { 
              value: 'data-driven-analytical', 
              label: 'Datengetrieben & Analytisch', 
              description: 'Entscheidungen basierend auf Daten und ausführlichen Tests treffen' 
            }
          ]
        }
      ];

      return { data: questions, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // NEW: Load local strategy files from /strategies directory
  static async loadLocalStrategies() {
    try {
      const strategyFiles = [
        'performance_boost',
        'stable_growth', 
        'retargeting_master',
        'brand_expansion',
        'conversion_optimizer',
        'local_dominance'
      ];

      const strategies = [];
      
      for (const fileName of strategyFiles) {
        try {
          const response = await fetch(`/src/strategies/${fileName}.json`);
          if (response?.ok) {
            const strategy = await response?.json();
            strategies?.push(strategy);
          }
        } catch (fileError) {
          console.warn(`Could not load strategy file: ${fileName}.json`, fileError);
        }
      }

      // Fallback to database strategies if local files not available
      if (strategies?.length === 0) {
        const { data: dbStrategies } = await this.getAllStrategies();
        return dbStrategies || [];
      }

      return strategies;
    } catch (error) {
      console.error('Error loading local strategies:', error);
      return [];
    }
  }

  // NEW: Get ad strategy for specific ad variant
  static async getAdStrategy(adVariantId) {
    try {
      const { data, error } = await supabase
        ?.from('ad_strategies')
        ?.select(
          `
            id,
            ad_variant_id,
            selected_strategy,
            matching_score,
            confidence_level,
            ai_analysis,
            created_at,
            meta_ads_setup:meta_ads_setups(
              id,
              campaign_config,
              adsets_config,
              ads_config,
              recommendations,
              created_at
            )
          `
        )
        ?.eq('ad_variant_id', adVariantId)
        ?.order('created_at', { ascending: false })
        ?.limit(1);

      if (error) {
        console.error('[AdStrategyService][getAdStrategy] Supabase error:', error);
        return { data: null, error };
      }

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
      return { data: row, error: null };
    } catch (error) {
      console.error('[AdStrategyService][getAdStrategy] Unexpected error:', error);
      return { data: null, error };
    }
  }

  // NEW: Generate Meta Ads Setup Guide using AI
  static async generateMetaAdsSetup(adStrategyId, adData, strategyData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user?.id) {
        throw new Error('Benutzer nicht authentifiziert');
      }

      // Check if Meta Ads setup already exists
      const { data: existingSetup } = await supabase
        ?.from('ad_meta_setup')
        ?.select('*')
        ?.eq('ad_strategy_id', adStrategyId)
        ?.single();

      if (existingSetup) {
        return { data: existingSetup, error: null };
      }

      // Create comprehensive Meta Ads setup prompt
      const setupPrompt = `
Du bist ein Elite-Meta-Ads-Manager-Experte mit 10+ Jahren Erfahrung in Facebook & Instagram Ads (Stand 2025).

Erstelle eine vollständige, Schritt-für-Schritt Meta Ads Setup-Anleitung basierend auf folgenden Daten:

ANZEIGEN-DATEN:
- Produkt: ${adData?.generated_ad?.product?.product_name || 'E-Commerce Produkt'}
- Branche: ${adData?.generated_ad?.product?.industry || 'E-Commerce'}
- Zielgruppe: ${adData?.generated_ad?.product?.target_audience || 'Erwachsene 25-45'}
- Hauptnutzen: ${adData?.generated_ad?.product?.main_benefits || 'Hohe Qualität'}
- USP: ${adData?.generated_ad?.product?.usp || 'Einzigartiges Angebot'}
- Tonalität: ${adData?.generated_ad?.product?.tonality || 'Professional'}
- Ad-Headline: ${adData?.generated_ad?.headline || 'Anzeige'}
- Ad-Text: ${adData?.generated_ad?.primary_text || 'Beschreibung'}
- CTA: ${adData?.generated_ad?.cta || 'Jetzt kaufen'}

STRATEGIE-DATEN:
- Strategietitel: ${strategyData?.title || 'Performance Marketing'}
- Ziel: ${strategyData?.goal_type || 'Conversions'}
- Beschreibung: ${strategyData?.description || 'Umsatzsteigerung'}

Erstelle eine praxisnahe Meta Ads Manager Anleitung für 2025 mit konkreten Schritt-für-Schritt Anweisungen.
`;

      const setupResponse = await openai?.chat?.completions?.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Meta Ads Manager Experte. Erstelle detaillierte, praxisnahe Kampagnen-Setup-Anleitungen für Meta Ads Manager 2025. Antworte nur auf Deutsch und im JSON-Format.'
          },
          { role: 'user', content: setupPrompt }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'meta_ads_setup',
            schema: {
              type: 'object',
              properties: {
                campaign: {
                  type: 'object',
                  properties: {
                    objective: { type: 'string', description: 'Kampagnenziel (z.B. Conversions, Traffic)' },
                    campaign_name: { type: 'string', description: 'Eindeutiger Kampagnenname' },
                    budget: { type: 'string', description: 'Tagesbudget (z.B. 50€/Tag)' },
                    optimization_goal: { type: 'string', description: 'Optimierungsziel' },
                    duration: { type: 'string', description: 'Kampagnenlaufzeit' },
                    notes: { type: 'string', description: 'Wichtige Setup-Hinweise' }
                  },
                  required: ['objective', 'campaign_name', 'budget', 'optimization_goal']
                },
                adsets: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'AdSet Name' },
                      budget: { type: 'string', description: 'Budget für dieses AdSet' },
                      placements: { type: 'string', description: 'Platzierungen (z.B. Automatic)' },
                      optimization: { type: 'string', description: 'Optimierung' },
                      target_audience: {
                        type: 'object',
                        properties: {
                          age: { type: 'string' },
                          gender: { type: 'string' },
                          locations: { type: 'array', items: { type: 'string' } },
                          languages: { type: 'array', items: { type: 'string' } },
                          interests: { type: 'array', items: { type: 'string' } },
                          exclusions: { type: 'array', items: { type: 'string' } }
                        }
                      }
                    },
                    required: ['name', 'budget', 'target_audience']
                  },
                  minItems: 2,
                  maxItems: 4,
                  description: 'Liste der AdSets (2-4 verschiedene Zielgruppen)'
                },
                ads: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Ad Name' },
                      format: { type: 'string', description: 'Format (Video, Bild, Karussell)' },
                      primary_text: { type: 'string', description: 'Haupttext der Anzeige' },
                      headline: { type: 'string', description: 'Überschrift' },
                      cta: { type: 'string', description: 'Call-to-Action Button' },
                      link: { type: 'string', description: 'Ziel-URL' },
                      tracking: { type: 'string', description: 'Tracking/Pixel Setup' }
                    },
                    required: ['name', 'format', 'primary_text', 'headline', 'cta']
                  },
                  minItems: 2,
                  maxItems: 6,
                  description: 'Liste der Anzeigenvarianten (2-6 verschiedene Creatives)'
                },
                recommendations: {
                  type: 'object',
                  properties: {
                    testing: { type: 'string', description: 'Testing-Strategie' },
                    scaling: { type: 'string', description: 'Skalierungsstrategie' },
                    reporting: { type: 'string', description: 'Reporting und Optimierung' },
                    timeline: { type: 'string', description: 'Zeitplan für Umsetzung' }
                  },
                  required: ['testing', 'scaling', 'reporting']
                },
                step_by_step_instructions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      step_number: { type: 'number' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      meta_ads_manager_actions: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Konkrete Klicks und Eingaben im Meta Ads Manager'
                      },
                      tips: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['step_number', 'title', 'description', 'meta_ads_manager_actions']
                  },
                  description: 'Detaillierte Schritt-für-Schritt Anleitung'
                }
              },
              required: ['campaign', 'adsets', 'ads', 'recommendations', 'step_by_step_instructions'],
              additionalProperties: false
            }
          }
        },
        reasoning_effort: 'high',
        verbosity: 'high'
      });

      const aiSetup = JSON.parse(setupResponse?.choices?.[0]?.message?.content);

      // Save Meta Ads setup to database
      const { data: savedSetup, error: saveError } = await supabase
        ?.from('ad_meta_setup')
        ?.insert({
          ad_strategy_id: adStrategyId,
          user_id: user?.id,
          setup_data: aiSetup,
          campaign_config: aiSetup?.campaign || {},
          adsets_config: aiSetup?.adsets || [],
          ads_config: aiSetup?.ads || [],
          recommendations: aiSetup?.recommendations || {},
          setup_instructions: { steps: aiSetup?.step_by_step_instructions || [] },
          status: 'generated'
        })
        ?.select('*')
        ?.single();

      if (saveError) throw saveError;

      return { data: savedSetup, error: null };
    } catch (error) {
      console.error('Error generating Meta Ads setup:', error);
      return { data: null, error };
    }
  }

  // NEW: Get Meta Ads Setup for Strategy
  static async getMetaAdsSetup(adStrategyId) {
    try {
      const { data, error } = await supabase
        ?.from('ad_meta_setup')
        ?.select('*')
        ?.eq('ad_strategy_id', adStrategyId)
        ?.single();

      if (error && error?.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching Meta Ads setup:', error);
      return { data: null, error };
    }
  }

  // NEW: Update Meta Ads Setup
  static async updateMetaAdsSetup(setupId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('ad_meta_setup')
        ?.update(updates)
        ?.eq('id', setupId)
        ?.select('*')
        ?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating Meta Ads setup:', error);
      return { data: null, error };
    }
  }

  // NEW: Delete Meta Ads Setup
  static async deleteMetaAdsSetup(setupId) {
    try {
      const { error } = await supabase
        ?.from('ad_meta_setup')
        ?.delete()
        ?.eq('id', setupId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting Meta Ads setup:', error);
      return { error };
    }
  }

// ENHANCED: Get saved ad variants with strategy AND Meta Ads setup
  static async getSavedAdVariants(userId) {
    try {
      const { data, error } = await supabase
        ?.from('ad_variants')
        ?.select(`
          id,
          saved_at,
          is_favorite,
          performance_data,
          generated_ad:generated_ads(
            *,
            product:products(*)
          ),
          ad_strategy:ad_strategies(
            id,
            ad_variant_id,
            user_id,
            selected_strategy,
            selected_strategy_data,
            ai_analysis,
            matching_score,
            confidence_level,
            status,
            created_at,
            meta_ads_setup:meta_ads_setups(
              id,
              campaign_config,
              adsets_config,
              ads_config,
              recommendations,
              created_at
            )
          )
        `)
        ?.eq('user_id', userId)
        ?.order('saved_at', { ascending: false });

      if (error) {
        console.error('[AdStrategyService][getSavedAdVariants] Supabase error:', error);
        return { data: null, error };
      }

      const normalized = (data || []).map((row) => ({
        ...row,
        ad_strategy: Array.isArray(row.ad_strategy) ? row.ad_strategy : [],
        generated_ad: row.generated_ad || null,
      }));

      return { data: normalized, error: null };
    } catch (error) {
      console.error('[AdStrategyService][getSavedAdVariants] Unexpected error:', error);
      return { data: null, error };
    }
  }

  // NEW: Update ad strategy status
  static async updateAdStrategyStatus(strategyId, status) {
    try {
      const { data, error } = await supabase?.from('ad_strategies')?.update({ 
          status: status,
          updated_at: new Date()?.toISOString()
        })?.eq('id', strategyId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating ad strategy status:', error);
      return { data: null, error };
    }
  }

  // NEW: Get user strategy statistics
  static async getUserStrategyStats(userId) {
    try {
      const { data, error } = await supabase?.rpc('get_user_strategy_stats', { target_user_id: userId });

      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Error fetching user strategy stats:', error);
      return { data: null, error };
    }
  }

  static async saveAdStrategy(adVariantId, userId, answers, strategyRecommendation, metaAdsSetup) {
    if (!adVariantId || !userId) {
      return { data: null, error: new Error('Missing adVariantId or userId for saveAdStrategy') };
    }
    if (!strategyRecommendation || !strategyRecommendation.strategy) {
      return { data: null, error: new Error('Missing strategyRecommendation.strategy for saveAdStrategy') };
    }

    try {
      const payload = {
        adVariantId,
        userId,
        answers: answers || {},
        strategyRecommendation,
        metaAdsSetup: metaAdsSetup || null,
      };

      const response = await fetch('/.netlify/functions/ad-strategy-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorPayload = null;
        try {
          errorPayload = await response.json();
        } catch (_) {
          errorPayload = await response.text();
        }
        console.error('[AdStrategyService][saveAdStrategy] HTTP error', {
          status: response.status,
          payload: errorPayload,
        });
        return { data: null, error: new Error('Failed to save strategy') };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('[AdStrategyService][saveAdStrategy] Flow failed:', error);
      return { data: null, error };
    }
  }

  // NEW: Full strategy + meta setup flow via Netlify Function
  static async runFullStrategyFlow({ adVariantId, userId, answers }) {
    try {
      if (!adVariantId || !userId) {
        throw new Error('adVariantId und userId sind erforderlich, um den Full-Flow zu starten.');
      }

      const response = await fetch('/.netlify/functions/ad-strategy-full-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adVariantId,
          userId,
          answers,
        }),
      });

      if (!response.ok) {
        let errorPayload = null;
        try {
          errorPayload = await response.json();
        } catch (_) {
          errorPayload = await response.text();
        }
        console.error('[AdStrategyService][runFullStrategyFlow] HTTP error', {
          status: response.status,
          payload: errorPayload,
        });
        return {
          data: null,
          error: new Error('Full-Flow Anfrage fehlgeschlagen.'),
        };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('[AdStrategyService][runFullStrategyFlow] Unexpected error:', error);
      return { data: null, error };
    }
  }
}

export default AdStrategyService;
export const runFullStrategyFlow = AdStrategyService.runFullStrategyFlow;
