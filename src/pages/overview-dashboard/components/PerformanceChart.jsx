import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceChart = () => {
  const chartData = [
    { date: '01.10', ctr: 2.4, conversions: 145, roas: 3.2 },
    { date: '02.10', ctr: 2.8, conversions: 167, roas: 3.5 },
    { date: '03.10', ctr: 3.1, conversions: 189, roas: 3.8 },
    { date: '04.10', ctr: 2.9, conversions: 178, roas: 3.6 },
    { date: '05.10', ctr: 3.3, conversions: 201, roas: 4.1 },
    { date: '06.10', ctr: 3.0, conversions: 185, roas: 3.7 },
    { date: '07.10', ctr: 3.5, conversions: 215, roas: 4.3 },
    { date: '08.10', ctr: 3.2, conversions: 198, roas: 4.0 },
    { date: '09.10', ctr: 3.7, conversions: 228, roas: 4.5 },
    { date: '10.10', ctr: 3.4, conversions: 210, roas: 4.2 },
    { date: '11.10', ctr: 3.8, conversions: 235, roas: 4.6 },
    { date: '12.10', ctr: 3.6, conversions: 222, roas: 4.4 },
    { date: '13.10', ctr: 3.9, conversions: 241, roas: 4.7 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium text-foreground mb-2">{`Datum: ${label}`}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry?.name === 'ctr' ? 'CTR' : 
                 entry?.name === 'conversions' ? 'Conversions' : 'ROAS'}:
              </span>
              <span className="text-sm font-medium text-foreground">
                {entry?.name === 'ctr' ? `${entry?.value}%` :
                 entry?.name === 'conversions' ? entry?.value :
                 `${entry?.value}x`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-minimal">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Performance über Zeit</h2>
          <p className="text-sm text-muted-foreground">Kampagnen-Metriken der letzten 13 Tage</p>
        </div>
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-2 cursor-help"
            title="CTR (Click-Through-Rate): Anteil der Klicks pro Impression in Prozent."
          >
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-sm text-muted-foreground">CTR</span>
          </div>
          <div
            className="flex items-center space-x-2 cursor-help"
            title="Conversions: Anzahl der Nutzer, die die gewünschte Aktion (z.B. Kauf oder Lead) ausgeführt haben."
          >
            <div className="w-3 h-3 bg-success rounded-full" />
            <span className="text-sm text-muted-foreground">Conversions</span>
          </div>
          <div
            className="flex items-center space-x-2 cursor-help"
            title="ROAS (Return on Ad Spend): Umsatz geteilt durch Werbekosten."
          >
            <div className="w-3 h-3 bg-warning rounded-full" />
            <span className="text-sm text-muted-foreground">ROAS</span>
          </div>
        </div>
      </div>
      
      <div className="h-80 w-full" aria-label="Performance Chart über Zeit">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="ctr" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="var(--color-success)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-success)', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="roas" 
              stroke="var(--color-warning)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-warning)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-warning)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
