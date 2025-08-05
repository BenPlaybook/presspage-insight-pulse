import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Target, Award, AlertTriangle } from 'lucide-react';

interface BenchmarkInsightsProps {
  champion: {
    id: string;
    name: string;
    metrics: BenchmarkMetrics;
  };
  competitors: Array<{
    id: string;
    name: string;
    metrics: BenchmarkMetrics;
  }>;
}

interface BenchmarkMetrics {
  publications: number;
  distributionTime: number;
  serpPosition: number;
  socialReach: number;
  engagementRate: number;
  financialPublications: number;
  nonFinancialPublications: number;
}

export const BenchmarkInsights: React.FC<BenchmarkInsightsProps> = ({
  champion,
  competitors
}) => {
  // Calculate aggregated insights
  const calculateAggregatedInsights = () => {
    const insights = {
      championStrengths: [] as string[],
      championWeaknesses: [] as string[],
      opportunities: [] as string[],
      threats: [] as string[],
      averageComparison: {
        publications: 0,
        distributionTime: 0,
        serpPosition: 0,
        socialReach: 0,
        engagementRate: 0
      }
    };

    if (competitors.length === 0) return insights;

    // Calculate averages
    const totals = competitors.reduce((acc, comp) => ({
      publications: acc.publications + comp.metrics.publications,
      distributionTime: acc.distributionTime + comp.metrics.distributionTime,
      serpPosition: acc.serpPosition + comp.metrics.serpPosition,
      socialReach: acc.socialReach + comp.metrics.socialReach,
      engagementRate: acc.engagementRate + comp.metrics.engagementRate
    }), {
      publications: 0,
      distributionTime: 0,
      serpPosition: 0,
      socialReach: 0,
      engagementRate: 0
    });

    insights.averageComparison = {
      publications: totals.publications / competitors.length,
      distributionTime: totals.distributionTime / competitors.length,
      serpPosition: totals.serpPosition / competitors.length,
      socialReach: totals.socialReach / competitors.length,
      engagementRate: totals.engagementRate / competitors.length
    };

    // Analyze strengths and weaknesses
    const championAvg = insights.averageComparison;

    // Distribution Time Analysis
    if (champion.metrics.distributionTime < championAvg.distributionTime) {
      insights.championStrengths.push(`Faster distribution time (${champion.metrics.distributionTime.toFixed(1)}h vs ${championAvg.distributionTime.toFixed(1)}h avg)`);
    } else {
      insights.championWeaknesses.push(`Slower distribution time (${champion.metrics.distributionTime.toFixed(1)}h vs ${championAvg.distributionTime.toFixed(1)}h avg)`);
      insights.opportunities.push('Optimize content distribution workflow');
    }

    // SERP Position Analysis
    if (champion.metrics.serpPosition < championAvg.serpPosition) {
      insights.championStrengths.push(`Better search ranking (#${champion.metrics.serpPosition} vs #${championAvg.serpPosition.toFixed(1)} avg)`);
    } else {
      insights.championWeaknesses.push(`Lower search ranking (#${champion.metrics.serpPosition} vs #${championAvg.serpPosition.toFixed(1)} avg)`);
      insights.opportunities.push('Improve SEO strategy and content optimization');
    }

    // Publications Analysis
    if (champion.metrics.publications > championAvg.publications) {
      insights.championStrengths.push(`More publications (${champion.metrics.publications} vs ${championAvg.publications.toFixed(1)} avg)`);
    } else {
      insights.championWeaknesses.push(`Fewer publications (${champion.metrics.publications} vs ${championAvg.publications.toFixed(1)} avg)`);
      insights.opportunities.push('Increase content production frequency');
    }

    // Social Reach Analysis
    if (champion.metrics.socialReach > championAvg.socialReach) {
      insights.championStrengths.push(`Higher social reach (${champion.metrics.socialReach.toLocaleString()} vs ${championAvg.socialReach.toLocaleString()} avg)`);
    } else {
      insights.championWeaknesses.push(`Lower social reach (${champion.metrics.socialReach.toLocaleString()} vs ${championAvg.socialReach.toLocaleString()} avg)`);
      insights.opportunities.push('Expand social media presence and engagement');
    }

    // Engagement Rate Analysis
    if (champion.metrics.engagementRate > championAvg.engagementRate) {
      insights.championStrengths.push(`Higher engagement rate (${champion.metrics.engagementRate.toFixed(2)}% vs ${championAvg.engagementRate.toFixed(2)}% avg)`);
    } else {
      insights.championWeaknesses.push(`Lower engagement rate (${champion.metrics.engagementRate.toFixed(2)}% vs ${championAvg.engagementRate.toFixed(2)}% avg)`);
      insights.opportunities.push('Improve content quality and audience engagement');
    }

    // Identify threats (competitors performing significantly better)
    competitors.forEach(competitor => {
      if (competitor.metrics.distributionTime < champion.metrics.distributionTime * 0.8) {
        insights.threats.push(`${competitor.name} has significantly faster distribution`);
      }
      if (competitor.metrics.serpPosition < champion.metrics.serpPosition * 0.7) {
        insights.threats.push(`${competitor.name} ranks much better in search results`);
      }
      if (competitor.metrics.engagementRate > champion.metrics.engagementRate * 1.3) {
        insights.threats.push(`${competitor.name} has much higher engagement rates`);
      }
    });

    return insights;
  };

  const insights = calculateAggregatedInsights();

  const renderInsightCard = (
    title: string,
    items: string[],
    icon: React.ReactNode,
    color: string,
    emptyMessage: string
  ) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${color}`} />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-presspage-teal" />
        <h3 className="text-lg font-semibold">Benchmark Insights</h3>
        <Badge variant="outline" className="ml-auto">
          {champion.name} vs {competitors.length} competitors
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Champion Strengths */}
        {renderInsightCard(
          "Champion Strengths",
          insights.championStrengths,
          <Award className="w-4 h-4 text-green-600" />,
          "bg-green-500",
          "No significant strengths identified"
        )}

        {/* Champion Weaknesses */}
        {renderInsightCard(
          "Areas for Improvement",
          insights.championWeaknesses,
          <AlertTriangle className="w-4 h-4 text-orange-600" />,
          "bg-orange-500",
          "No significant weaknesses identified"
        )}

        {/* Opportunities */}
        {renderInsightCard(
          "Opportunities",
          insights.opportunities,
          <TrendingUp className="w-4 h-4 text-blue-600" />,
          "bg-blue-500",
          "No specific opportunities identified"
        )}

        {/* Threats */}
        {renderInsightCard(
          "Competitive Threats",
          insights.threats,
          <TrendingDown className="w-4 h-4 text-red-600" />,
          "bg-red-500",
          "No significant threats identified"
        )}
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Publications</p>
              <p className="text-lg font-bold text-presspage-teal">
                {champion.metrics.publications}
              </p>
              <p className="text-xs text-gray-400">
                vs {insights.averageComparison.publications.toFixed(1)} avg
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Distribution</p>
              <p className="text-lg font-bold text-presspage-teal">
                {champion.metrics.distributionTime.toFixed(1)}h
              </p>
              <p className="text-xs text-gray-400">
                vs {insights.averageComparison.distributionTime.toFixed(1)}h avg
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">SERP Position</p>
              <p className="text-lg font-bold text-presspage-teal">
                #{champion.metrics.serpPosition}
              </p>
              <p className="text-xs text-gray-400">
                vs #{insights.averageComparison.serpPosition.toFixed(1)} avg
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Social Reach</p>
              <p className="text-lg font-bold text-presspage-teal">
                {champion.metrics.socialReach.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                vs {insights.averageComparison.socialReach.toLocaleString()} avg
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Engagement</p>
              <p className="text-lg font-bold text-presspage-teal">
                {champion.metrics.engagementRate.toFixed(2)}%
              </p>
              <p className="text-xs text-gray-400">
                vs {insights.averageComparison.engagementRate.toFixed(2)}% avg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 