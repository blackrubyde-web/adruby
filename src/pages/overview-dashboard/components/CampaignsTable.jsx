import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import StatusBadge from './StatusBadge';

const CampaignsTable = () => {
  const navigate = useNavigate();

  const campaigns = [
    {
      id: 1,
      name: "Herbst Sale 2024",
      budget: "2.500,00",
      clicks: "1.234",
      conversionRate: "3.2%",
      status: "Aktiv",
      lastModified: "13.10.2024"
    },
    {
      id: 2,
      name: "Black Friday Vorbereitung",
      budget: "5.000,00",
      clicks: "2.567",
      conversionRate: "4.1%",
      status: "Aktiv",
      lastModified: "12.10.2024"
    },
    {
      id: 3,
      name: "Weihnachts-Kollektion",
      budget: "3.200,00",
      clicks: "987",
      conversionRate: "2.8%",
      status: "Pausiert",
      lastModified: "11.10.2024"
    },
    {
      id: 4,
      name: "Sommer Clearance",
      budget: "1.800,00",
      clicks: "456",
      conversionRate: "1.9%",
      status: "Gestoppt",
      lastModified: "10.10.2024"
    },
    {
      id: 5,
      name: "Neue Produktlinie",
      budget: "4.100,00",
      clicks: "1.789",
      conversionRate: "3.7%",
      status: "Aktiv",
      lastModified: "09.10.2024"
    }
  ];

  const handleViewCampaigns = () => {
    navigate('/campaigns-management');
  };

  const handleQuickAction = (campaignId, action) => {
    console.log(`${action} action for campaign ${campaignId}`);
    // Quick action logic would go here
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-minimal">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Letzte Kampagnen</h2>
          <p className="text-sm text-muted-foreground">Übersicht der aktuellen Kampagnen-Performance</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleViewCampaigns}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Alle anzeigen
        </Button>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Kampagnen-Name
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Budget (EUR)
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Klicks
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Conversion Rate
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody>
            {campaigns?.map((campaign) => (
              <tr key={campaign?.id} className="border-b border-border last:border-b-0 hover:bg-accent transition-colors">
                <td className="py-4 px-6">
                  <div>
                    <p className="font-medium text-foreground">{campaign?.name}</p>
                    <p className="text-sm text-muted-foreground">Zuletzt bearbeitet: {campaign?.lastModified}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-medium text-foreground">€{campaign?.budget}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-foreground">{campaign?.clicks}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-medium text-foreground">{campaign?.conversionRate}</span>
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={campaign?.status} />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuickAction(campaign?.id, 'edit')}
                      className="h-8 w-8"
                    >
                      <Icon name="Edit2" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuickAction(campaign?.id, 'view')}
                      className="h-8 w-8"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-4">
        {campaigns?.map((campaign) => (
          <div key={campaign?.id} className="bg-accent rounded-lg p-4 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{campaign?.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{campaign?.lastModified}</p>
              </div>
              <StatusBadge status={campaign?.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-medium text-foreground">€{campaign?.budget}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Klicks</p>
                <p className="font-medium text-foreground">{campaign?.clicks}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="font-medium text-foreground">{campaign?.conversionRate}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAction(campaign?.id, 'edit')}
                iconName="Edit2"
                iconPosition="left"
              >
                Bearbeiten
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAction(campaign?.id, 'view')}
                iconName="Eye"
                iconPosition="left"
              >
                Anzeigen
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignsTable;