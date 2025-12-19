import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";

export default function StepHeader(props: {
  title: string;
  subtitle: string;
  step: 1 | 2 | 3;
}) {
  const pct = props.step === 1 ? 33 : props.step === 2 ? 66 : 100;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xl font-semibold text-foreground">{props.title}</div>
          <div className="text-sm text-muted-foreground">{props.subtitle}</div>
        </div>

        <Badge variant="secondary">Step {props.step}/3</Badge>
      </div>

      <Progress value={pct} />

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className={props.step === 1 ? "text-foreground" : ""}>1) Input</span>
        <span>•</span>
        <span className={props.step === 2 ? "text-foreground" : ""}>2) Review</span>
        <span>•</span>
        <span className={props.step === 3 ? "text-foreground" : ""}>3) Results</span>
      </div>
    </div>
  );
}

