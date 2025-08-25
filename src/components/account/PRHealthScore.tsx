import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Globe, Star, Search, Users } from 'lucide-react';

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
                    <span className="text-xs lg:text-sm font-medium text-gray-700">
                      {metric.label}
                    </span>
                  </div>
                  <span className={`text-xs lg:text-sm font-semibold ${getScoreColor(metric.value)}`}>
                    {metric.value}%
                  </span>
                </div>
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
  );
};

export default PRHealthScore;
