
import React from 'react';
import { MetricCard } from '@/components/MetricCard';
import { FileText, Zap, Search, Twitter, Linkedin, Newspaper, Globe } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface AccountMetricsProps {
  metrics: {
    publications: {
      count: number;
      period: string;
    };
    channels: {
      count: number;
      description: string;
    };
    distributionTime: {
      value: string;
      trend: string;
    };
    serpPosition: {
      value: string;
      positions: string;
    };
  };
}

export const AccountMetrics: React.FC<AccountMetricsProps> = ({ metrics }) => {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                title="Total Publications"
                value={metrics.publications.count}
                subtext={metrics.publications.period}
                icon={<FileText className="w-5 h-5" />}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total number of press releases and articles published during the specified period</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                title="Distribution Channels"
                value={metrics.channels.count}
                subtext={metrics.channels.description}
                icon={
                  <div className="flex -space-x-1">
                    <Twitter className="w-4 h-4 text-blue-500" />
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <Newspaper className="w-4 h-4 text-gray-600" />
                  </div>
                }
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Number of active distribution channels including social media, newswires, and press outlets</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                title="Publication–Distribution Time"
                value={metrics.distributionTime.value}
                trend={{
                  value: metrics.distributionTime.trend,
                  positive: true
                }}
                icon={<Zap className="w-5 h-5" />}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average time from initial publication to full distribution across all tracked channels</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                title="Search Engine Position"
                value={metrics.serpPosition.value}
                subtext={metrics.serpPosition.positions}
                valueClassName="text-presspage-teal"
                icon={<Search className="w-5 h-5" />}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average ranking position in search engine results pages (SERP) across North America and Europe</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
