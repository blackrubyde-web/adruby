import { memo } from 'react';
import { Heart, Sparkles, Shield } from 'lucide-react';

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto relative overflow-hidden">
      {/* Subtle gradient accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="py-5 px-4 sm:px-8 bg-card/40 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            {/* Left: Brand + legal links */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                  © {currentYear} AdRuby
                </span>
              </span>
              <span className="text-muted-foreground/30">·</span>
              <a href="#" className="hover:text-foreground transition-colors duration-200">Datenschutz</a>
              <a href="#" className="hover:text-foreground transition-colors duration-200">AGB</a>
              <a href="#" className="hover:text-foreground transition-colors duration-200">Impressum</a>
            </div>

            {/* Right: Status + AI badge */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs">DSGVO-konform</span>
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1.5">
                <span className="text-xs">Made with</span>
                <Heart className="w-3 h-3 text-primary fill-primary" />
                <span className="text-xs">in Germany</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});
