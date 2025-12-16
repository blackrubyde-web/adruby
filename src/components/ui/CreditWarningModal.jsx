import React from 'react';
import { useNavigate } from 'react-router-dom';
import { creditService } from '../../services/creditService';
import Icon from '../AppIcon';
import Button from './Button';
import Modal from './Modal';
import { UI } from './uiPrimitives';

const CreditWarningModal = ({
  isOpen,
  onClose,
  currentCredits,
  requiredCredits,
  actionType,
  className = '',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const shortage = Math.max(0, requiredCredits - currentCredits);

  const actionNames = {
    ad_builder: 'Ad Builder',
    ai_analysis: 'AI Analysis',
    ad_strategy: 'Ad Strategy',
    full_process: 'Kompletter Ablauf',
  };

  const handleRechargeClick = () => {
    onClose?.();
    navigate('/credits');
  };

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outline" onClick={onClose} className="flex-1">
        Abbrechen
      </Button>
      <Button onClick={handleRechargeClick} className="flex-1" iconName="CreditCard" iconPosition="left">
        Credits aufladen
      </Button>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Credits aufgebraucht"
      subtitle="Nicht genügend Credits verfügbar"
      footer={footer}
    >
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 p-4">
          <div className="h-10 w-10 rounded-full bg-accent/40 flex items-center justify-center">
            <Icon name="AlertTriangle" size={20} className="text-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Deine Credits sind aufgebraucht.</p>
            <p className="text-sm text-muted-foreground">Lade dein Konto auf, um fortzufahren.</p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4">
          <div className="flex items-center justify-between">
            <span className={UI.meta}>Aktuelle Credits</span>
            <span className="text-lg font-semibold text-foreground">
              {creditService?.formatCredits(currentCredits)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={UI.meta}>Benötigt für {actionNames?.[actionType] || 'diese Aktion'}</span>
            <span className="text-lg font-semibold text-foreground">
              {creditService?.formatCredits(requiredCredits)}
            </span>
          </div>
          <div className="border-t border-border/70 pt-3">
            <div className="flex items-center justify-between">
              <span className={UI.meta}>Fehlende Credits</span>
              <span className="text-lg font-semibold text-foreground">
                {creditService?.formatCredits(shortage)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Credit-Kosten Übersicht</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Ad Builder:</span>
              <span className="font-medium text-foreground">8 Credits</span>
            </div>
            <div className="flex justify-between">
              <span>AI Analysis:</span>
              <span className="font-medium text-foreground">6 Credits</span>
            </div>
            <div className="flex justify-between">
              <span>Ad Strategy:</span>
              <span className="font-medium text-foreground">6 Credits</span>
            </div>
            <div className="flex justify-between">
              <span>Kompletter Ablauf:</span>
              <span className="font-medium text-foreground">20 Credits</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreditWarningModal;
