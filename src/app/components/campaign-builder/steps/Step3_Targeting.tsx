import { useCampaignBuilder } from '../CampaignBuilderContext';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Slider } from '../../ui/slider';
import { MapPin, Users, Heart, Target, Globe, X, Plus, Sparkles, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useState } from 'react';

// Common interest categories for Meta Ads
const INTEREST_SUGGESTIONS = [
    { category: 'E-Commerce', interests: ['Online Shopping', 'Fashion', 'Luxury Goods', 'Electronics', 'Home Decor'] },
    { category: 'Business', interests: ['Entrepreneurship', 'Marketing', 'Small Business', 'B2B', 'SaaS'] },
    { category: 'Lifestyle', interests: ['Fitness', 'Travel', 'Food & Dining', 'Wellness', 'Outdoor Activities'] },
    { category: 'Tech', interests: ['Technology', 'Mobile Apps', 'Gadgets', 'Software', 'AI'] },
];

const LOCATION_PRESETS = [
    { id: 'DE', label: 'Deutschland', flag: '🇩🇪' },
    { id: 'AT', label: 'Österreich', flag: '🇦🇹' },
    { id: 'CH', label: 'Schweiz', flag: '🇨🇭' },
    { id: 'DACH', label: 'DACH Region', flag: '🇪🇺' },
    { id: 'EU', label: 'Europa', flag: '🇪🇺' },
    { id: 'US', label: 'USA', flag: '🇺🇸' },
];

const PLACEMENTS = [
    { id: 'feed', label: 'Feed', description: 'Facebook & Instagram Feed' },
    { id: 'stories', label: 'Stories', description: 'Facebook & Instagram Stories' },
    { id: 'reels', label: 'Reels', description: 'Instagram & Facebook Reels' },
    { id: 'explore', label: 'Explore', description: 'Instagram Explore Tab' },
    { id: 'audience_network', label: 'Audience Network', description: 'Partner Apps & Websites' },
] as const;

export const Step3_Targeting = () => {
    const { targeting, setTargeting, audiences, refreshAudiences } = useCampaignBuilder();
    const [interestInput, setInterestInput] = useState('');
    const [showInterestSuggestions, setShowInterestSuggestions] = useState(false);

    const updateField = <K extends keyof typeof targeting>(key: K, value: typeof targeting[K]) => {
        setTargeting(prev => ({ ...prev, [key]: value }));
    };

    const toggleLocation = (id: string) => {
        if (id === 'DACH') {
            updateField('locations', ['DE', 'AT', 'CH']);
        } else if (id === 'EU') {
            updateField('locations', ['DE', 'AT', 'CH', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL']);
        } else {
            const current = targeting.locations;
            if (current.includes(id)) {
                updateField('locations', current.filter(l => l !== id));
            } else {
                updateField('locations', [...current, id]);
            }
        }
    };

    const addInterest = (interest: string) => {
        if (!targeting.interests.includes(interest)) {
            updateField('interests', [...targeting.interests, interest]);
        }
        setInterestInput('');
        setShowInterestSuggestions(false);
    };

    const removeInterest = (interest: string) => {
        updateField('interests', targeting.interests.filter(i => i !== interest));
    };

    const togglePlacement = (id: typeof PLACEMENTS[number]['id']) => {
        const current = targeting.placements;
        if (current.includes(id)) {
            if (current.length > 1) { // Keep at least one
                updateField('placements', current.filter(p => p !== id));
            }
        } else {
            updateField('placements', [...current, id]);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    Targeting & Zielgruppe
                </h2>
                <p className="text-muted-foreground">Definiere, wer deine Ads sehen soll.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Locations */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <MapPin className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Standorte</h3>
                                <p className="text-xs text-muted-foreground">Wo sollen deine Ads ausgespielt werden?</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {LOCATION_PRESETS.map(loc => (
                                <button
                                    key={loc.id}
                                    onClick={() => toggleLocation(loc.id)}
                                    className={cn(
                                        "px-3 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2",
                                        targeting.locations.includes(loc.id) || (loc.id === 'DACH' && targeting.locations.includes('DE') && targeting.locations.includes('AT') && targeting.locations.includes('CH'))
                                            ? "border-blue-500 bg-blue-500/10 text-blue-600"
                                            : "border-border hover:border-blue-500/50"
                                    )}
                                >
                                    <span>{loc.flag}</span>
                                    {loc.label}
                                </button>
                            ))}
                        </div>

                        {targeting.locations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {targeting.locations.map(loc => (
                                    <Badge key={loc} variant="secondary" className="text-xs">
                                        {loc}
                                        <button onClick={() => updateField('locations', targeting.locations.filter(l => l !== loc))} className="ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Age & Gender */}
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/10 rounded-lg">
                                <Users className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Demografie</h3>
                                <p className="text-xs text-muted-foreground">Alter und Geschlecht deiner Zielgruppe</p>
                            </div>
                        </div>

                        {/* Age Range */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Altersgruppe</span>
                                <span className="text-sm font-bold text-primary">{targeting.ageMin} - {targeting.ageMax}+</span>
                            </div>
                            <div className="px-2">
                                <Slider
                                    value={[targeting.ageMin, targeting.ageMax]}
                                    onValueChange={([min, max]) => {
                                        updateField('ageMin', min);
                                        updateField('ageMax', max);
                                    }}
                                    min={13}
                                    max={65}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>13</span>
                                <span>25</span>
                                <span>35</span>
                                <span>45</span>
                                <span>55</span>
                                <span>65+</span>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-3">
                            <span className="text-sm font-medium">Geschlecht</span>
                            <div className="flex gap-2">
                                {(['all', 'male', 'female'] as const).map(gender => (
                                    <button
                                        key={gender}
                                        onClick={() => updateField('gender', gender)}
                                        className={cn(
                                            "flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all",
                                            targeting.gender === gender
                                                ? "border-violet-500 bg-violet-500/10 text-violet-600"
                                                : "border-border hover:border-violet-500/50"
                                        )}
                                    >
                                        {gender === 'all' ? 'Alle' : gender === 'male' ? 'Männer' : 'Frauen'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Advantage+ */}
                    <Card className={cn(
                        "p-6 cursor-pointer transition-all border-2",
                        targeting.advantagePlus
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                    )} onClick={() => updateField('advantagePlus', !targeting.advantagePlus)}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-primary to-violet-600 rounded-xl">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold">Advantage+ Audience</h3>
                                    <Badge className="bg-primary/10 text-primary border-0 text-[10px]">EMPFOHLEN</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Meta's KI erweitert automatisch deine Zielgruppe für bessere Ergebnisse
                                </p>
                            </div>
                            <div className={cn(
                                "w-12 h-6 rounded-full transition-all relative",
                                targeting.advantagePlus ? "bg-primary" : "bg-muted"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
                                    targeting.advantagePlus ? "left-7" : "left-1"
                                )} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Interests */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500/10 rounded-lg">
                                <Heart className="w-5 h-5 text-pink-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Interessen</h3>
                                <p className="text-xs text-muted-foreground">Was interessiert deine Zielgruppe?</p>
                            </div>
                        </div>

                        {/* Interest Input */}
                        <div className="relative">
                            <Input
                                value={interestInput}
                                onChange={e => setInterestInput(e.target.value)}
                                onFocus={() => setShowInterestSuggestions(true)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && interestInput.trim()) {
                                        addInterest(interestInput.trim());
                                    }
                                }}
                                placeholder="Interesse eingeben..."
                                className="pr-10"
                            />
                            <button
                                onClick={() => interestInput.trim() && addInterest(interestInput.trim())}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                            >
                                <Plus className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Interest Suggestions */}
                        {showInterestSuggestions && (
                            <div className="space-y-3">
                                {INTEREST_SUGGESTIONS.map(cat => (
                                    <div key={cat.category}>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">{cat.category}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {cat.interests.map(interest => (
                                                <button
                                                    key={interest}
                                                    onClick={() => addInterest(interest)}
                                                    disabled={targeting.interests.includes(interest)}
                                                    className={cn(
                                                        "px-2 py-1 text-xs rounded-md border transition-all",
                                                        targeting.interests.includes(interest)
                                                            ? "bg-pink-500/10 border-pink-500/30 text-pink-600"
                                                            : "border-border hover:border-pink-500/50"
                                                    )}
                                                >
                                                    {interest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selected Interests */}
                        {targeting.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                {targeting.interests.map(interest => (
                                    <Badge key={interest} className="bg-pink-500/10 text-pink-600 border-pink-500/20">
                                        {interest}
                                        <button onClick={() => removeInterest(interest)} className="ml-1.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Custom Audiences */}
                    {audiences.length > 0 && (
                        <Card className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <Target className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Custom Audiences</h3>
                                    <p className="text-xs text-muted-foreground">Deine gespeicherten Zielgruppen</p>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {audiences.filter(a => a.type !== 'lookalike').map(audience => (
                                    <button
                                        key={audience.id}
                                        onClick={() => {
                                            const isSelected = targeting.customAudiences.some(a => a.id === audience.id);
                                            if (isSelected) {
                                                updateField('customAudiences', targeting.customAudiences.filter(a => a.id !== audience.id));
                                            } else {
                                                updateField('customAudiences', [...targeting.customAudiences, { id: audience.id, name: audience.name }]);
                                            }
                                        }}
                                        className={cn(
                                            "w-full p-3 rounded-lg border text-left text-sm transition-all",
                                            targeting.customAudiences.some(a => a.id === audience.id)
                                                ? "border-green-500 bg-green-500/10"
                                                : "border-border hover:border-green-500/50"
                                        )}
                                    >
                                        <div className="font-medium">{audience.name}</div>
                                        {audience.size && (
                                            <div className="text-xs text-muted-foreground">{audience.size.toLocaleString()} Nutzer</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Placements */}
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Globe className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-bold">Placements</h3>
                                <p className="text-xs text-muted-foreground">Wo sollen deine Ads erscheinen?</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {PLACEMENTS.map(placement => (
                                <button
                                    key={placement.id}
                                    onClick={() => togglePlacement(placement.id)}
                                    className={cn(
                                        "w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between",
                                        targeting.placements.includes(placement.id)
                                            ? "border-orange-500 bg-orange-500/10"
                                            : "border-border hover:border-orange-500/50"
                                    )}
                                >
                                    <div>
                                        <div className="font-semibold text-sm">{placement.label}</div>
                                        <div className="text-xs text-muted-foreground">{placement.description}</div>
                                    </div>
                                    <div className={cn(
                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                        targeting.placements.includes(placement.id)
                                            ? "border-orange-500 bg-orange-500"
                                            : "border-muted-foreground"
                                    )}>
                                        {targeting.placements.includes(placement.id) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
