import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Send, CheckCircle2, Building2, Users, Globe, User, WandSparkles, ArrowRight, ArrowLeft } from 'lucide-react';
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
    fullName: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
    email: z.string().email('Ungültige E-Mail-Adresse'),
    companyName: z.string().optional(),
    website: z.string().url('Ungültige URL').optional().or(z.literal('')),
    partnerType: z.enum(['influencer', 'coach', 'community_leader', 'agency', 'other']),
    audienceSize: z.string().min(1, 'Bitte gib deine geschätzte Reichweite an'),
    platform: z.string().min(1, 'Primäre Plattform ist erforderlich'),
    motivation: z.string().min(50, 'Bitte erzähle uns etwas mehr darüber, warum du Partner werden möchtest (min. 50 Zeichen)'),
});

type FormData = z.infer<typeof formSchema>;

export function PartnerApplicationForm() {
    const { user, profile } = useAuthState();
    const { refreshData } = useAffiliate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState(1);

    // AI Magic Headline State
    const [showHeadlineSelector, setShowHeadlineSelector] = useState(false);
    const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
    const [headlineVariants, setHeadlineVariants] = useState<HeadlineVariant[]>([]);
    const [selectedHeadline, setSelectedHeadline] = useState<HeadlineVariant | null>(null);

    const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<FormData>({
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
            toast.error('Du musst eingeloggt sein, um eine Bewerbung abzusenden.');
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
                    status: 'pending'
                });

            if (error) throw error;

            setIsSuccess(true);
            await refreshData();
        } catch (err) {
            console.error('Application error:', err);
            const message = err instanceof Error ? err.message : 'Fehler beim Senden der Bewerbung';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateHeadlines = async () => {
        const formValues = watch();
        // Validation for AI gen
        const isValid = await trigger(['partnerType', 'audienceSize', 'platform', 'companyName']);

        if (!isValid) {
            toast.error('Bitte fülle zuerst die Details zu deiner Reichweite aus (Schritt 2).');
            return;
        }

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

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormData)[] = [];
        if (step === 1) fieldsToValidate = ['fullName', 'email', 'companyName', 'website'];
        if (step === 2) fieldsToValidate = ['partnerType', 'audienceSize', 'platform'];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    if (isSuccess) {
        return (
            <Card className="max-w-2xl mx-auto p-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Bewerbung eingegangen!</h2>
                <p className="text-xl text-white/60 mb-8">
                    Vielen Dank für deine Bewerbung. Unser Team prüft dein Profil und meldet sich innerhalb von 24 Stunden bei dir.
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
                    <p className="text-sm text-white/40">Status</p>
                    <p className="text-lg font-bold text-yellow-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> In Prüfung
                    </p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Zurück zum Dashboard
                </Button>
            </Card>
        );
    }

    return (
        <>
            <div className="max-w-3xl mx-auto mb-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25' : 'bg-white/5 text-white/40 border border-white/10'
                                }`}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`w-16 h-1 mx-2 rounded-full transition-all ${step > s ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-white/5'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Card className="max-w-3xl mx-auto p-6 md:p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                        {step === 1 && "Über Dich"}
                        {step === 2 && "Deine Reichweite"}
                        {step === 3 && "Warum AdRuby?"}
                    </h2>
                    <p className="text-muted-foreground">
                        {step === 1 && "Beginne mit deinen persönlichen und beruflichen Details."}
                        {step === 2 && "Erzähl uns von deiner Zielgruppe und Plattform."}
                        {step === 3 && "Warum möchtest du AdRuby Partner werden?"}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Step 1: Personal Details */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Vor- und Nachname</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="fullName" {...register('fullName')} className="pl-9" placeholder="Max Mustermann" />
                                    </div>
                                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-Mail</Label>
                                    <div className="relative">
                                        <Send className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" {...register('email')} className="pl-9" readOnly />
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Unternehmen / Brand (Optional)</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="companyName" {...register('companyName')} className="pl-9" placeholder="Dein Unternehmen GmbH" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Webseite / Social Profil (Optional)</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="website" {...register('website')} className="pl-9" placeholder="https://..." />
                                    </div>
                                    {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Professional Info */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Partner Typ</Label>
                                    <Select
                                        onValueChange={(val) => setValue('partnerType', val as 'influencer' | 'coach' | 'community_leader' | 'agency' | 'other')}
                                        defaultValue={watch('partnerType')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Bitte wählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="influencer">Influencer / Creator</SelectItem>
                                            <SelectItem value="coach">Coach / Berater</SelectItem>
                                            <SelectItem value="community_leader">Community Leader</SelectItem>
                                            <SelectItem value="agency">Agentur</SelectItem>
                                            <SelectItem value="other">Sonstiges</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="audienceSize">Geschätzte Reichweite</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="audienceSize" {...register('audienceSize')} className="pl-9" placeholder="z.B. 10k, 500+" />
                                    </div>
                                    {errors.audienceSize && <p className="text-xs text-red-500">{errors.audienceSize.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="platform">Primäre Plattform</Label>
                                    <Input id="platform" {...register('platform')} placeholder="z.B. LinkedIn, Instagram" />
                                    {errors.platform && <p className="text-xs text-red-500">{errors.platform.message}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Motivation & AI */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                            {/* AI Magic Link in Logic */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-violet-500/20 rounded-lg">
                                        <WandSparkles className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Noch keine Idee?</h4>
                                        <p className="text-sm text-muted-foreground">Lass die AI basierend auf deinem Profil aus Schritt 2 Headlines generieren.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGenerateHeadlines}
                                    disabled={isGeneratingHeadlines}
                                    className="w-full py-2 text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {isGeneratingHeadlines ? <Loader2 className="w-4 h-4 animate-spin" /> : "Headlines generieren"}
                                </button>

                                {selectedHeadline && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-xs font-bold text-violet-400 mb-1">Ausgewählte Headline:</p>
                                        <p className="italic text-white">{selectedHeadline.headline}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motivation">Warum möchtest du AdRuby Partner werden?</Label>
                                <Textarea
                                    id="motivation"
                                    {...register('motivation')}
                                    placeholder="Erzähl uns von deiner Zielgruppe und wie du AdRuby bewerben möchtest..."
                                    className="min-h-[120px]"
                                />
                                {errors.motivation && <p className="text-xs text-red-500">{errors.motivation.message}</p>}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-8 border-t border-white/10">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={prevStep}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
                            </Button>
                        ) : (
                            <div /> /* Spacer */
                        )}

                        {step < 3 ? (
                            <Button type="button" onClick={nextStep} className="bg-white text-black hover:bg-white/90">
                                Weiter <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit" size="lg" disabled={isSubmitting} className="bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sende...
                                    </>
                                ) : (
                                    <>
                                        Bewerbung absenden <CheckCircle2 className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        )}
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
