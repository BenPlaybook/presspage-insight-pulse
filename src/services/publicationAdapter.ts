import { Publication as SupabasePublication } from '@/types/database';
import { Publication } from '@/types/publications';

export const publicationAdapter = {
  // Convierte datos de Supabase al formato del frontend
  fromSupabase(supabasePublication: SupabasePublication): Publication {
    return {
      id: supabasePublication.id,
      title: supabasePublication.title,
      status: (supabasePublication.status as any) || 'Completed',
      detectedDate: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
      classification: (supabasePublication.financial_classification === 'Financial' ? 'Financial' : 'Non-Financial') as 'Financial' | 'Non-Financial',
                           trackingPeriod: {
          start: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
          end: supabasePublication.scraped_at ? new Date(new Date(supabasePublication.scraped_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : (supabasePublication.publication_date || '')
        },
      serpPosition: {
        na: supabasePublication.serp_position_na || 0,
        eu: supabasePublication.serp_position_eu || 0
      },
      socialCoverage: {
        matched: 0, // This would need to be calculated from actual social data
        total: 0,
        platforms: [
          {
            platform: 'Twitter' as const,
            matched: false,
            timeDifference: 'Coming Soon',
            postDate: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
            url: '#'
          },
          {
            platform: 'LinkedIn' as const,
            matched: false,
            timeDifference: 'Coming Soon',
            postDate: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
            url: '#'
          },
          {
            platform: 'Facebook' as const,
            matched: false,
            timeDifference: 'Coming Soon',
            postDate: 'Coming Soon',
            url: '#'
          }
        ]
      },
      distributionTime: 'Coming Soon', // This would need to be calculated from actual data
      totalLocations: 3,
      content: supabasePublication.body_content || supabasePublication.summary || 'No content available',
      source: supabasePublication.article_url || 'N/A',
      image: supabasePublication.image || null, // Solo incluir si existe
      aiSummary: supabasePublication.ai_summary || null,
      label: supabasePublication.label || null,
      serpResults: [
                                                                       {
             region: 'NA',
             position: supabasePublication.serp_position_na || 0,
             url: supabasePublication.article_url || '#',
             detected: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
             title: supabasePublication.title,
             articleDate: supabasePublication.publication_date || '',
           matchStatus: 'Exact Match',
          confidence: 'High',
          reasoning: 'Exact title match',
          domain: 'example.com',
          searchQuery: 'search query',
          searchType: 'google',
          partialMatch: false
        },
                                                                       {
             region: 'EU',
             position: supabasePublication.serp_position_eu || 0,
             url: supabasePublication.article_url || '#',
             detected: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
             title: supabasePublication.title,
             articleDate: supabasePublication.publication_date || '',
           matchStatus: 'Exact Match',
          confidence: 'High',
          reasoning: 'Exact title match',
          domain: 'example.eu',
          searchQuery: 'search query',
          searchType: 'google',
          partialMatch: false
        }
      ],
      socialMatches: {
        twitter: {
          matched: false,
          timeDifference: 'Coming Soon'
        },
        linkedin: {
          matched: false,
          timeDifference: 'Coming Soon'
        }
      },
      relationship: (supabasePublication as any).relationship || null
    };
  },

  // Convierte múltiples publicaciones
  fromSupabaseArray(supabasePublications: SupabasePublication[]): Publication[] {
    return supabasePublications.map(publication => this.fromSupabase(publication));
  }
}; 