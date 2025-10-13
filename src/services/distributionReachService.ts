import { supabase } from '@/lib/supabase';

/**
 * Distribution Reach Service
 * Calculates PR Health Score metric #2: Distribution Reach (0-100)
 * Weights: Owned Audience 40%, Earned Audience 60%
 */

// Comprehensive newswire audience estimates (monthly reach)
const NEWSWIRE_AUDIENCE_MAP: Record<string, number> = {
  // US & Global Newswires
  'prnewswire.com': 5000000,
  'businesswire.com': 3500000,
  'globenewswire.com': 2000000,
  'accesswire.com': 1500000,
  'newsfilecorp.com': 800000,
  'prnewswire.co.uk': 4000000,
  
  // European Newswires
  'presseportal.de': 2500000,        // Germany
  'dpa.com': 3000000,                 // Germany (dpa)
  'eqs-news.com': 1800000,            // Germany/Europe
  'ots.at': 500000,                   // Austria
  'pressebox.de': 600000,             // Germany
  'firmenpresse.de': 400000,          // Germany
  'afp.com': 4000000,                 // France (AFP)
  'businesswire.fr': 800000,          // France
  'actusnews.com': 600000,            // France
  'ansa.it': 2000000,                 // Italy
  'europa.eu': 5000000,               // EU institutions
  
  // UK Newswires
  'businesswire.co.uk': 1500000,
  'prweb.co.uk': 800000,
  'responsesource.com': 500000,
  
  // Nordic Countries
  'cision.com': 2000000,              // Sweden/Nordic
  'mfn.se': 600000,                   // Sweden
  'ntb.no': 800000,                   // Norway
  
  // Asia-Pacific Newswires
  'prnasia.com': 2500000,             // Pan-Asia
  'kyodonews.net': 3000000,           // Japan (Kyodo)
  'jiji.com': 2500000,                // Japan (Jiji)
  'yonhapnews.co.kr': 2000000,        // South Korea
  'xinhuanet.com': 8000000,           // China (Xinhua)
  'chinadaily.com.cn': 5000000,       // China
  'prnewswire.co.in': 1500000,        // India
  'ptinews.com': 2000000,             // India (PTI)
  'bernama.com': 800000,              // Malaysia
  'businesswire.asia': 1200000,       // Asia
  
  // Australia/NZ
  'businesswire.com.au': 600000,
  'prnewswire.com.au': 500000,
  'scoop.co.nz': 400000,              // New Zealand
  
  // Middle East
  'wam.ae': 1000000,                  // UAE
  'spa.gov.sa': 1500000,              // Saudi Arabia
  
  // Latin America
  'notimex.gob.mx': 1200000,          // Mexico
  'agenciabrasil.ebc.com.br': 1500000, // Brazil
};

// Baseline earned reach for accounts with no pickups
const BASELINE_EARNED_REACH = 20000;

interface DistributionReachData {
  totalScore: number;
  ownedReach: number;
  earnedReach: number;
  ownedScore: number;      // 0-100
  earnedScore: number;     // 0-100
  uniquePickupDomains: number;
  totalPickups: number;
}

/**
 * Extracts domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Gets audience size for a domain
 */
function getDomainAudience(domain: string): number {
  return NEWSWIRE_AUDIENCE_MAP[domain] || 0;
}

/**
 * Calculates relevance factor for a domain (MVP: all medium relevance)
 */
function getRelevanceFactor(_domain: string, _accountIndustry?: string): number {
  // MVP: All domains get medium relevance (0.5)
  // TODO: Add industry matching logic for higher relevance (1.0)
  return 0.5;
}

class DistributionReachService {
  /**
   * Calculates owned audience reach from account data
   */
  private async calculateOwnedReach(accountId: string): Promise<number> {
    try {
      const { data: account, error } = await supabase
        .from('accounts')
        .select('estimated_audience_size, follower_count, twitter_follower_count, estimated_newsroom_traffic')
        .eq('id', accountId)
        .single();

      if (error || !account) {
        console.log('No account data found for owned reach calculation');
        return 0;
      }

      // Priority: Use estimated_audience_size if user has set it
      if (account.estimated_audience_size && account.estimated_audience_size > 0) {
        console.log(`Using user-provided audience size: ${account.estimated_audience_size}`);
        return account.estimated_audience_size;
      }

      // Fallback: Calculate from available fields
      const linkedinFollowers = account.follower_count || 0;
      const twitterFollowers = account.twitter_follower_count || 0;
      const newsroomTraffic = account.estimated_newsroom_traffic || 0;

      const totalOwned = linkedinFollowers + twitterFollowers + newsroomTraffic;
      
      console.log('Owned reach breakdown:', {
        linkedin: linkedinFollowers,
        twitter: twitterFollowers,
        newsroom: newsroomTraffic,
        total: totalOwned
      });

      return totalOwned;
    } catch (error) {
      console.error('Error calculating owned reach:', error);
      return 0;
    }
  }

  /**
   * Calculates earned audience reach from third-party pickups
   */
  private async calculateEarnedReach(accountId: string, accountIndustry?: string): Promise<{
    earnedReach: number;
    uniqueDomains: number;
    totalPickups: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get validated newswire pickups from last 30 days
      const { data: pickups, error } = await supabase
        .from('publication_relationships')
        .select('source, publication_date')
        .eq('account_id', accountId)
        .eq('relationship_type', 'affiliated')
        .eq('serp_search_type', 'Newswire-Specific')
        .eq('match_status', 'Exact Match')
        .gte('publication_date', thirtyDaysAgo.toISOString())
        .not('source', 'is', null);

      if (error) {
        console.error('Error fetching pickups:', error);
        return { earnedReach: BASELINE_EARNED_REACH, uniqueDomains: 0, totalPickups: 0 };
      }

      if (!pickups || pickups.length === 0) {
        console.log('No validated pickups found - using baseline earned reach');
        return { earnedReach: BASELINE_EARNED_REACH, uniqueDomains: 0, totalPickups: 0 };
      }

      // Group by domain and count occurrences
      const domainCounts = new Map<string, number>();
      
      for (const pickup of pickups) {
        const domain = extractDomain(pickup.source);
        domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
      }

      // Filter to domains with ≥2 mentions (per spec)
      const qualifiedDomains = Array.from(domainCounts.entries())
        .filter(([_, count]) => count >= 2);

      if (qualifiedDomains.length === 0) {
        console.log('No domains with ≥2 mentions - using baseline earned reach');
        return { earnedReach: BASELINE_EARNED_REACH, uniqueDomains: 0, totalPickups: pickups.length };
      }

      // Calculate earned reach: Σ(audience × relevance_factor)
      let totalEarnedReach = 0;

      for (const [domain, count] of qualifiedDomains) {
        const audience = getDomainAudience(domain);
        const relevance = getRelevanceFactor(domain, accountIndustry);
        const weightedAudience = audience * relevance;

        console.log(`Domain: ${domain} | Mentions: ${count} | Audience: ${audience} | Relevance: ${relevance} | Weighted: ${weightedAudience}`);
        
        totalEarnedReach += weightedAudience;
      }

      // Apply baseline if calculated reach is too low
      const finalEarnedReach = Math.max(totalEarnedReach, BASELINE_EARNED_REACH);

      console.log('Earned reach calculation:', {
        totalPickups: pickups.length,
        uniqueDomains: domainCounts.size,
        qualifiedDomains: qualifiedDomains.length,
        calculatedReach: totalEarnedReach,
        finalReach: finalEarnedReach
      });

      return {
        earnedReach: finalEarnedReach,
        uniqueDomains: qualifiedDomains.length,
        totalPickups: pickups.length
      };
    } catch (error) {
      console.error('Error calculating earned reach:', error);
      return { earnedReach: BASELINE_EARNED_REACH, uniqueDomains: 0, totalPickups: 0 };
    }
  }

  /**
   * Normalizes total reach against peer companies
   */
  private async normalizeToPeers(
    accountId: string,
    totalReach: number,
    accountIndustry?: string
  ): Promise<number> {
    try {
      if (!accountIndustry) {
        // No industry data - use simple scaling
        // Cap at 100, scale linearly from 0-1M reach
        return Math.min((totalReach / 1000000) * 100, 100);
      }

      // Get peer accounts from same industry
      const { data: peerAccounts, error } = await supabase
        .from('accounts')
        .select('id, follower_count, estimated_audience_size')
        .eq('industry', accountIndustry)
        .eq('is_actively_tracked', true)
        .neq('id', accountId);

      if (error || !peerAccounts || peerAccounts.length === 0) {
        console.log('No peer accounts found - using simple scaling');
        return Math.min((totalReach / 1000000) * 100, 100);
      }

      // Calculate peer reaches (simplified - using owned reach only for peers)
      const peerReaches = peerAccounts
        .map(peer => peer.estimated_audience_size || peer.follower_count || 0)
        .filter(reach => reach > 0);

      if (peerReaches.length === 0) {
        return Math.min((totalReach / 1000000) * 100, 100);
      }

      const peerMin = Math.min(...peerReaches);
      const peerMax = Math.max(...peerReaches);

      // Handle edge case where all peers have same reach
      if (peerMax === peerMin) {
        return totalReach >= peerMax ? 100 : 50;
      }

      // Apply normalization formula
      const normalizedScore = ((totalReach - peerMin) / (peerMax - peerMin)) * 100;

      console.log('Peer normalization:', {
        industry: accountIndustry,
        peerCount: peerReaches.length,
        peerMin,
        peerMax,
        totalReach,
        normalizedScore: Math.round(normalizedScore)
      });

      return Math.max(0, Math.min(100, normalizedScore));
    } catch (error) {
      console.error('Error normalizing to peers:', error);
      return Math.min((totalReach / 1000000) * 100, 100);
    }
  }

  /**
   * Main calculation method for Distribution Reach score
   */
  async calculateDistributionReach(accountId: string): Promise<DistributionReachData> {
    console.log('🔍 STARTING Distribution Reach Calculation for account:', accountId);

    try {
      // Get account industry for peer comparison
      const { data: account } = await supabase
        .from('accounts')
        .select('industry')
        .eq('id', accountId)
        .single();

      const accountIndustry = account?.industry;

      // Step 1: Calculate Owned Reach (40% weight)
      console.log('📊 Step 1: Calculating Owned Reach...');
      const ownedReach = await this.calculateOwnedReach(accountId);
      console.log(`✅ Owned Reach: ${ownedReach}`);

      // Step 2: Calculate Earned Reach (60% weight)
      console.log('📊 Step 2: Calculating Earned Reach...');
      const { earnedReach, uniqueDomains, totalPickups } = await this.calculateEarnedReach(
        accountId,
        accountIndustry
      );
      console.log(`✅ Earned Reach: ${earnedReach} (${uniqueDomains} qualified domains, ${totalPickups} total pickups)`);

      // Step 3: Combine and normalize
      console.log('📊 Step 3: Normalizing against peers...');
      const totalReach = ownedReach + earnedReach;
      const normalizedScore = await this.normalizeToPeers(accountId, totalReach, accountIndustry);

      // Calculate component scores for transparency
      const ownedScore = Math.min((ownedReach / 1000000) * 100, 100); // Simple scaling for owned
      const earnedScore = Math.min((earnedReach / 1000000) * 100, 100); // Simple scaling for earned

      console.log('🎯 FINAL Distribution Reach Results:', {
        totalScore: Math.round(normalizedScore),
        ownedReach,
        earnedReach,
        ownedScore: Math.round(ownedScore),
        earnedScore: Math.round(earnedScore),
        uniquePickupDomains: uniqueDomains,
        totalPickups
      });

      return {
        totalScore: Math.round(normalizedScore),
        ownedReach,
        earnedReach,
        ownedScore: Math.round(ownedScore),
        earnedScore: Math.round(earnedScore),
        uniquePickupDomains: uniqueDomains,
        totalPickups
      };
    } catch (error) {
      console.error('❌ Error calculating distribution reach:', error);
      
      // Return baseline scores on error
      return {
        totalScore: 20,
        ownedReach: 0,
        earnedReach: BASELINE_EARNED_REACH,
        ownedScore: 0,
        earnedScore: 20,
        uniquePickupDomains: 0,
        totalPickups: 0
      };
    }
  }
}

// Export singleton instance
export const distributionReachService = new DistributionReachService();

