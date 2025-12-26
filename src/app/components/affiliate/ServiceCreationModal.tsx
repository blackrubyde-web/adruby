import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

const SERVICE_TYPES = [
    { id: 'ad_review', label: 'Ad Review', description: 'Professionelles Feedback zu Ads' },
    { id: 'onboarding', label: 'Onboarding Call', description: '1-on-1 Setup & Training' },
    { id: 'support', label: 'Premium Support', description: 'Prioritäts-Support' },
    { id: 'consultation', label: 'Consultation', description: 'Strategie-Beratung' },
    { id: 'custom', label: 'Custom', description: 'Individueller Service' },
];

export function ServiceCreationModal({ onClose, onSuccess }: Props) {
    const [formData, setFormData] = useState({
        service_type: 'ad_review',
        title: '',
        description: '',
        price_credits: 50,
        max_slots: null as number | null,
        is_active: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('Titel ist erforderlich');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Beschreibung ist erforderlich');
            return;
        }
        if (formData.price_credits < 1) {
            toast.error('Preis muss mindestens 1 Credit sein');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('affiliate_services')
                .insert({
                    affiliate_user_id: user.id,
                    ...formData
                });

            if (error) throw error;

            toast.success('Service erfolgreich erstellt!');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to create service:', err);
            toast.error('Fehler beim Erstellen des Services');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Neuen Service erstellen</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-6">
                        {/* Service Type */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Service Typ</label>
                            <div className="grid grid-cols-2 gap-3">
                                {SERVICE_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, service_type: type.id })}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${formData.service_type === type.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <p className="font-medium text-sm">{type.label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Titel *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="z.B. Ad Creative Review & Optimization"
                                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Beschreibung *</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Beschreibe was der Service beinhaltet..."
                                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Preis (Credits) *</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.price_credits}
                                onChange={e => setFormData({ ...formData, price_credits: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Empfohlen: Ad Review (50-100), Onboarding (100-200), Support (200-500)
                            </p>
                        </div>

                        {/* Max Slots */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Max. Slots (optional)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.max_slots || ''}
                                onChange={e => setFormData({
                                    ...formData,
                                    max_slots: e.target.value ? parseInt(e.target.value) : null
                                })}
                                placeholder="Unbegrenzt"
                                className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Leer lassen für unbegrenzte Buchungen
                            </p>
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 rounded border-border"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium">
                                Service sofort aktivieren
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-card border-t border-border p-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Erstelle...
                                </>
                            ) : (
                                'Service erstellen'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
