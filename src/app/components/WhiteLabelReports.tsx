import { useState } from 'react';
import { FileText, Download, Send, Eye, Calendar, Settings, Palette, Image as ImageIcon, Check, Mail, Link2, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  format: 'pdf' | 'excel' | 'ppt';
  lastUsed?: string;
}

interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  recipients: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  nextSend: string;
  isActive: boolean;
}

export function WhiteLabelReports() {
  const [brandingSettings, setBrandingSettings] = useState({
    companyName: 'Your Agency Name',
    logo: null as string | null,
    primaryColor: '#C80000',
    secondaryColor: '#000000',
    reportFooter: '© 2024 Your Agency. All rights reserved.'
  });

  const [templates, _setTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Executive Summary Report',
      description: 'High-level overview for C-suite executives',
      sections: ['Key Metrics', 'Campaign Performance', 'ROI Analysis', 'Recommendations'],
      format: 'pdf',
      lastUsed: '2024-12-15'
    },
    {
      id: '2',
      name: 'Detailed Analytics Report',
      description: 'Comprehensive campaign analysis',
      sections: ['Overview', 'Traffic Sources', 'Conversions', 'Demographics', 'A/B Tests', 'Budget', 'Insights'],
      format: 'pdf',
      lastUsed: '2024-12-14'
    },
    {
      id: '3',
      name: 'Monthly Performance Dashboard',
      description: 'Monthly KPI tracking',
      sections: ['Monthly Highlights', 'Campaign Comparison', 'Trends', 'Next Steps'],
      format: 'ppt',
      lastUsed: '2024-12-10'
    },
    {
      id: '4',
      name: 'ROI Analysis Sheet',
      description: 'Detailed financial breakdown',
      sections: ['Spend Overview', 'Revenue Attribution', 'ROAS by Campaign', 'Cost Analysis'],
      format: 'excel',
      lastUsed: '2024-12-12'
    }
  ]);

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      templateId: '1',
      templateName: 'Executive Summary Report',
      recipients: ['client@example.com', 'marketing@client.com'],
      frequency: 'weekly',
      nextSend: '2024-12-22',
      isActive: true
    },
    {
      id: '2',
      templateId: '2',
      templateName: 'Detailed Analytics Report',
      recipients: ['team@client.com'],
      frequency: 'monthly',
      nextSend: '2025-01-01',
      isActive: true
    }
  ]);

  const [clientPortalUrl, _setClientPortalUrl] = useState('https://reports.youragency.com/client-123');

  const handleGenerateReport = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    toast.success(`🎉 Generating "${template?.name}"...`);
    
    setTimeout(() => {
      toast.success(`📄 Report ready for download!`);
    }, 2000);
  };

  const handleSendReport = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    toast.success(`📧 "${template?.name}" sent to client!`);
  };

  const handleToggleSchedule = (id: string) => {
    setScheduledReports(prev => prev.map(report =>
      report.id === id ? { ...report, isActive: !report.isActive } : report
    ));
    toast.success('Schedule updated');
  };

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(clientPortalUrl);
    toast.success('📋 Portal link copied to clipboard!');
  };

  const formatIcons = {
    pdf: FileText,
    excel: FileText,
    ppt: FileText
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">White Label Reports</h2>
        <p className="text-muted-foreground">
          Create branded reports and client portals
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Report Templates */}
        <div className="col-span-2 space-y-6">
          {/* Branding Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Branding Settings</h3>
                <p className="text-sm text-muted-foreground">Customize your white-label reports</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground mb-2">Company/Agency Name</Label>
                <Input
                  value={brandingSettings.companyName}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground mb-2">Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={brandingSettings.primaryColor}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-16 h-10 p-1 bg-input border-border"
                  />
                  <Input
                    value={brandingSettings.primaryColor}
                    onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 bg-input border-border text-foreground"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-foreground mb-2">Report Footer Text</Label>
                <Input
                  value={brandingSettings.reportFooter}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, reportFooter: e.target.value }))}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-foreground mb-2">Company Logo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Click to upload logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or SVG (max. 2MB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Templates */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Report Templates</h3>
            
            <div className="space-y-3">
              {templates.map((template) => {
                const FormatIcon = formatIcons[template.format];
                return (
                  <div
                    key={template.id}
                    className="border border-border rounded-xl p-4 hover:border-primary transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FormatIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          
                          {/* Sections */}
                          <div className="flex flex-wrap gap-1">
                            {template.sections.slice(0, 3).map((section) => (
                              <span key={section} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                                {section}
                              </span>
                            ))}
                            {template.sections.length > 3 && (
                              <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                                +{template.sections.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Format Badge */}
                      <div className="px-2 py-1 bg-muted rounded text-xs font-medium text-foreground uppercase">
                        {template.format}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        onClick={() => handleGenerateReport(template.id)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                      <Button
                        onClick={() => handleSendReport(template.id)}
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-muted flex-1"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-muted"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>

                    {template.lastUsed && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Last used: {template.lastUsed}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Scheduled Reports</h3>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                New Schedule
              </Button>
            </div>

            <div className="space-y-3">
              {scheduledReports.map((report) => (
                <div
                  key={report.id}
                  className={`border rounded-lg p-4 transition-all ${
                    report.isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{report.templateName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          report.isActive
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {report.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="capitalize">{report.frequency}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{report.recipients.length} recipients</span>
                        </div>
                        <span>Next: {report.nextSend}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleToggleSchedule(report.id)}
                      size="sm"
                      variant="outline"
                      className={report.isActive ? 'border-orange-500 text-orange-500' : 'border-green-500 text-green-500'}
                    >
                      {report.isActive ? 'Pause' : 'Activate'}
                    </Button>
                  </div>

                  {/* Recipients */}
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
                    {report.recipients.map((email) => (
                      <span key={email} className="px-2 py-0.5 bg-muted rounded text-xs text-foreground">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Client Portal & Stats */}
        <div className="space-y-6">
          {/* Client Portal */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Client Portal</h3>
                <p className="text-xs text-muted-foreground">Share live dashboard</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2">Portal URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={clientPortalUrl}
                    readOnly
                    className="bg-input border-border text-foreground text-sm flex-1"
                  />
                  <Button
                    onClick={handleCopyPortalLink}
                    size="sm"
                    variant="outline"
                    className="border-border"
                  >
                    <Link2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-lg border border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Portal Status</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>127 views this month</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Last accessed: 2 hours ago</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Portal Features</Label>
                <div className="space-y-2">
                  {[
                    'Real-time metrics',
                    'Campaign performance',
                    'Custom date ranges',
                    'Export reports',
                    'White-label branding'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Settings className="w-4 h-4 mr-2" />
                Configure Portal
              </Button>
            </div>
          </div>

          {/* Report Stats */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4">Report Statistics</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-transparent rounded-lg border border-border/30">
                <div className="text-2xl font-bold text-foreground mb-1">24</div>
                <div className="text-xs text-muted-foreground">Reports Generated</div>
              </div>

              <div className="p-3 bg-gradient-to-br from-green-500/10 to-transparent rounded-lg border border-border/30">
                <div className="text-2xl font-bold text-foreground mb-1">18</div>
                <div className="text-xs text-muted-foreground">Reports Sent</div>
              </div>

              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-transparent rounded-lg border border-border/30">
                <div className="text-2xl font-bold text-foreground mb-1">5</div>
                <div className="text-xs text-muted-foreground">Active Schedules</div>
              </div>

              <div className="p-3 bg-gradient-to-br from-orange-500/10 to-transparent rounded-lg border border-border/30">
                <div className="text-2xl font-bold text-foreground mb-1">92%</div>
                <div className="text-xs text-muted-foreground">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4">Recent Activity</h3>
            
            <div className="space-y-3">
              {[
                { action: 'Report sent', detail: 'Executive Summary', time: '2 hours ago' },
                { action: 'Report generated', detail: 'Monthly Dashboard', time: '5 hours ago' },
                { action: 'Portal accessed', detail: 'Client viewed dashboard', time: '1 day ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                  <div className="flex-1">
                    <div className="text-foreground font-medium">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">{activity.detail}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
