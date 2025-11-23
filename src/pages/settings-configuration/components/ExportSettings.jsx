import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ExportSettings = () => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportQuality, setExportQuality] = useState('high');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState(null);

  const formatOptions = [
    { value: 'pdf', label: 'PDF-Dokument', description: 'Hochwertige PDF-Datei' },
    { value: 'png', label: 'PNG-Bild', description: 'Hochauflösendes Rasterbild' },
    { value: 'svg', label: 'SVG-Vektor', description: 'Skalierbare Vektorgrafik' },
    { value: 'jpg', label: 'JPEG-Bild', description: 'Komprimiertes Rasterbild' }
  ];

  const qualityOptions = [
    { value: 'low', label: 'Niedrig (72 DPI)', description: 'Für Web-Anzeige optimiert' },
    { value: 'medium', label: 'Mittel (150 DPI)', description: 'Ausgewogene Qualität' },
    { value: 'high', label: 'Hoch (300 DPI)', description: 'Für Druck optimiert' },
    { value: 'ultra', label: 'Ultra (600 DPI)', description: 'Maximale Qualität' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const exportData = {
      format: exportFormat,
      quality: exportQuality,
      timestamp: new Date()?.toISOString(),
      filename: `blackruby-design-${Date.now()}.${exportFormat}`
    };
    
    setLastExport(exportData);
    setIsExporting(false);
    
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#';
    link.download = exportData?.filename;
    link?.click();
  };

  const exportHistory = [
    {
      id: 1,
      filename: 'campaign-design-20241013.pdf',
      format: 'PDF',
      size: '2.4 MB',
      date: '13.10.2024, 15:30',
      status: 'completed'
    },
    {
      id: 2,
      filename: 'dashboard-export-20241012.png',
      format: 'PNG',
      size: '1.8 MB',
      date: '12.10.2024, 09:15',
      status: 'completed'
    },
    {
      id: 3,
      filename: 'analytics-report-20241011.svg',
      format: 'SVG',
      size: '456 KB',
      date: '11.10.2024, 14:22',
      status: 'completed'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Download" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Design-Export</h3>
          <p className="text-sm text-muted-foreground">Exportieren Sie Ihre Designs in verschiedenen Formaten</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Export Format Selection */}
        <div>
          <Select
            label="Exportformat"
            description="Wählen Sie das gewünschte Dateiformat"
            options={formatOptions}
            value={exportFormat}
            onChange={setExportFormat}
            className="mb-4"
          />
        </div>

        {/* Quality Selection */}
        <div>
          <Select
            label="Exportqualität"
            description="Bestimmen Sie die Auflösung und Qualität"
            options={qualityOptions}
            value={exportQuality}
            onChange={setExportQuality}
            className="mb-4"
          />
        </div>

        {/* Export Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="default"
            onClick={handleExport}
            loading={isExporting}
            iconName="Download"
            iconPosition="left"
            className="flex-1"
          >
            {isExporting ? 'Exportiere...' : 'Design exportieren'}
          </Button>
          
          <Button
            variant="outline"
            iconName="Settings"
            iconPosition="left"
            className="sm:w-auto"
          >
            Erweiterte Optionen
          </Button>
        </div>

        {/* Last Export Info */}
        {lastExport && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <div>
                <p className="text-sm font-medium text-foreground">Export erfolgreich</p>
                <p className="text-sm text-muted-foreground">
                  {lastExport?.filename} wurde heruntergeladen
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Export History */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-4">Letzte Exports</h4>
          <div className="space-y-3">
            {exportHistory?.map((item) => (
              <div
                key={item?.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <Icon name="FileText" size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item?.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {item?.format} • {item?.size} • {item?.date}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Download"
                  className="h-8 w-8 p-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Export Tips */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Lightbulb" size={16} className="text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Export-Tipps</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PDF für professionelle Präsentationen</li>
                <li>• PNG für Web-Anwendungen mit Transparenz</li>
                <li>• SVG für skalierbare Vektorgrafiken</li>
                <li>• Hohe Qualität für Druckzwecke verwenden</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSettings;