import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface CompetitorComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  champion: {
    id: string;
    name: string;
    metrics: BenchmarkMetrics;
  };
  competitor: {
    id: string;
    name: string;
    metrics: BenchmarkMetrics;
  };
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

export const CompetitorComparisonModal: React.FC<CompetitorComparisonModalProps> = ({
  isOpen,
  onClose,
  champion,
  competitor
}) => {
  // Calculate comparison metrics
  const calculateComparison = (championValue: number, competitorValue: number) => {
    const difference = competitorValue - championValue;
    const percentage = championValue > 0 ? (difference / championValue) * 100 : 0;
    
    return {
      difference,
      percentage,
      isBetter: difference < 0, // Lower is better for most metrics
      isWorse: difference > 0
    };
  };

  const getMetricComparison = (metric: keyof BenchmarkMetrics) => {
    const championValue = champion.metrics[metric];
    const competitorValue = competitor.metrics[metric];
    return calculateComparison(championValue, competitorValue);
  };

  const renderMetricCard = (
    title: string,
    championValue: number,
    competitorValue: number,
    format: (value: number) => string,
    lowerIsBetter: boolean = true
  ) => {
    const comparison = calculateComparison(championValue, competitorValue);
    const isBetter = lowerIsBetter ? comparison.isBetter : !comparison.isBetter;
    const isWorse = lowerIsBetter ? comparison.isWorse : !comparison.isWorse;

    return (
      <Card className="border-l-4 border-l-presspage-teal">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Champion</p>
              <p className="text-lg font-bold text-presspage-teal">
                {format(championValue)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Competitor</p>
              <p className="text-lg font-bold text-gray-900">
                {format(competitorValue)}
              </p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Difference</span>
              <div className="flex items-center gap-1">
                {isBetter && <ArrowDown className="w-3 h-3 text-green-500" />}
                {isWorse && <ArrowUp className="w-3 h-3 text-red-500" />}
                {!isBetter && !isWorse && <Minus className="w-3 h-3 text-gray-400" />}
                <span className={`text-xs font-medium ${
                  isBetter ? 'text-green-600' : 
                  isWorse ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {comparison.difference > 0 ? '+' : ''}{comparison.difference.toFixed(1)}
                  {comparison.percentage !== 0 && ` (${comparison.percentage > 0 ? '+' : ''}${comparison.percentage.toFixed(1)}%)`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Comparison: {champion.name} vs {competitor.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with company info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Badge variant="default" className="mb-2">Champion</Badge>
              <h3 className="font-semibold text-presspage-teal">{champion.name}</h3>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Competitor</Badge>
              <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Key Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderMetricCard(
                "Total Publications",
                champion.metrics.publications,
                competitor.metrics.publications,
                (value) => value.toString(),
                false
              )}
              {renderMetricCard(
                "Distribution Time (hours)",
                champion.metrics.distributionTime,
                competitor.metrics.distributionTime,
                (value) => `${value.toFixed(1)}h`,
                true
              )}
              {renderMetricCard(
                "SERP Position",
                champion.metrics.serpPosition,
                competitor.metrics.serpPosition,
                (value) => `#${value}`,
                true
              )}
              {renderMetricCard(
                "Social Reach",
                champion.metrics.socialReach,
                competitor.metrics.socialReach,
                (value) => value.toLocaleString(),
                false
              )}
            </div>
          </div>

          {/* Publication Analysis */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Publication Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderMetricCard(
                "Financial Publications",
                champion.metrics.financialPublications,
                competitor.metrics.financialPublications,
                (value) => value.toString(),
                false
              )}
              {renderMetricCard(
                "Non-Financial Publications",
                champion.metrics.nonFinancialPublications,
                competitor.metrics.nonFinancialPublications,
                (value) => value.toString(),
                false
              )}
            </div>
          </div>

          {/* Engagement */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Engagement</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderMetricCard(
                "Engagement Rate",
                champion.metrics.engagementRate,
                competitor.metrics.engagementRate,
                (value) => `${value.toFixed(2)}%`,
                false
              )}
            </div>
          </div>

          {/* Summary Insights */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Summary Insights</h4>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {getMetricComparison('distributionTime').isBetter && (
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{competitor.name}</strong> has faster distribution time than {champion.name}
                      </span>
                    </div>
                  )}
                  {getMetricComparison('serpPosition').isBetter && (
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{competitor.name}</strong> ranks better in search results than {champion.name}
                      </span>
                    </div>
                  )}
                  {getMetricComparison('publications').isBetter && (
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{competitor.name}</strong> has more publications than {champion.name}
                      </span>
                    </div>
                  )}
                  {getMetricComparison('engagementRate').isBetter && (
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{competitor.name}</strong> has higher engagement rate than {champion.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Areas where champion performs better */}
                  {getMetricComparison('distributionTime').isWorse && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{champion.name}</strong> has faster distribution time
                      </span>
                    </div>
                  )}
                  {getMetricComparison('serpPosition').isWorse && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{champion.name}</strong> ranks better in search results
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 