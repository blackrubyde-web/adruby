import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import AppSelect from '../../../components/ui/AppSelect';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const InputForm = ({ 
  formData, 
  setFormData, 
  onGenerate, 
  handleAdCreationStart,
  isRunning,
  isGenerating, 
  isAnalyzing,
}) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const industryOptions = [
    { value: 'e_commerce', label: 'E-Commerce' },
    { value: 'fitness', label: 'Gesundheit & Fitness' },
    { value: 'beauty', label: 'Beauty & Lifestyle' },
    { value: 'food', label: 'Gastronomie & Lebensmittel' },
    { value: 'tech', label: 'Technologie' },
    { value: 'other', label: 'Andere' }
  ];

  const tonalityOptions = [
    { value: 'professional', label: 'Professionell' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'humorous', label: 'Humorvoll' },
    { value: 'serious', label: 'Seriös' },
    { value: 'luxury', label: 'Luxuriös' },
    { value: 'scientific', label: 'Wissenschaftlich' },
    { value: 'friendly', label: 'Freundlich' },
    { value: 'urgent', label: 'Dringlich' },
    { value: 'casual', label: 'Locker' },
    { value: 'playful', label: 'Verspielt' },
    { value: 'exclusive', label: 'Exklusiv' }
  ];

  const adGoalOptions = [
    { value: 'sales', label: 'Verkäufe / Käufe' },
    { value: 'leads', label: 'Leads / Anfragen' },
    { value: 'awareness', label: 'Brand Awareness / Reichweite' }
  ];

  const marketCountryOptions = [
    { value: 'DE', label: 'Deutschland (DE)' },
    { value: 'AT', label: 'Österreich (AT)' },
    { value: 'CH', label: 'Schweiz (CH)' },
    { value: 'BE', label: 'Belgien (BE)' },
    { value: 'NL', label: 'Niederlande (NL)' },
    { value: 'US', label: 'USA (US)' },
    { value: 'GB', label: 'Großbritannien (GB)' }
  ];

  const languageOptions = [
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'Englisch' },
    { value: 'fr', label: 'Französisch' },
    { value: 'es', label: 'Spanisch' }
  ];

  const researchCountryOptions = [
    { value: 'DE', label: 'Deutschland' },
    { value: 'AT', label: 'Österreich' },
    { value: 'CH', label: 'Schweiz' },
    { value: 'US', label: 'USA' },
    { value: 'GB', label: 'Großbritannien' },
    { value: 'FR', label: 'Frankreich' },
    { value: 'NL', label: 'Niederlande' }
  ];

  const researchPeriodOptions = [
    { value: '', label: 'Alle' },
    { value: '30d', label: 'Letzte 30 Tage' },
    { value: '90d', label: 'Letzte 90 Tage' }
  ];

  const isDisabled = isRunning || isGenerating || isAnalyzing;
  const startHandler = handleAdCreationStart || onGenerate;

  return (
    <motion.div 
      className="bg-card border border-border rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Edit3" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Produkt-Input für Conversion-Ad</h2>
          <p className="text-sm text-muted-foreground">Geben Sie Ihre Produktdaten für die KI-Analyse ein</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Produktname */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Produktname *
          </label>
          <Input
            type="text"
            value={formData?.product_name || ''}
            onChange={(e) => handleInputChange('product_name', e?.target?.value)}
            placeholder="z.B. FitMax Pro Supplement"
            disabled={isDisabled}
            className="w-full"
          />
        </div>

        {/* Produktbeschreibung */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Produktbeschreibung *
          </label>
          <textarea
            value={formData?.product_description || ''}
            onChange={(e) => handleInputChange('product_description', e?.target?.value)}
            placeholder="Detaillierte Beschreibung Ihres Produkts..."
            disabled={isDisabled}
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Branche */}
        <div>
          <AppSelect
            label="Branche"
            name="industry"
            value={formData?.industry || 'e_commerce'}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            disabled={isDisabled}
          >
            {industryOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </AppSelect>
        </div>

        {/* Zielgruppe */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Zielgruppe *
          </label>
          <Input
            type="text"
            value={formData?.target_audience || ''}
            onChange={(e) => handleInputChange('target_audience', e?.target?.value)}
            placeholder="z.B. Fitness-Enthusiasten, 25-45 Jahre"
            disabled={isDisabled}
            className="w-full"
          />
        </div>

        {/* Hauptnutzen */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Hauptnutzen *
          </label>
          <textarea
            value={formData?.main_benefits || ''}
            onChange={(e) => handleInputChange('main_benefits', e?.target?.value)}
            placeholder="Die wichtigsten Vorteile Ihres Produkts..."
            disabled={isDisabled}
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Schmerzpunkte */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Schmerzpunkte *
          </label>
          <textarea
            value={formData?.pain_points || ''}
            onChange={(e) => handleInputChange('pain_points', e?.target?.value)}
            placeholder="Welche Probleme löst Ihr Produkt..."
            disabled={isDisabled}
            rows={3}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* USP */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            USP (Unique Selling Proposition) *
          </label>
          <Input
            type="text"
            value={formData?.usp || ''}
            onChange={(e) => handleInputChange('usp', e?.target?.value)}
            placeholder="Was macht Ihr Produkt einzigartig..."
            disabled={isDisabled}
            className="w-full"
          />
        </div>

        {/* Preis/Angebot */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Preis/Angebot
          </label>
          <Input
            type="text"
            value={formData?.price_offer || ''}
            onChange={(e) => handleInputChange('price_offer', e?.target?.value)}
            placeholder="z.B. 49,99 EUR (statt 79,99 EUR)"
            disabled={isDisabled}
            className="w-full"
          />
        </div>

        {/* Tonalität */}
        <div>
          <AppSelect
            label="Tonalität"
            name="tonality"
            value={formData?.tonality || 'professional'}
            onChange={(e) => handleInputChange('tonality', e.target.value)}
            disabled={isDisabled}
          >
            {tonalityOptions?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </AppSelect>
        </div>

        {/* CTA-Text */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            CTA-Text
          </label>
          <Input
            type="text"
            value={formData?.cta_text || ''}
            onChange={(e) => handleInputChange('cta_text', e?.target?.value)}
            placeholder="z.B. Jetzt kaufen, Mehr erfahren"
            disabled={isDisabled}
            className="w-full"
          />
        </div>

        {/* Kampagnenparameter & Research */}
        <div className="border-t border-border pt-6 mt-2 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Kampagnenparameter & Research</h3>
              <p className="text-sm text-muted-foreground">Definiere Ziel, Markt und Research-Einstellungen</p>
            </div>
          </div>

          <div className="space-y-4">
            <AppSelect
              label="Ziel der Anzeige *"
              name="ad_goal"
              value={formData?.ad_goal || 'sales'}
              onChange={(e) => handleInputChange('ad_goal', e.target.value)}
              disabled={isDisabled}
            >
              {adGoalOptions?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              label="Zielmarkt / Land *"
              name="market_country"
              value={formData?.market_country || 'DE'}
              onChange={(e) => handleInputChange('market_country', e.target.value)}
              disabled={isDisabled}
            >
              {marketCountryOptions?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              label="Sprache *"
              name="language"
              value={formData?.language || 'de'}
              onChange={(e) => handleInputChange('language', e.target.value)}
              disabled={isDisabled}
            >
              {languageOptions?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AppSelect>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Research-Keyword (Brand, Produkt oder Nische)
              </label>
              <Input
                type="text"
                value={formData?.research_keyword || ''}
                onChange={(e) => handleInputChange('research_keyword', e?.target?.value)}
                placeholder='z.B. "FitMax", "Proteinpulver", "Online Coaching"'
                disabled={isDisabled}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Wenn leer, wird automatisch der Produktname als Keyword verwendet.
              </p>
            </div>

            <AppSelect
              label="Research-Land"
              name="research_country"
              value={formData?.research_country || 'DE'}
              onChange={(e) => handleInputChange('research_country', e.target.value)}
              disabled={isDisabled}
            >
              {researchCountryOptions?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AppSelect>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppSelect
                label="Zeitraum"
                name="research_period"
                value={formData?.research_period ?? ''}
                onChange={(e) => handleInputChange('research_period', e.target.value)}
                disabled={isDisabled}
              >
                {researchPeriodOptions?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </AppSelect>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max. Ads
                </label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={formData?.research_max_results ?? 30}
                  onChange={(e) => {
                    const val = Number(e?.target?.value);
                    handleInputChange('research_max_results', val);
                  }}
                  disabled={isDisabled}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">Zwischen 10 und 100, Standard: 30</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fokus-Checkboxen */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-4">
            Fokus-Bereiche
          </label>
          <div className="space-y-3">
            <Checkbox
              id="focus_emotion"
              checked={formData?.focus_emotion || false}
              onCheckedChange={(checked) => handleCheckboxChange('focus_emotion', checked)}
              disabled={isDisabled}
              label="Fokus auf Emotion"
            />
            
            <Checkbox
              id="focus_benefits"
              checked={formData?.focus_benefits || false}
              onCheckedChange={(checked) => handleCheckboxChange('focus_benefits', checked)}
              disabled={isDisabled}
              label="Fokus auf Nutzen"
            />
            
            <Checkbox
              id="focus_urgency"
              checked={formData?.focus_urgency || false}
              onCheckedChange={(checked) => handleCheckboxChange('focus_urgency', checked)}
              disabled={isDisabled}
              label="Fokus auf Dringlichkeit"
            />
          </div>
        </div>

        {/* Ad-Erstellung starten Button */}
        <div className="pt-2">
          <Button
            onClick={startHandler}
            disabled={isDisabled}
            className="w-full bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold py-3 px-6 text-lg"
            variant="default"
          >
            {isRunning || isAnalyzing || isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>
                  {isRunning && 'Ads werden erstellt...'}
                  {!isRunning && isAnalyzing && 'Analysiere Markt...'}
                  {!isRunning && !isAnalyzing && isGenerating && 'Generiere Anzeigen...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Icon name="Sparkles" size={20} />
                <span>Ad-Erstellung starten</span>
              </div>
            )}
          </Button>
        </div>

        {/* Required Fields Note */}
        <div className="text-xs text-muted-foreground">
          * Pflichtfelder
        </div>
      </div>
    </motion.div>
  );
};

export default InputForm;
