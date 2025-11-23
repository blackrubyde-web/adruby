import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Bestätigen", 
  cancelText = "Abbrechen",
  type = "default",
  campaignName = ""
}) => {
  if (!isOpen) return null;

  const getModalConfig = () => {
    switch (type) {
      case 'delete':
        return {
          icon: 'Trash2',
          iconColor: 'text-destructive',
          confirmVariant: 'destructive'
        };
      case 'pause':
        return {
          icon: 'Pause',
          iconColor: 'text-warning',
          confirmVariant: 'warning'
        };
      case 'activate':
        return {
          icon: 'Play',
          iconColor: 'text-success',
          confirmVariant: 'success'
        };
      default:
        return {
          icon: 'AlertCircle',
          iconColor: 'text-primary',
          confirmVariant: 'default'
        };
    }
  };

  const config = getModalConfig();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${config?.iconColor}`}>
                <Icon name={config?.icon} size={20} />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-muted-foreground mb-4">
              {message}
            </p>
            
            {campaignName && (
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Kampagne:</span> {campaignName}
                </p>
              </div>
            )}

            {type === 'delete' && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertTriangle" size={16} className="text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Warnung: Diese Aktion kann nicht rückgängig gemacht werden
                    </p>
                    <p className="text-sm text-destructive/80 mt-1">
                      Alle Kampagnendaten und Statistiken gehen dauerhaft verloren.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant={config?.confirmVariant}
              onClick={handleConfirm}
              iconName={config?.icon}
              iconPosition="left"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;