import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Send, CheckCircle2, Building2, Users, Globe, User, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../layout';
import { supabase } from '../../lib/supabaseClient';
import { useAuthState } from '../../contexts/AuthContext';
import { useAffiliate } from '../../contexts/AffiliateContext';
import { generateAffiliateHeadlines, type HeadlineVariant } from '../../lib/api/ai-headline-generator';
import { HeadlineSelector } from './HeadlineSelector';

const formSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    companyName: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    partnerType: z.enum(['influencer', 'coach', 'community_leader', 'agency', 'other']),
    audienceSize: z.string().min(1, 'Please estimate your audience size'),
    platform: z.string().min(1, 'Primary platform is required'),
    motivation: z.string().min(50, 'Please tell us a bit more about why you want to partner with us (min 50 chars)'),
});

type FormData = z.infer<typeof formSchema>;

export function PartnerApplicationForm() {
    const { user, profile } = useAuthState();
    const { refreshData } = useAffiliate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Magic Headline State
    const [showHeadlineSelector, setShowHeadlineSelector] = useState(false);
    const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
    const [headlineVariants, setHeadlineVariants] = useState<HeadlineVariant[]>([]);
    const [selectedHeadline, setSelectedHeadline] = useState<HeadlineVariant | null>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: (profile?.full_name || user?.user_metadata?.full_name) || '',
            email: user?.email || '',
            companyName: '',
            website: '',
            partnerType: 'influencer',
            audienceSize: '',
            platform: '',
            motivation: '',
        }
    });

    const onSubmit = async (data: FormData) => {
        if (!user) {
            toast.error('You must be logged in to submit an application');
            return;
        }
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('partner_applications')
                .insert({
                    user_id: user.id,
                    full_name: data.fullName,
                    email: data.email,
                    company_name: data.companyName,
                    website: data.website,
                    partner_type: data.partnerType,
                    audience_size: parseInt(data.audienceSize.replace(/[^0-9]/g, '')) || 0, // Simple parsing
                    platform: data.platform,
                    motivation: data.motivation,
                    status: 'pending' // Forced by RLS/Default but good to be explicit mentally
                });

            if (error) throw error;

            toast.success('Application submitted successfully!');
            await refreshData();
        } catch (err) {
            console.error('Application error:', err);
            const message = err instanceof Error ? err.message : 'Failed to submit application';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateHeadlines = async () => {
        const formValues = watch();

        setIsGeneratingHeadlines(true);
        setShowHeadlineSelector(true);

        try {
            const result = await generateAffiliateHeadlines({
                partnerType: formValues.partnerType,
                audienceSize: formValues.audienceSize,
                platform: formValues.platform,
                companyName: formValues.companyName,
                language: 'de'
            });

            setHeadlineVariants(result.variants);
            toast.success('Headlines generiert! Wähle deine Lieblings-Variante aus.');
        } catch (error) {
            console.error('Headline generation error:', error);
            toast.error('Headline-Generierung fehlgeschlagen. Versuche es erneut.');
            setShowHeadlineSelector(false);
        } finally {
            setIsGeneratingHeadlines(false);
        }
    };

    const handleSelectHeadline = (variant: HeadlineVariant) => {
        setSelectedHeadline(variant);
        toast.success(`✨ "${variant.headline}" ausgewählt!`);
    };

    return (
        <>
            <Card className="max-w-3xl mx-auto p-6 md:p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Apply for Partner Program</h2>
                    <p className="text-muted-foreground">
                        Join our exclusive partner network and earn recurring commissions.
                        Tell us a bit about yourself.
                    </p>

                    {/* AI Magic Button */}
                    <button
                        type="button"
                        onClick={handleGenerateHeadlines}
                        disabled={isGeneratingHeadlines}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingHeadlines ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                AI zaubert Headlines...
                            </>
                        ) : (
                            <>
                                <WandSparkles className="w-5 h-5" />
                                AI Magic - Krasse Headlines generieren
                            </>
                        )}
                    </button>

                    {/* Display Selected Headline */}
                    {selectedHeadline && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                            <p className="text-xs font-bold text-violet-600 mb-1">✨ Deine AI-generierte Headline</p>
                            <p
                                className="font-bold leading-tight"
                                style={{
                                    fontSize: '20px',
                                    fontWeight: selectedHeadline.design.fontWeight,
                                    background: selectedHeadline.design.gradient
                                        ? `linear-gradient(135deg, ${selectedHeadline.design.gradient.from}, ${selectedHeadline.design.gradient.to})`
                                        : selectedHeadline.design.accentColor,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                {selectedHeadline.headline}
                            </p>
                            {selectedHeadline.subheadline && (
                                <p className="text-sm text-muted-foreground mt-1">{selectedHeadline.subheadline}</p>
                            )}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="fullName" {...register('fullName')} className="pl-9" placeholder="John Doe" />
                            </div>
                            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Send className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="email" {...register('email')} className="pl-9" readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company / Brand (Optional)</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="companyName" {...register('companyName')} className="pl-9" placeholder="Acme Inc." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website / Social Profile (Optional)</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="website" {...register('website')} className="pl-9" placeholder="https://..." />
                            </div>
                            {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
                        </div>
                    </div>

                    {/* Partner Specifics */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Partner Type</Label>
                            <Select
                                onValueChange={(val) => setValue('partnerType', val as 'influencer' | 'coach' | 'community_leader' | 'agency' | 'other')}
                                defaultValue={watch('partnerType')}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="influencer">Influencer / Creator</SelectItem>
                                    <SelectItem value="coach">Coach / Consultant</SelectItem>
                                    <SelectItem value="community_leader">Community Leader</SelectItem>
                                    <SelectItem value="agency">Agency</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="audienceSize">Est. Audience Size</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="audienceSize" {...register('audienceSize')} className="pl-9" placeholder="e.g. 10k, 500+" />
                            </div>
                            {errors.audienceSize && <p className="text-xs text-red-500">{errors.audienceSize.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="platform">Primary Platform</Label>
                            <Input id="platform" {...register('platform')} placeholder="e.g. LinkedIn, Instagram, Email List" />
                            {errors.platform && <p className="text-xs text-red-500">{errors.platform.message}</p>}
                        </div>
                    </div>

                    {/* Motivation */}
                    <div className="space-y-2">
                        <Label htmlFor="motivation">Why do you want to partner with AdRuby?</Label>
                        <Textarea
                            id="motivation"
                            {...register('motivation')}
                            placeholder="Tell us about your audience and how you plan to promote AdRuby..."
                            className="min-h-[120px]"
                        />
                        {errors.motivation && <p className="text-xs text-red-500">{errors.motivation.message}</p>}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Application <CheckCircle2 className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* AI Magic Headline Selector Modal */}
            <HeadlineSelector
                variants={headlineVariants}
                isOpen={showHeadlineSelector}
                onClose={() => setShowHeadlineSelector(false)}
                onSelect={handleSelectHeadline}
                isGenerating={isGeneratingHeadlines}
            />
        </>
    );
}
