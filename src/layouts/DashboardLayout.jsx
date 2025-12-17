import React, { useState } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";

const DashboardLayout = ({ children, mainClassName = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
        <div className="px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
