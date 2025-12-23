import { memo } from 'react';
import { Heart } from 'lucide-react';

export const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-6 px-4 sm:px-8 border-t border-border/30 backdrop-blur-sm bg-card/40">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} BRAVE. All rights reserved.</span>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span>for marketers</span>
          </div>
        </div>
      </div>
    </footer>
  );
});
