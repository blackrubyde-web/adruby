import { Sparkles } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { PageShell } from "./layout/PageShell";
import CreativeBuilderWizard from "./creative-builder/CreativeBuilderWizard";

export function CreativeBuilderPage() {
  return (
    <PageShell>
      <PageHeader
        title="Creative Builder"
        description="Upload an image, normalize your brief into strict JSON, then generate high-performing ad variants."
        icon={Sparkles}
      />
      <CreativeBuilderWizard />
    </PageShell>
  );
}

