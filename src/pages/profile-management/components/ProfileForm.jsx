import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const ProfileForm = ({ formData, onChange, saving }) => {
  
  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    onChange(name, value);
  };

  return (
    <div className="space-y-6">
      
      {/* Full Name Field */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-2">
          Vollständiger Name *
        </label>
        <div className="relative">
          <Input
            id="full_name"
            name="full_name"
            type="text"
            value={formData?.full_name || ''}
            onChange={handleInputChange}
            placeholder="Ihr vollständiger Name"
            disabled={saving}
            required
            className="pl-10 pr-4 py-3 h-11"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Icon name="User" size={18} />
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Dieser Name wird in Ihrem Profil und bei der Kommunikation angezeigt
        </p>
      </div>

      {/* Email Field (Read-only) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          E-Mail-Adresse
        </label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            value={formData?.email || ''}
            disabled
            className="pl-10 pr-4 py-3 h-11 bg-muted text-muted-foreground cursor-not-allowed"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Icon name="Mail" size={18} />
          </div>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
            <Icon name="Lock" size={16} />
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Die E-Mail-Adresse kann aus Sicherheitsgründen nicht geändert werden
        </p>
      </div>

      {/* Company Name Field (Optional) */}
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-foreground mb-2">
          Unternehmensname
          <span className="text-muted-foreground text-xs ml-1">(optional)</span>
        </label>
        <div className="relative">
          <Input
            id="company_name"
            name="company_name"
            type="text"
            value={formData?.company_name || ''}
            onChange={handleInputChange}
            placeholder="Ihr Unternehmensname"
            disabled={saving}
            className="pl-10 pr-4 py-3 h-11"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Icon name="Building" size={18} />
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional: Ihr Firmenname für geschäftliche Zwecke
        </p>
      </div>

      {/* Form Hints */}
      <div className="bg-muted border border-border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground">Profil-Hinweise</h4>
            <div className="text-sm text-muted-foreground mt-1">
              <ul className="space-y-1 list-disc list-inside">
                <li>Felder mit * sind Pflichtfelder</li>
                <li>Ihre Änderungen werden sofort gespeichert</li>
                <li>Ein vollständiges Profil verbessert Ihre Nutzererfahrung</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileForm;
