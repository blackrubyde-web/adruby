import type { ReactNode } from "react";
import { Copy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import type { CreativeOutputV1 } from "../../lib/creative/schemas";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { creativeImageUrl } from "../../lib/api/creative";

export default function CreativeCard(props: {
  creative: CreativeOutputV1["creatives"][number];
  angleLabel?: string;
  onDuplicate?: () => void;
  onCopy?: (text: string) => void;
  actions?: ReactNode;
}) {
  const c = props.creative;
  const aspectClass =
    c.format === "9:16"
      ? "aspect-[9/16]"
      : c.format === "4:5"
        ? "aspect-[4/5]"
        : "aspect-square";

  const scoreVariant =
    c.score.value >= 85 ? "default" : c.score.value >= 70 ? "secondary" : "outline";

  const copyAll = () => {
    const text = [
      `Hook: ${c.copy.hook}`,
      "",
      c.copy.primary_text,
      "",
      `CTA: ${c.copy.cta}`,
      ...(c.copy.bullets?.length ? ["", "Bullets:", ...c.copy.bullets.map((b) => `- ${b}`)] : []),
    ].join("\n");
    props.onCopy?.(text);
  };

  const imageSrc = c.image.final_image_url ?? c.image.hero_image_url ?? undefined;
  const imageBucket = c.image.final_image_bucket ?? c.image.hero_image_bucket ?? null;
  const imagePath = c.image.final_image_path ?? c.image.hero_image_path ?? null;
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(imageSrc);
  const [imageError, setImageError] = useState<string | null>(c.image.error ?? null);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  useEffect(() => {
    setResolvedSrc(imageSrc);
    setImageError(c.image.error ?? null);
    setRefreshAttempted(false);
  }, [imageSrc, c.image.error]);

  useEffect(() => {
    if (imageSrc || !imageBucket || !imagePath) return;
    let active = true;
    creativeImageUrl({ bucket: imageBucket, path: imagePath })
      .then((url) => {
        if (active && url) {
          setResolvedSrc(url);
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Image URL failed";
        setImageError(message);
      });
    return () => {
      active = false;
    };
  }, [imageSrc, imageBucket, imagePath]);

  const displaySrc = resolvedSrc ?? imageSrc;

  return (
    <Card className="p-4">
      {displaySrc ? (
        <div
          className={`mb-3 w-full overflow-hidden rounded-xl border border-border bg-muted/20 ${aspectClass}`}
        >
          <ImageWithFallback
            src={displaySrc}
            alt={c.copy.hook}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => {
              if (refreshAttempted || !imageBucket || !imagePath) return;
              setRefreshAttempted(true);
              creativeImageUrl({ bucket: imageBucket, path: imagePath })
                .then((url) => {
                  if (url) setResolvedSrc(url);
                })
                .catch((err: unknown) => {
                  const message = err instanceof Error ? err.message : "Image URL failed";
                  setImageError(message);
                });
            }}
          />
        </div>
      ) : (
        <div
          className={`mb-3 flex w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-xs text-muted-foreground ${aspectClass}`}
        >
          {imageError ? `Image error: ${imageError}` : "Image rendering pending"}
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{props.angleLabel ?? c.angle_id}</Badge>
            <Badge variant={scoreVariant}>Score {c.score.value}</Badge>
            <Badge variant="secondary">{c.format}</Badge>
          </div>
          <div className="mt-2 text-base font-semibold leading-snug">{c.copy.hook}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {props.actions}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => {
              copyAll();
              toast.success("Copied ad copy");
            }}
            aria-label="Copy ad copy"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => props.onDuplicate?.()}
            aria-label="Create variant"
            title="Create variant"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="space-y-3 text-sm">
        <div className="whitespace-pre-wrap text-foreground">{c.copy.primary_text}</div>

        {c.copy.bullets?.length > 0 && (
          <ul className="list-disc pl-5 text-muted-foreground">
            {c.copy.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">CTA:</span> {c.copy.cta}
          </div>
          <div className="text-xs text-muted-foreground">{c.score.rationale}</div>
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Render intent:</span>{" "}
          {c.image.render_intent}
        </div>
      </div>
    </Card>
  );
}
