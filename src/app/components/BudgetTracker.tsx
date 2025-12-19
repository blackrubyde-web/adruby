import { DollarSign, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function BudgetTracker() {
  const totalBudget = 5000;
  const spent = 1953.43;
  const dailyBudget = 278.35;
  const [animatedSpent, setAnimatedSpent] = useState(0);
  
  const percentage = (spent / totalBudget) * 100;
  const remaining = totalBudget - spent;
  const daysRemaining = Math.floor(remaining / dailyBudget);
  const isWarning = percentage >= 80;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = spent / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= spent) {
        setAnimatedSpent(spent);
        clearInterval(timer);
      } else {
        setAnimatedSpent(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [spent]);

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const strokeColor = isWarning ? '#f59e0b' : '#3b82f6'; // yellow-500 : blue-500

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-muted-foreground/50" />
          <h3 className="text-lg font-bold text-foreground">Budget Tracker</h3>
        </div>
        {isWarning && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500" />
            <span className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">80% Used</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Progress Circle */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="transform -rotate-90" width="140" height="140">
              {/* Background Circle */}
              <circle
                cx="70"
                cy="70"
                r="60"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-border"
              />
              {/* Progress Circle */}
              <circle
                cx="70"
                cy="70"
                r="60"
                stroke={strokeColor}
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-foreground">
                {percentage.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Used</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col justify-center space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
            <div className="text-2xl font-bold text-foreground">
              ${totalBudget.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Spent</div>
            <div className="text-xl font-bold text-foreground">
              ${animatedSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Remaining</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-500">
              ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Burn Rate */}
      <div className="p-4 bg-muted border border-border rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Daily Burn Rate</div>
            <div className="text-lg font-bold text-foreground">
              ${dailyBudget.toFixed(2)}/day
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Projected End</div>
            <div className="text-lg font-bold text-foreground">
              {daysRemaining} days
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-out ${
            isWarning ? 'bg-yellow-500/60' : 'bg-blue-500/60'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
