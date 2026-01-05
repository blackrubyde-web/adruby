import { useEffect, useState, useRef } from 'react';
import type { AdDocument } from '../types/studio';

interface AutoSaveOptions {
    enabled?: boolean;
    interval?: number; // ms
    storageKey?: string;
}

export function useAutoSave(
    doc: AdDocument | null,
    setDoc: (doc: AdDocument) => void,
    options: AutoSaveOptions = {}
) {
    const {
        enabled = true,
        interval = 5000,
        storageKey = 'adruby-autosave'
    } = options;

    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Save to localStorage (with Base64 stripping to prevent overflow)
    useEffect(() => {
        if (!enabled || !doc) return;

        const saveToLocalStorage = () => {
            setIsSaving(true);
            try {
                // Strip Base64 data from layers to prevent localStorage overflow
                const lightweightDoc: AdDocument = {
                    ...doc,
                    layers: doc.layers.map(layer => {
                        // Check if layer has src with Base64 data
                        if ('src' in layer && typeof layer.src === 'string' && layer.src.startsWith('data:')) {
                            return {
                                ...layer,
                                src: '[BASE64_STRIPPED]' // Placeholder - real images stored in Supabase
                            };
                        }
                        return layer;
                    })
                };

                const saved = {
                    doc: lightweightDoc,
                    timestamp: Date.now()
                };

                localStorage.setItem(storageKey, JSON.stringify(saved));
                setLastSaved(new Date());
                setLastSaved(new Date());
            } catch (error) {
                console.error('AutoSave failed:', error);

                // Handle quota exceeded
                if (error instanceof Error && error.name === 'QuotaExceededError') {
                    // console.warn('localStorage quota exceeded - clearing old saves');
                    try {
                        localStorage.removeItem(storageKey);
                    } catch (e) {
                        console.error('Failed to clear localStorage:', e);
                    }
                }
            } finally {
                setIsSaving(false);
            }
        };

        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set new timer
        timerRef.current = setTimeout(saveToLocalStorage, interval);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [doc, enabled, interval, storageKey, setDoc]);

    // Restore from localStorage on mount
    useEffect(() => {
        if (!enabled) return;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);

                // Only restore if document is fresh/empty
                if (doc && doc.layers.length === 0 && parsed.doc) {
                    // console.log('Restoring autosaved document...');
                    setDoc(parsed.doc);
                    setLastSaved(new Date(parsed.timestamp));
                }
            }
        } catch (error) {
            console.error('Failed to restore autosave:', error);
        }
    }, [enabled, storageKey, setDoc, doc]); // Only run on mount or if doc changes (careful with loops)

    return {
        lastSaved,
        isSaving
    };
}
