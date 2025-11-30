import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';
import CreditDisplay from './CreditDisplay';

const Header = ({
  onMenuToggle,
  className = '',
  isNavCollapsed = false,
  onNavCollapseToggle
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement?.classList?.toggle('dark');
  };

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
      // Sign out the user first
      await signOut();
      // Then redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to home page even if logout fails
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
    ? "left-[72px] w-[calc(100%-72px)]"
    : "left-60 w-[calc(100%-240px)]";

  return (
    <header
      className={`fixed top-0 h-16 transition-all duration-300 bg-background border-b border-border z-30 ${layoutClasses} ${className}`}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="h-10 w-10"
          >
            <Icon name="Menu" size={20} />
          </Button>
        </div>

        {/* Desktop Spacer */}
        <div className="hidden lg:flex flex-1 items-center gap-3">
          <img 
            src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png" 
            alt="AdRuby Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-semibold text-foreground">AdRuby</span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Credit Display */}
          <CreditDisplay className="hidden sm:block" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="h-10 w-10 transition-smooth"
          >
            <Icon name={isDarkMode ? "Sun" : "Moon"} size={18} />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="h-10 w-10 relative transition-smooth"
            >
              <Icon name="Bell" size={18} />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Notifications Dropdown */}
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
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification?.type === 'success' ? 'bg-success' :
                          notification?.type === 'warning'? 'bg-warning' : 'bg-primary'
                        }`} />
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

          {/* Profile Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowProfile(!showProfile)}
              className="h-10 px-3 flex items-center space-x-2 transition-smooth"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 
                   user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </Button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-12 w-56 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <p className="font-medium text-sm">
                    {user?.user_metadata?.full_name || 'Marketing Manager'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || 'manager@adruby.com'}
                  </p>
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => handleProfileMenuClick('profile')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-smooth flex items-center space-x-2"
                  >
                    <Icon name="User" size={16} />
                    <span>🧍 Profil / Settings</span>
                  </button>
                  <button 
                    onClick={() => handleProfileMenuClick('support')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-smooth flex items-center space-x-2"
                  >
                    <Icon name="HelpCircle" size={16} />
                    <span>💬 Hilfe & Support</span>
                  </button>
                  <div className="border-t border-border my-2" />
                  <button 
                    onClick={() => handleProfileMenuClick('logout')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-smooth flex items-center space-x-2 text-destructive"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>🚪 Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Click outside handlers */}
      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
