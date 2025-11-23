import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const InputForm = ({ 
  formData, 
  setFormData, 
  onGenerate, 
  isGenerating, 
  isAnalyzing,
  currentStep 
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

  const isDisabled = isGenerating || currentStep !== 'input';

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
          <label className="block text-sm font-medium text-foreground mb-2">
            Branche
          </label>
          <Select
            value={formData?.industry || 'e_commerce'}
            onChange={(value) => handleInputChange('industry', value)}
            options={industryOptions}
            disabled={isDisabled}
            placeholder="Branche auswählen"
          />
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
          <label className="block text-sm font-medium text-foreground mb-2">
            Tonalität
          </label>
          <Select
            value={formData?.tonality || 'professional'}
            onChange={(value) => handleInputChange('tonality', value)}
            options={tonalityOptions}
            disabled={isDisabled}
            placeholder="Tonalität auswählen"
          />
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
            onClick={onGenerate}
            disabled={isDisabled}
            className="w-full bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold py-3 px-6 text-lg"
            variant="default"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>
                  {currentStep === 'analyzing' && 'Analysiere Markt...'}
                  {currentStep === 'generating' && 'Generiere Anzeigen...'}
                  {currentStep === 'input' && 'Ad-Erstellung starten'}
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