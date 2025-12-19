import { useState } from "react";
import useAdBuilderMock from "../hooks/useAdBuilderMock";
import AdResearchList from './AdResearchList';

export default function AdDemoPage() {
  const { status, analyze, generate, result, quality, error, cancel } = useAdBuilderMock();
  const [running, setRunning] = useState(false);

  async function runDemo() {
    setRunning(true);
    try {
      const fd = new FormData();
      fd.append("brandName", "DemoBrand");
      fd.append("productName", "Demo Produkt");
      fd.append("audience", "Selbständige, Kleinunternehmer");
      fd.append("tone", "direct");
      fd.append("goal", "sales");

      await analyze(fd);
      await generate({ brief: {}, hasImage: false });
    } catch {
      // noop -- hook exposes error state
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Ad Demo — Generierter Vorschlag</h2>
      <div className="mb-4">
        <button className="btn" onClick={runDemo} disabled={running || status !== "idle"}>
          {running ? "Running…" : "Generate demo ad"}
        </button>
        <button className="ml-3 btn-ghost" onClick={cancel} disabled={status === "idle"}>
          Cancel
        </button>
      </div>

  <div className="mb-4">Status: <strong>{status}</strong></div>

  <h3 className="mt-6 mb-2 font-semibold">Recent Ad Research</h3>
  <AdResearchList limit={5} />

      {error && <div className="text-red-600">Error: {error}</div>}

      {result ? (
        <div className="border p-4 rounded">
          <h3 className="text-lg font-bold">Headline</h3>
          <p className="mb-2">{result.variants?.[0]?.headline}</p>
          <h4 className="font-semibold">Body</h4>
          <p className="mb-2">{result.variants?.[0]?.body}</p>
          <div className="mt-3">
            <strong>CTA:</strong> {result.variants?.[0]?.cta}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Quality: {quality?.satisfaction ?? "n/a"}</div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No result yet — click Generate demo ad.</div>
      )}
    </div>
  );
}
