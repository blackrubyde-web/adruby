import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ContactForm = ({ user, onSubmit, onError }) => {
  const [formData, setFormData] = useState({
    inquiryType: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  
  const [submitting, setSubmitting] = useState(false);

  const inquiryTypes = [
    { value: '', label: 'Wählen Sie eine Kategorie...' },
    { value: 'technical', label: 'Technische Probleme' },
    { value: 'billing', label: 'Abrechnung & Bezahlung' },
    { value: 'campaign', label: 'Kampagnen-Management' },
    { value: 'account', label: 'Konto & Profile' },
    { value: 'feature', label: 'Feature-Anfrage' },
    { value: 'general', label: 'Allgemeine Fragen' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Niedrig', color: 'text-green-600' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600' },
    { value: 'high', label: 'Hoch', color: 'text-orange-600' },
    { value: 'urgent', label: 'Dringend', color: 'text-red-600' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validation
    if (!formData?.inquiryType) {
      onError('Bitte wählen Sie eine Anfrage-Kategorie aus');
      return;
    }
    
    if (!formData?.subject?.trim()) {
      onError('Bitte geben Sie einen Betreff ein');
      return;
    }
    
    if (!formData?.message?.trim()) {
      onError('Bitte beschreiben Sie Ihr Anliegen');
      return;
    }

    if (formData?.message?.length < 10) {
      onError('Ihre Nachricht sollte mindestens 10 Zeichen lang sein');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        userEmail: user?.email,
        userName: user?.user_metadata?.full_name || 'Unbekannter Benutzer',
        timestamp: new Date()?.toISOString()
      };

      const result = await onSubmit(submitData);
      
      if (result?.success) {
        // Reset form on success
        setFormData({
          inquiryType: '',
          subject: '',
          message: '',
          priority: 'normal'
        });
      }
    } catch (error) {
      onError('Fehler beim Senden der Anfrage: ' + error?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Form Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Kontaktieren Sie unser Support-Team
        </h2>
        <p className="text-muted-foreground">
          Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen zurück.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* User Information (Read-only) */}
        <div className="bg-muted rounded-lg p-4 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Ihre Kontaktdaten</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Name</label>
              <p className="text-foreground font-medium">
                {user?.user_metadata?.full_name || 'Nicht verfügbar'}
              </p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">E-Mail</label>
              <p className="text-foreground font-medium">
                {user?.email || 'Nicht verfügbar'}
              </p>
            </div>
          </div>
        </div>

        {/* Inquiry Type */}
        <div>
          <label htmlFor="inquiryType" className="block text-sm font-medium text-foreground mb-2">
            Anfrage-Kategorie *
          </label>
          <Select
            id="inquiryType"
            value={formData?.inquiryType}
            onChange={(e) => handleInputChange('inquiryType', e?.target?.value)}
            options={inquiryTypes}
            disabled={submitting}
            className="w-full"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Wählen Sie die passende Kategorie für eine schnellere Bearbeitung
          </p>
        </div>

        {/* Priority Level */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
            Priorität
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {priorityLevels?.map((priority) => (
              <label key={priority?.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={priority?.value}
                  checked={formData?.priority === priority?.value}
                  onChange={(e) => handleInputChange('priority', e?.target?.value)}
                  disabled={submitting}
                  className="sr-only"
                />
                <div className={`border-2 rounded-lg p-3 text-center transition-all ${
                  formData?.priority === priority?.value
                    ? 'border-primary/70 bg-primary/10 text-primary'
                    : 'border-border hover:border-border/80'
                }`}>
                  <span className="text-sm font-medium text-foreground">
                    {priority?.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
            Betreff *
          </label>
          <div className="relative">
            <Input
              id="subject"
              type="text"
              value={formData?.subject}
              onChange={(e) => handleInputChange('subject', e?.target?.value)}
              placeholder="Kurze Zusammenfassung Ihres Anliegens"
              disabled={submitting}
              maxLength={200}
              className="pl-10 pr-4 py-3 w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Icon name="MessageSquare" size={18} />
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              Beschreiben Sie Ihr Problem in wenigen Worten
            </p>
            <span className="text-xs text-muted-foreground">
              {formData?.subject?.length}/200
            </span>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
            Nachricht *
          </label>
          <div className="relative">
            <textarea
              id="message"
              value={formData?.message}
              onChange={(e) => handleInputChange('message', e?.target?.value)}
              placeholder="Beschreiben Sie Ihr Anliegen so detailliert wie möglich. Je mehr Informationen Sie uns geben, desto besser können wir Ihnen helfen."
              disabled={submitting}
              rows={6}
              maxLength={2000}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-colors"
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              Bitte schildern Sie Ihr Problem detailliert
            </p>
            <span className="text-xs text-muted-foreground">
              {formData?.message?.length}/2000
            </span>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Lightbulb" size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground">Hilfreiche Tipps</h4>
              <div className="text-sm text-muted-foreground mt-1">
                <ul className="space-y-1 list-disc list-inside">
                  <li>Beschreiben Sie Schritte zur Reproduktion des Problems</li>
                  <li>Geben Sie Fehlermeldungen wörtlich wieder</li>
                  <li>Erwähnen Sie verwendete Browser und Betriebssystem</li>
                  <li>Screenshots können bei der Problemlösung helfen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-border">
          <Button
            type="submit"
            disabled={submitting || !formData?.inquiryType || !formData?.subject || !formData?.message}
            className="px-8 py-3"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Wird gesendet...
              </div>
            ) : (
              <div className="flex items-center">
                <Icon name="Send" size={18} className="mr-2" />
                Anfrage senden
              </div>
            )}
          </Button>
        </div>

      </form>

    </div>
  );
};

export default ContactForm;
