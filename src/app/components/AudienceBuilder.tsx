import { useState } from 'react';
import { Users, Plus, Target, MapPin, Heart, Briefcase, Calendar, DollarSign, Smartphone, X, Sparkles, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface AudienceSegment {
  id: string;
  type: 'demographics' | 'interests' | 'behaviors' | 'custom';
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
    value: string | string[];
  }[];
}

interface SavedAudience {
  id: string;
  name: string;
  description: string;
  size: number;
  segments: AudienceSegment[];
  createdAt: string;
  lastUsed?: string;
  performance?: {
    campaigns: number;
    avgCTR: number;
    avgROAS: number;
  };
}

export function AudienceBuilder() {
  const [audienceName, setAudienceName] = useState('');
  const [audienceDescription, setAudienceDescription] = useState('');
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [estimatedSize, setEstimatedSize] = useState(2400000);

  const [savedAudiences, setSavedAudiences] = useState<SavedAudience[]>([
    {
      id: '1',
      name: 'High-Value Fitness Enthusiasts',
      description: 'Age 25-45, interested in fitness, high income',
      size: 1200000,
      segments: [],
      createdAt: '2024-12-10',
      lastUsed: '2024-12-15',
      performance: {
        campaigns: 5,
        avgCTR: 4.2,
        avgROAS: 7.8
      }
    },
    {
      id: '2',
      name: 'Tech-Savvy Millennials',
      description: 'Age 28-40, works in tech, early adopters',
      size: 890000,
      segments: [],
      createdAt: '2024-12-08',
      lastUsed: '2024-12-14',
      performance: {
        campaigns: 3,
        avgCTR: 5.1,
        avgROAS: 6.5
      }
    },
    {
      id: '3',
      name: 'Luxury Shoppers',
      description: 'High income, luxury brand interests',
      size: 450000,
      segments: [],
      createdAt: '2024-12-05',
      performance: {
        campaigns: 2,
        avgCTR: 3.8,
        avgROAS: 12.3
      }
    }
  ]);

  const demographicOptions = [
    { field: 'age', label: 'Age Range', icon: Calendar, options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
    { field: 'gender', label: 'Gender', icon: Users, options: ['All', 'Male', 'Female', 'Non-binary'] },
    { field: 'location', label: 'Location', icon: MapPin, options: ['Germany', 'Austria', 'Switzerland', 'USA', 'UK'] },
    { field: 'income', label: 'Income Level', icon: DollarSign, options: ['Low', 'Medium', 'High', 'Very High'] },
  ];

  const interestOptions = [
    { field: 'fitness', label: 'Fitness & Wellness', icon: Heart },
    { field: 'tech', label: 'Technology', icon: Smartphone },
    { field: 'business', label: 'Business & Finance', icon: Briefcase },
    { field: 'travel', label: 'Travel', icon: MapPin },
  ];

  const behaviorOptions = [
    { field: 'online_shoppers', label: 'Online Shoppers' },
    { field: 'engaged_shoppers', label: 'Engaged Shoppers' },
    { field: 'frequent_travelers', label: 'Frequent Travelers' },
    { field: 'early_adopters', label: 'Early Technology Adopters' },
  ];

  const [activeTab, setActiveTab] = useState<'demographics' | 'interests' | 'behaviors' | 'saved'>('demographics');

  const handleAddDemographic = (field: string, value: string) => {
    setSegments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'demographics',
        criteria: [{ field, operator: 'equals', value }]
      }
    ]);
    
    // Simulate audience size calculation
    const randomChange = Math.random() * 0.3 - 0.15; // -15% to +15%
    setEstimatedSize(prev => Math.floor(prev * (1 + randomChange)));
    
    toast.success(`Added ${field}: ${value}`);
  };

  const handleAddInterest = (interest: string) => {
    setSegments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'interests',
        criteria: [{ field: interest, operator: 'equals', value: 'true' }]
      }
    ]);
    
    const randomChange = Math.random() * 0.2 - 0.1;
    setEstimatedSize(prev => Math.floor(prev * (1 + randomChange)));
    
    toast.success(`Added interest: ${interest}`);
  };

  const handleAddBehavior = (behavior: string) => {
    setSegments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'behaviors',
        criteria: [{ field: behavior, operator: 'equals', value: 'true' }]
      }
    ]);
    
    const randomChange = Math.random() * 0.25 - 0.125;
    setEstimatedSize(prev => Math.floor(prev * (1 + randomChange)));
    
    toast.success(`Added behavior: ${behavior}`);
  };

  const handleRemoveSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
    const randomChange = Math.random() * 0.2 + 0.1; // +10% to +30%
    setEstimatedSize(prev => Math.floor(prev * (1 + randomChange)));
    toast.success('Segment removed');
  };

  const handleSaveAudience = () => {
    if (!audienceName) {
      toast.error('Please enter an audience name');
      return;
    }

    const newAudience: SavedAudience = {
      id: Date.now().toString(),
      name: audienceName,
      description: audienceDescription,
      size: estimatedSize,
      segments,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSavedAudiences(prev => [newAudience, ...prev]);
    
    // Reset form
    setAudienceName('');
    setAudienceDescription('');
    setSegments([]);
    setEstimatedSize(2400000);
    
    toast.success('🎉 Audience saved successfully!');
  };

  const handleLoadAudience = (audience: SavedAudience) => {
    setAudienceName(audience.name);
    setAudienceDescription(audience.description);
    setSegments(audience.segments);
    setEstimatedSize(audience.size);
    setActiveTab('demographics');
    toast.success(`Loaded "${audience.name}"`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Audience Builder</h2>
        <p className="text-muted-foreground">
          Create custom audiences with advanced targeting options
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Audience Configuration */}
        <div className="col-span-2 space-y-4">
          {/* Audience Name & Description */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Audience Details</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground mb-2">Audience Name</Label>
                <Input
                  value={audienceName}
                  onChange={(e) => setAudienceName(e.target.value)}
                  placeholder="e.g., High-Value Fitness Enthusiasts"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground mb-2">Description (Optional)</Label>
                <Input
                  value={audienceDescription}
                  onChange={(e) => setAudienceDescription(e.target.value)}
                  placeholder="Brief description of this audience"
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Targeting Options */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30">
              {(['demographics', 'interests', 'behaviors', 'saved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-card text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Demographics Tab */}
              {activeTab === 'demographics' && (
                <div className="space-y-4">
                  {demographicOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.field}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-foreground">{option.label}</Label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {option.options.map((value) => (
                            <button
                              key={value}
                              onClick={() => handleAddDemographic(option.field, value)}
                              className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg text-sm font-medium transition-all"
                            >
                              <Plus className="w-3 h-3 inline mr-1" />
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Interests Tab */}
              {activeTab === 'interests' && (
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map((interest) => {
                    const Icon = interest.icon;
                    return (
                      <button
                        key={interest.field}
                        onClick={() => handleAddInterest(interest.label)}
                        className="p-4 border-2 border-border hover:border-primary rounded-xl transition-all hover:bg-primary/5 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary rounded-lg flex items-center justify-center transition-colors">
                            <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-foreground">{interest.label}</div>
                            <div className="text-xs text-muted-foreground">Add to audience</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Behaviors Tab */}
              {activeTab === 'behaviors' && (
                <div className="space-y-2">
                  {behaviorOptions.map((behavior) => (
                    <button
                      key={behavior.field}
                      onClick={() => handleAddBehavior(behavior.label)}
                      className="w-full p-4 border-2 border-border hover:border-primary rounded-lg transition-all hover:bg-primary/5 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground group-hover:text-primary">
                          {behavior.label}
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Saved Audiences Tab */}
              {activeTab === 'saved' && (
                <div className="space-y-3">
                  {savedAudiences.map((audience) => (
                    <div
                      key={audience.id}
                      className="p-4 border border-border rounded-lg hover:border-primary transition-all cursor-pointer"
                      onClick={() => handleLoadAudience(audience)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{audience.name}</h4>
                          <p className="text-xs text-muted-foreground">{audience.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">
                            {(audience.size / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-xs text-muted-foreground">people</div>
                        </div>
                      </div>
                      
                      {audience.performance && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                          <span>{audience.performance.campaigns} campaigns</span>
                          <span>CTR: {audience.performance.avgCTR}%</span>
                          <span className="text-green-500">ROAS: {audience.performance.avgROAS}x</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview & Summary */}
        <div className="space-y-4">
          {/* Audience Size Estimate */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Estimated Reach</h3>
                <p className="text-xs text-muted-foreground">Potential audience size</p>
              </div>
            </div>

            <div className="text-center py-6 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/30">
              <div className="text-4xl font-bold text-foreground mb-1">
                {(estimatedSize / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-muted-foreground">people</div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Audience Quality</span>
                <span className="font-bold text-green-500">High</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Competition</span>
                <span className="font-bold text-orange-500">Medium</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Est. CPM</span>
                <span className="font-bold text-foreground">€8-12</span>
              </div>
            </div>
          </div>

          {/* Active Segments */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4">Active Segments ({segments.length})</h3>
            
            {segments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No segments added yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg group"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        segment.type === 'demographics' ? 'bg-blue-500' :
                        segment.type === 'interests' ? 'bg-purple-500' :
                        'bg-green-500'
                      }`} />
                      <span className="text-sm text-foreground">
                        {segment.criteria[0].field}: {segment.criteria[0].value}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSegment(segment.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Suggestions */}
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">AI Suggestion</h4>
                <p className="text-xs text-muted-foreground">
                  Add "Online Shoppers" behavior to increase conversion potential by ~15%
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveAudience}
            disabled={!audienceName || segments.length === 0}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 h-12"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Audience
          </Button>
        </div>
      </div>
    </div>
  );
}
