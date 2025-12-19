import { useEffect, useMemo, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

export default function ImageDropzone(props: {
  value: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => {
    if (!props.value) return null;
    return URL.createObjectURL(props.value);
  }, [props.value]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const accept = "image/png,image/jpeg,image/webp";

  const onPick = () => inputRef.current?.click();

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    props.onChange(file);
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative flex min-h-[220px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center transition-colors",
          "hover:bg-muted/30",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onClick={onPick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onPick();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />

        {!props.value && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium">Drop your image here</div>
            <div className="text-xs text-muted-foreground">
              JPG / PNG / WebP • up to 10MB • optional
            </div>
            <Button type="button" variant="secondary" size="sm" className="mt-1" onClick={onPick}>
              Choose file
            </Button>
          </div>
        )}

        {props.value && previewUrl && (
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{props.value.name}</div>
                <div className="text-xs text-white/80">
                  {(props.value.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPick();
                  }}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.onChange(null);
                  }}
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
