
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
      channels?: any[]; // Add channels data
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
  // Use real distribution channels data or fallback to mock data
  const distributionChannels = metrics.channels?.channels?.length > 0 
    ? metrics.channels.channels.map((channel: any) => {
        // Map source_type to display name and icon
        const getChannelInfo = (sourceType: string) => {
          switch (sourceType) {
            case 'Twitter / X':
              return { name: 'Twitter', icon: Twitter };
            case 'Linkedin':
              return { name: 'LinkedIn', icon: Linkedin };
            case 'Facebook':
              return { name: 'Facebook', icon: Facebook };
            case 'Media Room':
              return { name: 'Media Room', icon: Newspaper };
            default:
              return { name: sourceType, icon: Globe };
          }
        };
        
        const channelInfo = getChannelInfo(channel.source_type);
        return {
          ...channelInfo,
          id: channel.id,
          source_type: channel.source_type,
          status: channel.status
        };
      })
    : [
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
                value={
                  <div className="flex items-center gap-2">
                    <span>{metrics.channels.count}</span>
                    <div className="flex space-x-0.5">
                      {distributionChannels.map((channel, index) => {
                        const IconComponent = channel.icon;
                        return (
                          <IconComponent 
                            key={`${channel.name}-${index}`} 
                            className="w-4 h-4 text-gray-400" 
                          />
                        );
                      })}
                    </div>
                  </div>
                }
                subtext={metrics.channels.description}
                icon={<Globe className="w-5 h-5" />}
                className="h-full"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-medium mb-2">Active distribution channels:</p>
              <ul className="text-sm space-y-1">
                {distributionChannels.map((channel, index) => (
                  <li key={channel.id || `${channel.name}-${index}`} className="flex items-center space-x-2">
                    <channel.icon className="w-3 h-3" />
                    <span>{channel.name}</span>
                    {channel.status && (
                      <span className={`text-xs px-1 rounded ${
                        channel.status === 'active' ? 'bg-green-100 text-green-800' : 
                        channel.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {channel.status}
                      </span>
                    )}
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
                valueClassName={metrics.serpPosition.value === '-' ? 'text-gray-400' : 'text-presspage-teal'}
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
