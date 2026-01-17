import { useState, useEffect, useRef } from 'react';
import { Menu, X, Sparkles, Image, Rocket, BarChart3, Brain, ChevronDown } from 'lucide-react';

interface GlobalNavProps {
  currentPage?: 'home' | 'features' | 'pricing' | 'affiliate' | string;
  onNavigate: (page: string) => void;
  onSignIn: () => void;
  onGetStarted: () => void;
  onMobileMenuChange?: (isOpen: boolean) => void;
}

// Feature items for dropdown
const FEATURE_ITEMS = [
  {
    id: 'feature-ai-generator',
    icon: Sparkles,
    title: 'AI Ad Generator',
    description: 'Erstelle high-converting Ads mit KI',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'feature-creative-library',
    icon: Image,
    title: 'Creative Library',
    description: 'Organisiere deine Creatives',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'feature-campaign-builder',
    icon: Rocket,
    title: 'Campaign Builder',
    description: 'Baue Kampagnen Schritt für Schritt',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'feature-analytics',
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Tracke Performance in Echtzeit',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'feature-ai-analysis',
    icon: Brain,
    title: 'AI Analysis',
    description: 'KI-gestützte Einblicke',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
];

export function GlobalNav({ currentPage = 'home', onNavigate, onSignIn, onGetStarted, onMobileMenuChange }: GlobalNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
  const [isMobileFeatureExpanded, setIsMobileFeatureExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFeatureDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileMenuToggle = (next?: boolean) => {
    setIsMobileMenuOpen((prev) => {
      const newState = typeof next === 'boolean' ? next : !prev;
      onMobileMenuChange?.(newState);
      return newState;
    });
  };

  const handleFeatureMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsFeatureDropdownOpen(true);
  };

  const handleFeatureMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsFeatureDropdownOpen(false);
    }, 150);
  };

  const handleFeatureItemClick = (featureId: string) => {
    onNavigate(featureId);
    setIsFeatureDropdownOpen(false);
    handleMobileMenuToggle(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', hasDropdown: false },
    { id: 'features', label: 'Features', hasDropdown: true },
    { id: 'pricing', label: 'Pricing', hasDropdown: false },
    { id: 'affiliate', label: 'Affiliate', hasDropdown: false },
  ];

  const isFeaturePage = currentPage?.startsWith('feature-') || currentPage === 'features';

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
                <div
                  key={item.id}
                  className="relative"
                  ref={item.hasDropdown ? dropdownRef : undefined}
                  onMouseEnter={item.hasDropdown ? handleFeatureMouseEnter : undefined}
                  onMouseLeave={item.hasDropdown ? handleFeatureMouseLeave : undefined}
                >
                  <button
                    onClick={() => item.hasDropdown ? setIsFeatureDropdownOpen(!isFeatureDropdownOpen) : onNavigate(item.id)}
                    className={`text-sm font-semibold transition-all relative group flex items-center gap-1 ${(item.id === 'features' ? isFeaturePage : currentPage === item.id)
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFeatureDropdownOpen ? 'rotate-180' : ''}`} />
                    )}
                    {(item.id === 'features' ? isFeaturePage : currentPage === item.id) && (
                      <div className="absolute -bottom-[1.125rem] left-0 right-0 h-0.5 bg-gradient-to-r from-[#C80000] via-rose-500 to-red-600 shadow-glow" />
                    )}
                    {!(item.id === 'features' ? isFeaturePage : currentPage === item.id) && (
                      <div className="absolute -bottom-[1.125rem] left-1/2 right-1/2 h-0.5 bg-gradient-to-r from-[#C80000] via-rose-500 to-red-600 opacity-0 group-hover:opacity-100 group-hover:left-0 group-hover:right-0 transition-all duration-300" />
                    )}
                  </button>

                  {/* Features Dropdown */}
                  {item.hasDropdown && (
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-200 ${isFeatureDropdownOpen
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-2'
                        }`}
                    >
                      <div className="w-80 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Dropdown header */}
                        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
                        </div>

                        {/* Feature items */}
                        <div className="p-2">
                          {FEATURE_ITEMS.map((feature) => {
                            const Icon = feature.icon;
                            return (
                              <button
                                key={feature.id}
                                onClick={() => handleFeatureItemClick(feature.id)}
                                className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all group text-left"
                              >
                                <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                  <Icon className={`w-5 h-5 ${feature.color}`} />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{feature.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* View all link */}
                        <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
                          <button
                            onClick={() => handleFeatureItemClick('features')}
                            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            Alle Features ansehen →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
              onClick={() => handleMobileMenuToggle()}
              className="md:hidden p-2 hover:bg-muted/50 rounded-lg transition-colors mr-1"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Premium Fullscreen Takeover Menu (Mobile) */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-black/95 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.725,0,1)] ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none delay-200'
          }`}
      >
        <div className="flex flex-col h-full pt-24 pb-12 px-6 pr-8 overflow-y-auto">
          <div className="flex-1 flex flex-col justify-start space-y-4">
            {navItems.map((item, i) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.hasDropdown) {
                      setIsMobileFeatureExpanded(!isMobileFeatureExpanded);
                    } else {
                      onNavigate(item.id);
                      handleMobileMenuToggle(false);
                    }
                  }}
                  className={`text-3xl font-black tracking-tighter text-white text-left transition-all duration-500 flex items-center gap-2 w-full ${isMobileMenuOpen
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                    }`}
                  style={{ transitionDelay: `${100 + i * 50}ms` }}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isMobileFeatureExpanded ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Mobile Feature Submenu */}
                {item.hasDropdown && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${isMobileFeatureExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="space-y-2 pl-2">
                      {FEATURE_ITEMS.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <button
                            key={feature.id}
                            onClick={() => handleFeatureItemClick(feature.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                          >
                            <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center shrink-0`}>
                              <Icon className={`w-5 h-5 ${feature.color}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{feature.title}</p>
                              <p className="text-xs text-white/60">{feature.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={`space-y-4 transition-all duration-700 delay-300 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="h-px bg-white/10 w-full mb-8" />

            <button
              onClick={() => {
                onSignIn();
                handleMobileMenuToggle(false);
              }}
              className="w-full py-4 text-center text-white/60 font-medium hover:text-white transition-colors"
            >
              Anmelden
            </button>

            <button
              onClick={() => {
                onGetStarted();
                handleMobileMenuToggle(false);
              }}
              className="w-full py-5 bg-[#FF1F1F] text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(255,31,31,0.4)]"
            >
              Kostenlos starten
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
