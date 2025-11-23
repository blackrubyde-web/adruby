import React from 'react';
import { useNavigate } from 'react-router-dom';
import { creditService } from '../../services/creditService';
import Icon from '../AppIcon';
import Button from './Button';

const CreditWarningModal = ({ 
  isOpen, 
  onClose, 
  currentCredits, 
  requiredCredits, 
  actionType,
  className = '' 
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const shortage = Math.max(0, requiredCredits - currentCredits);
  
  const actionNames = {
    'ad_builder': 'Ad Builder',
    'ai_analysis': 'AI Analysis', 
    'ad_strategy': 'Ad Strategy',
    'full_process': 'Kompletter Ablauf'
  };

  const handleRechargeClick = () => {
    onClose();
    navigate('/credits');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`
        bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Credits aufgebraucht
              </h3>
              <p className="text-sm text-gray-600">
                Nicht genügend Credits verfügbar
              </p>
            </div>
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
        <div className="p-6 space-y-4">
          {/* Current Status */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Aktuelle Credits:
              </span>
              <span className="text-lg font-bold text-red-600">
                {creditService?.formatCredits(currentCredits)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Benötigt für {actionNames?.[actionType]}:
              </span>
              <span className="text-lg font-bold text-gray-900">
                {creditService?.formatCredits(requiredCredits)}
              </span>
            </div>
            <div className="border-t border-red-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Fehlende Credits:
                </span>
                <span className="text-lg font-bold text-red-600">
                  {creditService?.formatCredits(shortage)}
                </span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <p className="text-gray-800 font-medium">
              Deine Credits sind aufgebraucht.
            </p>
            <p className="text-gray-600 text-sm">
              Lade dein Konto auf, um fortzufahren.
            </p>
          </div>

          {/* Credit Cost Reference */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Credit-Kosten Übersicht:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Ad Builder:</span>
                <span className="font-medium">8 Credits</span>
              </div>
              <div className="flex justify-between">
                <span>AI Analysis:</span>
                <span className="font-medium">6 Credits</span>
              </div>
              <div className="flex justify-between">
                <span>Ad Strategy:</span>
                <span className="font-medium">6 Credits</span>
              </div>
              <div className="flex justify-between">
                <span>Kompletter Ablauf:</span>
                <span className="font-medium">20 Credits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleRechargeClick}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            iconName="CreditCard"
            iconPosition="left"
          >
            Credits aufladen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreditWarningModal;