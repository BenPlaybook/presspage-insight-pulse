
import { ReactNode } from 'react';

type MetricCardProps = {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive?: boolean;
  };
  subtext?: string;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  trendIcon?: boolean;
};

export const MetricCard = ({
  title,
  value,
  trend,
  subtext,
  icon,
  className = '',
  valueClassName = '',
  trendIcon = true
}: MetricCardProps) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm animate-fade-in ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-end gap-2 mt-1">
            <p className={`text-2xl font-semibold ${valueClassName}`}>{value}</p>
            {trend && (
              <div className="flex items-center">
                {trendIcon && (
                  <span className={trend.positive ? 'text-green-500' : 'text-red-500'}>
                    {trend.positive ? '↑' : '↓'}
                  </span>
                )}
                <span className={`text-xs ml-0.5 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};
