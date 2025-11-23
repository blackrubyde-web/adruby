import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const CampaignTable = ({ campaigns, onBulkAction, onCampaignAction }) => {
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCampaigns(campaigns?.map(campaign => campaign?.id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  const handleSelectCampaign = (campaignId, checked) => {
    if (checked) {
      setSelectedCampaigns([...selectedCampaigns, campaignId]);
    } else {
      setSelectedCampaigns(selectedCampaigns?.filter(id => id !== campaignId));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedCampaigns = () => {
    if (!sortConfig?.key) return campaigns;

    return [...campaigns]?.sort((a, b) => {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];

      if (typeof aValue === 'string') {
        return sortConfig?.direction === 'asc' 
          ? aValue?.localeCompare(bValue)
          : bValue?.localeCompare(aValue);
      }

      if (typeof aValue === 'number') {
        return sortConfig?.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }

      return 0;
    });
  };

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

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-foreground" />
      : <Icon name="ArrowDown" size={14} className="text-foreground" />;
  };

  const handleBulkAction = (action) => {
    onBulkAction(action, selectedCampaigns);
    setSelectedCampaigns([]);
    setShowBulkActions(false);
  };

  const sortedCampaigns = getSortedCampaigns();
  const isAllSelected = selectedCampaigns?.length === campaigns?.length && campaigns?.length > 0;
  const isIndeterminate = selectedCampaigns?.length > 0 && selectedCampaigns?.length < campaigns?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedCampaigns?.length > 0 && (
        <div className="bg-primary/5 border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {selectedCampaigns?.length} Kampagne(n) ausgewählt
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('pause')}
                  iconName="Pause"
                  iconPosition="left"
                >
                  Pausieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  iconName="Play"
                  iconPosition="left"
                >
                  Aktivieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('duplicate')}
                  iconName="Copy"
                  iconPosition="left"
                >
                  Duplizieren
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCampaigns([])}
              iconName="X"
            >
              Auswahl aufheben
            </Button>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-6 py-4 text-left">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Kampagnenname</span>
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('budget')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Budget</span>
                  {getSortIcon('budget')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('clicks')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Klicks</span>
                  {getSortIcon('clicks')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('conversionRate')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                >
                  <span>Conversion Rate</span>
                  {getSortIcon('conversionRate')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-medium text-foreground">Status</span>
              </th>
              <th className="px-6 py-4 text-right">
                <span className="text-sm font-medium text-foreground">Aktionen</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedCampaigns?.map((campaign) => (
              <tr key={campaign?.id} className="hover:bg-accent/50 transition-smooth">
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedCampaigns?.includes(campaign?.id)}
                    onChange={(e) => handleSelectCampaign(campaign?.id, e?.target?.checked)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{campaign?.name}</span>
                    <span className="text-sm text-muted-foreground">{campaign?.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {formatCurrency(campaign?.budget)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(campaign?.spent)} ausgegeben
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-foreground">
                    {formatNumber(campaign?.clicks)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-foreground">
                    {formatPercentage(campaign?.conversionRate)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(campaign?.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCampaignAction('edit', campaign?.id)}
                      className="h-8 w-8"
                    >
                      <Icon name="Edit2" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCampaignAction('duplicate', campaign?.id)}
                      className="h-8 w-8"
                    >
                      <Icon name="Copy" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCampaignAction(
                        campaign?.status === 'active' ? 'pause' : 'activate', 
                        campaign?.id
                      )}
                      className="h-8 w-8"
                    >
                      <Icon name={campaign?.status === 'active' ? 'Pause' : 'Play'} size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCampaignAction('delete', campaign?.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {campaigns?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Keine Kampagnen gefunden
          </h3>
          <p className="text-muted-foreground mb-6">
            Versuchen Sie, Ihre Suchkriterien anzupassen oder eine neue Kampagne zu erstellen.
          </p>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Neue Kampagne erstellen
          </Button>
        </div>
      )}
    </div>
  );
};

export default CampaignTable;