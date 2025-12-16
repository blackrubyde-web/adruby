import React, { useState } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";

const DashboardLayout = ({ children, mainClassName = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  return (
    <div className="min-h-screen relative">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(232,57,78,0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(95,120,255,0.12), transparent 28%), linear-gradient(180deg, #0f1116 0%, #0b0d12 50%, #090b10 100%)"
        }}
      />
      <div className="app-shell-surface min-h-screen relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isNavCollapsed={isNavCollapsed}
          setIsNavCollapsed={setIsNavCollapsed}
        />
        <Header onMenuToggle={() => setSidebarOpen(true)} isNavCollapsed={isNavCollapsed} />

        <main
          className={`pt-16 transition-all duration-300 ${
            isNavCollapsed ? "lg:ml-[72px]" : "lg:ml-60"
          } ${mainClassName}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
