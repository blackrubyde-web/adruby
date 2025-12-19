import { useTheme } from './ThemeProvider';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['12am', '4am', '8am', '12pm', '4pm', '8pm'];

// Mock heatmap data (0-100 performance score)
const heatmapData = [
  [20, 15, 18, 45, 52, 48, 35], // 12am
  [12, 10, 14, 38, 45, 42, 28], // 4am
  [35, 32, 38, 65, 72, 68, 52], // 8am
  [58, 55, 62, 85, 92, 88, 75], // 12pm
  [72, 68, 75, 95, 98, 95, 82], // 4pm
  [65, 62, 68, 88, 92, 90, 78], // 8pm
];

export function PerformanceHeatmap() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getHeatColor = (value: number) => {
    if (value >= 90) return isDark ? 'bg-green-500' : 'bg-green-500';
    if (value >= 75) return isDark ? 'bg-green-600' : 'bg-green-400';
    if (value >= 60) return isDark ? 'bg-yellow-500' : 'bg-yellow-400';
    if (value >= 45) return isDark ? 'bg-orange-500' : 'bg-orange-400';
    if (value >= 30) return isDark ? 'bg-red-500' : 'bg-red-400';
    return isDark ? 'bg-red-600' : 'bg-red-500';
  };

  const getOpacity = (value: number) => {
    return Math.max(0.2, value / 100);
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="mb-6">
        <h2 className="text-foreground mb-1">Performance Heatmap</h2>
        <p className="text-sm text-muted-foreground">Best performing times to run ads</p>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header - Days */}
          <div className="flex items-center mb-2">
            <div className="w-16" /> {/* Spacer for time labels */}
            {days.map((day) => (
              <div key={day} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground font-medium">{day}</span>
              </div>
            ))}
          </div>

          {/* Heatmap Rows */}
          {heatmapData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center mb-2">
              {/* Time Label */}
              <div className="w-16 pr-3 text-right">
                <span className="text-xs text-muted-foreground font-medium">{hours[rowIndex]}</span>
              </div>

              {/* Heat Cells */}
              {row.map((value, colIndex) => (
                <div key={colIndex} className="flex-1 px-1">
                  <div
                    className={`${getHeatColor(value)} rounded-md transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer group relative`}
                    style={{ 
                      opacity: getOpacity(value),
                      height: '36px'
                    }}
                  >
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {days[colIndex]} {hours[rowIndex]}: {value}% CTR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Performance Score</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex gap-1">
            {[20, 40, 60, 80, 100].map((value) => (
              <div
                key={value}
                className={`w-6 h-4 rounded ${getHeatColor(value)}`}
                style={{ opacity: getOpacity(value) }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>

      {/* Best Time Badge */}
      <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-foreground">
            <span className="font-medium text-green-500">Peak time:</span> Friday 4pm-8pm with 98% performance score
          </span>
        </div>
      </div>
    </div>
  );
}
