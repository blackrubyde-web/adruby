import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../AppIcon";
import Button from "./Button";
import { creditService } from "../../services/creditService";

const navItems = [
  { label: "Overview", path: "/overview-dashboard", icon: "BarChart3" },
  { label: "Ads Strategien", path: "/ad-strategy", icon: "Target" },
  { label: "Campaigns", path: "/campaigns-management", icon: "Target" },
  { label: "Ad Builder", path: "/app-builder-interface", icon: "Layers" },
  { label: "AI Analysis", path: "/ai-analysis", icon: "Brain" },
  { label: "Settings", path: "/settings-configuration", icon: "Settings" },
];

const Sidebar = ({
  isOpen = false,
  onClose,
  isNavCollapsed = false,
  setIsNavCollapsed = () => {},
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const collapsed = !!isNavCollapsed;

  const [activeItem, setActiveItem] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loadingName, setLoadingName] = useState(true);
  const [creditStatus, setCreditStatus] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    const currentPath = location?.pathname;
    const activeNav = navItems?.find((item) => item?.path === currentPath);
    if (activeNav) {
      setActiveItem(activeNav?.path);
    }
  }, [location?.pathname]);

  useEffect(() => {
    if (!user?.id) {
      setDisplayName("Guest");
      setLoadingName(false);
      setCreditStatus(null);
      setCreditsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingName(true);
        const name = user?.email?.split("@")?.[0] || "User";
        setDisplayName(name);
      } catch {
        setDisplayName("User");
      } finally {
        setLoadingName(false);
      }

      try {
        const credits = await creditService?.getUserCreditStatus(user?.id);
        setCreditStatus(credits);
      } catch {
        setCreditStatus(null);
      } finally {
        setCreditsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleNavigation = (path) => {
    navigate(path);
    setActiveItem(path);
    if (onClose) onClose();
  };

  const creditDisplayClasses = () => {
    if (!creditStatus?.credits) return "text-muted-foreground";
    const credits = creditStatus?.credits;
    if (credits > 250) return "text-green-600";
    if (credits <= 250 && credits > 50) return "text-orange-600";
    return "text-red-600";
  };

  const renderNavItem = (item, showLabel) => {
    const isActive = activeItem === item?.path;
    return (
      <button
        key={item?.path}
        onClick={() => handleNavigation(item?.path)}
        className={`flex items-center ${
          showLabel ? "gap-3 px-4 py-3" : "justify-center h-12 w-12"
        } rounded-xl transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-foreground hover:bg-accent"
        }`}
        aria-label={item?.label}
      >
        <Icon
          name={item?.icon}
          size={20}
          className={isActive ? "text-primary-foreground" : "text-muted-foreground"}
        />
        {showLabel && <span className="text-sm font-medium truncate">{item?.label}</span>}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-60"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
              alt="AdRuby Logo"
              className="w-8 h-8 object-contain"
            />
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">AdRuby</p>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNavCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            <Icon name={collapsed ? "ChevronsRight" : "ChevronsLeft"} size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {navItems.map((item) => renderNavItem(item, !collapsed))}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <Icon name="User" size={16} className="text-muted-foreground" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                {loadingName ? (
                  <div className="animate-pulse space-y-1">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {displayName || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">Active Session</p>
                  </>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <Icon name="Coins" size={12} className="text-muted-foreground" />
                  {creditsLoading ? (
                    <div className="animate-pulse h-3 bg-muted rounded w-16" />
                  ) : (
                    <p
                      className={`text-xs font-medium ${creditDisplayClasses()}`}
                      title="Verfügbare Credits"
                    >
                      Credits:{" "}
                      {creditStatus?.credits
                        ? creditService?.formatCredits(creditStatus?.credits)
                        : user
                        ? "0"
                        : "--"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-60 bg-card border-r border-border z-50 flex flex-col lg:hidden">
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
                  alt="AdRuby Logo"
                  className="w-9 h-9 object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">AdRuby</p>
                  <p className="text-xs text-muted-foreground">Dashboard</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <Icon name="X" size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
              {navItems.map((item) => renderNavItem(item, true))}
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  {loadingName ? (
                    <div className="animate-pulse space-y-1">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {displayName || "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground">Active Session</p>
                    </>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <Icon name="Coins" size={12} className="text-muted-foreground" />
                    {creditsLoading ? (
                      <div className="animate-pulse h-3 bg-muted rounded w-16" />
                    ) : (
                      <p
                        className={`text-xs font-medium ${creditDisplayClasses()}`}
                        title="Verfügbare Credits"
                      >
                        Credits:{" "}
                        {creditStatus?.credits
                          ? creditService?.formatCredits(creditStatus?.credits)
                          : user
                          ? "0"
                          : "--"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
