import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface GlobalNavProps {
  currentPage?: 'home' | 'features' | 'pricing' | 'affiliate';
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function GlobalNav({ currentPage = 'home', onNavigate, onSignIn, onGetStarted }: GlobalNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'affiliate', label: 'Affiliate' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-lg' : 'bg-card/60 backdrop-blur-md'
          }`}
      >
        <div className="landing-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">AR</span>
              </div>
              <span className="font-black text-xl">AdRuby</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`text-sm font-semibold transition-all relative group ${currentPage === item.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {item.label}
                  {currentPage === item.id && (
                    <div className="absolute -bottom-[1.125rem] left-0 right-0 h-0.5 bg-gradient-to-r from-[#C80000] via-rose-500 to-red-600 shadow-glow" />
                  )}
                  {currentPage !== item.id && (
                    <div className="absolute -bottom-[1.125rem] left-1/2 right-1/2 h-0.5 bg-gradient-to-r from-[#C80000] via-rose-500 to-red-600 opacity-0 group-hover:opacity-100 group-hover:left-0 group-hover:right-0 transition-all duration-300" />
                  )}
                </button>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={onSignIn}
                className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-all"
              >
                Anmelden
              </button>
              <button
                onClick={onGetStarted}
                className="px-5 py-2.5 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-md"
              >
                7 Tage kostenlos testen
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted/50 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            className="absolute top-16 left-0 right-0 bg-background border-b border-border/50 shadow-xl"
          >
            <div className="landing-container py-6">
              <div className="flex flex-col gap-4">
                {/* Navigation Items */}
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left px-4 py-3 rounded-lg font-semibold transition-colors ${currentPage === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted/50'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}

                {/* Divider */}
                <div className="h-px bg-border/50 my-2" />

                {/* CTA Buttons */}
                <button
                  onClick={() => {
                    onSignIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-left font-semibold text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  Anmelden
                </button>
                <button
                  onClick={() => {
                    onGetStarted();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-[#C80000] via-rose-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all text-center"
                >
                  7 Tage kostenlos testen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16" />
    </>
  );
}
