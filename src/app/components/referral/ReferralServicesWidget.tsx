import { useState, useEffect } from 'react';
import { Star, Loader2, Send } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface AffiliateService {
    id: string;
    title: string;
    description: string;
    price_credits: number;
    affiliate_name: string;
    affiliate_email: string;
}

/**
 * Component for referrals to view and book services from their affiliate
 * Shows on regular user dashboard if they were referred
 */
export function ReferralServicesWidget() {
    const [services, setServices] = useState<AffiliateService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [_affiliateId, setAffiliateId] = useState<string | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedService, setSelectedService] = useState<AffiliateService | null>(null);
    const [bookingMessage, setBookingMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadAffiliateServices();
    }, []);

    const loadAffiliateServices = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if user was referred
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('referred_by_affiliate_id')
                .eq('id', user.id)
                .single();

            if (profileError || !profileData?.referred_by_affiliate_id) {
                setIsLoading(false);
                return; // Not a referral, don't show widget
            }

            _setAffiliateId(profileData.referred_by_affiliate_id);

            // Load affiliate's active services
            const { data: servicesData, error: servicesError } = await supabase
                .from('affiliate_services')
                .select(`
                    *,
                    affiliate:user_profiles!affiliate_user_id(full_name, email)
                `)
                .eq('affiliate_user_id', profileData.referred_by_affiliate_id)
                .eq('is_active', true);

            if (servicesError) throw servicesError;

            const formattedServices = (servicesData || []).map((s) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                price_credits: s.price_credits,
                affiliate_name: s.affiliate?.full_name || 'Your Partner',
                affiliate_email: s.affiliate?.email || ''
            }));

            setServices(formattedServices);
        } catch (err) {
            console.error('Failed to load affiliate services:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookService = async () => {
        if (!selectedService || !bookingMessage.trim()) {
            toast.error('Please add a message');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Create service request
            const { error } = await supabase
                .from('affiliate_service_requests')
                .insert({
                    service_id: selectedService.id,
                    requester_user_id: user.id,
                    message: bookingMessage,
                    status: 'pending'
                });

            if (error) throw error;

            toast.success('Service request sent!');
            setShowBookingModal(false);
            setSelectedService(null);
            setBookingMessage('');
        } catch (err) {
            console.error('Failed to book service:', err);
            toast.error('Failed to send request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-2xl p-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
        );
    }

    if (services.length === 0) {
        return null; // Don't show widget if no services
    }

    return (
        <>
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Star className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">Premium Services</h3>
                        <p className="text-sm text-muted-foreground">
                            Exklusive Services von {services[0]?.affiliate_name}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {services.map(service => (
                        <div
                            key={service.id}
                            className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h4 className="font-semibold mb-1">{service.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {service.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-primary">
                                            {service.price_credits} Credits
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedService(service);
                                        setShowBookingModal(true);
                                    }}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                                >
                                    Buchen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedService && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Service buchen</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Service</p>
                                <p className="font-semibold">{selectedService.title}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Preis</p>
                                <p className="text-lg font-bold text-primary">
                                    {selectedService.price_credits} Credits
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Deine Nachricht
                                </label>
                                <textarea
                                    value={bookingMessage}
                                    onChange={e => setBookingMessage(e.target.value)}
                                    placeholder="Beschreibe dein Anliegen..."
                                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowBookingModal(false);
                                    setSelectedService(null);
                                    setBookingMessage('');
                                }}
                                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleBookService}
                                disabled={isSubmitting || !bookingMessage.trim()}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Anfrage senden
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
