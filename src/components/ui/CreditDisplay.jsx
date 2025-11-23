import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { creditService } from '../../services/creditService';
import Icon from '../AppIcon';

import { useNavigate } from 'react-router-dom';

const CreditDisplay = ({ className = '', showTooltip = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creditStatus, setCreditStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltipState, setShowTooltipState] = useState(false);

  useEffect(() => {
    const loadCreditStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const status = await creditService.getUserCreditStatus(user.id);
        setCreditStatus(status);
      } catch (error) {
        console.error('Error loading credit status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCreditStatus();

    // Set up real-time subscription for credit updates
    window.addEventListener('credit-updated', loadCreditStatus);
    
    return () => {
      window.removeEventListener('credit-updated', loadCreditStatus);
    };
  }, [user?.id]);

  const handleCreditClick = () => {
    navigate('/credits');
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-lg w-24"></div>
        </div>
      </div>
    );
  }

  if (!creditStatus || !user) {
    return null;
  }

  const colorClasses = creditService.getCreditColorClasses(creditStatus.credits);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200
          hover:shadow-sm ${colorClasses.bg} ${colorClasses.border}
        `}
        onClick={handleCreditClick}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        {/* Credit Icon */}
        <Icon 
          name="Coins" 
          size={18} 
          className={colorClasses.icon}
        />

        {/* Credits Display */}
        <div className="flex items-center space-x-1">
          <span className={`font-semibold text-sm ${colorClasses.text}`}>
            Credits:
          </span>
          <span className={`font-bold text-sm ${colorClasses.text}`}>
            {creditService.formatCredits(creditStatus.credits)}
          </span>
        </div>

        {/* Warning Icon for Low Credits */}
        {creditStatus.credits <= 50 && (
          <Icon 
            name="AlertTriangle" 
            size={16} 
            className="text-red-500 animate-pulse"
          />
        )}

        {/* Chevron */}
        <Icon 
          name="ChevronRight" 
          size={14} 
          className={`${colorClasses.text} opacity-60`}
        />
      </div>

      {/* Tooltip */}
      {showTooltipState && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">Credit-Verbrauch pro Aktion:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>Ad Builder:</span>
                <span className="text-yellow-300">8 Credits</span>
                <span>AI Analysis:</span>
                <span className="text-yellow-300">6 Credits</span>
                <span>Ad Strategy:</span>
                <span className="text-yellow-300">6 Credits</span>
                <span>Kompletter Ablauf:</span>
                <span className="text-yellow-300">20 Credits</span>
              </div>
              <p className="text-xs opacity-75 mt-2">
                Klicken Sie für mehr Details und zum Aufladen.
              </p>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;