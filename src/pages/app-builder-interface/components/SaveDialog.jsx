import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SaveDialog = ({ isOpen, onClose, onSave, draftData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title?.trim()) return;
    
    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const savedDraft = {
      id: Date.now(),
      title: title?.trim(),
      description: description?.trim() || draftData?.description || '',
      date: new Date()?.toISOString()?.split('T')?.[0],
      time: new Date()?.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      ...draftData
    };
    
    onSave(savedDraft);
    setIsSaving(false);
    setTitle('');
    setDescription('');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Save" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Entwurf speichern</h2>
              <p className="text-sm text-muted-foreground">Geben Sie einen Namen für Ihren Entwurf ein</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <Input
            label="Titel"
            type="text"
            placeholder="z.B. Premium Fitness Tracker Kampagne"
            value={title}
            onChange={(e) => setTitle(e?.target?.value)}
            required
            className="w-full"
          />

          <Input
            label="Beschreibung (optional)"
            type="text"
            placeholder="Kurze Beschreibung des Entwurfs..."
            value={description}
            onChange={(e) => setDescription(e?.target?.value)}
            className="w-full"
          />

          {/* Preview Info */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Entwurf Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produkt:</span>
                <span className="text-foreground">{draftData?.productName || 'Nicht angegeben'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tonalität:</span>
                <span className="text-foreground capitalize">{draftData?.tonality || 'Nicht angegeben'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Erstellt:</span>
                <span className="text-foreground">
                  {new Date()?.toLocaleDateString('de-DE')} um {new Date()?.toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Abbrechen
          </Button>
          
          <Button
            variant="default"
            onClick={handleSave}
            loading={isSaving}
            iconName={isSaving ? "Loader2" : "Save"}
            iconPosition="left"
            disabled={!title?.trim() || isSaving}
          >
            {isSaving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;