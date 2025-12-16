import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';
import CreditDisplay from './CreditDisplay';
import useTheme from '../../hooks/useTheme';

const Header = ({
  onMenuToggle,
  className = '',
  isNavCollapsed = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const handleProfileMenuClick = (action) => {
    setShowProfile(false);
    
    switch(action) {
      case 'profile': navigate('/profile-management');
        break;
      case 'support': navigate('/help-support-center');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Campaign Performance Alert',
      message: 'Holiday Campaign CTR increased by 15%',
      time: '2 min ago',
      type: 'success'
    },
    {
      id: 2,
      title: 'Budget Warning',
      message: 'Q4 Campaign approaching 80% budget limit',
      time: '1 hour ago',
      type: 'warning'
    },
    {
      id: 3,
      title: 'New AI Insights Available',
      message: 'Optimization suggestions ready for review',
      time: '3 hours ago',
      type: 'info'
    }
  ];

  const layoutClasses = isNavCollapsed
    ? "lg:left-[72px] lg:w-[calc(100%-72px)]"
    : "lg:left-60 lg:w-[calc(100%-240px)]";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (showProfile && profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications, showProfile]);

  useEffect(() => {
    setShowNotifications(false);
    setShowProfile(false);
  }, [location.pathname, location.search]);

  return (
    <header
      className={`fixed top-0 h-16 transition-all duration-300 bg-background border-b border-border z-30 left-0 w-full ${layoutClasses} ${className}`}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="h-10 w-10"
              aria-label="Menü öffnen"
            >
              <Icon name="Menu" size={20} />
            </Button>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <Icon name="LayoutDashboard" size={18} className="text-muted-foreground" />
            <span className="font-semibold text-foreground">Overview</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <CreditDisplay className="hidden sm:flex" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 transition-smooth"
            aria-label="Theme wechseln"
          >
            <Icon name={isDark ? "Sun" : "Moon"} size={18} />
          </Button>

          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-10 w-10 relative transition-smooth"
              aria-label="Benachrichtigungen"
            >
              <Icon name="Bell" size={18} />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-sm">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications?.map((notification) => (
                    <div
                      key={notification?.id}
                      className="p-4 border-b border-border last:border-b-0 hover:bg-accent transition-smooth cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification?.type === "success"
                              ? "bg-success"
                              : notification?.type === "warning"
                              ? "bg-warning"
                              : "bg-primary"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {notification?.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification?.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification?.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              onClick={() => setShowProfile(!showProfile)}
              className="h-10 px-3 flex items-center gap-2 transition-smooth"
              aria-label="Profilmenü öffnen"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </span>
              </div>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </Button>

            {showProfile && (
              <div className="absolute right-0 top-12 w-56 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <p className="font-medium text-sm">
                    {user?.user_metadata?.full_name || "Marketing Manager"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || "manager@adruby.com"}
                  </p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => handleProfileMenuClick("profile")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-smooth flex items-center gap-2"
                  >
                    <Icon name="User" size={16} />
                    <span>Profil / Settings</span>
                  </button>
                  <button
                    onClick={() => handleProfileMenuClick("support")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-smooth flex items-center gap-2"
                  >
                    <Icon name="HelpCircle" size={16} />
                    <span>Hilfe & Support</span>
                  </button>
                  <div className="border-t border-border my-2" />
                  <button
                    onClick={() => handleProfileMenuClick("logout")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-smooth flex items-center gap-2 text-destructive"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
