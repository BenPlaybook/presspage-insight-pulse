import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Activity, Download, ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFComparisonDocument } from './PDFComparisonDocument';

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
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
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

          {/* AI Insights */}
          <Collapsible open={aiInsightsOpen} onOpenChange={setAiInsightsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">AI Insights</span>
                </div>
                {aiInsightsOpen ? (
                  <ChevronDown className="w-4 h-4 text-purple-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-purple-600" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Champion AI Summary Card */}
                <Card className="border-l-4 border-l-presspage-teal">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-presspage-teal">
                      {champion.name} - AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <strong>Performance Summary:</strong> {champion.name} demonstrates strong content distribution efficiency with {champion.metrics.publications} publications in the last 30 days.
                      </p>
                      <p className="text-gray-700">
                        <strong>Speed Analysis:</strong> Average distribution time of {champion.metrics.distributionTime.toFixed(1)} days shows {champion.metrics.distributionTime < 5 ? 'excellent' : 'good'} content velocity.
                      </p>
                      <p className="text-gray-700">
                        <strong>SERP Performance:</strong> Ranking at position #{champion.metrics.serpPosition.toFixed(1)} indicates {champion.metrics.serpPosition < 5 ? 'strong' : 'moderate'} search visibility.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Competitor AI Summary Card */}
                <Card className="border-l-4 border-l-gray-400">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {competitor.name} - AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <strong>Performance Summary:</strong> {competitor.name} shows {competitor.metrics.publications > champion.metrics.publications ? 'higher' : 'lower'} publication volume with {competitor.metrics.publications} articles.
                      </p>
                      <p className="text-gray-700">
                        <strong>Speed Analysis:</strong> {competitor.metrics.distributionTime.toFixed(1)} days average distribution time, {competitor.metrics.distributionTime < champion.metrics.distributionTime ? 'faster' : 'slower'} than {champion.name}.
                      </p>
                      <p className="text-gray-700">
                        <strong>SERP Performance:</strong> Position #{competitor.metrics.serpPosition.toFixed(1)} suggests {competitor.metrics.serpPosition < champion.metrics.serpPosition ? 'better' : 'worse'} search ranking than {champion.name}.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Key Metrics */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Key Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderMetricCard(
                "Publications (30d)",
                champion.metrics.publications,
                competitor.metrics.publications,
                (value) => value.toString(),
                false
              )}
              {renderMetricCard(
                "Average Speed (days)",
                champion.metrics.distributionTime,
                competitor.metrics.distributionTime,
                (value) => `${value.toFixed(1)}d`,
                true
              )}
              {renderMetricCard(
                "SERP Position",
                champion.metrics.serpPosition,
                competitor.metrics.serpPosition,
                (value) => `#${value.toFixed(1)}`,
                true
              )}
              {renderMetricCard(
                "Social Coverage",
                champion.metrics.socialReach,
                competitor.metrics.socialReach,
                (value) => value === 0 ? "-" : value.toLocaleString(),
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

          {/* Efficiency Score */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Performance Score</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderMetricCard(
                "Efficiency Score",
                champion.metrics.engagementRate,
                competitor.metrics.engagementRate,
                (value) => value.toFixed(1),
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
                        <strong>{competitor.name}</strong> has faster average speed than {champion.name}
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
                        <strong>{competitor.name}</strong> has higher efficiency score than {champion.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Areas where champion performs better */}
                  {getMetricComparison('distributionTime').isWorse && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{champion.name}</strong> has faster average speed
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
          <div className="flex justify-end gap-3 pt-4">
            <PDFDownloadLink
              document={
                <PDFComparisonDocument
                  champion={champion}
                  competitor={competitor}
                  generatedDate={new Date().toLocaleDateString()}
                />
              }
              fileName={`benchmark-comparison-${champion.name}-vs-${competitor.name}.pdf`}
            >
              {({ blob, url, loading, error }) => (
                <Button
                  variant="outline"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {loading ? 'Generating PDF...' : 'Export PDF'}
                </Button>
              )}
            </PDFDownloadLink>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 