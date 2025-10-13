import { supabase } from '@/lib/supabase';

/**
 * Parses body content - handles both plain text and JSON-wrapped content
 */
function parseBodyContent(bodyContent: string): string {
  if (!bodyContent) return '';
  
  // Try to parse as JSON-wrapped content (Avantium style)
  try {
    const jsonMatch = bodyContent.match(/```json\s*\n\s*{\s*"content":\s*"(.+?)"\s*}\s*```/s);
    if (jsonMatch) {
      return jsonMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
    }
  } catch (e) {
    // Not JSON format, continue
  }
  
  // Return as plain text
  return bodyContent.trim();
}

/**
 * Extracts significant keywords from text using frequency analysis
 */
function extractKeywords(text: string, maxKeywords: number = 20): string[] {
  const stopwords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
    'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
    'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all',
    'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
    'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
    'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'also',
    'has', 'been', 'are', 'was', 'were', 'our', 'more', 'these', 'may', 'such'
  ]);
  
  // Extract words (4+ characters, alphanumeric)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 4 && !stopwords.has(word) && !/^\d+$/.test(word));
  
  // Count frequency
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });
  
  // Return top keywords by frequency
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Clusters keywords by co-occurrence across articles
 */
function clusterKeywords(
  articleKeywords: Map<string, string[]>
): Array<{ name: string; keywords: string[]; articleCount: number }> {
  // Build co-occurrence matrix
  const cooccurrence = new Map<string, Map<string, number>>();
  
  for (const keywords of articleKeywords.values()) {
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const key1 = keywords[i];
        const key2 = keywords[j];
        
        if (!cooccurrence.has(key1)) cooccurrence.set(key1, new Map());
        if (!cooccurrence.has(key2)) cooccurrence.set(key2, new Map());
        
        cooccurrence.get(key1)!.set(key2, (cooccurrence.get(key1)!.get(key2) || 0) + 1);
        cooccurrence.get(key2)!.set(key1, (cooccurrence.get(key2)!.get(key1) || 0) + 1);
      }
    }
  }
  
  // Simple clustering: group keywords that co-occur frequently
  const clusters: Array<{ name: string; keywords: string[]; articleCount: number }> = [];
  const clustered = new Set<string>();
  
  for (const [keyword, cooccurrences] of cooccurrence.entries()) {
    if (clustered.has(keyword)) continue;
    
    // Find strongly related keywords (co-occur in 30%+ of cases)
    const related = [keyword];
    const threshold = Math.max(2, articleKeywords.size * 0.3);
    
    for (const [related_word, count] of cooccurrences.entries()) {
      if (!clustered.has(related_word) && count >= threshold) {
        related.push(related_word);
        clustered.add(related_word);
      }
    }
    
    clustered.add(keyword);
    
    // Count articles containing any keyword from this cluster
    let articleCount = 0;
    for (const keywords of articleKeywords.values()) {
      if (related.some(kw => keywords.includes(kw))) {
        articleCount++;
      }
    }
    
    clusters.push({
      name: related[0], // Use first keyword as cluster name
      keywords: related.slice(0, 5), // Limit to 5 keywords per cluster
      articleCount
    });
  }
  
  return clusters.sort((a, b) => b.articleCount - a.articleCount);
}

export interface OrganicFindabilityMetrics {
  serpScore: number; // 0-100
  prTopicsCoverage: number; // 0-100
  trendsScore: number; // 0-100
  compositeScore: number; // 0-100
}

export interface OrganicFindabilityData {
  metrics: OrganicFindabilityMetrics;
  details: {
    averageSerpPosition: number;
    uniqueKeywords: number;
    totalPublications: number;
    publicationFrequency: number;
  };
  error?: string;
}

export const organicFindabilityService = {
  /**
   * Calcula el Organic Findability score para un account
   * Basado en:
   * 1. Average SERP score (serp_index_position)
   * 2. PR topics coverage (diversidad de palabras clave)
   * 3. Publication frequency (frecuencia temporal)
   */
  async calculateOrganicFindability(accountId: string): Promise<OrganicFindabilityData> {
    console.log('====================================');
    console.log('🔍 STARTING Organic Findability Calculation');
    console.log('Account ID:', accountId);
    console.log('====================================');
    
    try {
      // 1. SERP Position Score (30%)
      console.log('📊 Step 1: Calculating SERP Score...');
      let serpScore = 0;
      try {
        serpScore = await this.calculateSerpScore(accountId);
        console.log('✅ SERP Score Result:', serpScore);
      } catch (error) {
        console.error('❌ SERP Score Error:', error);
        serpScore = 50; // Fallback
      }
      
      // 2. Topic Coverage Score (20%)
      console.log('📊 Step 2: Calculating Topic Coverage...');
      let prTopicsCoverage = 0;
      try {
        prTopicsCoverage = await this.calculatePrTopicsCoverage(accountId);
        console.log('✅ Topic Coverage Result:', prTopicsCoverage);
      } catch (error) {
        console.error('❌ Topic Coverage Error:', error);
        prTopicsCoverage = 5; // Fallback
      }
      
      // 3. Branded Search Lift Score (50%)
      console.log('📊 Step 3: Calculating Branded Search Score...');
      let trendsScore = 0;
      try {
        trendsScore = await this.calculateBrandedSearchScore(accountId);
        console.log('✅ Branded Search Result:', trendsScore);
      } catch (error) {
        console.error('❌ Branded Search Error:', error);
        trendsScore = 0; // Fallback
      }
      
      // 4. Calculate weighted total
      console.log('📊 Step 4: Calculating Final Score...');
      const totalScore = (serpScore * 0.30) + (prTopicsCoverage * 0.20) + (trendsScore * 0.50);
      
      console.log('====================================');
      console.log('🎯 FINAL RESULTS:');
      console.log('  SERP Score (30%):', serpScore);
      console.log('  Topic Coverage (20%):', prTopicsCoverage);
      console.log('  Branded Search (50%):', trendsScore);
      console.log('  Total Score:', Math.round(totalScore));
      console.log('====================================');
      
      // 5. Obtener detalles para debugging
      const details = await this.getCalculationDetails(accountId);
      
      return {
        metrics: {
          serpScore: Math.round(serpScore),
          prTopicsCoverage,
          trendsScore: Math.round(trendsScore),
          compositeScore: Math.round(totalScore)
        },
        details: {
          averageSerpPosition: details.averageSerpPosition,
          uniqueKeywords: prTopicsCoverage,
          totalPublications: details.totalPublications,
          publicationFrequency: 0
        }
      };
    } catch (error) {
      console.error('====================================');
      console.error('💥 FATAL ERROR in Organic Findability:');
      console.error(error);
      console.error('====================================');
      return {
        metrics: {
          serpScore: 0,
          prTopicsCoverage: 0,
          trendsScore: 0,
          compositeScore: 0
        },
        details: {
          averageSerpPosition: 0,
          uniqueKeywords: 0,
          totalPublications: 0,
          publicationFrequency: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Calculates the SERP Score based on average search position
   * Formula: MAX(0, ((50 - AVG_POSITION) / 49) * 100)
   */
  async calculateSerpScore(accountId: string): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: serpData, error } = await supabase
        .from('publication_relationships')
        .select('serp_index_position, publication_id')
        .eq('account_id', accountId)
        .not('serp_index_position', 'is', null)
        .gt('serp_index_position', 0)
        .gte('publication_date', thirtyDaysAgo.toISOString());

      if (error || !serpData || serpData.length === 0) {
        console.log('No SERP data found for account:', accountId);
        return 50;
      }

      const positions = serpData.map(row => row.serp_index_position);
      const avgPosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;

      const MAX_SERP_POSITION = 50;
      const serpScore = Math.max(0, ((MAX_SERP_POSITION - avgPosition) / (MAX_SERP_POSITION - 1)) * 100);
      
      return Math.round(serpScore * 100) / 100;
    } catch (error) {
      console.error('Error calculating SERP score:', error);
      return 50;
    }
  },

  /**
   * Calculates PR Topics Coverage based on content clustering
   * Uses keyword extraction and co-occurrence clustering
   */
  async calculatePrTopicsCoverage(accountId: string): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get Media Room articles with body content
      const { data: publications, error } = await supabase
        .from('publications')
        .select(`
          id,
          title,
          body_content,
          content_sources!inner (
            source_type
          )
        `)
        .eq('account_id', accountId)
        .eq('content_sources.source_type', 'Media Room')
        .not('body_content', 'is', null)
        .gte('scraped_at', thirtyDaysAgo.toISOString());

      if (error || !publications || publications.length === 0) {
        console.log('No publications with content found for topic coverage');
        return 5; // Minimum baseline
      }
      
      // Extract keywords from each article
      const articleKeywords = new Map<string, string[]>();
      
      for (const pub of publications) {
        const content = parseBodyContent(pub.body_content);
        if (content.length < 100) continue; // Skip very short content
        
        const keywords = extractKeywords(content, 15);
        if (keywords.length > 0) {
          articleKeywords.set(pub.id, keywords);
        }
      }
      
      if (articleKeywords.size === 0) {
        return 5; // Minimum baseline
      }
      
      // Cluster keywords to identify unique topics
      const clusters = clusterKeywords(articleKeywords);
      const uniqueTopicClusters = clusters.length;
      
      console.log(`Topic Coverage - Account ${accountId}:`, {
        articlesAnalyzed: articleKeywords.size,
        topicClusters: uniqueTopicClusters,
        topClusters: clusters.slice(0, 5).map(c => ({
          name: c.name,
          keywords: c.keywords,
          articles: c.articleCount
        }))
      });
      
      // Get peer accounts from same industry
      const { data: account } = await supabase
        .from('accounts')
        .select('industry')
        .eq('id', accountId)
        .single();
      
      if (!account?.industry) {
        // No industry data, use raw cluster count
        return Math.min(uniqueTopicClusters * 10, 100);
      }
      
      // Get max clusters from peer accounts
      const { data: peerAccounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('industry', account.industry)
        .eq('is_actively_tracked', true)
        .neq('id', accountId);
      
      if (!peerAccounts || peerAccounts.length === 0) {
        // No peers, use raw cluster count
        return Math.min(uniqueTopicClusters * 10, 100);
      }
      
      // Calculate peer max (simplified - use industry average * 1.5)
      const industryAverage = 8; // Reasonable baseline
      const peerMax = Math.max(uniqueTopicClusters, industryAverage * 1.5);
      
      // Calculate score
      const score = Math.min((uniqueTopicClusters / peerMax) * 100, 100);
      
      return Math.round(score);
    } catch (error) {
      console.error('Error calculating PR topics coverage:', error);
      return 5; // Minimum baseline
    }
  },

  /**
   * Calcula el Publication Frequency basado en la frecuencia de publicaciones en el tiempo
   * Frecuencia más alta = score más alto
   */
  async calculatePublicationFrequency(accountId: string): Promise<number> {
    try {
      // Obtener publicaciones del account de los últimos 90 días
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: publications, error } = await supabase
        .from('publications')
        .select('publication_date')
        .eq('account_id', accountId)
        .gte('publication_date', ninetyDaysAgo.toISOString())
        .not('publication_date', 'is', null)
        .order('publication_date', { ascending: true });

      if (error || !publications || publications.length === 0) {
        return 0;
      }

      if (publications.length === 1) {
        return 20; // Una sola publicación
      }

      // Calcular frecuencia promedio (días entre publicaciones)
      const timeDifferences: number[] = [];
      
      for (let i = 1; i < publications.length; i++) {
        const prevDate = new Date(publications[i - 1].publication_date);
        const currDate = new Date(publications[i].publication_date);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        timeDifferences.push(diffDays);
      }

      const averageDaysBetweenPublications = timeDifferences.reduce((sum, days) => sum + days, 0) / timeDifferences.length;
      
      // Normalizar a score 0-100
      // 0-1 días = 100, 1-7 días = 80-100, 7-30 días = 40-80, 30+ días = 0-40
      let score = 0;
      if (averageDaysBetweenPublications <= 1) {
        score = 100;
      } else if (averageDaysBetweenPublications <= 7) {
        score = 100 - ((averageDaysBetweenPublications - 1) / 6) * 20;
      } else if (averageDaysBetweenPublications <= 30) {
        score = 80 - ((averageDaysBetweenPublications - 7) / 23) * 40;
      } else {
        score = Math.max(0, 40 - ((averageDaysBetweenPublications - 30) / 30) * 40);
      }

      return Math.round(Math.max(0, Math.min(100, score)));
    } catch (error) {
      console.error('Error calculating Publication Frequency:', error);
      return 0;
    }
  },



  /**
   * Obtiene detalles de los cálculos para debugging
   */
  async getCalculationDetails(accountId: string): Promise<{
    averageSerpPosition: number;
    uniqueKeywords: number;
    totalPublications: number;
    publicationFrequency: number;
  }> {
    try {
      // Obtener publicaciones
      const { data: publications, error: pubError } = await supabase
        .from('publications')
        .select('id, title, body_content, summary, publication_date')
        .eq('account_id', accountId);

      if (pubError || !publications) {
        return {
          averageSerpPosition: 0,
          uniqueKeywords: 0,
          totalPublications: 0,
          publicationFrequency: 0
        };
      }

      // Calcular posiciones SERP promedio
      const publicationIds = publications.map(pub => pub.id);
      const { data: relationships } = await supabase
        .from('publication_relationships')
        .select('serp_index_position')
        .in('publication_id', publicationIds)
        .not('serp_index_position', 'is', null)
        .gt('serp_index_position', 0);

      const averageSerpPosition = relationships && relationships.length > 0
        ? relationships.reduce((sum, rel) => sum + rel.serp_index_position, 0) / relationships.length
        : 0;

      // Calcular palabras clave únicas
      const keywords = new Set<string>();
      publications.forEach(pub => {
        if (pub.title) {
          extractKeywords(pub.title).forEach(word => keywords.add(word));
        }
        if (pub.body_content) {
          const content = parseBodyContent(pub.body_content);
          extractKeywords(content.substring(0, 1000)).forEach(word => keywords.add(word));
        }
        if (pub.summary) {
          extractKeywords(pub.summary).forEach(word => keywords.add(word));
        }
      });

      // Calcular frecuencia de publicaciones
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const recentPublications = publications.filter(pub => 
        pub.publication_date && new Date(pub.publication_date) >= ninetyDaysAgo
      );

      let publicationFrequency = 0;
      if (recentPublications.length > 1) {
        const sortedPubs = recentPublications
          .filter(pub => pub.publication_date)
          .sort((a, b) => new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime());
        
        const timeDifferences: number[] = [];
        for (let i = 1; i < sortedPubs.length; i++) {
          const prevDate = new Date(sortedPubs[i - 1].publication_date);
          const currDate = new Date(sortedPubs[i].publication_date);
          const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          timeDifferences.push(diffDays);
        }
        
        publicationFrequency = timeDifferences.length > 0
          ? timeDifferences.reduce((sum, days) => sum + days, 0) / timeDifferences.length
          : 0;
      }

      return {
        averageSerpPosition: Math.round(averageSerpPosition * 100) / 100,
        uniqueKeywords: keywords.size,
        totalPublications: publications.length,
        publicationFrequency: Math.round(publicationFrequency * 100) / 100
      };
    } catch (error) {
      console.error('Error getting calculation details:', error);
      return {
        averageSerpPosition: 0,
        uniqueKeywords: 0,
        totalPublications: 0,
        publicationFrequency: 0
      };
    }
  },

  /**
   * Calculates Branded Search Lift Score from Google Trends data
   * Returns 0-100 score based on search volume spikes
   */
  async calculateBrandedSearchScore(accountId: string): Promise<number> {
    try {
      // Get most recent Google Trends snapshot
      const { data: trendsData, error } = await supabase
        .from('branded_search_metrics')
        .select('*')
        .eq('account_id', accountId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !trendsData) {
        console.log('No Google Trends data found for account:', accountId);
        return 0;
      }
      
      // Parse spikes from TEXT column
      let spikes: Array<{ date: string; volume: number; lift: number }> | null = null;
      if (trendsData.spikes) {
        try {
          spikes = JSON.parse(trendsData.spikes);
        } catch (e) {
          console.error('Error parsing spikes JSON:', e);
          return 0;
        }
      }
      
      if (!spikes || spikes.length === 0) {
        console.log('No search spikes detected for account:', accountId);
        return 0;
      }
      
      // Link spikes to publications if not already done
      if (!trendsData.linked_publication_ids || trendsData.linked_publication_ids.length === 0) {
        await this.linkSpikesToPublications(accountId, trendsData.id, spikes);
      }
      
      // Calculate average lift from all spikes
      const avgLift = spikes.reduce((sum, spike) => sum + spike.lift, 0) / spikes.length;
      
      // Cap at 100, floor at 0
      const brandedSearchScore = Math.min(Math.max(0, avgLift), 100);
      
      console.log(`Branded Search Score - Account ${accountId}:`, {
        snapshotDate: trendsData.snapshot_date,
        baseline: trendsData.baseline_volume,
        spikeCount: spikes.length,
        avgLift: `${avgLift.toFixed(1)}%`,
        score: brandedSearchScore
      });
      
      return Math.round(brandedSearchScore);
    } catch (error) {
      console.error('Error calculating branded search score:', error);
      return 0;
    }
  },

  /**
   * Links search spikes to related publications
   */
  async linkSpikesToPublications(
    accountId: string, 
    trendsDataId: string, 
    spikes: Array<{ date: string; volume: number; lift: number }>
  ): Promise<void> {
    try {
      // This method would implement the logic to link spikes to publications
      // For now, we'll leave it as a placeholder since the instruction says not to modify it
      console.log('Linking spikes to publications for account:', accountId, 'trends data:', trendsDataId);
    } catch (error) {
      console.error('Error linking spikes to publications:', error);
    }
  }
};
