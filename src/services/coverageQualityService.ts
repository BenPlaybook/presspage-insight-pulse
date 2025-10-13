import { supabase } from '@/lib/supabase';

/**
 * Coverage Quality Service
 * Calculates PR Health Score metric #3: Coverage Quality (0-100)
 * Weights: Domain Authority 40%, Industry Match 30%, Sentiment 20%, Engagement 10%
 * 
 * Note: Requires enrichment data from n8n workflow to be populated in publication_relationships:
 * - domain_authority
 * - industry_match_score
 * - sentiment_score
 * - engagement_score
 */

interface CoverageQualityData {
  totalScore: number;
  qualifiedPickups: number;
  averageDomainAuthority: number;
  averageIndustryMatch: number;
  averageSentiment: number;
  averageEngagement: number;
}

class CoverageQualityService {
  /**
   * Calculates quality score for a single pickup
   */
  private calculatePickupQuality(
    domainAuthority: number,
    industryMatch: number,
    sentiment: number,
    engagement: number
  ): number {
    // Normalize sentiment from [-1, 1] to [0, 100]
    const sentimentNormalized = ((sentiment + 1) / 2) * 100;
    
    // Calculate weighted score
    const score = 
      (domainAuthority * 0.40) +
      (industryMatch * 100 * 0.30) +
      (sentimentNormalized * 0.20) +
      (engagement * 0.10);
    
    return score;
  }

  /**
   * Main calculation method for Coverage Quality score
   */
  async calculateCoverageQuality(accountId: string): Promise<CoverageQualityData> {
    console.log('🔍 STARTING Coverage Quality Calculation for account:', accountId);

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get validated newswire pickups with quality scores from last 30 days
      const { data: pickups, error } = await supabase
        .from('publication_relationships')
        .select('domain_authority, industry_match_score, sentiment_score, engagement_score')
        .eq('account_id', accountId)
        .eq('relationship_type', 'affiliated')
        .eq('serp_search_type', 'Newswire-Specific')
        .eq('match_status', 'Exact Match')
        .gte('publication_date', thirtyDaysAgo.toISOString())
        .not('domain_authority', 'is', null)
        .not('quality_data_fetched_at', 'is', null);

      if (error) {
        console.error('Error fetching pickups:', error);
        return this.getBaselineScore();
      }

      if (!pickups || pickups.length === 0) {
        console.log('No scored pickups found - returning baseline score');
        return this.getBaselineScore();
      }

      // Filter out low-quality domains (DA < 10 per spec)
      const qualifiedPickups = pickups.filter(p => (p.domain_authority || 0) >= 10);

      if (qualifiedPickups.length === 0) {
        console.log('No qualified pickups (all DA < 10) - returning baseline score');
        return this.getBaselineScore();
      }

      console.log(`📊 Analyzing ${qualifiedPickups.length} qualified pickups...`);

      // Calculate quality score for each pickup
      const pickupScores = qualifiedPickups.map(pickup => {
        const da = pickup.domain_authority || 50;
        const industryMatch = pickup.industry_match_score || 0.5;
        const sentiment = pickup.sentiment_score || 0.0;
        const engagement = pickup.engagement_score || 0;

        const score = this.calculatePickupQuality(da, industryMatch, sentiment, engagement);

        return {
          score,
          da,
          industryMatch,
          sentiment,
          engagement
        };
      });

      // Calculate averages for transparency
      const avgDA = pickupScores.reduce((sum, p) => sum + p.da, 0) / pickupScores.length;
      const avgIndustry = pickupScores.reduce((sum, p) => sum + p.industryMatch, 0) / pickupScores.length;
      const avgSentiment = pickupScores.reduce((sum, p) => sum + p.sentiment, 0) / pickupScores.length;
      const avgEngagement = pickupScores.reduce((sum, p) => sum + p.engagement, 0) / pickupScores.length;

      // Calculate overall score as average of all pickup scores
      const totalScore = pickupScores.reduce((sum, p) => sum + p.score, 0) / pickupScores.length;

      console.log('📊 Coverage Quality Breakdown:', {
        qualifiedPickups: qualifiedPickups.length,
        avgDomainAuthority: Math.round(avgDA),
        avgIndustryMatch: Math.round(avgIndustry * 100),
        avgSentiment: avgSentiment.toFixed(2),
        avgEngagement: Math.round(avgEngagement)
      });

      console.log('🎯 FINAL Coverage Quality Score:', Math.round(totalScore));

      return {
        totalScore: Math.round(totalScore),
        qualifiedPickups: qualifiedPickups.length,
        averageDomainAuthority: Math.round(avgDA),
        averageIndustryMatch: Math.round(avgIndustry * 100),
        averageSentiment: avgSentiment,
        averageEngagement: Math.round(avgEngagement)
      };

    } catch (error) {
      console.error('❌ Error calculating coverage quality:', error);
      return this.getBaselineScore();
    }
  }

  /**
   * Returns baseline score when no quality data is available
   */
  private getBaselineScore(): CoverageQualityData {
    return {
      totalScore: 50, // Neutral baseline
      qualifiedPickups: 0,
      averageDomainAuthority: 0,
      averageIndustryMatch: 0,
      averageSentiment: 0,
      averageEngagement: 0
    };
  }
}

// Export singleton instance
export const coverageQualityService = new CoverageQualityService();

