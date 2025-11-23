import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setShowFeaturesDropdown(false);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
  ];

  // Features dropdown items organized like AdCreative.ai
  const featuresDropdown = {
    generate: [
      {
        name: 'Ad Builder',
        path: '/ad-ruby-ad-builder',
        description: 'Create high-performing ads in seconds',
        icon: '🎯'
      },
      {
        name: 'Ad Strategies',
        path: '/ad-ruby-ad-strategies', 
        description: 'AI-powered campaign strategies',
        icon: '📊'
      }
    ],
    analyse: [
      {
        name: 'AI Analysis',
        path: '/ad-ruby-ai-analysis',
        description: 'Analyze ad performance before launch',
        icon: '🔍'
      },
      {
        name: 'Creative Insights',
        path: '/ad-ruby-creative-insights',
        description: 'Discover what makes ads successful',
        icon: '💡'
      }
    ]
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-sm border-b border-[#e0e0e0]' 
            : 'bg-white/90 backdrop-blur-sm'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <motion.div
              className="flex items-center cursor-pointer space-x-3"
              onClick={() => handleNavigation('/')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <img 
                  src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png" 
                  alt="AdRuby Logo"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-lg font-medium text-[#101010]">
                AdRuby
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks?.map((link) => (
                <motion.button
                  key={link?.path}
                  onClick={() => handleNavigation(link?.path)}
                  className={`relative font-medium transition-all duration-200 ${
                    isActive(link?.path)
                      ? 'text-[#d3122c]'
                      : 'text-[#666] hover:text-[#101010]'
                  }`}
                  whileHover={{ y: -1 }}
                >
                  {link?.name}
                  {isActive(link?.path) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#d3122c] rounded-full"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}

              {/* Features Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowFeaturesDropdown(true)}
                onMouseLeave={() => setShowFeaturesDropdown(false)}
              >
                <motion.button
                  className="relative font-medium transition-all duration-200 text-[#666] hover:text-[#101010] flex items-center space-x-1"
                  whileHover={{ y: -1 }}
                >
                  <span>Features</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${showFeaturesDropdown ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                {/* Features Dropdown Menu */}
                {showFeaturesDropdown && (
                  <motion.div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 z-50"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onMouseEnter={() => setShowFeaturesDropdown(true)}
                    onMouseLeave={() => setShowFeaturesDropdown(false)}
                  >
                    <div className="w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="p-6">
                        {/* Generate Section */}
                        <div className="mb-6">
                          <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">
                            GENERATE
                          </h3>
                          <div className="space-y-3">
                            {featuresDropdown?.generate?.map((feature) => (
                              <motion.button
                                key={feature?.path}
                                onClick={() => handleNavigation(feature?.path)}
                                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                                whileHover={{ x: 4 }}
                              >
                                <div className="flex items-start space-x-3">
                                  <span className="text-lg">{feature?.icon}</span>
                                  <div>
                                    <h4 className="font-medium text-[#101010] group-hover:text-[#d3122c] transition-colors duration-200">
                                      {feature?.name}
                                    </h4>
                                    <p className="text-sm text-[#666] mt-1">
                                      {feature?.description}
                                    </p>
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Analyse Section */}
                        <div>
                          <h3 className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">
                            ANALYSE
                          </h3>
                          <div className="space-y-3">
                            {featuresDropdown?.analyse?.map((feature) => (
                              <motion.button
                                key={feature?.path}
                                onClick={() => handleNavigation(feature?.path)}
                                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                                whileHover={{ x: 4 }}
                              >
                                <div className="flex items-start space-x-3">
                                  <span className="text-lg">{feature?.icon}</span>
                                  <div>
                                    <h4 className="font-medium text-[#101010] group-hover:text-[#d3122c] transition-colors duration-200">
                                      {feature?.name}
                                    </h4>
                                    <p className="text-sm text-[#666] mt-1">
                                      {feature?.description}
                                    </p>
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </nav>

            {/* Desktop Login Button */}
            <motion.button
              onClick={() => handleNavigation('/ad-ruby-registration')}
              className="hidden md:block bg-[#d3122c] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#b8101f] transition-all duration-200"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Kostenlos starten
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-[#666] hover:text-[#101010] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </motion.header>
      {/* Mobile Menu Overlay */}
      <motion.div
        className={`md:hidden fixed inset-0 z-40 ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        initial={false}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          backdropFilter: isMobileMenuOpen ? 'blur(10px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 bg-white/95" />
        
        <motion.div
          className="relative z-10 min-h-screen flex flex-col justify-center items-center space-y-8 px-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: isMobileMenuOpen ? 0 : 20,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.2, delay: isMobileMenuOpen ? 0.05 : 0 }}
        >
          {/* Mobile Navigation Links */}
          {navLinks?.map((link, index) => (
            <motion.button
              key={link?.path}
              onClick={() => handleNavigation(link?.path)}
              className={`text-2xl font-medium transition-colors duration-200 ${
                isActive(link?.path)
                  ? 'text-[#d3122c]'
                  : 'text-[#101010] hover:text-[#d3122c]'
              }`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: isMobileMenuOpen ? 1 : 0,
                y: isMobileMenuOpen ? 0 : 15
              }}
              transition={{ duration: 0.2, delay: isMobileMenuOpen ? 0.1 + index * 0.05 : 0 }}
              whileTap={{ scale: 0.95 }}
            >
              {link?.name}
            </motion.button>
          ))}

          {/* Mobile Features Section */}
          <div className="text-center">
            <h3 className="text-xl font-medium text-[#101010] mb-4">Features</h3>
            <div className="space-y-3">
              {[...featuresDropdown?.generate, ...featuresDropdown?.analyse]?.map((feature, index) => (
                <motion.button
                  key={feature?.path}
                  onClick={() => handleNavigation(feature?.path)}
                  className="block text-lg text-[#666] hover:text-[#d3122c] transition-colors duration-200"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ 
                    opacity: isMobileMenuOpen ? 1 : 0,
                    y: isMobileMenuOpen ? 0 : 15
                  }}
                  transition={{ duration: 0.2, delay: isMobileMenuOpen ? 0.2 + index * 0.05 : 0 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {feature?.icon} {feature?.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mobile Login Button */}
          <motion.button
            onClick={() => handleNavigation('/ad-ruby-registration')}
            className="mt-8 bg-[#d3122c] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#b8101f] transition-all duration-200"
            initial={{ opacity: 0, y: 15 }}
            animate={{ 
              opacity: isMobileMenuOpen ? 1 : 0,
              y: isMobileMenuOpen ? 0 : 15
            }}
            transition={{ duration: 0.2, delay: isMobileMenuOpen ? 0.4 : 0 }}
            whileTap={{ scale: 0.95 }}
          >
            Kostenlos starten
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Header;