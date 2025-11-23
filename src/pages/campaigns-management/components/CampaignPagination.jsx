import React from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const CampaignPagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const itemsPerPageOptions = [
    { value: 10, label: '10 pro Seite' },
    { value: 25, label: '25 pro Seite' },
    { value: 50, label: '50 pro Seite' },
    { value: 100, label: '100 pro Seite' }
  ];

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range?.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots?.push(1, '...');
    } else {
      rangeWithDots?.push(1);
    }

    rangeWithDots?.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots?.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots?.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items per page selector */}
        <div className="flex items-center space-x-3">
          <Select
            options={itemsPerPageOptions}
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            className="min-w-[140px]"
          />
          <span className="text-sm text-muted-foreground">
            {startItem}-{endItem} von {totalItems} Kampagnen
          </span>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            iconName="ChevronLeft"
            iconPosition="left"
            className="px-3"
          >
            Zurück
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getVisiblePages()?.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-sm text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    className="min-w-[40px] h-10"
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            iconName="ChevronRight"
            iconPosition="right"
            className="px-3"
          >
            Weiter
          </Button>
        </div>
      </div>
      {/* Mobile-friendly page info */}
      <div className="sm:hidden mt-3 pt-3 border-t border-border text-center">
        <span className="text-sm text-muted-foreground">
          Seite {currentPage} von {totalPages}
        </span>
      </div>
    </div>
  );
};

export default CampaignPagination;