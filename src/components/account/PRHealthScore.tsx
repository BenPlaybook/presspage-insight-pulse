import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Globe, Star, Search, Users } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PRHealthScoreProps {
  overallScore: number;
  metrics: {
    publishingVelocity: number;
    distributionReach: number;
    pickupQuality: number;
    organicFindability: number;
    competitorBenchmark: number;
  };
  recommendation: string;
}

const PRHealthScore: React.FC<PRHealthScoreProps> = ({
  overallScore,
  metrics,
  recommendation
}) => {


  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-presspage-teal';
    if (score >= 60) return 'text-yellow-600';
    return 'text-presspage-red';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-presspage-teal to-presspage-blue';
    if (score >= 60) return 'from-yellow-600 to-orange-500';
    return 'from-presspage-red to-red-600';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-presspage-teal to-presspage-blue';
    if (score >= 60) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-presspage-red to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const metricConfig = [
    {
      key: 'publishingVelocity',
      label: 'Publishing Velocity',
      icon: TrendingUp,
      value: metrics.publishingVelocity
    },
    {
      key: 'distributionReach',
      label: 'Distribution Reach',
      icon: Globe,
      value: metrics.distributionReach
    },
    {
      key: 'pickupQuality',
      label: 'Pickup Quality',
      icon: Star,
      value: metrics.pickupQuality
    },
    {
      key: 'organicFindability',
      label: 'Organic Findability',
      icon: Search,
      value: metrics.organicFindability
    },
    {
      key: 'competitorBenchmark',
      label: 'Competitor Benchmark',
      icon: Target,
      value: metrics.competitorBenchmark
    }
  ];

  return (
    <TooltipProvider>
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-presspage-teal to-white rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-presspage-blue" />
            </div>
            <CardTitle className="text-base lg:text-lg">PR Health Score</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${getScoreGradient(overallScore)} bg-clip-text text-transparent`}>
              {overallScore}%
            </div>
            <div className="text-xs lg:text-sm text-gray-600 mt-1">
              {getScoreLabel(overallScore)} Performance
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-3 lg:space-y-4">
            {metricConfig.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <div key={metric.key} className="space-y-1 lg:space-y-2">
                                     <div className="flex items-center justify-between">
                     <div className="flex items-center gap-1 lg:gap-2">
                       <IconComponent className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500" />
                                              {metric.key === 'publishingVelocity' ? (
                         <Tooltip>
                           <TooltipTrigger>
                             <span className="text-xs lg:text-sm font-medium text-gray-700 cursor-help underline decoration-dotted">
                               {metric.label}
                             </span>
                           </TooltipTrigger>
                           <TooltipContent>
                             <div className="space-y-2">
                               <h4 className="font-semibold text-sm">Publishing Velocity</h4>
                               <p className="text-xs text-gray-600">Average delay from original publication to distribution across channels</p>
                               <ul className="text-xs text-gray-600 space-y-1">
                                 <li>• Original → Channel delay (hours)</li>
                                 <li>• Channel factor: channels × 0.5</li>
                                 <li>• Score = avg_delay + channel_factor</li>
                               </ul>
                               <p className="text-xs text-gray-500 mt-2">Score: {metric.value}%</p>
                             </div>
                           </TooltipContent>
                         </Tooltip>
                       ) : metric.key === 'distributionReach' ? (
                         <Tooltip>
                           <TooltipTrigger>
                             <span className="text-xs lg:text-sm font-medium text-gray-700 cursor-help underline decoration-dotted">
                               {metric.label}
                             </span>
                           </TooltipTrigger>
                           <TooltipContent>
                             <div className="space-y-2">
                               <h4 className="font-semibold text-sm">Distribution Reach</h4>
                               <p className="text-xs text-gray-600">How widely stories are distributed across platforms</p>
                                                <ul className="text-xs text-gray-600 space-y-1">
                   <li>• Count unique distribution outlets</li>
                   <li>• Based on source field</li>
                   <li>• Normalized to 0-100 score</li>
                 </ul>
                               <p className="text-xs text-gray-500 mt-2">Score: {metric.value}%</p>
                             </div>
                           </TooltipContent>
                         </Tooltip>
                       ) : metric.key === 'organicFindability' ? (
                         <Tooltip>
                           <TooltipTrigger>
                             <span className="text-xs lg:text-sm font-medium text-gray-700 cursor-help underline decoration-dotted">
                               {metric.label}
                             </span>
                           </TooltipTrigger>
                           <TooltipContent>
                             <div className="space-y-2">
                               <h4 className="font-semibold text-sm">Organic Findability</h4>
                               <p className="text-xs text-gray-600">Composite score based on:</p>
                               <ul className="text-xs text-gray-600 space-y-1">
                                 <li>• Average SERP score (position in search results)</li>
                                 <li>• PR topics coverage (diversity of search queries)</li>
                                 <li>• Google Trends proxy (publication frequency over time)</li>
                               </ul>
                               <p className="text-xs text-gray-500 mt-2">Score: {metric.value}%</p>
                             </div>
                           </TooltipContent>
                         </Tooltip>
                       ) : metric.key === 'pickupQuality' ? (
                         <Tooltip>
                           <TooltipTrigger>
                             <span className="text-xs lg:text-sm font-medium text-gray-700 cursor-help underline decoration-dotted">
                               {metric.label}
                             </span>
                           </TooltipTrigger>
                           <TooltipContent>
                             <div className="space-y-2">
                               <h4 className="font-semibold text-sm">Pick-Up Quality</h4>
                               <p className="text-xs text-gray-600">Measures effectiveness of third-party pickups for publications</p>
                               <ul className="text-xs text-gray-600 space-y-1">
                                 <li>• Third-party audience size (proxy based on site type)</li>
                                 <li>• Brand-audience fit factor (relevance scoring)</li>
                                 <li>• Quality = Audience × Fit Factor per pickup</li>
                               </ul>
                               <p className="text-xs text-gray-500 mt-2">Score: {metric.value}%</p>
                               </div>
                             </TooltipContent>
                           </Tooltip>
                         ) : (
                           <span className="text-xs lg:text-sm font-medium text-gray-700">
                             {metric.label}
                           </span>
                         )}
                     </div>
                     <span className={`text-xs lg:text-sm font-semibold ${getScoreColor(metric.value)}`}>
                       {metric.value}%
                     </span>
                   </div>
                   {/* Barra de progreso */}
                   <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2 overflow-hidden">
                     <div
                       className={`h-1.5 lg:h-2 rounded-full transition-all duration-500 ${getBarColor(metric.value)} shadow-sm`}
                       style={{ width: `${metric.value}%` }}
                     />
                   </div>
                </div>
              );
            })}
          </div>
        {/* Recommendation - Temporarily Hidden */}
        {/* <div className="bg-gradient-to-r from-presspage-blue/5 to-presspage-teal/5 rounded-lg p-3 lg:p-4 border border-presspage-blue/20">
          <div className="flex items-center gap-1 lg:gap-2 mb-2">
            <Users className="w-3 h-3 lg:w-4 lg:h-4 text-presspage-blue" />
            <span className="text-xs lg:text-sm font-semibold text-presspage-blue">Recommendation</span>
          </div>
          <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
            {recommendation}
          </p>
        </div> */}
      </CardContent>
    </Card>
      </TooltipProvider>
  );
};

export default PRHealthScore;
