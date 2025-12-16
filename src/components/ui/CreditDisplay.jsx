import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { creditService } from '../../services/creditService';
import Icon from '../AppIcon';

const CreditDisplay = ({ className = '', showTooltip = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creditStatus, setCreditStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const debounceRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const loadCreditStatus = async () => {
      const started = Date.now();
      if (!user?.id) {
        if (mountedRef.current) setLoading(false);
        return;
      }
      try {
        const status = await creditService.getUserCreditStatus(user.id);
        if (!mountedRef.current || cancelled) return;
        setCreditStatus(status);
      } catch (error) {
        console.error('Error loading credit status:', error);
      } finally {
        if (mountedRef.current && !cancelled) {
          const elapsed = Date.now() - started;
          const waitFor = elapsed < 200 ? 200 - elapsed : 0;
          setTimeout(() => {
            if (mountedRef.current && !cancelled) setLoading(false);
          }, waitFor);
        }
      }
    };

    loadCreditStatus();

    const debouncedListener = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        loadCreditStatus();
      }, 400);
    };

    window.addEventListener('credit-updated', debouncedListener);

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      window.removeEventListener('credit-updated', debouncedListener);
    };
  }, [user?.id]);

  const handleCreditClick = () => navigate('/credits');

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-lg w-24"></div>
        </div>
      </div>
    );
  }

  if (!creditStatus || !user) return null;

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center space-x-2 px-3 py-2 h-10 rounded-lg border border-border bg-card cursor-pointer transition-all duration-200 hover:bg-accent"
        onClick={handleCreditClick}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        <Icon name="Coins" size={18} className="text-muted-foreground" />
        <div className="flex items-center space-x-1">
          <span className="font-semibold text-sm text-muted-foreground">Credits:</span>
          <span className="font-bold text-sm text-foreground">{creditService.formatCredits(creditStatus.credits)}</span>
        </div>
        {creditStatus.credits <= 50 && <Icon name="AlertTriangle" size={16} className="text-destructive animate-pulse" />}
        <Icon name="ChevronRight" size={14} className="text-muted-foreground opacity-60" />
      </div>

      {showTooltipState && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="relative rounded-lg border border-border bg-popover px-3 py-2 text-xs text-foreground shadow-lg max-w-xs">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Credit-Verbrauch pro Aktion:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>Ad Builder:</span>
                <span className="text-foreground">8 Credits</span>
                <span>AI Analysis:</span>
                <span className="text-foreground">6 Credits</span>
                <span>Ad Strategy:</span>
                <span className="text-foreground">6 Credits</span>
                <span>Kompletter Ablauf:</span>
                <span className="text-foreground">20 Credits</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Klicken Sie für mehr Details und zum Aufladen.</p>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-border"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;
