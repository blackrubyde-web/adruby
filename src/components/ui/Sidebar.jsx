import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../AppIcon";
import Button from "./Button";

const navItems = [
  { id: "overview", label: "Overview", path: "/overview-dashboard", icon: "BarChart3" },
  { id: "strategies", label: "Ads Strategien", path: "/ad-strategy", icon: "Target" },
  { id: "campaigns", label: "Campaigns", path: "/campaigns-management", icon: "Target" },
  { id: "builder", label: "Ad Builder", path: "/app-builder-interface", icon: "Layers" },
  { id: "analysis", label: "AI Analysis", path: "/ai-analysis", icon: "Brain" },
  { id: "settings", label: "Settings", path: "/settings-configuration", icon: "Settings" },
];

const SidebarItem = ({ item, collapsed, active, onNavigate }) => (
  <button
    key={item?.id}
    onClick={() => onNavigate(item?.path)}
    className={`flex items-center w-full rounded-xl px-4 py-3 min-h-[44px] transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
      active ? "bg-accent text-foreground shadow-sm" : "text-foreground hover:bg-accent/60"
    }`}
    aria-label={item?.label}
    aria-current={active ? "page" : undefined}
  >
    <Icon
      name={item?.icon}
      size={20}
      className={active ? "text-foreground" : "text-muted-foreground"}
    />
    {!collapsed && <span className="ml-3 text-sm font-medium truncate">{item?.label}</span>}
    {!collapsed && item?.badge && (
      <span className="ml-auto inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {item?.badge}
      </span>
    )}
  </button>
);

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
  const [displayName, setDisplayName] = useState("Guest");

  useEffect(() => {
    const currentPath = location?.pathname;
    const activeNav = navItems?.find((item) => item?.path === currentPath);
    if (activeNav) setActiveItem(activeNav?.path);
  }, [location?.pathname]);

  useEffect(() => {
    const name =
      user?.user_metadata?.full_name ||
      user?.email?.split("@")?.[0] ||
      "Guest";
    setDisplayName(name);
  }, [user?.id]);

  const handleNavigation = (path) => {
    navigate(path);
    setActiveItem(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-14 px-4 border-b border-border">
            <div className="flex items-center gap-2">
              <img
                src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
                alt="AdRuby Logo"
                className="w-8 h-8 object-contain"
              />
              {!collapsed && (
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-foreground">AdRuby</p>
                  <p className="text-xs text-muted-foreground">Workspace</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNavCollapsed(!collapsed)}
              className="h-9 w-9"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon name={collapsed ? "ChevronsRight" : "ChevronsLeft"} size={16} />
            </Button>
          </div>

          <div className="px-3 pt-3">
            <Button
              onClick={() => handleNavigation("/app-builder-interface")}
              className={`w-full justify-center gap-2 rounded-xl ${collapsed ? "px-0" : ""}`}
            >
              <Icon name="Sparkles" size={18} />
              {!collapsed && <span className="text-sm font-semibold">Neue Anzeige</span>}
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="px-3 pb-4 pt-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <SidebarItem
                  key={item?.id}
                  item={item}
                  collapsed={collapsed}
                  active={activeItem === item?.path}
                  onNavigate={handleNavigation}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/60 flex items-center justify-center">
                <Icon name="User" size={16} className="text-foreground" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {displayName || "Guest"}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Session</p>
                </div>
              )}
              <span className="ml-auto h-2 w-2 rounded-full bg-accent" aria-hidden />
            </div>
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
          <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 flex flex-col lg:hidden">
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/images/Screenshot_2025-10-21_000636-removebg-preview-1762544374259.png"
                  alt="AdRuby Logo"
                  className="w-9 h-9 object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">AdRuby</p>
                  <p className="text-xs text-muted-foreground">Workspace</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
                <Icon name="X" size={18} />
              </Button>
            </div>

            <div className="px-3 pt-3">
              <Button
                onClick={() => handleNavigation("/app-builder-interface")}
                className="w-full justify-center gap-2 rounded-xl"
              >
                <Icon name="Sparkles" size={18} />
                <span className="text-sm font-semibold">Neue Anzeige</span>
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="px-3 pb-4 pt-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <SidebarItem
                    key={item?.id}
                    item={item}
                    collapsed={false}
                    active={activeItem === item?.path}
                    onNavigate={handleNavigation}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/60 flex items-center justify-center">
                  <Icon name="User" size={16} className="text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {displayName || "Guest"}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Session</p>
                </div>
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
