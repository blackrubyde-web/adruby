import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import type { CreativeOutputV1 } from "../../lib/creative/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import CreativeCard from "./CreativeCard";
import JsonViewer from "./JsonViewer";
import { creativeLibraryStatus, creativeSaveToLibrary } from "../../lib/api/creative";
import { toast } from "sonner";

export default function CreativeResults(props: {
  output: CreativeOutputV1;
  quality?: { satisfaction?: number; target?: number; issues?: unknown[] } | null;
  onReset: () => void;
}) {
  const [creatives, setCreatives] = useState(props.output.creatives);
  const [saving, setSaving] = useState(false);
  const [libraryEnabled, setLibraryEnabled] = useState<boolean>(false);
  const [libraryReason, setLibraryReason] = useState<string | null>(null);

  useEffect(() => {
    setCreatives(props.output.creatives);
  }, [props.output]);

  useEffect(() => {
    let mounted = true;
    creativeLibraryStatus()
      .then((s) => {
        if (!mounted) return;
        setLibraryEnabled(s.enabled);
        setLibraryReason(s.reason ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        setLibraryEnabled(false);
        setLibraryReason("Library module not configured yet.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const angles = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of props.output.brief.angles) map.set(a.id, a.label);
    return map;
  }, [props.output.brief.angles]);

  const satisfaction = props.quality?.satisfaction;
  const target = props.quality?.target ?? 95;
  const satVariant =
    typeof satisfaction === "number" && satisfaction >= target
      ? "default"
      : typeof satisfaction === "number" && satisfaction >= 80
        ? "secondary"
        : "outline";

  async function onSave() {
    setSaving(true);
    try {
      await creativeSaveToLibrary({ output: { ...props.output, creatives } });
      toast.success("Saved to Library");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Results</div>
            <div className="text-xs text-muted-foreground">
              {creatives.length} creatives generated • Format {props.output.brief.format} •{" "}
              {props.output.brief.language.toUpperCase()}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {typeof satisfaction === "number" && (
              <Badge variant={satVariant}>
                Quality {satisfaction}/{target}
              </Badge>
            )}

            <Button type="button" variant="secondary" onClick={props.onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              New brief
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      type="button"
                      disabled={!libraryEnabled || saving}
                      onClick={onSave}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving…" : "Save to Library"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!libraryEnabled && (
                  <TooltipContent>
                    {libraryReason ?? "Library module not configured yet."}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="creative">
        <TabsList>
          <TabsTrigger value="creative">Creative</TabsTrigger>
          <TabsTrigger value="creatives">Creatives</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="creative">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {creatives.map((c) => (
              <CreativeCard
                key={c.id}
                creative={c}
                angleLabel={angles.get(c.angle_id) ?? c.angle_id}
                onDuplicate={() => {
                  const id = crypto.randomUUID();
                  setCreatives((prev) => [
                    ...prev,
                    {
                      ...c,
                      id,
                      score: {
                        ...c.score,
                        value: Math.max(0, Math.min(100, Math.trunc(c.score.value - 2))),
                        rationale: `Variant of ${c.id}. ${c.score.rationale}`.slice(0, 240),
                      },
                    },
                  ]);
                }}
                onCopy={async (text) => {
                  await navigator.clipboard.writeText(text);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="creatives">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {creatives.map((c) => (
              <CreativeCard
                key={c.id}
                creative={c}
                angleLabel={angles.get(c.angle_id) ?? c.angle_id}
                onDuplicate={() => {
                  const id = crypto.randomUUID();
                  setCreatives((prev) => [
                    ...prev,
                    {
                      ...c,
                      id,
                      score: {
                        ...c.score,
                        value: Math.max(0, Math.min(100, Math.trunc(c.score.value - 2))),
                        rationale: `Variant of ${c.id}. ${c.score.rationale}`.slice(0, 240),
                      },
                    },
                  ]);
                }}
                onCopy={async (text) => {
                  await navigator.clipboard.writeText(text);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="json">
          <JsonViewer value={{ ...props.output, creatives }} title="CreativeOutput JSON" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
