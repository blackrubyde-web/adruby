import React from 'react';
import { render, screen } from '@testing-library/react';
import OverviewPage from '../src/pages/Overview';

jest.mock('../src/layouts/DashboardLayout', () => {
  return ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
});

jest.mock('../src/hooks/useMockApi', () => ({
  useMockApi: () => ({
    data: {
      kpis: {
        ctr: { value: 3.8, delta: 0.4 },
        conversion_rate: { value: 4.2, delta: 0.7 },
        roas: { value: 4.5, delta: 0.3 }
      },
      timeSeries: [],
      topCampaigns: [],
      sessionsByDevice: []
    },
    loading: false,
    error: null,
    refresh: jest.fn()
  })
}));

jest.mock('recharts', () => {
  const Mock = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Mock,
    ComposedChart: Mock,
    BarChart: Mock,
    PieChart: Mock,
    Pie: Mock,
    Line: Mock,
    Area: Mock,
    Bar: Mock,
    Tooltip: Mock,
    Legend: Mock,
    Brush: Mock,
    CartesianGrid: Mock,
    XAxis: Mock,
    YAxis: Mock,
    Cell: Mock
  };
});

describe('Overview dashboard', () => {
  it('zeigt KPI Karten mit Werten', () => {
    render(<OverviewPage />);
    expect(screen.getByText(/Click-Through-Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/3\.8%/i)).toBeInTheDocument();
    expect(screen.getByText(/Conversion Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.2%/i)).toBeInTheDocument();
    expect(screen.getByText(/ROAS/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.5x/i)).toBeInTheDocument();
  });
});
