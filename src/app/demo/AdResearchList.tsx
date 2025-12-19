import { useEffect, useState } from 'react';
import { fetchAdResearch } from '../lib/api/creative';

type AdResearchItem = {
  id: string;
  image_url?: string | null;
  headline?: string | null;
  page_name?: string | null;
  ad_library_id?: string | null;
  primary_text?: string | null;
};

export default function AdResearchList({
  limit = 5,
  selectedIds = [],
  onToggle,
  refreshKey = 0,
}: {
  limit?: number;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  refreshKey?: number;
}) {
  const [items, setItems] = useState<AdResearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchAdResearch(limit)
      .then((res) => {
        if (!mounted) return;
        setItems(res.items || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || String(err));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [limit, refreshKey]);

  if (loading) return <div>Loading research...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!items.length) return <div className="text-sm text-muted-foreground">No research ads found.</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          className="text-xs text-primary underline"
          onClick={() => {
            // select all
            items.forEach((it) => onToggle && !selectedIds?.includes(it.id) && onToggle(it.id));
          }}
        >
          Select all
        </button>
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => {
            // clear selection
            items.forEach((it) => onToggle && selectedIds?.includes(it.id) && onToggle(it.id));
          }}
        >
          Clear
        </button>
      </div>

      {items.map((it) => {
        const checked = selectedIds?.includes(it.id);
        return (
          <label key={it.id} className="p-3 border rounded flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle && onToggle(it.id)}
              className="mt-1"
            />
            {it.image_url ? (
              <img src={it.image_url} alt={it.headline || ''} className="w-16 h-16 object-cover rounded" />
            ) : (
              <div className="w-16 h-16 bg-border rounded" />
            )}
            <div>
              <div className="font-semibold">{it.page_name || it.ad_library_id}</div>
              <div className="text-sm text-muted-foreground">{it.headline}</div>
              <div className="mt-2 text-sm">{it.primary_text}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
