import { ImageIcon, Upload, Search, Eye, Download, Trash2, Star, Grid3x3, List, Video, FileText, Copy, Edit2, MousePointerClick, TrendingUp, CheckSquare, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import { FixedSizeGrid } from 'react-window';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { EmptyState } from './EmptyState';
import { DashboardShell } from './layout/DashboardShell';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabaseClient';
import { creativeSaveToLibrary } from '../lib/api/creative';
import type { AdDocument, ImageLayer, StudioLayer, TextLayer } from '../types/studio';

interface Creative {
  id: string;
  name: string;
  type: 'image' | 'video' | 'carousel';
  url: string;
  thumbnail: string;
  tags: string[];
  hooks?: string[]; // Added hooks
  primaryText?: string; // Added primary text
  performance: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    roas: number;
  };
  uploadedAt: string;
  usedInCampaigns: number;
  isFavorite: boolean;
}

const EditorLayout = lazy(() => import('./studio/EditorLayout').then(mod => ({ default: mod.EditorLayout })));
const AdWizard = lazy(() => import('./studio/AdWizard').then(mod => ({ default: mod.AdWizard })));

export function CreativeLibraryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('creativeLibraryFavorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<Creative['type'] | 'all'>('all');
  const [studioView, setStudioView] = useState<'idle' | 'wizard' | 'editor'>('idle');
  const [studioDoc, setStudioDoc] = useState<AdDocument | undefined>(undefined);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingCreative, setEditingCreative] = useState<Creative | null>(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  type CreativeRow = {
    id: string;
    thumbnail: string | null;
    created_at: string;
    metrics: Record<string, number> | null;
    saved: boolean;
    inputs: unknown;
    media_type?: string | null;
    image_url?: string | null;
    video_url?: string | null;
    tags?: string[] | null;
    metadata?: Record<string, unknown> | null;
  };
  const mapCreativeRow = useCallback((row: CreativeRow, favorites: Set<string>): Creative => {
    const inputs = (row?.inputs || {}) as {
      creativeName?: string;
      productName?: string;
      creativeType?: string;
      tags?: string[];
      brief?: { product?: { name?: string; category?: string }; goal?: string };
      hooks?: string[]; // Extract hooks
      primaryText?: string; // Extract primary text
      copy?: { hooks?: string[]; primaryText?: string }; // Alternative structure
    };
    const brief = inputs?.brief || null;
    const name =
      inputs?.creativeName ||
      brief?.product?.name ||
      inputs?.productName ||
      'AI Creative';

    const typeCandidate = row?.media_type || inputs?.creativeType;
    const type: Creative['type'] =
      typeCandidate === 'video' || typeCandidate === 'carousel' ? typeCandidate : 'image';

    const hasCustomTags = Array.isArray(row?.tags) || Array.isArray(inputs?.tags);
    const customTags = hasCustomTags ? (Array.isArray(row?.tags) ? (row.tags || []) : (inputs.tags || [])) : [];
    const fallbackTags = [
      brief?.product?.category || 'ai',
      brief?.goal || 'performance',
      'generated',
    ].filter(Boolean);
    const tags = hasCustomTags ? customTags : fallbackTags;

    // safe extraction of hooks
    const hooks = inputs?.hooks || inputs?.copy?.hooks || [];
    const primaryText = inputs?.primaryText || inputs?.copy?.primaryText;

    // For video creatives, resolve the video URL from multiple sources
    const metadata = (row?.metadata || {}) as Record<string, unknown>;
    const videoUrl = type === 'video'
      ? (row?.video_url || row?.image_url || row?.thumbnail || (metadata?.videoUrl as string) || '')
      : '';

    // For video thumbnails: find an actual IMAGE url (not a video url)
    // Check if a URL is an image (not a video)
    const isImageUrl = (url: string | null | undefined): boolean => {
      if (!url) return false;
      const lower = url.toLowerCase();
      // If it contains video extensions or video-related paths, it's not an image
      if (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov')) return false;
      // If it contains image extensions, it IS an image
      if (lower.includes('.png') || lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.webp') || lower.includes('.gif')) return true;
      // If it's a data URL, check the mime type
      if (lower.startsWith('data:image/')) return true;
      if (lower.startsWith('data:video/')) return false;
      // Default: assume Supabase storage URLs without extension are images if they came from thumbnail/image_url columns
      return true;
    };

    // Video thumbnail: prefer actual image thumbnail over video URL
    const videoThumbnailImage = type === 'video'
      ? (
        (isImageUrl(row?.thumbnail) && row?.thumbnail !== videoUrl ? row.thumbnail : null) ||
        (metadata?.thumbnailUrl && isImageUrl(metadata.thumbnailUrl as string) ? (metadata.thumbnailUrl as string) : null) ||
        (metadata?.posterUrl && isImageUrl(metadata.posterUrl as string) ? (metadata.posterUrl as string) : null) ||
        null
      )
      : null;

    return {
      id: row.id,
      name,
      type,
      url: videoUrl,
      thumbnail: type === 'video' ? (videoThumbnailImage || videoUrl) : (row.thumbnail || row?.image_url || ''),
      tags,
      hooks,
      primaryText,
      performance: {
        impressions: Number(row?.metrics?.impressions || 0),
        clicks: Number(row?.metrics?.clicks || 0),
        ctr: Number(row?.metrics?.ctr || 0),
        conversions: Number(row?.metrics?.conversions || 0),
        roas: Number(row?.metrics?.roas || 0),
      },
      uploadedAt: row.created_at ? String(row.created_at).split('T')[0] : '—',
      usedInCampaigns: 0,
      isFavorite: favorites.has(row.id),
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'creativeLibraryFavorites',
      JSON.stringify(Array.from(favoriteIds))
    );
  }, [favoriteIds]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          if (mounted) setCreatives([]);
          return;
        }

        // Only fetch minimal fields for the listing to avoid storing large JSON blobs in memory.
        const { data, error } = await supabase
          .from('generated_creatives')
          .select('id,thumbnail,created_at,metrics,saved,inputs,media_type,image_url,video_url,tags,metadata')
          .eq('saved', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          // Specific error messages for common issues
          if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
            throw new Error('Tabelle "generated_creatives" existiert nicht. Bitte Supabase Migration ausführen.');
          } else if (error.code === '42501' || error.message.includes('permission') || error.message.includes('RLS')) {
            throw new Error('Keine Berechtigung. Bitte RLS Policies für "generated_creatives" prüfen.');
          }
          throw error;
        }

        const mapped = (data || []).map((row) => mapCreativeRow(row, favoriteIds));
        if (mounted) setCreatives(mapped);
      } catch (err: unknown) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load creatives';
          console.error('CreativeLibrary load error:', errorMessage, err);
          setLoadError(errorMessage);
          setCreatives([]);

          // Show toast for user feedback
          toast.error(errorMessage);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [favoriteIds, mapCreativeRow, reloadTick]);

  const filteredCreatives = useMemo(() => {
    return creatives.filter(creative => {
      const matchesSearch = creative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creative.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || creative.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [creatives, searchQuery, selectedType]);

  const stats = useMemo(() => {
    const total = creatives.length;
    const sumRoas = creatives.reduce((sum, c) => sum + c.performance.roas, 0);
    return {
      total,
      images: creatives.filter(c => c.type === 'image').length,
      videos: creatives.filter(c => c.type === 'video').length,
      carousels: creatives.filter(c => c.type === 'carousel').length,
      avgROAS: total ? (sumRoas / total).toFixed(1) : '0.0'
    };
  }, [creatives]);

  const handleToggleFavorite = useCallback((id: string) => {
    setCreatives(prev => prev.map(c =>
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ));
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    const creative = creatives.find(c => c.id === id);
    toast.success(creative?.isFavorite ? 'Aus Favoriten entfernt' : '⭐ Zu Favoriten hinzugefügt');
  }, [creatives]);

  const handleDelete = useCallback((id: string) => {
    (async () => {
      const creative = creatives.find(c => c.id === id);
      try {
        const { error } = await supabase.from('generated_creatives').delete().eq('id', id);
        if (error) throw error;
        setCreatives(prev => prev.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
        toast.success(`Deleted "${creative?.name}"`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Delete failed');
      }
    })();
  }, [creatives]);



  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectionMode(false);
  }, []);

  const selectAll = useCallback(() => {
    setSelectionMode(true);
    setSelectedIds(filteredCreatives.map(c => c.id));
  }, [filteredCreatives]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} Creatives wirklich löschen?`)) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('generated_creatives')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      setCreatives(prev => prev.filter(c => !selectedIds.includes(c.id)));
      toast.success(`${selectedIds.length} Creatives gelöscht`);
      clearSelection();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk delete failed');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, clearSelection]);

  const handleDuplicate = useCallback((id: string) => {
    (async () => {
      const creative = creatives.find(c => c.id === id);
      if (!creative) return;
      try {
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id;
        if (!userId) {
          throw new Error('Bitte zuerst anmelden.');
        }

        const { data: detail, error: detailError } = await supabase
          .from('generated_creatives')
          .select('outputs,inputs,thumbnail,metrics')
          .eq('id', id)
          .single();
        if (detailError) throw detailError;

        const { data, error } = await supabase
          .from('generated_creatives')
          .insert({
            user_id: userId,
            outputs: detail?.outputs || null,
            inputs: detail?.inputs || null,
            thumbnail: detail?.thumbnail || null,
            metrics: detail?.metrics || null,
            saved: true,
          })
          .select('id,inputs,created_at,saved,thumbnail,metrics')
          .single();

        if (error) throw error;
        const mapped = mapCreativeRow(data, favoriteIds);
        setCreatives(prev => [mapped, ...prev]);
        toast.success('🎉 Creative erfolgreich dupliziert!');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Duplicate failed');
      }
    })();
  }, [creatives, favoriteIds, mapCreativeRow]);

  const handleCreateAd = useCallback(() => {
    setStudioView('wizard');
  }, []);

  const handleWizardComplete = useCallback((doc: AdDocument) => {
    setStudioDoc(doc);
    setStudioView('editor');
  }, []);

  const handleStudioClose = useCallback(() => {
    setStudioDoc(undefined);
    setStudioView('idle');
  }, []);

  const handleStudioSave = useCallback(async (doc: AdDocument) => {
    try {
      const headlineLayer = doc.layers.find((l: StudioLayer) =>
        l.type === 'text' && (l.name.toLowerCase().includes('headline') || (l as TextLayer).fontSize > 40)
      );
      const descLayer = doc.layers.find((l: StudioLayer) => l.type === 'text' && l.id !== headlineLayer?.id);
      const ctaLayer = doc.layers.find((l: StudioLayer) => l.type === 'cta' || l.name.toLowerCase().includes('cta'));
      const imageLayer = doc.layers.find((l: StudioLayer) => l.type === 'product' || l.type === 'background');

      const payload = {
        createdFrom: 'studio',
        lifecycle: { status: 'active' },
        productName: doc.name || 'AdRuby Design',
        targetAudience: doc.meta?.mood || 'General',
        headline: (headlineLayer as TextLayer)?.text || 'New Creative',
        description: (descLayer as TextLayer)?.text || '',
        cta: (ctaLayer as TextLayer)?.text || 'Learn More',
        copy: {
          hook: (headlineLayer as TextLayer)?.text || 'New Creative',
          primary_text: (descLayer as TextLayer)?.text || '',
          cta: (ctaLayer as TextLayer)?.text || 'Learn More',
        },
        thumbnail: (imageLayer as ImageLayer)?.src || null,
        doc_snapshot: doc,
      };

      await creativeSaveToLibrary({
        output: payload,
        blueprintId: doc.meta?.blueprintId,
        score: doc.meta?.score,
      });

      toast.success('Ad saved to library.');
      setReloadTick((prev) => prev + 1);
      handleStudioClose();
    } catch (err) {
      console.error('Failed to save ad:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save ad.');
    }
  }, [handleStudioClose]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadFileToStorage = useCallback(async (file: File, userId: string) => {
    const ext = file.name.split('.').pop() || 'png';
    const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-z0-9._-]/gi, '');
    const path = `${userId}/library-${Date.now()}-${crypto.randomUUID()}-${safeName}.${ext}`;
    const buckets = ['creative-renders', 'creative-inputs'];
    let bucketUsed = buckets[0];
    let uploaded = false;

    for (const bucket of buckets) {
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
      if (!error) {
        bucketUsed = bucket;
        uploaded = true;
        break;
      }
      if (!error?.message?.toLowerCase().includes('bucket')) {
        throw new Error(error.message);
      }
    }

    if (!uploaded) {
      throw new Error('Storage bucket fehlt. Bitte creative-renders oder creative-inputs anlegen.');
    }

    const { data: publicData } = supabase.storage.from(bucketUsed).getPublicUrl(path);
    if (publicData?.publicUrl) {
      return { bucket: bucketUsed, path, url: publicData.publicUrl };
    }

    const signed = await supabase.storage.from(bucketUsed).createSignedUrl(path, 60 * 60);
    if (signed.error) {
      throw new Error(signed.error.message);
    }
    return { bucket: bucketUsed, path, url: signed.data.signedUrl };
  }, []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      event.target.value = '';

      if (!file.type.startsWith('image/')) {
        toast.error('Bitte nur Bilddateien hochladen.');
        return;
      }

      (async () => {
        setIsUploading(true);
        setUploadError(null);
        try {
          const { data: session } = await supabase.auth.getSession();
          const userId = session.session?.user?.id;
          if (!userId) throw new Error('Bitte zuerst anmelden.');

          const upload = await uploadFileToStorage(file, userId);
          const name = file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Creative';

          const { data, error } = await supabase
            .from('generated_creatives')
            .insert({
              user_id: userId,
              saved: true,
              thumbnail: upload.url,
              inputs: {
                creativeName: name,
                creativeType: 'image',
                tags: ['uploaded'],
                upload: { bucket: upload.bucket, path: upload.path, filename: file.name },
              },
            })
            .select('id,thumbnail,created_at,metrics,inputs,saved')
            .single();

          if (error) throw error;
          const mapped = mapCreativeRow(data, favoriteIds);
          setCreatives(prev => [mapped, ...prev]);
          toast.success('Creative hochgeladen');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Upload fehlgeschlagen';
          setUploadError(message);
          toast.error(message);
        } finally {
          setIsUploading(false);
        }
      })();
    },
    [favoriteIds, mapCreativeRow, uploadFileToStorage]
  );

  type CreativeImageRef = {
    final_image_url?: string | null;
    final_image_bucket?: string | null;
    final_image_path?: string | null;
    hero_image_url?: string | null;
    hero_image_bucket?: string | null;
    hero_image_path?: string | null;
    input_image_url?: string | null;
  };
  type CreativeOutputVariant = {
    visual?: { image?: CreativeImageRef | null } | null;
    image?: CreativeImageRef | null;
  };

  const resolveDownloadUrl = useCallback((row: { thumbnail?: string | null; outputs?: unknown | null }) => {
    if (row.thumbnail) return { url: row.thumbnail, bucket: null, path: null };
    const outputs = row.outputs as
      | { variants?: CreativeOutputVariant[]; creatives?: CreativeOutputVariant[] }
      | null;
    const variants = outputs?.variants || outputs?.creatives || [];
    const first = Array.isArray(variants) ? variants[0] : null;
    const image = first?.visual?.image || first?.image || null;
    const url = image?.final_image_url || image?.hero_image_url || image?.input_image_url || null;
    const bucket = image?.final_image_bucket || image?.hero_image_bucket || null;
    const path = image?.final_image_path || image?.hero_image_path || null;
    return { url, bucket, path };
  }, []);

  const handleDownload = useCallback((id: string) => {
    (async () => {
      const creative = creatives.find(c => c.id === id);
      try {
        const { data, error } = await supabase
          .from('generated_creatives')
          .select('thumbnail,outputs')
          .eq('id', id)
          .single();
        if (error) throw error;
        const resolved = resolveDownloadUrl(data || {});
        let url = resolved.url || null;
        if (!url && resolved.bucket && resolved.path) {
          try {
            const { creativeImageUrl } = await import("../lib/api/creative");
            url = await creativeImageUrl({ bucket: resolved.bucket, path: resolved.path });
          } catch {
            url = null;
          }
        }
        if (!url) {
          throw new Error('Kein Bild zum Download gefunden.');
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Download fehlgeschlagen.');
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        const safeName = (creative?.name || 'creative').replace(/[^a-z0-9-_]+/gi, '_');
        link.download = `${safeName}.png`;
        link.click();
        URL.revokeObjectURL(objectUrl);
        toast.success('Download gestartet');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Download fehlgeschlagen');
      }
    })();
  }, [creatives, resolveDownloadUrl]);

  const handleEditOpen = useCallback((creative: Creative) => {
    setEditingCreative(creative);
    setEditName(creative.name);
    setEditTags(creative.tags.join(', '));
  }, []);

  const handleEditSave = useCallback(() => {
    if (!editingCreative) return;
    const nextName = editName.trim();
    if (!nextName) {
      toast.error('Bitte einen Namen angeben.');
      return;
    }

    const tags = editTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    (async () => {
      setIsSavingEdit(true);
      try {
        const { data: detail, error: detailError } = await supabase
          .from('generated_creatives')
          .select('inputs')
          .eq('id', editingCreative.id)
          .single();
        if (detailError) throw detailError;

        const inputs = { ...(detail?.inputs || {}), creativeName: nextName, tags };
        const { error } = await supabase
          .from('generated_creatives')
          .update({ inputs })
          .eq('id', editingCreative.id);
        if (error) throw error;

        setCreatives(prev =>
          prev.map(c =>
            c.id === editingCreative.id
              ? { ...c, name: nextName, tags }
              : c
          )
        );
        toast.success('Creative aktualisiert');
        setEditingCreative(null);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Update fehlgeschlagen');
      } finally {
        setIsSavingEdit(false);
      }
    })();
  }, [editName, editTags, editingCreative]);

  const typeIcons = useMemo(
    () => ({
      image: ImageIcon,
      video: Video,
      carousel: FileText,
    }),
    [],
  );

  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-background text-primary">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Lade Studio...</p>
      </div>
    </div>
  );

  // Memoized row component for list view to avoid re-renders when unrelated state changes
  const CreativeListRow = useCallback(
    (props: { creative: Creative }) => {
      const { creative } = props;
      const TypeIcon = typeIcons[creative.type];
      return (
        <tr key={creative.id} className="border-b border-border hover:bg-muted/50 transition-colors">
          <td className="p-4">
            <div className="flex items-center gap-3">
              {creative.thumbnail || creative.url ? (
                creative.type === 'video' ? (
                  <video
                    src={creative.url || creative.thumbnail}
                    poster={creative.thumbnail !== creative.url ? creative.thumbnail : undefined}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-16 h-10 object-cover rounded"
                  />
                ) : (
                  <img
                    src={creative.thumbnail}
                    alt={creative.name}
                    loading="lazy"
                    decoding="async"
                    width={64}
                    height={40}
                    className="w-16 h-10 object-cover rounded"
                  />
                )
              ) : (
                <div className="w-16 h-10 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                  {creative.type === 'video' ? '🎬' : 'AI'}
                </div>
              )}
              <div>
                <div className="font-medium text-foreground">{creative.name}</div>
                <div className="text-xs text-muted-foreground">{creative.uploadedAt}</div>
              </div>
            </div>
          </td>
          <td className="p-4">
            <div className="flex items-center gap-1 text-foreground">
              <TypeIcon className="w-4 h-4" />
              <span className="capitalize">{creative.type}</span>
            </div>
          </td>
          <td className="p-4">
            <div className="flex flex-wrap gap-1">
              {creative.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          </td>
          <td className="p-4 text-right font-medium text-foreground">
            {(creative.performance.impressions / 1000).toFixed(1)}K
          </td>
          <td className="p-4 text-right font-medium text-foreground">{creative.performance.ctr}%</td>
          <td className="p-4 text-right font-bold text-green-500">{creative.performance.roas}x</td>
          <td className="p-4">
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => handleToggleFavorite(creative.id)} className="p-1.5 hover:bg-muted rounded transition-colors">
                <Star className={`w-4 h-4 ${creative.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
              </button>
              <button onClick={() => handleDownload(creative.id)} className="p-1.5 hover:bg-muted rounded transition-colors">
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDuplicate(creative.id)} className="p-1.5 hover:bg-muted rounded transition-colors">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleEditOpen(creative)} className="p-1.5 hover:bg-muted rounded transition-colors">
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => handleDelete(creative.id)} className="p-1.5 hover:bg-red-500/20 rounded transition-colors">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </td>
        </tr>
      );
    },
    [handleDelete, handleDownload, handleDuplicate, handleEditOpen, handleToggleFavorite, typeIcons]
  );

  const gridRef = useRef<HTMLDivElement | null>(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGridWidth(Math.floor(entry.contentRect.width));
      }
    });
    observer.observe(element);
    setGridWidth(Math.floor(element.getBoundingClientRect().width));

    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const gridGap = 24;
  const isNarrowGrid = gridWidth < 640;
  const cardWidth = isNarrowGrid ? Math.min(gridWidth, Math.max(220, gridWidth - gridGap * 2)) : 360;
  const cardHeight = isNarrowGrid ? 360 : 380;
  const gridColumnCount = Math.max(1, Math.floor((gridWidth + gridGap) / (cardWidth + gridGap)));
  const gridRowCount = Math.ceil(filteredCreatives.length / gridColumnCount);
  const gridHeight = Math.max(360, Math.min(isNarrowGrid ? 720 : 900, viewportHeight - (isNarrowGrid ? 220 : 260)));

  const renderGridCell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: CSSProperties;
  }) => {
    const index = rowIndex * gridColumnCount + columnIndex;
    const creative = filteredCreatives[index];
    if (!creative) return null;
    const TypeIcon = typeIcons[creative.type];

    return (
      <div style={{ ...style, left: Number(style.left) + gridGap / 2, top: Number(style.top) + gridGap / 2 }}>
        <div className="creative-card stagger-reveal" style={{ width: cardWidth, height: cardHeight, animationDelay: `${index * 50}ms` }}>
          {/* Image — fixed height, no aspect-ratio to prevent overflow */}
          <div className="creative-card-image" style={{ height: '200px' }}>
            {creative.thumbnail || creative.url ? (
              creative.type === 'video' ? (
                <video
                  src={creative.url || creative.thumbnail}
                  poster={creative.thumbnail !== creative.url ? creative.thumbnail : undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={creative.thumbnail}
                  alt={creative.name}
                  loading="lazy"
                  decoding="async"
                  width={320}
                  height={200}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-muted">
                {creative.type === 'video' ? '🎬 Video' : 'AI Creative'}
              </div>
            )}

            <div className="creative-card-overlay">
              <button
                onClick={() => handleToggleFavorite(creative.id)}
                className="creative-card-action"
                title="Favorit"
              >
                <Star className={`w-4 h-4 ${creative.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </button>
              <button
                onClick={() => handleDownload(creative.id)}
                className="creative-card-action"
                title="Herunterladen"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(creative.id)}
                className="creative-card-action"
                title="Löschen"
                style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full flex items-center gap-1 bg-black/65 backdrop-blur-md border border-white/5">
              <TypeIcon className="w-3 h-3 text-white" />
              <span className="text-[10px] text-white font-medium capitalize">{creative.type}</span>
            </div>

            {creative.isFavorite && (
              <div className="absolute top-3 right-3">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              </div>
            )}
          </div>

          {/* Card body — fixed remaining height, no overflow */}
          <div className="creative-card-body flex flex-col overflow-hidden" style={{ flex: 1 }}>
            <h3 className="creative-card-name">{creative.name}</h3>

            <div className="flex flex-wrap gap-1 mt-1.5 mb-auto">
              {creative.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="creative-card-tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="creative-card-stats mt-auto shrink-0">
              <div>
                <div className="creative-card-stat-label">Views</div>
                <div className="creative-card-stat-value">
                  {(creative.performance.impressions / 1000).toFixed(1)}K
                </div>
              </div>
              <div>
                <div className="creative-card-stat-label">CTR</div>
                <div className="creative-card-stat-value">
                  {creative.performance.ctr}%
                </div>
              </div>
              <div>
                <div className="creative-card-stat-label">ROAS</div>
                <div className="creative-card-stat-value text-primary">
                  {creative.performance.roas}x
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardShell
      hideHero
      headerChips={
        <div className="flex flex-wrap gap-2 items-center">
          <span className="stat-pill">{stats.total} Gesamt</span>
          <span className="stat-pill">{stats.images} Bilder</span>
          <span className="stat-pill">{stats.videos} Videos</span>
          <span className="stat-pill stat-pill-accent">{stats.avgROAS}x Ø ROAS</span>
        </div>
      }
      headerActions={
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={handleCreateAd}
            className="generate-btn gap-2 text-white border-0 rounded-xl"
          >
            <Sparkles className="w-4 h-4" />
            Neue Ad erstellen
          </Button>
          <Button
            onClick={handleUploadClick}
            disabled={isUploading}
            variant="outline"
            className="gap-2 rounded-xl border-border/60"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Hochladen…' : 'Hochladen'}
          </Button>
        </div>
      }
    >
      {/* ── Editorial Page Header ──────────────────────── */}
      <div className="page-header-editorial">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Creative Library</h1>
            <p className="page-subtitle">Verwalte und organisiere deine Ad Creatives</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {loadError && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-600">
          {loadError}
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700">
          {uploadError}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Search */}
      <div className="card-obsidian p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Creatives nach Name oder Tags suchen..."
              className="pl-10 bg-muted/50 border-border text-foreground rounded-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            {(['all', 'image', 'video', 'carousel'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`filter-chip ${selectedType === type ? 'filter-chip-active' : ''}`}
              >
                {type === 'all' ? 'Alle' : type === 'image' ? 'Bilder' : type === 'video' ? 'Videos' : 'Karussells'}
              </button>
            ))}

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                  }`}
              >
                <Grid3x3 className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                  }`}
              >
                <List className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Selection Mode Toggle */}
            <button
              onClick={() => selectionMode ? clearSelection() : setSelectionMode(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${selectionMode
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              <CheckSquare className="w-4 h-4" />
              {selectionMode ? `${selectedIds.length} ausgewählt` : 'Auswählen'}
            </button>
          </div>
        </div>
      </div>

      {/* Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-20 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {selectedIds.length} Creatives ausgewählt
              </div>
              <div className="text-xs text-muted-foreground">
                Bulk-Aktionen verfügbar
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={selectAll}
              className="px-3 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold w-full sm:w-auto"
            >
              Alle auswählen ({filteredCreatives.length})
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold w-full sm:w-auto"
            >
              Auswahl aufheben
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              {isDeleting ? 'Löschen...' : `${selectedIds.length} löschen`}
            </button>
          </div>
        </div>
      )}


      {viewMode === 'grid' || isNarrowGrid ? (
        <div ref={gridRef} className="w-full">
          {gridWidth > 0 && (
            <FixedSizeGrid
              columnCount={gridColumnCount}
              columnWidth={cardWidth + gridGap}
              height={gridHeight}
              rowCount={gridRowCount}
              rowHeight={cardHeight + gridGap}
              width={gridWidth}
            >
              {renderGridCell}
            </FixedSizeGrid>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Creative</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Typ</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Tags</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">Impressionen</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">CTR</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">ROAS</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredCreatives.map((creative) => (
                <CreativeListRow key={creative.id} creative={creative} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCreatives.length === 0 && (
        <EmptyState
          icon={ImageIcon}
          title="Keine Creatives gefunden"
          description="Speichere Creatives aus dem Ad Builder, damit sie hier erscheinen."
        />
      )}

      {editingCreative && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={() => setEditingCreative(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl bg-card border border-border backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-display font-bold text-lg text-foreground mb-4">Creative bearbeiten</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="mt-2 w-full rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 bg-muted/50 border border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                <input
                  value={editTags}
                  onChange={(event) => setEditTags(event.target.value)}
                  placeholder="z.B. performance, fitness"
                  className="mt-2 w-full rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 bg-muted/50 border border-border"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingCreative(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted/80 transition-colors border border-border"
              >
                Abbrechen
              </button>
              <button
                onClick={handleEditSave}
                disabled={isSavingEdit}
                className="generate-btn px-4 py-2 rounded-xl text-sm text-white disabled:opacity-50"
              >
                {isSavingEdit ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}

      {studioView !== 'idle' && (
        <div className="fixed inset-0 z-[9999] bg-background overflow-hidden">
          <Suspense fallback={<LoadingFallback />}>
            {studioView === 'wizard' ? (
              <AdWizard
                isOpen={true}
                onClose={handleStudioClose}
                onComplete={handleWizardComplete}
              />
            ) : (
              <EditorLayout
                onClose={handleStudioClose}
                onSave={handleStudioSave}
                initialDoc={studioDoc}
              />
            )}
          </Suspense>
        </div>
      )}
    </DashboardShell>
  );
}
