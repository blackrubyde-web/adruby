import { ImageIcon, Upload, Search, Eye, Download, Trash2, Star, Grid3x3, List, Video, FileText, Copy, Edit2, MousePointerClick, TrendingUp, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import { FixedSizeGrid } from 'react-window';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { EmptyState } from './EmptyState';
import { supabase } from '../lib/supabaseClient';

interface Creative {
  id: string;
  name: string;
  type: 'image' | 'video' | 'carousel';
  url: string;
  thumbnail: string;
  tags: string[];
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

export function CreativeLibraryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'carousel'>('all');

  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('creativeLibraryFavorites');
      const ids = raw ? JSON.parse(raw) : [];
      return new Set<string>(Array.isArray(ids) ? ids : []);
    } catch {
      return new Set<string>();
    }
  });

  // Bulk selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  type CreativeRow = {
    id: string;
    thumbnail?: string | null;
    inputs?: Record<string, unknown> | null;
    created_at?: string | null;
    metrics?: {
      impressions?: number;
      clicks?: number;
      ctr?: number;
      conversions?: number;
      roas?: number;
    } | null;
  };

  const mapCreativeRow = useCallback((row: CreativeRow, favorites: Set<string>): Creative => {
    const inputs = (row?.inputs || {}) as {
      creativeName?: string;
      productName?: string;
      creativeType?: string;
      tags?: string[];
      brief?: { product?: { name?: string; category?: string }; goal?: string };
    };
    const brief = inputs?.brief || null;
    const name =
      inputs?.creativeName ||
      brief?.product?.name ||
      inputs?.productName ||
      'AI Creative';

    const typeCandidate = inputs?.creativeType;
    const type: Creative['type'] =
      typeCandidate === 'video' || typeCandidate === 'carousel' ? typeCandidate : 'image';

    const hasCustomTags = Array.isArray(inputs?.tags);
    const customTags = hasCustomTags ? inputs.tags || [] : [];
    const fallbackTags = [
      brief?.product?.category || 'ai',
      brief?.goal || 'performance',
      'generated',
    ].filter(Boolean);
    const tags = hasCustomTags ? customTags : fallbackTags;

    return {
      id: row.id,
      name,
      type,
      url: '',
      thumbnail: row.thumbnail || '',
      tags,
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
          .select('id,thumbnail,created_at,metrics,saved')
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
  }, [favoriteIds, mapCreativeRow]);

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
    toast.success(creative?.isFavorite ? 'Removed from favorites' : '⭐ Added to favorites');
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
        toast.success('🎉 Creative duplicated successfully!');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Duplicate failed');
      }
    })();
  }, [creatives, favoriteIds, mapCreativeRow]);

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
            .select('id,thumbnail,created_at,metrics,inputs')
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

  // Memoized row component for list view to avoid re-renders when unrelated state changes
  const CreativeListRow = useCallback(
    (props: { creative: Creative }) => {
      const { creative } = props;
      const TypeIcon = typeIcons[creative.type];
      return (
        <tr key={creative.id} className="border-b border-border hover:bg-muted/50 transition-colors">
          <td className="p-4">
            <div className="flex items-center gap-3">
              {creative.thumbnail ? (
                <img
                  src={creative.thumbnail}
                  alt={creative.name}
                  loading="lazy"
                  decoding="async"
                  width={64}
                  height={40}
                  className="w-16 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-10 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                  AI
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
  const cardWidth = 360;
  const cardHeight = 520;
  const gridColumnCount = Math.max(1, Math.floor((gridWidth + gridGap) / (cardWidth + gridGap)));
  const gridRowCount = Math.ceil(filteredCreatives.length / gridColumnCount);
  const gridHeight = Math.max(480, Math.min(900, viewportHeight - 260));

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
        <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02] group" style={{ width: cardWidth, height: cardHeight }}>
          <div className="relative aspect-video bg-muted overflow-hidden">
            {creative.thumbnail ? (
              <img
                src={creative.thumbnail}
                alt={creative.name}
                loading="lazy"
                decoding="async"
                width={320}
                height={180}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center text-muted-foreground text-sm">
                AI Creative
              </div>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => handleToggleFavorite(creative.id)}
                className="p-2 bg-card rounded-lg hover:bg-card/90 transition-colors"
              >
                <Star className={`w-4 h-4 ${creative.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-foreground'}`} />
              </button>
              <button
                onClick={() => handleDownload(creative.id)}
                className="p-2 bg-card rounded-lg hover:bg-card/90 transition-colors"
              >
                <Download className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => handleDuplicate(creative.id)}
                className="p-2 bg-card rounded-lg hover:bg-card/90 transition-colors"
              >
                <Copy className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => handleEditOpen(creative)}
                className="p-2 bg-card rounded-lg hover:bg-card/90 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => handleDelete(creative.id)}
                className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 rounded-lg flex items-center gap-1">
              <TypeIcon className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium capitalize">{creative.type}</span>
            </div>

            {creative.isFavorite && (
              <div className="absolute top-3 right-3">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{creative.name}</h3>

            <div className="flex flex-wrap gap-1 mb-3">
              {creative.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs">Views</span>
                </div>
                <div className="text-sm font-bold text-foreground">
                  {(creative.performance.impressions / 1000).toFixed(1)}K
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <MousePointerClick className="w-3 h-3" />
                  <span className="text-xs">CTR</span>
                </div>
                <div className="text-sm font-bold text-foreground">
                  {creative.performance.ctr}%
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs">ROAS</span>
                </div>
                <div className="text-sm font-bold text-green-500">
                  {creative.performance.roas}x
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              <span>Used in {creative.usedInCampaigns} campaigns</span>
              <span>{creative.uploadedAt}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Hero Header */}
      <div className="backdrop-blur-xl bg-card/60 rounded-2xl border border-border/50 shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-foreground mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Creative Library
            </h1>
            <p className="text-muted-foreground">
              Manage and analyze all your ad creatives in one place
            </p>
          </div>
          <Button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading…' : 'Upload Creative'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Creatives</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">{stats.images}</div>
            <div className="text-sm text-muted-foreground">Images</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">{stats.videos}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">{stats.carousels}</div>
            <div className="text-sm text-muted-foreground">Carousels</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-border/30">
            <div className="text-2xl text-foreground font-bold mb-1">{stats.avgROAS}x</div>
            <div className="text-sm text-muted-foreground">Avg. ROAS</div>
          </div>
        </div>
      </div>

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
        <div className="p-4 rounded-xl border border-border bg-card text-sm text-muted-foreground">
          Lade Creative Library…
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creatives by name or tags..."
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            {(['all', 'image', 'video', 'carousel'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

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

      {/* Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-20 p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-center justify-between gap-4">
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
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold"
            >
              Alle auswählen ({filteredCreatives.length})
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold"
            >
              Auswahl aufheben
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Löschen...' : `${selectedIds.length} löschen`}
            </button>
          </div>
        </div>
      )}


      {viewMode === 'grid' ? (
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
                <th className="text-left p-4 text-sm font-semibold text-foreground">Type</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">Tags</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">Impressions</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">CTR</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">ROAS</th>
                <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
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
          title="No creatives found"
          description="Speichere Creatives aus dem Ad Builder, damit sie hier erscheinen."
        />
      )}

      {editingCreative && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setEditingCreative(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Creative bearbeiten</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                <input
                  value={editTags}
                  onChange={(event) => setEditTags(event.target.value)}
                  placeholder="z.B. performance, fitness"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingCreative(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted"
              >
                Abbrechen
              </button>
              <button
                onClick={handleEditSave}
                disabled={isSavingEdit}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {isSavingEdit ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
