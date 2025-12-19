import { Copy } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";

export default function JsonViewer(props: { value: unknown; title?: string }) {
  const text = JSON.stringify(props.value, null, 2);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("JSON copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{props.title ?? "JSON"}</div>
        <Button type="button" size="sm" variant="secondary" onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
      <div className="mt-3 rounded-lg border border-border bg-muted/20">
        <ScrollArea className="h-[520px] w-full">
          <pre className="p-4 text-xs leading-relaxed">
            <code>{text}</code>
          </pre>
        </ScrollArea>
      </div>
    </Card>
  );
}

