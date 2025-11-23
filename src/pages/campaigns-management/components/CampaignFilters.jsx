import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CampaignFilters = ({ onFiltersChange, totalCampaigns, filteredCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const statusOptions = [
    { value: '', label: 'Alle Status' },
    { value: 'active', label: 'Aktiv' },
    { value: 'paused', label: 'Pausiert' },
    { value: 'stopped', label: 'Gestoppt' }
  ];

  const periodOptions = [
    { value: '', label: 'Alle Zeiträume' },
    { value: 'today', label: 'Heute' },
    { value: 'week', label: 'Diese Woche' },
    { value: 'month', label: 'Dieser Monat' },
    { value: 'quarter', label: 'Dieses Quartal' },
    { value: 'year', label: 'Dieses Jahr' }
  ];

  const searchSuggestions = [
    'Holiday Campaign',
    'Black Friday',
    'Summer Sale',
    'Product Launch',
    'Brand Awareness',
    'Retargeting'
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);
    setShowSuggestions(value?.length > 0);
    
    onFiltersChange({
      search: value,
      status: selectedStatus,
      period: selectedPeriod
    });
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    onFiltersChange({
      search: searchTerm,
      status: value,
      period: selectedPeriod
    });
  };

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
    onFiltersChange({
      search: searchTerm,
      status: selectedStatus,
      period: value
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPeriod('');
    setShowSuggestions(false);
    
    onFiltersChange({
      search: '',
      status: '',
      period: ''
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    
    onFiltersChange({
      search: suggestion,
      status: selectedStatus,
      period: selectedPeriod
    });
  };

  const hasActiveFilters = searchTerm || selectedStatus || selectedPeriod;

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Section */}
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <Input
              type="search"
              placeholder="Kampagnen durchsuchen..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-10"
            />
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchTerm('');
                  setShowSuggestions(false);
                  onFiltersChange({
                    search: '',
                    status: selectedStatus,
                    period: selectedPeriod
                  });
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              >
                <Icon name="X" size={14} />
              </Button>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50">
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2 px-2">Vorschläge</p>
                {searchSuggestions?.filter(suggestion => 
                    suggestion?.toLowerCase()?.includes(searchTerm?.toLowerCase())
                  )?.slice(0, 5)?.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded transition-smooth flex items-center space-x-2"
                    >
                      <Icon name="Search" size={14} className="text-muted-foreground" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={handleStatusChange}
            placeholder="Status filtern"
            className="min-w-[140px]"
          />

          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={handlePeriodChange}
            placeholder="Zeitraum wählen"
            className="min-w-[160px]"
          />

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              iconName="X"
              iconPosition="left"
              iconSize={16}
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>
      </div>
      {/* Results Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>
            {filteredCount} von {totalCampaigns} Kampagnen
          </span>
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <Icon name="Filter" size={14} />
              <span>Filter aktiv</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
            Exportieren
          </Button>
          <Button variant="default" size="sm" iconName="Plus" iconPosition="left">
            Neue Kampagne
          </Button>
        </div>
      </div>
      {/* Click outside handler for suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default CampaignFilters;