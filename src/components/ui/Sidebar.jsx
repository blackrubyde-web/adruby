import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabasePublic } from '../../lib/supabaseClient';
import { creditService } from '../../services/creditService';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isOpen = false, onClose, className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creditStatus, setCreditStatus] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const { user, userProfile } = useAuth();

  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        label: 'Overview',
        path: '/overview-dashboard',
        icon: 'BarChart3',
        description: 'Performance metrics and activity monitoring'
      },
      {
        label: 'Ads Strategien',
        path: '/strategy',
        icon: 'Target',
        description: 'AI-powered advertising strategy recommendations'
      },
      {
        label: 'Campaigns',
        path: '/campaigns-management',
        icon: 'Target',
        description: 'Campaign management and bulk operations'
      },
      {
        label: 'App Builder',
        path: '/app-builder-interface',
        icon: 'Layers',
        description: 'Creative asset generation tools'
      },
      {
        label: 'AI Analysis',
        path: '/ai-analysis-panel',
        icon: 'Brain',
        description: 'Advanced optimization insights'
      },
      {
        label: 'Settings',
        path: '/settings-configuration',
        icon: 'Settings',
        description: 'Account preferences and configuration'
      }
    ];

    if (userProfile?.affiliate_enabled) {
      baseItems.splice(baseItems.length - 1, 0, {
        label: 'Affiliate',
        path: '/affiliate',
        icon: 'Share2',
        description: 'Affiliate-Link, Statistiken und Auszahlungen'
      });
    }

    return baseItems;
  }, [userProfile?.affiliate_enabled]);

  // Load user display name using database function
  useEffect(() => {
    const loadUserDisplayName = async () => {
      if (!user?.id) {
        setDisplayName('Guest');
        setLoading(false);
        return;
      }

      try {
        // Use the existing get_user_display_name function
        const { data, error } = await supabasePublic?.rpc('get_user_display_name', { 
          user_uuid: user?.id 
        });

        if (error) {
          console.error('Error fetching display name:', error);
          setDisplayName(user?.email?.split('@')?.[0] || 'User');
          return;
        }

        setDisplayName(data || 'User');
      } catch (error) {
        console.error('Error loading user display name:', error);
        setDisplayName(user?.email?.split('@')?.[0] || 'User');
      } finally {
        setLoading(false);
      }
    };

    loadUserDisplayName();
  }, [user]);

  // Load user credit status
  useEffect(() => {
    const loadUserCredits = async () => {
      if (!user?.id) {
        setCreditStatus(null);
        setCreditsLoading(false);
        return;
      }

      try {
        const credits = await creditService?.getUserCreditStatus(user?.id);
        setCreditStatus(credits);
      } catch (error) {
        console.error('Error loading user credits:', error);
        setCreditStatus(null);
      } finally {
        setCreditsLoading(false);
      }
    };

    loadUserCredits();
  }, [user]);

  useEffect(() => {
    const currentPath = location?.pathname;
    const activeNav = navigationItems?.find(item => item?.path === currentPath);
    if (activeNav) {
      setActiveItem(activeNav?.path);
    }
  }, [location?.pathname, navigationItems]);

  const handleNavigation = (path) => {
    navigate(path);
    setActiveItem(path);
    if (onClose) {
      onClose();
    }
  };

  const handleKeyNavigation = (event, path) => {
    if (event?.key === 'Enter' || event?.key === ' ') {
      event?.preventDefault();
      handleNavigation(path);
    }
  };

  // Get credit color classes based on current credits
  const getCreditDisplayClasses = () => {
    if (!creditStatus?.credits) return 'text-muted-foreground';
    
    const credits = creditStatus?.credits;
    if (credits > 250) return 'text-green-600';
    if (credits <= 250 && credits > 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-card border-r border-border z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <img 
                src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png" 
                alt="AdRuby Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-foreground">AdRuby</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden h-8 w-8"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigationItems?.map((item) => {
              const isActive = activeItem === item?.path;
              
              return (
                <div
                  key={item?.path}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigation(item?.path)}
                  onKeyDown={(e) => handleKeyNavigation(e, item?.path)}
                  className={`
                    group relative flex items-center px-3 py-3 rounded-lg cursor-pointer
                    transition-all duration-200 ease-out
                    hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-minimal' 
                      : 'text-foreground hover:text-foreground'
                    }
                  `}
                  aria-label={`Navigate to ${item?.label}: ${item?.description}`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r" />
                  )}
                  {/* Icon */}
                  <div className="flex-shrink-0 mr-3">
                    <Icon 
                      name={item?.icon} 
                      size={20} 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                  </div>
                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${
                      isActive ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {item?.label}
                    </p>
                  </div>
                  {/* Hover Effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200" />
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Updated Footer with German requirements and Credits */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Icon name="User" size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              ) : (
                <div className="sidebar-user">
                  <p className="text-sm font-medium text-black truncate" title={displayName || "Guest"}>
                    {displayName || "Guest"}
                  </p>
                  <p className="text-xs" style={{ color: '#AAAAAA' }}>Active Session</p>
                  
                  {/* Credits Display */}
                  <div className="flex items-center space-x-1 mt-1">
                    <Icon name="Coins" size={12} className="text-muted-foreground" />
                    {creditsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    ) : (
                      <p 
                        className={`text-xs font-medium ${getCreditDisplayClasses()}`}
                        title="Verfügbare Credits"
                      >
                        Credits: {creditStatus?.credits ? 
                          creditService?.formatCredits(creditStatus?.credits) : 
                          (user ? '0' : '--')
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="w-2 h-2 bg-success rounded-full" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
