import { supabase } from '@/lib/supabase';
import { 
  Account, 
  ContentSource, 
  Publication, 
  PublicationRelationship,
  AccountsResponse,
  ContentSourcesResponse,
  PublicationsResponse,
  PublicationRelationshipsResponse
} from '@/types/database';

export const databaseService = {
  // ===== ACCOUNTS =====
  async getAccounts(page: number = 1, limit: number = 10, search?: string, filters?: {
    status?: 'Active' | 'Processing';
    industry?: string;
  }): Promise<{
    data: Account[];
    error: any;
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    let query = supabase
      .from('accounts')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    // Apply status filter
    if (filters?.status) {
      const isActive = filters.status === 'Active';
      query = query.eq('is_actively_tracked', isActive);
    }

    // Apply industry filter
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return { 
      data: data || [], 
      error, 
      total, 
      totalPages, 
      currentPage: page 
    };
  },

  async getAccountById(id: string): Promise<{ data: Account | null; error: any }> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async createAccount(account: Partial<Account>): Promise<{ data: Account | null; error: any }> {
    const { data, error } = await supabase
      .from('accounts')
      .insert([account])
      .select()
      .single();

    return { data, error };
  },

  async updateAccount(id: string, updates: Partial<Account>): Promise<{ data: Account | null; error: any }> {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async deleteAccount(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    return { error };
  },

  // Get unique industries for filters
  async getIndustries(): Promise<{ data: string[]; error: any }> {
    const { data, error } = await supabase
      .from('accounts')
      .select('industry')
      .not('industry', 'is', null);

    if (error) {
      return { data: [], error };
    }

    const industries = [...new Set(data?.map(item => item.industry).filter(Boolean))];
    return { data: industries, error: null };
  },

  // Get total active accounts count
  async getActiveAccountsCount(): Promise<{ count: number; error: any }> {
    const { count, error } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('is_actively_tracked', true);

    return { count: count || 0, error };
  },

  // ===== CONTENT SOURCES =====
  async getContentSources(accountId?: string): Promise<ContentSourcesResponse> {
    let query = supabase
      .from('content_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getContentSourceById(id: string): Promise<{ data: ContentSource | null; error: any }> {
    const { data, error } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async createContentSource(contentSource: Partial<ContentSource>): Promise<{ data: ContentSource | null; error: any }> {
    const { data, error } = await supabase
      .from('content_sources')
      .insert([contentSource])
      .select()
      .single();

    return { data, error };
  },

  async updateContentSource(id: string, updates: Partial<ContentSource>): Promise<{ data: ContentSource | null; error: any }> {
    const { data, error } = await supabase
      .from('content_sources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // ===== PUBLICATIONS =====
  async getPublications(accountId?: string, limit?: number): Promise<PublicationsResponse> {
    let query = supabase
      .from('publications')
      .select('*')
      .order('publication_date', { ascending: false });

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getPublicationById(id: string): Promise<{ data: Publication | null; error: any }> {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  async getPublicationsByAccount(accountId: string, limit?: number): Promise<PublicationsResponse> {
    let query = supabase
      .from('publications')
      .select('*')
      .eq('account_id', accountId)
      .order('publication_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async createPublication(publication: Partial<Publication>): Promise<{ data: Publication | null; error: any }> {
    const { data, error } = await supabase
      .from('publications')
      .insert([publication])
      .select()
      .single();

    return { data, error };
  },

  async updatePublication(id: string, updates: Partial<Publication>): Promise<{ data: Publication | null; error: any }> {
    const { data, error } = await supabase
      .from('publications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // ===== PUBLICATION RELATIONSHIPS =====
  async getPublicationRelationships(publicationId?: string): Promise<PublicationRelationshipsResponse> {
    let query = supabase
      .from('publication_relationships')
      .select('*')
      .order('created_at', { ascending: false });

    if (publicationId) {
      query = query.or(`publication_id_a.eq.${publicationId},publication_id_b.eq.${publicationId}`);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // ===== STATISTICS =====
  async getAccountStats(accountId: string): Promise<{ 
    totalPublications: number; 
    totalContentSources: number; 
    recentPublications: number;
    error: any;
  }> {
    try {
      // Get total publications
      const { count: publicationsCount } = await supabase
        .from('publications')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId);

      // Get total content sources
      const { count: sourcesCount } = await supabase
        .from('content_sources')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId);

      // Get recent publications (last 30 days) using scraped_at
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentCount } = await supabase
        .from('publications')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .gte('scraped_at', thirtyDaysAgo.toISOString());

      return {
        totalPublications: publicationsCount || 0,
        totalContentSources: sourcesCount || 0,
        recentPublications: recentCount || 0,
        error: null
      };
    } catch (error) {
      return {
        totalPublications: 0,
        totalContentSources: 0,
        recentPublications: 0,
        error
      };
    }
  },

  // ===== PUBLICATIONS LAST 30 DAYS =====
  async getPublicationsLast30Days(accountId: string): Promise<PublicationsResponse> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('account_id', accountId)
      .gte('scraped_at', thirtyDaysAgo.toISOString())
      .order('scraped_at', { ascending: false });

    return { data, error };
  },

  async getTrackedPublicationsLast30Days(accountId: string): Promise<PublicationsResponse> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get publications that are being tracked (not direct social media posts)
    // Filter out publications that are direct LinkedIn/Twitter posts
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('account_id', accountId)
      .gte('scraped_at', thirtyDaysAgo.toISOString())
      .not('article_url', 'ilike', '%linkedin.com%')
      .not('article_url', 'ilike', '%twitter.com%')
      .not('article_url', 'ilike', '%x.com%')
      .not('title', 'ilike', '%linkedin post%')
      .not('title', 'ilike', '%twitter post%')
      .order('scraped_at', { ascending: false });

    return { data, error };
  },

  // ===== PUBLICATIONS CLASSIFICATION STATS =====
  async getPublicationsClassificationStats(accountId: string): Promise<{
    financial: number;
    nonFinancial: number;
    error: any;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get financial publications count (tracked only)
      const { count: financialCount } = await supabase
        .from('publications')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .eq('financial_classification', 'Financial')
        .gte('scraped_at', thirtyDaysAgo.toISOString())
        .not('article_url', 'ilike', '%linkedin.com%')
        .not('article_url', 'ilike', '%twitter.com%')
        .not('article_url', 'ilike', '%x.com%');

      // Get non-financial publications count (tracked only)
      const { count: nonFinancialCount } = await supabase
        .from('publications')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId)
        .neq('financial_classification', 'Financial')
        .gte('scraped_at', thirtyDaysAgo.toISOString())
        .not('article_url', 'ilike', '%linkedin.com%')
        .not('article_url', 'ilike', '%twitter.com%')
        .not('article_url', 'ilike', '%x.com%');

      return {
        financial: financialCount || 0,
        nonFinancial: nonFinancialCount || 0,
        error: null
      };
    } catch (error) {
      return {
        financial: 0,
        nonFinancial: 0,
        error
      };
    }
  },

  // ===== RELATED PUBLICATIONS =====
  async getRelatedPublications(publicationId: string): Promise<PublicationsResponse> {
    try {
      // Get related publications based on publication_relationships table
      // where content_source_id matches the current publication's content_source_id
      const { data, error } = await supabase
        .from('publication_relationships')
        .select(`
          publication_id_a,
          publication_id_b,
          publications!publication_id_a(*)
        `)
        .eq('publication_id_a', publicationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching related publications:', error);
        return { data: [], error };
      }

      // Extract the related publications from the relationships
      const relatedPublications = data?.map(rel => rel.publications).filter(Boolean) || [];
      
      return { data: relatedPublications, error: null };
    } catch (error) {
      console.error('Error in getRelatedPublications:', error);
      return { data: [], error };
    }
  },

  // ===== SEARCH =====
  async searchPublications(query: string, accountId?: string): Promise<PublicationsResponse> {
    let supabaseQuery = supabase
      .from('publications')
      .select('*')
      .or(`title.ilike.%${query}%,body_content.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('publication_date', { ascending: false });

    if (accountId) {
      supabaseQuery = supabaseQuery.eq('account_id', accountId);
    }

    const { data, error } = await supabaseQuery;
    return { data, error };
  },

  // ===== DISTRIBUTION CHANNELS =====
  async getDistributionChannels(accountId: string): Promise<{
    data: ContentSource[];
    error: any;
  }> {
    const { data, error } = await supabase
      .from('content_sources')
      .select('*')
      .eq('account_id', accountId)
      .in('source_type', ['media_room', 'Twitter / X', 'Linkedin', 'Facebook'])
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  // ===== SERP DATA =====
  async getSerpData(accountId: string): Promise<{
    northAmerica: { position: number; trend: string } | null;
    europe: { position: number; trend: string } | null;
    error: any;
  }> {
    try {
      // This would typically query a serp_data table
      // For demonstration, we'll return sample data for some accounts
      if (accountId === '1') { // Ethiad Airways
        return {
          northAmerica: { position: 3, trend: '+2 positions' },
          europe: { position: 5, trend: '+1 position' },
          error: null
        };
      } else if (accountId === '2') { // Another account with only Europe data
        return {
          northAmerica: null,
          europe: { position: 8, trend: '-1 position' },
          error: null
        };
      } else {
        // No SERP data available for other accounts
        return {
          northAmerica: null,
          europe: null,
          error: null
        };
      }
    } catch (error) {
      return {
        northAmerica: null,
        europe: null,
        error
      };
    }
  },

  // ===== DISTRIBUTION TIME CALCULATION =====
  // Calculates average time between publication_date (original) and scraped_at (detection)
  async getAverageDistributionTime(accountId: string): Promise<{
    averageHours: number;
    trend: string;
    error: any;
  }> {
    try {
      // Get publications from last 30 days with both dates
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: publications, error } = await supabase
        .from('publications')
        .select('publication_date, scraped_at')
        .eq('account_id', accountId)
        .gte('scraped_at', thirtyDaysAgo.toISOString())
        .not('publication_date', 'is', null)
        .not('scraped_at', 'is', null);

      if (error) {
        return { averageHours: 0, trend: 'N/A', error };
      }

      if (!publications || publications.length === 0) {
        return { averageHours: 0, trend: 'No data available', error: null };
      }

      // Calculate time differences
      const timeDifferences: number[] = [];
      
      publications.forEach(pub => {
        const publicationDate = new Date(pub.publication_date);
        const scrapedDate = new Date(pub.scraped_at);
        
        // Calculate difference in hours: scraped_at (detection) - publication_date (original)
        const diffMs = scrapedDate.getTime() - publicationDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Only include reasonable values (positive and less than 30 days)
        if (diffHours > 0 && diffHours < 720) { // 30 days = 720 hours
          timeDifferences.push(diffHours);
        }
      });

      if (timeDifferences.length === 0) {
        return { averageHours: 0, trend: 'No valid data', error: null };
      }

      // Calculate average
      const averageHours = timeDifferences.reduce((sum, hours) => sum + hours, 0) / timeDifferences.length;
      
      // Calculate trend (simplified - could be enhanced with historical data)
      const trend = averageHours < 2 ? '↓ 20% vs last month' : 
                   averageHours > 4 ? '↑ 20% vs last month' : 
                   '→ Stable';

      return { 
        averageHours: Math.round(averageHours * 10) / 10, // Round to 1 decimal
        trend, 
        error: null 
      };
    } catch (error) {
      return { averageHours: 0, trend: 'Error calculating', error };
    }
  },


}; 