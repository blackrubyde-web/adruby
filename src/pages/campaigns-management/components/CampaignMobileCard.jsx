import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const CampaignMobileCard = ({ campaign, isSelected, onSelect, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        label: 'Aktiv', 
        className: 'bg-success/10 text-success border-success/20' 
      },
      paused: { 
        label: 'Pausiert', 
        className: 'bg-warning/10 text-warning border-warning/20' 
      },
      stopped: { 
        label: 'Gestoppt', 
        className: 'bg-destructive/10 text-destructive border-destructive/20' 
      }
    };

    const config = statusConfig?.[status] || statusConfig?.stopped;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config?.className}`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'active' ? 'bg-success' :
          status === 'paused' ? 'bg-warning' : 'bg-destructive'
        }`} />
        {config?.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('de-DE')?.format(number);
  };

  const formatPercentage = (percentage) => {
    return `${percentage?.toFixed(2)}%`;
  };

  const handleSwipeAction = (action) => {
    onAction(action, campaign?.id);
    setShowActions(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Main Card Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={isSelected}
              onChange={(e) => onSelect(campaign?.id, e?.target?.checked)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {campaign?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {campaign?.type}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(campaign?.status)}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-medium text-foreground">
              {formatCurrency(campaign?.budget)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Klicks</p>
            <p className="font-medium text-foreground">
              {formatNumber(campaign?.clicks)}
            </p>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-border pt-3 mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Ausgegeben</p>
                <p className="font-medium text-foreground">
                  {formatCurrency(campaign?.spent)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="font-medium text-foreground">
                  {formatPercentage(campaign?.conversionRate)}
                </p>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Budget-Nutzung</span>
                <span className="text-xs font-medium">
                  {((campaign?.spent / campaign?.budget) * 100)?.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((campaign?.spent / campaign?.budget) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Campaign Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Erstellt:</span>
                <span className="text-foreground">
                  {new Date(campaign.createdAt)?.toLocaleDateString('de-DE')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Letztes Update:</span>
                <span className="text-foreground">
                  {new Date(campaign.lastModified)?.toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            iconName="MoreHorizontal"
          >
            Aktionen
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction('edit', campaign?.id)}
              iconName="Edit2"
              iconPosition="left"
            >
              Bearbeiten
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction(
                campaign?.status === 'active' ? 'pause' : 'activate', 
                campaign?.id
              )}
              iconName={campaign?.status === 'active' ? 'Pause' : 'Play'}
              iconPosition="left"
            >
              {campaign?.status === 'active' ? 'Pausieren' : 'Aktivieren'}
            </Button>
          </div>
        </div>

        {/* Expanded Actions */}
        {showActions && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipeAction('duplicate')}
                iconName="Copy"
                iconPosition="left"
                fullWidth
              >
                Duplizieren
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSwipeAction('delete')}
                iconName="Trash2"
                iconPosition="left"
                className="text-destructive hover:text-destructive"
                fullWidth
              >
                Löschen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignMobileCard;