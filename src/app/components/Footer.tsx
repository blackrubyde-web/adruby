import { memo } from 'react';
import { Heart } from 'lucide-react';

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 px-4 sm:px-8 border-t border-border/30 backdrop-blur-sm bg-card/40">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
              © {currentYear} AdRuby Studio
            </span>
            <span className="text-muted-foreground/50">·</span>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" />
            <span className="font-semibold text-foreground">AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
});
