import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar, { NavItem } from '../Sidebar';

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <div data-testid="icon-home" /> },
  { id: 'reports', label: 'Reports', icon: <div data-testid="icon-reports" />, badge: 3 }
];

describe('Sidebar', () => {
  it('rendert Nav Items und aria-current beim aktiven Eintrag', () => {
    render(<Sidebar collapsed={false} active="reports" onToggle={() => {}} navItems={navItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    const active = screen.getByRole('button', { name: 'Reports' });
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('zeigt Credits im Profilbereich', () => {
    render(<Sidebar collapsed={false} active="home" onToggle={() => {}} navItems={navItems} />);
    expect(screen.getByText(/Credits/i)).toBeInTheDocument();
  });

  it('collapsed versteckt Labels und zeigt Tooltip bei Hover', () => {
    render(<Sidebar collapsed active="home" onToggle={() => {}} navItems={navItems} />);
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    const homeButton = screen.getByRole('button', { name: 'Home' });
    fireEvent.mouseOver(homeButton);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
