import type { NormalizedBrief } from "../../lib/creative/schemas";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

function severityVariant(sev: string) {
  if (sev === "high") return "destructive";
  if (sev === "medium") return "secondary";
  return "outline";
}

function labelize(s: string) {
  return String(s || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim();
}

export default function NormalizedBriefReview(props: { brief: NormalizedBrief }) {
  const { brief } = props;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="text-sm font-semibold">Brief (normalized)</div>
          <Separator className="my-3" />

          <div className="grid gap-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground">Brand</div>
              <div className="text-right font-medium">{brief.brand.name}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground">Product</div>
              <div className="text-right font-medium">{brief.product.name}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground">Goal</div>
              <div className="text-right font-medium">{labelize(brief.goal)}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground">Funnel</div>
              <div className="text-right font-medium">{labelize(brief.funnel_stage)}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground">Language</div>
              <div className="text-right font-medium">{brief.language.toUpperCase()}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground">Format</div>
              <div className="text-right font-medium">{brief.format}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-muted-foreground">Tone</div>
              <div className="text-right font-medium">{labelize(brief.tone)}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold">Audience</div>
          <Separator className="my-3" />
          <div className="text-sm text-foreground">{brief.audience.summary}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {brief.audience.segments.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm font-semibold">Offer</div>
          <Separator className="my-3" />
          <div className="text-sm text-foreground">
            {brief.offer.summary ? brief.offer.summary : (
              <span className="text-muted-foreground">No explicit offer provided.</span>
            )}
          </div>
          {brief.offer.constraints?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {brief.offer.constraints.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="text-sm font-semibold">Angles</div>
          <Separator className="my-3" />
          <div className="grid gap-3">
            {brief.angles.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{a.label}</div>
                  <Badge variant="outline">{a.id}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{a.why_it_fits}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Risk flags</div>
            <Badge variant={brief.risk_flags.length ? "secondary" : "outline"}>
              {brief.risk_flags.length ? `${brief.risk_flags.length} found` : "none"}
            </Badge>
          </div>
          <Separator className="my-3" />
          {brief.risk_flags.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No obvious compliance risks detected.
            </div>
          ) : (
            <div className="grid gap-2">
              {brief.risk_flags.map((f, idx) => (
                <div key={`${f.type}-${idx}`} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{f.type}</div>
                    <div className="text-xs text-muted-foreground">{f.note}</div>
                  </div>
                  <Badge variant={severityVariant(f.severity)}>{f.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

