import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import CampaignFilters from './components/CampaignFilters';
import CampaignTable from './components/CampaignTable';
import CampaignPagination from './components/CampaignPagination';
import CampaignMobileCard from './components/CampaignMobileCard';
import ConfirmationModal from './components/ConfirmationModal';

const CampaignsManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    campaignId: null,
    campaignName: ''
  });
  const [isMobile, setIsMobile] = useState(false);

  // Mock campaign data
  const mockCampaigns = [
    {
      id: 1,
      name: "Holiday Season Campaign 2024",
      type: "Display Advertising",
      budget: 15000,
      spent: 12750,
      clicks: 45230,
      conversionRate: 3.45,
      status: "active",
      createdAt: "2024-10-01T10:00:00Z",
      lastModified: "2024-10-13T14:30:00Z"
    },
    {
      id: 2,
      name: "Black Friday Mega Sale",
      type: "Social Media Ads",
      budget: 25000,
      spent: 18900,
      clicks: 78450,
      conversionRate: 4.12,
      status: "active",
      createdAt: "2024-09-15T09:00:00Z",
      lastModified: "2024-10-12T16:45:00Z"
    },
    {
      id: 3,
      name: "Summer Product Launch",
      type: "Search Engine Marketing",
      budget: 8500,
      spent: 8500,
      clicks: 23100,
      conversionRate: 2.89,
      status: "stopped",
      createdAt: "2024-06-01T08:00:00Z",
      lastModified: "2024-08-31T17:00:00Z"
    },
    {
      id: 4,
      name: "Brand Awareness Q4",
      type: "Video Advertising",
      budget: 12000,
      spent: 6800,
      clicks: 34560,
      conversionRate: 1.95,
      status: "paused",
      createdAt: "2024-10-05T11:30:00Z",
      lastModified: "2024-10-10T13:20:00Z"
    },
    {
      id: 5,
      name: "Retargeting Campaign",
      type: "Display Advertising",
      budget: 5000,
      spent: 3200,
      clicks: 15670,
      conversionRate: 5.67,
      status: "active",
      createdAt: "2024-09-20T14:00:00Z",
      lastModified: "2024-10-13T10:15:00Z"
    },
    {
      id: 6,
      name: "Mobile App Promotion",
      type: "Mobile Advertising",
      budget: 18000,
      spent: 14500,
      clicks: 56780,
      conversionRate: 2.34,
      status: "active",
      createdAt: "2024-08-15T12:00:00Z",
      lastModified: "2024-10-11T15:30:00Z"
    },
    {
      id: 7,
      name: "Email Marketing Integration",
      type: "Email Campaign",
      budget: 3500,
      spent: 2100,
      clicks: 8900,
      conversionRate: 6.78,
      status: "paused",
      createdAt: "2024-09-01T10:30:00Z",
      lastModified: "2024-09-25T14:45:00Z"
    },
    {
      id: 8,
      name: "Influencer Collaboration",
      type: "Influencer Marketing",
      budget: 22000,
      spent: 19800,
      clicks: 67890,
      conversionRate: 3.89,
      status: "active",
      createdAt: "2024-07-10T09:15:00Z",
      lastModified: "2024-10-12T11:20:00Z"
    }
  ];

  useEffect(() => {
    setCampaigns(mockCampaigns);
    setFilteredCampaigns(mockCampaigns);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFiltersChange = (filters) => {
    let filtered = campaigns;

    // Search filter
    if (filters?.search) {
      filtered = filtered?.filter(campaign =>
        campaign?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        campaign?.type?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    // Status filter
    if (filters?.status) {
      filtered = filtered?.filter(campaign => campaign?.status === filters?.status);
    }

    // Period filter (simplified for demo)
    if (filters?.period) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters?.period) {
        case 'today':
          filterDate?.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate?.setDate(now?.getDate() - 7);
          break;
        case 'month':
          filterDate?.setMonth(now?.getMonth() - 1);
          break;
        case 'quarter':
          filterDate?.setMonth(now?.getMonth() - 3);
          break;
        case 'year':
          filterDate?.setFullYear(now?.getFullYear() - 1);
          break;
        default:
          break;
      }

      if (filters?.period !== '') {
        filtered = filtered?.filter(campaign => 
          new Date(campaign.lastModified) >= filterDate
        );
      }
    }

    setFilteredCampaigns(filtered);
    setCurrentPage(1);
  };

  const handleBulkAction = (action, campaignIds) => {
    const campaignNames = campaigns?.filter(c => campaignIds?.includes(c?.id))?.map(c => c?.name)?.join(', ');

    const actionMessages = {
      pause: {
        title: 'Kampagnen pausieren',
        message: `Möchten Sie ${campaignIds?.length} Kampagne(n) pausieren?`,
        confirmText: 'Pausieren'
      },
      activate: {
        title: 'Kampagnen aktivieren',
        message: `Möchten Sie ${campaignIds?.length} Kampagne(n) aktivieren?`,
        confirmText: 'Aktivieren'
      },
      duplicate: {
        title: 'Kampagnen duplizieren',
        message: `Möchten Sie ${campaignIds?.length} Kampagne(n) duplizieren?`,
        confirmText: 'Duplizieren'
      }
    };

    setConfirmModal({
      isOpen: true,
      type: action,
      title: actionMessages?.[action]?.title,
      message: actionMessages?.[action]?.message,
      confirmText: actionMessages?.[action]?.confirmText,
      campaignId: campaignIds,
      campaignName: campaignNames
    });
  };

  const handleCampaignAction = (action, campaignId) => {
    const campaign = campaigns?.find(c => c?.id === campaignId);
    
    const actionMessages = {
      edit: () => {
        // Navigate to edit page (mock)
        console.log('Navigating to edit campaign:', campaignId);
      },
      duplicate: {
        title: 'Kampagne duplizieren',
        message: 'Möchten Sie diese Kampagne duplizieren?',
        confirmText: 'Duplizieren'
      },
      pause: {
        title: 'Kampagne pausieren',
        message: 'Möchten Sie diese Kampagne pausieren?',
        confirmText: 'Pausieren'
      },
      activate: {
        title: 'Kampagne aktivieren',
        message: 'Möchten Sie diese Kampagne aktivieren?',
        confirmText: 'Aktivieren'
      },
      delete: {
        title: 'Kampagne löschen',
        message: 'Sind Sie sicher, dass Sie diese Kampagne löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        confirmText: 'Löschen'
      }
    };

    if (action === 'edit') {
      actionMessages?.edit();
      return;
    }

    const config = actionMessages?.[action];
    setConfirmModal({
      isOpen: true,
      type: action,
      title: config?.title,
      message: config?.message,
      confirmText: config?.confirmText,
      campaignId: campaignId,
      campaignName: campaign?.name || ''
    });
  };

  const handleConfirmAction = () => {
    const { type, campaignId } = confirmModal;
    
    if (Array.isArray(campaignId)) {
      // Bulk action
      setCampaigns(prevCampaigns => 
        prevCampaigns?.map(campaign => {
          if (campaignId?.includes(campaign?.id)) {
            switch (type) {
              case 'pause':
                return { ...campaign, status: 'paused' };
              case 'activate':
                return { ...campaign, status: 'active' };
              case 'duplicate':
                // In real app, this would create new campaigns
                return campaign;
              default:
                return campaign;
            }
          }
          return campaign;
        })
      );
    } else {
      // Single campaign action
      setCampaigns(prevCampaigns => {
        switch (type) {
          case 'delete':
            return prevCampaigns?.filter(c => c?.id !== campaignId);
          case 'pause':
            return prevCampaigns?.map(c => 
              c?.id === campaignId ? { ...c, status: 'paused' } : c
            );
          case 'activate':
            return prevCampaigns?.map(c => 
              c?.id === campaignId ? { ...c, status: 'active' } : c
            );
          case 'duplicate':
            const original = prevCampaigns?.find(c => c?.id === campaignId);
            if (original) {
              const duplicate = {
                ...original,
                id: Math.max(...prevCampaigns?.map(c => c?.id)) + 1,
                name: `${original?.name} (Kopie)`,
                spent: 0,
                clicks: 0,
                status: 'paused',
                createdAt: new Date()?.toISOString(),
                lastModified: new Date()?.toISOString()
              };
              return [...prevCampaigns, duplicate];
            }
            return prevCampaigns;
          default:
            return prevCampaigns;
        }
      });
    }

    // Update filtered campaigns
    handleFiltersChange({ search: '', status: '', period: '' });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleCampaignSelect = (campaignId, isSelected) => {
    if (isSelected) {
      setSelectedCampaigns([...selectedCampaigns, campaignId]);
    } else {
      setSelectedCampaigns(selectedCampaigns?.filter(id => id !== campaignId));
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = filteredCampaigns?.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isNavCollapsed={isNavCollapsed}
        setIsNavCollapsed={setIsNavCollapsed}
      />
      <Header onMenuToggle={() => setSidebarOpen(true)} isNavCollapsed={isNavCollapsed} />
        
      <main className={`pt-16 transition-all duration-300 ${isNavCollapsed ? "lg:ml-[72px]" : "lg:ml-60"}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6"
        >
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Kampagnen-Management
              </h1>
              <p className="text-muted-foreground">
                Verwalten Sie alle Ihre Marketingkampagnen an einem Ort mit erweiterten Filter- und Bulk-Operationen.
              </p>
            </div>

            {/* Filters */}
            <CampaignFilters
              onFiltersChange={handleFiltersChange}
              totalCampaigns={campaigns?.length}
              filteredCount={filteredCampaigns?.length}
            />

            {/* Campaign List */}
            {isMobile ? (
              <div className="space-y-4">
                {currentCampaigns?.map((campaign) => (
                  <motion.div
                    key={campaign?.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CampaignMobileCard
                      campaign={campaign}
                      isSelected={selectedCampaigns?.includes(campaign?.id)}
                      onSelect={handleCampaignSelect}
                      onAction={handleCampaignAction}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <CampaignTable
                  campaigns={currentCampaigns}
                  onBulkAction={handleBulkAction}
                  onCampaignAction={handleCampaignAction}
                />
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <CampaignPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredCampaigns?.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </motion.div>
            )}
          </motion.div>
        </main>
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal?.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          onConfirm={handleConfirmAction}
          title={confirmModal?.title}
          message={confirmModal?.message}
          confirmText={confirmModal?.confirmText}
          type={confirmModal?.type}
          campaignName={confirmModal?.campaignName}
        />
    </div>
  );
};

export default CampaignsManagement;
