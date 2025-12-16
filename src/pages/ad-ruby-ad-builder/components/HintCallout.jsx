import React from 'react';
import { UI } from '../../../components/ui/uiPrimitives';
import { Sparkles } from 'lucide-react';

const HintCallout = ({ text }) => (
  <div className="rounded-xl border border-border bg-accent/40 p-3 flex items-center gap-2">
    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
      <Sparkles size={16} className="text-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

export default HintCallout;
