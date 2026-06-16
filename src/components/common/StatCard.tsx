import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'health' | 'warning' | 'danger' | 'default';
  suffix?: string;
  onClick?: () => void;
  trendData?: number[];
}

export default function StatCard({
  title,
  value,
  unit,
  change,
  changeLabel = '较昨日',
  icon,
  variant = 'default',
  suffix,
  onClick,
  trendData,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const showTrend = trendData && trendData.length > 0;

  const variantClasses = {
    primary: 'from-primary-500 to-primary-600 text-white',
    health: 'from-health-500 to-health-600 text-white',
    warning: 'from-warning-500 to-warning-600 text-white',
    danger: 'from-danger-500 to-danger-600 text-white',
    default: 'bg-white text-neutral-800 border border-neutral-100 shadow-card hover:shadow-card-hover',
  };

  const maxTrend = showTrend ? Math.max(...trendData) : 0;
  const minTrend = showTrend ? Math.min(...trendData) : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 transition-all duration-300 group',
        variant === 'default' ? variantClasses.default : `bg-gradient-to-br ${variantClasses[variant]} shadow-lg hover:shadow-xl hover:scale-[1.02]`,
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={cn('text-sm font-medium mb-1', variant === 'default' ? 'text-neutral-500' : 'text-white/80')}>
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight">
              {value}
            </span>
            {(unit || suffix) && (
              <span className={cn('text-sm font-medium', variant === 'default' ? 'text-neutral-400' : 'text-white/60')}>
                {unit}{suffix}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              variant === 'default' ? 'bg-primary-50 text-primary-500' : 'bg-white/20 text-white'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium',
                isPositive
                  ? variant === 'default'
                    ? 'bg-health-50 text-health-600'
                    : 'bg-white/20 text-white'
                  : variant === 'default'
                  ? 'bg-danger-50 text-danger-600'
                  : 'bg-white/20 text-white'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
            <span className={cn('text-xs', variant === 'default' ? 'text-neutral-400' : 'text-white/60')}>
              {changeLabel}
            </span>
          </div>
        )}

        {showTrend && (
          <div className="flex items-end gap-0.5 h-8">
            {trendData.map((v, i) => {
              const height = maxTrend > minTrend 
                ? ((v - minTrend) / (maxTrend - minTrend)) * 100 
                : 50;
              return (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 rounded-full transition-all duration-300',
                    variant === 'default' ? 'bg-primary-200 group-hover:bg-primary-400' : 'bg-white/40 group-hover:bg-white/60'
                  )}
                  style={{ height: `${Math.max(height, 15)}%` }}
                />
              );
            })}
          </div>
        )}
      </div>

      {variant !== 'default' && (
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
      )}
    </div>
  );
}
