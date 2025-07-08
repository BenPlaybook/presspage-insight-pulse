
import React from 'react';
import { MetricCard } from '@/components/MetricCard';
import { FileText, Zap, Search, Globe, Twitter, Linkedin, Facebook, Newspaper, Rss } from 'lucide-react';
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
  // Mock distribution channels data - in real app this would come from props
  const distributionChannels = [
    { name: 'Twitter', icon: Twitter },
    { name: 'LinkedIn', icon: Linkedin },
    { name: 'Facebook', icon: Facebook },
    { name: 'PR Newswire', icon: Newspaper },
    { name: 'RSS Feeds', icon: Rss }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-full">
              <MetricCard
                title="Total Publications"
                value={metrics.publications.count}
                subtext={metrics.publications.period}
                icon={<FileText className="w-5 h-5" />}
                className="h-full"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total number of press releases and articles published during the specified period</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-full">
              <MetricCard
                title="Distribution Channels"
                value={metrics.channels.count}
                subtext={metrics.channels.description}
                icon={
                  <div className="flex items-center space-x-1">
                    <Globe className="w-5 h-5" />
                    <div className="flex space-x-0.5 ml-1">
                      {distributionChannels.slice(0, 3).map((channel, index) => {
                        const IconComponent = channel.icon;
                        return (
                          <IconComponent 
                            key={channel.name} 
                            className="w-3 h-3 text-gray-400" 
                          />
                        );
                      })}
                      {distributionChannels.length > 3 && (
                        <span className="text-xs text-gray-400 ml-0.5">+{distributionChannels.length - 3}</span>
                      )}
                    </div>
                  </div>
                }
                className="h-full"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-medium mb-2">Active distribution channels:</p>
              <ul className="text-sm space-y-1">
                {distributionChannels.map((channel) => (
                  <li key={channel.name} className="flex items-center space-x-2">
                    <channel.icon className="w-3 h-3" />
                    <span>{channel.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-full">
              <MetricCard
                title="Publication–Distribution Time"
                value={metrics.distributionTime.value}
                trend={{
                  value: metrics.distributionTime.trend,
                  positive: true
                }}
                icon={<Zap className="w-5 h-5" />}
                className="h-full"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average time from initial publication to full distribution across all tracked channels</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="h-full">
              <MetricCard
                title="Search Engine Position"
                value={metrics.serpPosition.value}
                subtext={metrics.serpPosition.positions}
                valueClassName="text-presspage-teal"
                icon={<Search className="w-5 h-5" />}
                className="h-full"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>SERP (Search Engine Results Page) - Average ranking position in search results across North America and Europe</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
