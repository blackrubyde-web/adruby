import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { QuickActionsButton } from './QuickActionsButton';
import type { PageType } from '../App';

interface AppShellProps {
  children: React.ReactNode;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  currentCredits: number;
  maxCredits: number;
}

/**
 * APP SHELL
 * 
 * For logged-in dashboard pages.
 * Includes: Sidebar, Header, Footer, max-width container.
 * 
 * NEVER use for marketing pages (Landing, Features, Pricing).
 */
export function AppShell({ 
  children, 
  currentPage, 
  onNavigate, 
  currentCredits, 
  maxCredits 
}: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-background flex">
      {/* Sidebar - Desktop Only */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      {/* Main App Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          currentPage={currentPage}
          onNavigate={onNavigate}
          currentCredits={currentCredits}
          maxCredits={maxCredits}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Quick Actions Button - Mobile */}
        <QuickActionsButton onCreateAd={() => onNavigate('adbuilder')} />
      </div>
    </div>
  );
}
