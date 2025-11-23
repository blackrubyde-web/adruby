import { supabase } from '../lib/supabase';
import openai from '../lib/openai';


/**
 * Service for managing ad builder operations with Supabase and OpenAI
 */
export class AdBuilderService {
  
  // Product Management
  static async createProduct(productData) {
    try {
      // Ensure user is authenticated before attempting to create product
      const { data: { user }, error: authError } = await supabase?.auth?.getUser();
      
      if (authError || !user) {
        throw new Error('User must be authenticated to create products');
      }

      // NEW: Ensure user profile exists before creating product
      // This prevents RLS policy failures due to missing user_profiles entries
      try {
        const { data: profileResult, error: profileError } = await supabase?.rpc('ensure_user_profile_exists');
        
        if (profileError) {
          console.warn('Profile creation check failed:', profileError);
          // Continue anyway - the RLS policy will handle missing profiles gracefully
        } else if (!profileResult) {
          console.warn('User profile could not be created or verified');
          // Still try to create product - user might have permissions through other means
        }
      } catch (profileCheckError) {
        console.warn('Error checking user profile:', profileCheckError);
        // Continue - don't block product creation due to profile check failures
      }

      // Prepare product data with explicit user_id
      const productPayload = {
        ...productData,
        user_id: user?.id
      };

      console.log('Creating product with payload:', productPayload);

      const { data, error } = await supabase?.from('products')?.insert([productPayload])?.select()?.single();

      if (error) {
        console.error('Product creation error:', error);
        
        // Enhanced error handling with specific guidance
        if (error?.code === '42501' || error?.message?.includes('row-level security')) {
          console.error('RLS Policy Error Details:', {
            code: error?.code,
            message: error?.message,
            hint: error?.hint,
            details: error?.details
          });
          
          // Try to provide helpful error message
          const enhancedError = new Error(
            `Unable to create product due to permissions. This may be because:\n` +
            `1. Your user profile is not properly set up\n` +
            `2. Database policies need to be updated\n` +
            `3. Authentication session is invalid\n\n` +
            `Original error: ${error.message}`
          );
          enhancedError.originalError = error;
          throw enhancedError;
        }
        
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('AdBuilderService.createProduct error:', error);
      return { data: null, error };
    }
  }

  static async getProducts(userId) {
    try {
      const { data, error } = await supabase?.from('products')?.select(`
          *,
          campaign:ad_campaigns(id, name),
          generated_ads(id, headline, conversion_score, status)
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateProduct(productId, updates) {
    try {
      const { data, error } = await supabase?.from('products')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', productId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Enhanced error detection for OpenAI issues
  static isOpenAIQuotaError(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.status || error?.code;
    
    return (
      errorCode === 429 ||
      errorMessage?.includes('quota') ||
      errorMessage?.includes('rate limit') ||
      errorMessage?.includes('billing') ||
      errorMessage?.includes('exceeded')
    );
  }

  // Enhanced error detection for network issues
  static isNetworkError(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    return (
      errorMessage?.includes('network') ||
      errorMessage?.includes('timeout') ||
      errorMessage?.includes('connection') ||
      errorMessage?.includes('fetch')
    );
  }

  // Enhanced mock data generator based on form input
  static generateIntelligentMockData(productData = {}) {
    const industrySpecificData = {
      ecommerce: {
        hooks: ["50% Rabatt nur heute", "Kostenloser Versand", "Bestseller jetzt verfügbar"],
        triggers: ["Sparsamkeit", "Zeitdruck", "Soziale Bestätigung"],
        ctas: ["Jetzt kaufen", "Zum Angebot", "In den Warenkorb"],
        visuals: ["Produktfoto", "Lifestyle-Shooting", "Vergleichsbild"]
      },
      health: {
        hooks: ["Natürlich gesund leben", "Wissenschaftlich bewiesen", "Ohne Nebenwirkungen"],
        triggers: ["Gesundheit", "Sicherheit", "Wohlbefinden"],
        ctas: ["Jetzt testen", "Mehr erfahren", "Beratung buchen"],
        visuals: ["Natürliche Zutaten", "Vorher-Nachher", "Experten-Empfehlung"]
      },
      finance: {
        hooks: ["Kostenlose Beratung", "Garantiert günstigere Konditionen", "Sofortzusage möglich"],
        triggers: ["Sicherheit", "Vertrauen", "Erfolg"],
        ctas: ["Jetzt vergleichen", "Kostenlos anfragen", "Termin vereinbaren"],
        visuals: ["Vertrauenssymbole", "Erfolgsgeschichten", "Experten-Team"]
      },
      technology: {
        hooks: ["Neueste Technologie", "Einfache Bedienung", "Maximale Leistung"],
        triggers: ["Innovation", "Effizienz", "Status"],
        ctas: ["Jetzt entdecken", "Demo ansehen", "Kostenlos testen"],
        visuals: ["Produktfeatures", "Tech-Ambiente", "Anwendungsbeispiele"]
      },
      other: {
        hooks: ["Limitiertes Angebot", "Exklusiv für Sie", "Jetzt oder nie"],
        triggers: ["FOMO", "Exklusivität", "Dringlichkeit"],
        ctas: ["Jetzt sichern", "Mehr erfahren", "Angebot nutzen"],
        visuals: ["Produktfokus", "Lifestyle-Szenen", "Emotionale Momente"]
      }
    };

    const industry = productData?.industry || 'other';
    const selectedData = industrySpecificData?.[industry] || industrySpecificData?.other;

    return {
      common_hooks: selectedData?.hooks,
      emotional_triggers: selectedData?.triggers,
      common_ctas: selectedData?.ctas,
      visual_trends: selectedData?.visuals
    };
  }

  // NEW: Dedicated market analysis method as requested with enhanced error handling
  static async analyzeMarket(formData = {}) {
    console.log("AdBuilderService.analyzeMarket() aufgerufen mit:", formData);
    
    try {
      // First attempt: Try OpenAI API
      const result = await this.analyzeProduct(formData);
      console.log("Marktanalyse-Ergebnis von API:", result);
      return result;
    } catch (error) {
      console.error("Fehler in analyzeMarket:", error);
      
      // Enhanced error handling with specific error types
      let fallbackReason = "Unbekannter Fehler";
      
      if (this.isOpenAIQuotaError(error)) {
        fallbackReason = "OpenAI Quota erreicht - verwende intelligente Fallback-Daten";
        console.warn("OpenAI Quota/Billing Problem erkannt:", error?.message);
      } else if (this.isNetworkError(error)) {
        fallbackReason = "Netzwerkproblem - verwende lokale Daten";
        console.warn("Netzwerkfehler erkannt:", error?.message);
      } else {
        fallbackReason = "API temporär nicht verfügbar - verwende Fallback";
        console.warn("Sonstiger API-Fehler:", error?.message);
      }

      // Use intelligent mock data based on form input
      const intelligentMockData = this.generateIntelligentMockData(formData);
      
      console.log(`${fallbackReason}:`, intelligentMockData);
      return { 
        data: intelligentMockData, 
        error: null,
        fallbackUsed: true,
        fallbackReason
      };
    }
  }

  // Enhanced AI Ad Generation with better error handling and model fallback
  static async analyzeProduct(productData) {
    console.log("AdBuilderService.analyzeProduct() gestartet");
    
    try {
      // Create market analysis prompt in German
      const analysisPrompt = `
Du bist ein erfahrener Performance-Marketer spezialisiert auf Facebook Ads.

Analysiere folgende Produktinformationen und erstelle eine Marktanalyse:

Produkt: ${productData?.product_name || 'Nicht angegeben'}
Branche: ${productData?.industry || 'Allgemein'}
Zielgruppe: ${productData?.target_audience || 'Allgemeine Zielgruppe'}
Hauptnutzen: ${productData?.main_benefits || 'Hochwertige Lösung'}
Schmerzpunkte: ${productData?.pain_points || 'Alltägliche Herausforderungen'}
USP: ${productData?.usp || 'Einzigartige Vorteile'}
Preis/Angebot: ${productData?.price_offer || 'Attraktiver Preis'}
Tonalität: ${productData?.tonality || 'Professional'}

Erstelle eine JSON-Antwort mit:
1. Top 5 häufigste Hooks für diese Branche
2. Top 5 häufigste CTA-Phrasen
3. Top 5 emotionale Trigger
4. Top 5 visuelle Trends

Format: {"common_hooks": [], "common_ctas": [], "emotional_triggers": [], "visual_trends": []}
`;

      console.log("OpenAI-Anfrage wird gesendet...");
      
      // Try different models with fallback strategy
      let analysisResponse;
      const modelsToTry = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
      
      for (const model of modelsToTry) {
        try {
          console.log(`Versuche Modell: ${model}`);
          
          analysisResponse = await openai?.chat?.completions?.create({
            model: model,
            messages: [
              { 
                role: 'system', 
                content: 'Du bist ein Experte für Facebook Ads und Performance Marketing. Antworte nur auf Deutsch und in JSON-Format.' 
              },
              { role: 'user', content: analysisPrompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            response_format: { type: "json_object" }
          });
          
          console.log(`Erfolg mit Modell: ${model}`);
          break; // Exit loop on success
          
        } catch (modelError) {
          console.log(`Modell ${model} fehlgeschlagen:`, modelError?.message);
          
          if (this.isOpenAIQuotaError(modelError)) {
            // If it's a quota error, don't try other models
            throw modelError;
          }
          
          // Continue to next model for other errors
          if (model === modelsToTry?.[modelsToTry?.length - 1]) {
            // If this was the last model, throw the error
            throw modelError;
          }
        }
      }

      const marketInsights = JSON.parse(analysisResponse?.choices?.[0]?.message?.content);
      console.log("OpenAI-Antwort erhalten:", marketInsights);
      
      // Validate response structure
      const requiredFields = ['common_hooks', 'common_ctas', 'emotional_triggers', 'visual_trends'];
      const isValidResponse = requiredFields?.every(field => 
        Array.isArray(marketInsights?.[field]) && marketInsights?.[field]?.length > 0
      );
      
      if (!isValidResponse) {
        throw new Error('Invalid response structure from OpenAI');
      }
      
      return { data: marketInsights, error: null };

    } catch (error) {
      console.error('Market analysis error:', error);
      
      // Provide specific error context for debugging
      if (this.isOpenAIQuotaError(error)) {
        console.error('OpenAI Quota/Billing Issue - Check your OpenAI account and billing');
      }
      
      throw error; // Re-throw for proper error handling in calling function
    }
  }

  static async generateAds(productData, marketInsights) {
    try {
      // Create focus descriptions based on checkboxes
      const focusAreas = [];
      if (productData?.focus_emotion) focusAreas?.push('emotionale Ansprache');
      if (productData?.focus_benefits) focusAreas?.push('Nutzen-fokussierte Argumentation');
      if (productData?.focus_urgency) focusAreas?.push('Dringlichkeit und FOMO');
      
      const focusText = focusAreas?.length > 0 ? focusAreas?.join(', ') : 'ausgewogene Ansprache';

      const adGenerationPrompt = `
Du bist ein Top-Performance-Marketer der hochkonvertierende Facebook Ads erstellt.

Analysiere die Marktdaten und erstelle 3 Facebook-Ad-Varianten für folgendes Produkt:

PRODUKTDATEN:
- Produktname: ${productData?.product_name}
- Beschreibung: ${productData?.product_description}  
- Branche: ${productData?.industry}
- Zielgruppe: ${productData?.target_audience}
- Hauptnutzen: ${productData?.main_benefits}
- Schmerzpunkte: ${productData?.pain_points}
- USP: ${productData?.usp}
- Preis/Angebot: ${productData?.price_offer}
- Tonalität: ${productData?.tonality}
- CTA-Text: ${productData?.cta_text}
- Fokus: ${focusText}

MARKTINSIGHTS:
- Erfolgreiche Hooks: ${marketInsights?.common_hooks?.join(', ') || 'Standard-Hooks'}
- Bewährte CTAs: ${marketInsights?.common_ctas?.join(', ') || 'Standard-CTAs'}  
- Emotionale Trigger: ${marketInsights?.emotional_triggers?.join(', ') || 'Standard-Trigger'}
- Visuelle Trends: ${marketInsights?.visual_trends?.join(', ') || 'Standard-Visuals'}

Erstelle 3 verschiedene Ad-Varianten (konservativ, emotional, aggressiv) im JSON-Format.
Jede Variante sollte 80+ Conversion-Score haben.

Pro Variante:
- headline: Prägnante Headline (max 40 Zeichen)
- primary_text: Haupttext (max 125 Zeichen für mobile Optimierung)
- cta: Call-to-Action basierend auf Vorgabe
- emotional_trigger: Hauptemotion der Anzeige
- visual_suggestion: Detaillierte Beschreibung des idealen Bildes
- conversion_score: Score 0-100 basierend auf Hook-Stärke, Relevanz, CTA-Qualität
- estimated_ctr: Geschätzte CTR in % (1.5-3.5%)
`;

      // Try different models with fallback strategy for ad generation
      let adResponse;
      const modelsToTry = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
      
      for (const model of modelsToTry) {
        try {
          console.log(`Generiere Ads mit Modell: ${model}`);
          
          adResponse = await openai?.chat?.completions?.create({
            model: model,
            messages: [
              { 
                role: 'system', 
                content: 'Du bist ein Elite-Performance-Marketer mit 10+ Jahren Facebook Ads Erfahrung. Erstelle nur hochkonvertierende Anzeigen auf Deutsch.' 
              },
              { role: 'user', content: adGenerationPrompt }
            ],
            max_tokens: 2000,
            temperature: 0.8,
            response_format: { type: "json_object" }
          });
          
          console.log(`Ad-Generierung erfolgreich mit: ${model}`);
          break; // Exit loop on success
          
        } catch (modelError) {
          console.log(`Ad-Generierung mit ${model} fehlgeschlagen:`, modelError?.message);
          
          if (this.isOpenAIQuotaError(modelError)) {
            // Generate fallback ads if quota exceeded
            return this.generateFallbackAds(productData, marketInsights);
          }
          
          // Continue to next model
          if (model === modelsToTry?.[modelsToTry?.length - 1]) {
            // If this was the last model, generate fallback
            return this.generateFallbackAds(productData, marketInsights);
          }
        }
      }

      const generatedAds = JSON.parse(adResponse?.choices?.[0]?.message?.content);
      return { data: generatedAds?.ads, error: null };

    } catch (error) {
      console.error('Ad generation error:', error);
      
      // Always provide fallback ads instead of failing
      return this.generateFallbackAds(productData, marketInsights);
    }
  }

  // New method to generate fallback ads when API fails
  static generateFallbackAds(productData, marketInsights) {
    console.log("Generiere Fallback-Anzeigen basierend auf Produktdaten");
    
    const productName = productData?.product_name || 'Ihr Produkt';
    const mainBenefit = productData?.main_benefits || 'Hochwertige Lösung';
    const cta = productData?.cta_text || 'Jetzt kaufen';
    const targetAudience = productData?.target_audience || 'Kunden';
    
    const fallbackAds = [
      {
        headline: `${productName} - Jetzt entdecken!`,
        primary_text: `Entdecken Sie ${mainBenefit} für ${targetAudience}. Profitieren Sie von unserem einzigartigen Angebot.`,
        cta: cta,
        emotional_trigger: marketInsights?.emotional_triggers?.[0] || 'Vertrauen',
        visual_suggestion: `Hochwertiges Produktfoto von ${productName} mit modernem Hintergrund`,
        conversion_score: 85,
        estimated_ctr: 2.3
      },
      {
        headline: `${mainBenefit} garantiert!`,
        primary_text: `${productName} bietet ${mainBenefit}. Überzeugen Sie sich selbst von der Qualität.`,
        cta: cta,
        emotional_trigger: marketInsights?.emotional_triggers?.[1] || 'Erfolg',
        visual_suggestion: `Lifestyle-Foto mit ${productName} in Anwendung, glückliche Menschen`,
        conversion_score: 88,
        estimated_ctr: 2.7
      },
      {
        headline: `Limitiert: ${productName}`,
        primary_text: `Nur noch kurze Zeit verfügbar! Sichern Sie sich ${mainBenefit} zum Sonderpreis.`,
        cta: cta,
        emotional_trigger: marketInsights?.emotional_triggers?.[2] || 'FOMO',
        visual_suggestion: `Urgency-Design mit ${productName}, Timer oder "Limitiert" Badge`,
        conversion_score: 82,
        estimated_ctr: 2.9
      }
    ];
    
    return { data: fallbackAds, error: null, fallbackGenerated: true };
  }

  // Save generated ads to database
  static async saveGeneratedAds(productId, ads) {
    try {
      const user = (await supabase?.auth?.getUser())?.data?.user;
      if (!user) throw new Error('User not authenticated');

      const adRecords = ads?.map(ad => ({
        product_id: productId,
        user_id: user?.id,
        headline: ad?.headline,
        primary_text: ad?.primary_text,
        cta: ad?.cta,
        emotional_trigger: ad?.emotional_trigger,
        visual_suggestion: ad?.visual_suggestion,
        conversion_score: Math.round(ad?.conversion_score || 0),
        estimated_ctr: ad?.estimated_ctr,
        facebook_preview_data: {
          page_name: 'Ihr Unternehmen',
          image_placeholder: ad?.visual_suggestion?.substring(0, 100) || 'Produktbild',
          likes: Math.floor(Math.random() * 2000) + 500,
          shares: Math.floor(Math.random() * 200) + 50,
          comments: Math.floor(Math.random() * 300) + 100
        },
        status: 'generated'
      }));

      const { data, error } = await supabase?.from('generated_ads')?.insert(adRecords)?.select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get generated ads for a product
  static async getGeneratedAds(productId) {
    try {
      const { data, error } = await supabase?.from('generated_ads')?.select('*')?.eq('product_id', productId)?.order('conversion_score', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Save market insights
  static async saveMarketInsights(productId, insights) {
    try {
      const user = (await supabase?.auth?.getUser())?.data?.user;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase?.from('market_insights')?.insert([{
          user_id: user?.id,
          product_id: productId,
          industry: insights?.industry || 'other',
          common_hooks: insights?.common_hooks || [],
          common_ctas: insights?.common_ctas || [],
          emotional_triggers: insights?.emotional_triggers || [],
          visual_trends: insights?.visual_trends || []
        }])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Complete ad generation workflow
  static async generateCompleteAdCampaign(productData) {
    try {
      // Step 1: Analyze product and market
      const { data: insights, error: analysisError } = await this.analyzeProduct(productData);
      if (analysisError) throw analysisError;

      // Step 2: Generate ads based on analysis
      const { data: ads, error: adsError } = await this.generateAds(productData, insights);
      if (adsError) throw adsError;

      // Step 3: Save to database
      const { data: savedAds, error: saveError } = await this.saveGeneratedAds(productData?.id, ads);
      if (saveError) throw saveError;

      // Step 4: Save market insights
      await this.saveMarketInsights(productData?.id, insights);

      return { 
        data: {
          ads: savedAds,
          insights,
          product: productData
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Complete campaign generation error:', error);
      return { data: null, error };
    }
  }

  // NEW: Navigate to strategy page after ad generation
  static getStrategyPageUrl(adId) {
    return `/ad-strategy?adId=${adId}`;
  }

  // NEW: Check if ad has strategy assigned
  static async checkAdStrategy(adId) {
    try {
      const { data, error } = await supabase?.from('generated_ads')?.select('selected_strategy_id, strategy:strategies(title)')?.eq('id', adId)?.single();

      if (error) throw error;
      return { 
        data: {
          hasStrategy: !!data?.selected_strategy_id,
          strategyTitle: data?.strategy?.title || null
        }, 
        error: null 
      };
    } catch (error) {
      return { data: { hasStrategy: false, strategyTitle: null }, error };
    }
  }
}

export default AdBuilderService;

// Add new function to fetch admin stats using the corrected function approach
export const getAdminSystemStats = async () => {
  try {
    const { data, error } = await supabase?.rpc('get_admin_system_stats');
    
    if (error) {
      throw error;
    }

    // The function returns a single row with all stats
    return data?.[0] || {
      total_users: 0,
      admin_users: 0,
      total_campaigns: 0,
      total_products: 0,
      total_ads: 0,
      published_ads: 0,
      total_insights: 0,
      avg_conversion_score: 0
    };
  } catch (error) {
    throw new Error(`Failed to fetch admin system stats: ${error.message}`);
  }
};