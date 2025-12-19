import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Age 18-24', value: 30, color: '#8b5cf6' }, // Purple
  { name: 'Age 25-34', value: 25, color: '#3b82f6' }, // Blue
  { name: 'Age 35-44', value: 20, color: '#10b981' }, // Green
  { name: 'Age 45+', value: 25, color: '#f59e0b' }, // Orange
];

export function AudienceBreakdown() {
  const totalReach = 2847632.00;

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h2 className="text-foreground mb-1">Audience demographics</h2>
      <p className="text-sm text-muted-foreground mb-6">Campaign #7305</p>

      <div className="mb-6">
        <div className="text-2xl text-foreground mb-1">
          ${totalReach.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-sm text-muted-foreground">Total audience reach</div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl text-foreground">$847K</div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-sm text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
