
import React from 'react';
import { MetricCard } from '@/components/MetricCard';

interface AccountMetricsProps {
  metrics: {
    distributionTime: {
      value: string;
      trend: string;
    };
    serpPosition: {
      value: string;
      positions: string;
    };
    publications: {
      count: number;
      period: string;
    };
    channels: {
      count: number;
      description: string;
    };
  };
}

export const AccountMetrics: React.FC<AccountMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Avg. Publication to Distribution"
        value={metrics.distributionTime.value}
        trend={{
          value: metrics.distributionTime.trend,
          positive: true
        }}
      />
      <MetricCard
        title="Average SERP Position"
        value={metrics.serpPosition.value}
        subtext={metrics.serpPosition.positions}
        valueClassName="text-presspage-teal"
      />
      <MetricCard
        title="Total Publications"
        value={metrics.publications.count}
        subtext={metrics.publications.period}
      />
      <MetricCard
        title="Distribution Channels"
        value={metrics.channels.count}
        subtext={metrics.channels.description}
      />
    </div>
  );
};
