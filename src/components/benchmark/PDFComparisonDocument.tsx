import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  date: {
    fontSize: 10,
    color: '#9ca3af',
  },
  content: {
    marginTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  metricCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    width: '30%',
  },
  metricValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    width: '35%',
    textAlign: 'center',
  },
  comparison: {
    fontSize: 10,
    color: '#374151',
    width: '35%',
    textAlign: 'center',
  },
  championValue: {
    color: '#2563eb',
  },
  competitorValue: {
    color: '#374151',
  },
  better: {
    color: '#059669',
  },
  worse: {
    color: '#dc2626',
  },
  equal: {
    color: '#6b7280',
  },
  insightsSection: {
    marginTop: 25,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 10,
    marginRight: 8,
    marginTop: 1,
  },
  insightText: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
  },
  positiveInsight: {
    color: '#059669',
  },
  negativeInsight: {
    color: '#dc2626',
  },
  neutralInsight: {
    color: '#2563eb',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

interface BenchmarkMetrics {
  publications: number;
  distributionTime: number;
  serpPosition: number;
  socialReach: number;
  engagementRate: number;
  financialPublications: number;
  nonFinancialPublications: number;
}

interface PDFComparisonDocumentProps {
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
  generatedDate: string;
}

export const PDFComparisonDocument = ({
  champion,
  competitor,
  generatedDate,
}: PDFComparisonDocumentProps) => {
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

  const formatMetric = (value: number, format: (value: number) => string) => {
    return format(value);
  };

  const getComparisonText = (comparison: any, lowerIsBetter: boolean = true) => {
    const isBetter = lowerIsBetter ? comparison.isBetter : !comparison.isBetter;
    const isWorse = lowerIsBetter ? comparison.isWorse : !comparison.isWorse;
    
    if (isBetter) {
      return `+${Math.abs(comparison.percentage).toFixed(1)}%`;
    } else if (isWorse) {
      return `-${Math.abs(comparison.percentage).toFixed(1)}%`;
    } else {
      return '0%';
    }
  };

  const getComparisonStyle = (comparison: any, lowerIsBetter: boolean = true) => {
    const isBetter = lowerIsBetter ? comparison.isBetter : !comparison.isBetter;
    const isWorse = lowerIsBetter ? comparison.isWorse : !comparison.isWorse;
    
    if (isBetter) return styles.better;
    if (isWorse) return styles.worse;
    return styles.equal;
  };

  const generateInsights = () => {
    const insights = [];
    
    // Positive insights for competitor
    if (getMetricComparison('distributionTime').isBetter) {
      insights.push({
        text: `${competitor.name} has faster distribution time than ${champion.name}`,
        type: 'positive'
      });
    }
    if (getMetricComparison('serpPosition').isBetter) {
      insights.push({
        text: `${competitor.name} ranks better in search results than ${champion.name}`,
        type: 'positive'
      });
    }
    if (getMetricComparison('publications').isBetter) {
      insights.push({
        text: `${competitor.name} has more publications than ${champion.name}`,
        type: 'positive'
      });
    }
    if (getMetricComparison('engagementRate').isBetter) {
      insights.push({
        text: `${competitor.name} has higher engagement rate than ${champion.name}`,
        type: 'positive'
      });
    }
    
    // Champion strengths
    if (getMetricComparison('distributionTime').isWorse) {
      insights.push({
        text: `${champion.name} has faster distribution time`,
        type: 'neutral'
      });
    }
    if (getMetricComparison('serpPosition').isWorse) {
      insights.push({
        text: `${champion.name} ranks better in search results`,
        type: 'neutral'
      });
    }
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Benchmark Comparison Report</Text>
          <Text style={styles.subtitle}>
            {champion.name} vs {competitor.name}
          </Text>
          <Text style={styles.date}>Generated on {generatedDate}</Text>
        </View>

        {/* Key Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
          
          {/* Publications */}
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Publications</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Champion</Text>
              <Text style={[styles.metricValue, styles.championValue]}>
                {formatMetric(champion.metrics.publications, (v) => v.toString())}
              </Text>
              <Text style={styles.comparison}>-</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Competitor</Text>
              <Text style={[styles.metricValue, styles.competitorValue]}>
                {formatMetric(competitor.metrics.publications, (v) => v.toString())}
              </Text>
              <Text style={[styles.comparison, getComparisonStyle(getMetricComparison('publications'), false)]}>
                {getComparisonText(getMetricComparison('publications'), false)}
              </Text>
            </View>
          </View>

          {/* Distribution Time */}
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Distribution Time</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Champion</Text>
              <Text style={[styles.metricValue, styles.championValue]}>
                {formatMetric(champion.metrics.distributionTime, (v) => `${v.toFixed(1)}h`)}
              </Text>
              <Text style={styles.comparison}>-</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Competitor</Text>
              <Text style={[styles.metricValue, styles.competitorValue]}>
                {formatMetric(competitor.metrics.distributionTime, (v) => `${v.toFixed(1)}h`)}
              </Text>
              <Text style={[styles.comparison, getComparisonStyle(getMetricComparison('distributionTime'))]}>
                {getComparisonText(getMetricComparison('distributionTime'))}
              </Text>
            </View>
          </View>

          {/* SERP Position */}
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>SERP Position</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Champion</Text>
              <Text style={[styles.metricValue, styles.championValue]}>
                {formatMetric(champion.metrics.serpPosition, (v) => `#${v}`)}
              </Text>
              <Text style={styles.comparison}>-</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Competitor</Text>
              <Text style={[styles.metricValue, styles.competitorValue]}>
                {formatMetric(competitor.metrics.serpPosition, (v) => `#${v}`)}
              </Text>
              <Text style={[styles.comparison, getComparisonStyle(getMetricComparison('serpPosition'))]}>
                {getComparisonText(getMetricComparison('serpPosition'))}
              </Text>
            </View>
          </View>

          {/* Social Reach */}
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Social Reach</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Champion</Text>
              <Text style={[styles.metricValue, styles.championValue]}>
                {formatMetric(champion.metrics.socialReach, (v) => v.toLocaleString())}
              </Text>
              <Text style={styles.comparison}>-</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Competitor</Text>
              <Text style={[styles.metricValue, styles.competitorValue]}>
                {formatMetric(competitor.metrics.socialReach, (v) => v.toLocaleString())}
              </Text>
              <Text style={[styles.comparison, getComparisonStyle(getMetricComparison('socialReach'), false)]}>
                {getComparisonText(getMetricComparison('socialReach'), false)}
              </Text>
            </View>
          </View>

          {/* Engagement Rate */}
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Engagement Rate</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Champion</Text>
              <Text style={[styles.metricValue, styles.championValue]}>
                {formatMetric(champion.metrics.engagementRate, (v) => `${v.toFixed(2)}%`)}
              </Text>
              <Text style={styles.comparison}>-</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Competitor</Text>
              <Text style={[styles.metricValue, styles.competitorValue]}>
                {formatMetric(competitor.metrics.engagementRate, (v) => `${v.toFixed(2)}%`)}
              </Text>
              <Text style={[styles.comparison, getComparisonStyle(getMetricComparison('engagementRate'), false)]}>
                {getComparisonText(getMetricComparison('engagementRate'), false)}
              </Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightIcon}>•</Text>
              <Text style={[
                styles.insightText,
                insight.type === 'positive' ? styles.positiveInsight :
                insight.type === 'negative' ? styles.negativeInsight :
                styles.neutralInsight
              ]}>
                {insight.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by Presspage Content Analyzer
          </Text>
        </View>
      </Page>
    </Document>
  );
}; 