import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { MiniSparkline } from './MiniSparkline';
import { Search, Play, Pause, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface CampaignRowInput {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  spend: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  roas?: number;
}

export type CampaignAction = 'view' | 'pause' | 'resume' | 'delete' | 'duplicate';
export type CampaignBulkAction = 'pause' | 'resume' | 'delete';

interface Campaign {
  id: string;
  name: string;
  date: string;
  time: string;
  progress: number;
  status: 'live' | 'paused' | 'scheduled' | 'completed';
  adSpend: string;
  impressions: string;
  clicks: string;
  conversions: string;
  roas: string;
  sparklineData: number[];
  tags: string[];
}

const campaigns: Campaign[] = [
  {
    id: '7305',
    name: 'Summer Sale Campaign',
    date: '15 Dec 2024',
    time: '10:32 PM',
    progress: 88,
    status: 'live',
    adSpend: '$2,500.00',
    impressions: '1.2M',
    clicks: '45K',
    conversions: '3.2K',
    roas: '4.8x',
    sparklineData: [580, 620, 590, 650, 680, 700, 720],
    tags: ['High ROI', 'Q4']
  },
  {
    id: '7304',
    name: 'Holiday Special',
    date: '14 Dec 2024',
    time: '03:24 PM',
    progress: 93,
    status: 'live',
    adSpend: '$3,200.00',
    impressions: '980K',
    clicks: '38K',
    conversions: '2.9K',
    roas: '3.9x',
    sparklineData: [520, 580, 600, 620, 590, 610, 630],
    tags: ['Testing']
  },
  {
    id: '7303',
    name: 'Black Friday Blast',
    date: '12 Dec 2024',
    time: '08:45 AM',
    progress: 100,
    status: 'completed',
    adSpend: '$1,800.00',
    impressions: '1.5M',
    clicks: '52K',
    conversions: '4.1K',
    roas: '5.2x',
    sparklineData: [600, 700, 800, 900, 950, 1000, 1100],
    tags: ['High ROI']
  },
  {
    id: '7302',
    name: 'Product Launch',
    date: '10 Dec 2024',
    time: '02:15 PM',
    progress: 75,
    status: 'paused',
    adSpend: '$2,100.00',
    impressions: '890K',
    clicks: '31K',
    conversions: '2.5K',
    roas: '3.5x',
    sparklineData: [450, 480, 460, 470, 490, 480, 475],
    tags: []
  },
  {
    id: '7301',
    name: 'New Year Preview',
    date: '20 Dec 2024',
    time: '12:00 AM',
    progress: 0,
    status: 'scheduled',
    adSpend: '$0.00',
    impressions: '0',
    clicks: '0',
    conversions: '0',
    roas: '0x',
    sparklineData: [],
    tags: ['Scheduled']
  },
];

export function CampaignsTable({
  campaigns: externalCampaigns,
  onAction,
  onBulkAction,
}: {
  campaigns?: CampaignRowInput[];
  onAction?: (campaignId: string, action: CampaignAction) => void | Promise<void>;
  onBulkAction?: (campaignIds: string[], action: CampaignBulkAction) => void | Promise<void>;
}) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const now = new Date();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  const formatCompact = (value: number) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

  const mappedExternal: Campaign[] = (externalCampaigns || []).map((row) => {
    const spend = row.spend ?? 0;
    const status = String(row.status || '').toLowerCase();
    const normalizedStatus =
      status === 'ended' ||
      status === 'completed' ||
      status === 'deleted' ||
      status === 'archived'
        ? 'completed'
        : status === 'active'
        ? 'live'
        : status === 'paused'
        ? 'paused'
        : status === 'scheduled'
        ? 'scheduled'
        : 'paused';
    return {
      id: row.id,
      name: row.name,
      date: now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      progress: Math.min(100, Math.max(0, Math.round((row.roas ?? 0) * 12))),
      status: normalizedStatus,
      adSpend: formatCurrency(spend),
      impressions: formatCompact(row.impressions ?? 0),
      clicks: formatCompact(row.clicks ?? 0),
      conversions: formatCompact(row.conversions ?? 0),
      roas: `${(row.roas ?? 0).toFixed(2)}x`,
      sparklineData: row.roas ? [row.roas * 0.8, row.roas, row.roas * 1.1] : [],
      tags: row.roas && row.roas >= 3 ? ['High ROI'] : [],
    };
  });

  const hasExternal = Array.isArray(externalCampaigns);
  const activeCampaigns = hasExternal ? mappedExternal : campaigns;

  const handleAction = (campaignId: string, action: CampaignAction) => {
    if (onAction) {
      void onAction(campaignId, action);
      return;
    }
    toast.info('Öffne die Campaigns-Seite für Aktionen.');
  };

  const handleBulkAction = (action: CampaignBulkAction) => {
    if (!selectedCampaigns.length) return;
    if (onBulkAction) {
      void onBulkAction(selectedCampaigns, action);
      return;
    }
    toast.info('Öffne die Campaigns-Seite für Bulk-Aktionen.');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCampaigns(activeCampaigns.map(c => c.id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  const handleSelectCampaign = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCampaigns([...selectedCampaigns, id]);
    } else {
      setSelectedCampaigns(selectedCampaigns.filter(cid => cid !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      live: 'bg-green-500/20 text-green-500 border-green-500/50',
      paused: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      scheduled: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
      completed: 'bg-gray-500/20 text-gray-500 border-gray-500/50'
    };
    
    const icons = {
      live: '● ',
      paused: '❚❚ ',
      scheduled: '◷ ',
      completed: '✓ '
    };

    return (
      <Badge className={`${styles[status as keyof typeof styles]} border`}>
        {icons[status as keyof typeof icons]}{status.toUpperCase()}
      </Badge>
    );
  };

  const filteredCampaigns = activeCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.id.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-card rounded-xl p-0 border border-border">
      <div className="p-3 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-foreground mb-1 text-base md:text-lg">Campaign Management</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Showing {filteredCampaigns.length} of {activeCampaigns.length} campaigns
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-3 md:px-6 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 transition-colors text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 md:px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 transition-colors text-sm w-full md:w-auto"
        >
          <option value="all">All Status</option>
          <option value="live">Live</option>
          <option value="paused">Paused</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCampaigns.length > 0 && (
        <div className="mx-3 md:mx-6 mb-4 p-3 md:p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <span className="text-xs md:text-sm text-foreground font-medium">
            {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-card hidden md:flex"
              onClick={() => handleBulkAction('resume')}
            >
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-card hidden md:flex"
              onClick={() => handleBulkAction('pause')}
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-card text-red-500 hover:text-red-600"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table with horizontal scroll on mobile - DESKTOP ONLY */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted">
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.length === activeCampaigns.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                </TableHead>
                <TableHead className="text-muted-foreground">Campaign</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Trend</TableHead>
                <TableHead className="text-muted-foreground">Progress</TableHead>
                <TableHead className="text-muted-foreground">Ad Spend</TableHead>
                <TableHead className="text-muted-foreground">Impressions</TableHead>
                <TableHead className="text-muted-foreground">Clicks</TableHead>
                <TableHead className="text-muted-foreground">Conv.</TableHead>
                <TableHead className="text-muted-foreground">ROAS</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id} className="border-border hover:bg-muted group">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={(e) => handleSelectCampaign(campaign.id, e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground font-medium">#{campaign.id}</div>
                    <div className="text-sm text-muted-foreground">{campaign.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {campaign.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(campaign.status)}
                    <div className="text-xs text-muted-foreground mt-1">{campaign.date}</div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      {campaign.sparklineData.length > 0 && (
                        <MiniSparkline data={campaign.sparklineData} color="#3b82f6" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={campaign.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground mt-1">{campaign.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">{campaign.adSpend}</TableCell>
                  <TableCell className="text-blue-500">{campaign.impressions}</TableCell>
                  <TableCell className="text-green-500">{campaign.clicks}</TableCell>
                  <TableCell className="text-orange-500">{campaign.conversions}</TableCell>
                  <TableCell className="text-purple-500 font-medium">{campaign.roas}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-card border-border text-foreground hover:bg-muted"
                        onClick={() => handleAction(campaign.id, 'view')}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => handleAction(campaign.id, 'view')}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards View - MOBILE ONLY */}
      <div className="md:hidden space-y-3">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-xl border border-border p-4 bg-card w-full min-w-0">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3 min-w-0">
              <input
                type="checkbox"
                checked={selectedCampaigns.includes(campaign.id)}
                onChange={(e) => handleSelectCampaign(campaign.id, e.target.checked)}
                className="w-4 h-4 rounded border-border mt-1 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">#{campaign.id}</span>
                  {getStatusBadge(campaign.status)}
                </div>
                <h4 className="font-semibold text-foreground truncate">{campaign.name}</h4>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {campaign.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-semibold text-foreground">{campaign.progress}%</span>
              </div>
              <Progress value={campaign.progress} className="h-2" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <div className="text-muted-foreground text-xs">Spend</div>
                <div className="text-foreground font-medium tabular-nums truncate">{campaign.adSpend}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">ROAS</div>
                <div className="text-purple-500 font-medium tabular-nums truncate">{campaign.roas}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Impressions</div>
                <div className="text-blue-500 tabular-nums truncate">{campaign.impressions}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Clicks</div>
                <div className="text-green-500 tabular-nums truncate">{campaign.clicks}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Conversions</div>
                <div className="text-orange-500 tabular-nums truncate">{campaign.conversions}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Date</div>
                <div className="text-foreground text-xs truncate">{campaign.date}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-card border-border"
                onClick={() => handleAction(campaign.id, 'view')}
              >
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-card border-border"
                onClick={() => {
                  if (campaign.status === 'live') {
                    handleAction(campaign.id, 'pause');
                  } else if (campaign.status === 'paused') {
                    handleAction(campaign.id, 'resume');
                  } else {
                    handleAction(campaign.id, 'view');
                  }
                }}
              >
                {campaign.status === 'live' ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                ) : campaign.status === 'paused' ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Resume
                  </>
                ) : (
                  <>View</>
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleAction(campaign.id, 'view')}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
