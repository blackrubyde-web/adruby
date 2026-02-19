import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  // ── Scroll detection ─────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Body scroll-lock when mobile menu is open ────────
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

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
      {/* ── TOP NAV BAR ─────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
            ? 'bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-lg'
            : 'bg-card/60 backdrop-blur-md'
          }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="landing-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo — hover glow + scale */}
            <motion.button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E63946] to-rose-600 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(230,57,70,0.5)] transition-shadow duration-300">
                  <span className="text-white font-black text-sm">AR</span>
                </div>
              </div>
              <span className="font-black text-xl font-display tracking-tight">AdRuby</span>
            </motion.button>

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
                      <motion.div
                        animate={{ rotate: isFeatureDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    )}
                    {(item.id === 'features' ? isFeaturePage : currentPage === item.id) && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-[1.125rem] left-0 right-0 h-0.5 bg-gradient-to-r from-[#E63946] via-rose-500 to-red-600"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    {!(item.id === 'features' ? isFeaturePage : currentPage === item.id) && (
                      <div className="absolute -bottom-[1.125rem] left-1/2 right-1/2 h-0.5 bg-gradient-to-r from-[#E63946] via-rose-500 to-red-600 opacity-0 group-hover:opacity-100 group-hover:left-0 group-hover:right-0 transition-all duration-300" />
                    )}
                  </button>

                  {/* Features Dropdown — AnimatePresence */}
                  {item.hasDropdown && (
                    <AnimatePresence>
                      {isFeatureDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                        >
                          <div className="w-80 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Dropdown header */}
                            <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
                            </div>

                            {/* Feature items — staggered */}
                            <div className="p-2">
                              {FEATURE_ITEMS.map((feature, idx) => {
                                const Icon = feature.icon;
                                return (
                                  <motion.button
                                    key={feature.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04, duration: 0.25 }}
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
                                  </motion.button>
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                onClick={onSignIn}
                className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-all"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Anmelden
              </motion.button>
              <motion.button
                onClick={onGetStarted}
                className="relative px-5 py-2.5 bg-gradient-to-r from-[#E63946] via-rose-600 to-red-600 text-white rounded-xl font-semibold shadow-md overflow-hidden"
                whileHover={{ scale: 1.05, boxShadow: '0 0 28px rgba(230,57,70,0.45)' }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {/* Animated shimmer overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
                <span className="relative z-10">7 Tage kostenlos testen</span>
              </motion.button>
            </div>

            {/* ── MOBILE BURGER — 44×44px touch target ── */}
            <motion.button
              onClick={() => handleMobileMenuToggle()}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 active:bg-white/15 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── FULLSCREEN MOBILE MENU ──────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden bg-black/95 backdrop-blur-2xl"
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <div className="flex flex-col h-full pt-20 pb-8 px-6 overflow-y-auto overscroll-contain">
              {/* ── Nav Items ─────────────────────── */}
              <div className="flex-1 flex flex-col justify-start gap-2 mt-2">
                {navItems.map((item, i) => (
                  <div key={item.id}>
                    <motion.button
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.06, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      onClick={() => {
                        if (item.hasDropdown) {
                          setIsMobileFeatureExpanded(!isMobileFeatureExpanded);
                        } else {
                          onNavigate(item.id);
                          handleMobileMenuToggle(false);
                        }
                      }}
                      className="min-h-[52px] text-3xl font-black tracking-tighter text-white text-left flex items-center gap-2 w-full py-2 font-display"
                    >
                      {item.label}
                      {item.hasDropdown && (
                        <motion.div animate={{ rotate: isMobileFeatureExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                          <ChevronDown className="w-6 h-6" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Mobile Feature Submenu — AnimatePresence */}
                    {item.hasDropdown && (
                      <AnimatePresence>
                        {isMobileFeatureExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1.5 pl-1 mt-2 mb-2">
                              {FEATURE_ITEMS.map((feature, idx) => {
                                const Icon = feature.icon;
                                return (
                                  <motion.button
                                    key={feature.id}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                                    onClick={() => handleFeatureItemClick(feature.id)}
                                    className="w-full flex items-center gap-3 p-3.5 min-h-[52px] rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-all text-left"
                                  >
                                    <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center shrink-0`}>
                                      <Icon className={`w-5 h-5 ${feature.color}`} />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-white text-[15px]">{feature.title}</p>
                                      <p className="text-xs text-white/50 mt-0.5">{feature.description}</p>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Bottom CTA Section ────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-3 mt-auto"
              >
                <div className="h-px bg-white/10 w-full mb-4" />

                <button
                  onClick={() => {
                    onSignIn();
                    handleMobileMenuToggle(false);
                  }}
                  className="w-full min-h-[48px] py-3.5 text-center text-white/60 font-medium hover:text-white active:text-white/90 transition-colors rounded-xl"
                >
                  Anmelden
                </button>

                <motion.button
                  onClick={() => {
                    onGetStarted();
                    handleMobileMenuToggle(false);
                  }}
                  className="w-full min-h-[56px] py-4 bg-[#E63946] text-white font-bold text-lg rounded-2xl shadow-[0_0_30px_rgba(230,57,70,0.4)] active:brightness-90 transition-all font-display"
                  whileTap={{ scale: 0.97 }}
                >
                  Kostenlos starten
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
