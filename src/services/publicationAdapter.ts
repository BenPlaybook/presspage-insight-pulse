import { Publication as SupabasePublication } from '@/types/database';
import { Publication } from '@/types/publications';

export const publicationAdapter = {
  // Convierte datos de Supabase al formato del frontend
  fromSupabase(supabasePublication: SupabasePublication): Publication {
    return {
      id: supabasePublication.id,
      title: supabasePublication.title,
      status: supabasePublication.status || 'Completed',
      detectedDate: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
      classification: supabasePublication.financial_classification || 'Non-Financial',
                           trackingPeriod: {
          start: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
          end: supabasePublication.scraped_at ? new Date(new Date(supabasePublication.scraped_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : (supabasePublication.publication_date || '')
        },
      serpPosition: {
        na: supabasePublication.serp_position_na || 0,
        eu: supabasePublication.serp_position_eu || 0
      },
      socialCoverage: {
        matched: 2, // This would need to be calculated from actual social data
        total: 3,
        platforms: [
                                {
                           platform: 'Twitter',
               matched: true,
               timeDifference: '0.8 hrs',
               postDate: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
               url: '#'
          },
                                {
                           platform: 'LinkedIn',
               matched: true,
               timeDifference: '1.2 hrs',
               postDate: supabasePublication.scraped_at ? new Date(supabasePublication.scraped_at).toISOString().split('T')[0] : (supabasePublication.publication_date || ''),
               url: '#'
          },
          {
            platform: 'Facebook',
            matched: false,
            timeDifference: 'N/A',
            postDate: 'N/A',
            url: '#'
          }
        ]
      },
      distributionTime: '1.2 hours', // This would need to be calculated from actual data
      totalLocations: 3,
      content: supabasePublication.body_content || supabasePublication.summary || 'No content available',
      source: supabasePublication.article_url || 'N/A',
      image: supabasePublication.image || null, // Solo incluir si existe
      aiSummary: supabasePublication.ai_summary || null,
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
          matched: true,
          timeDifference: '0.8 hrs'
        },
        linkedin: {
          matched: true,
          timeDifference: '1.2 hrs'
        }
      }
    };
  },

  // Convierte múltiples publicaciones
  fromSupabaseArray(supabasePublications: SupabasePublication[]): Publication[] {
    return supabasePublications.map(publication => this.fromSupabase(publication));
  }
}; 