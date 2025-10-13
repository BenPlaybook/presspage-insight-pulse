import { supabase } from '@/lib/supabase';
import { Publication, ContentSource } from '@/types/database';
import { organicFindabilityService } from './organicFindabilityService';
import { distributionReachService } from './distributionReachService';
import { coverageQualityService } from './coverageQualityService';

export interface PublishingVelocityData {
  averageDelay: number; // en horas
  channelFactor: number; // factor por canal
  totalScore: number; // score final en horas
  scorePercentage: number; // porcentaje para el PR Health Score
  channels: {
    sourceType: string;
    delay: number;
    publicationDate: string;
    scrapedDate: string;
  }[];
}

export interface DistributionReachData {
  totalScore: number;
  ownedReach: number;
  earnedReach: number;
  ownedScore: number;      // 0-100
  earnedScore: number;     // 0-100
  uniquePickupDomains: number;
  totalPickups: number;
}

export interface OrganicFindabilityData {
  serpScore: number; // SERP Score (0-100)
  prTopicsCoverage: number; // Number of unique search queries
  trendsScore: number; // Google Trends proxy score (0-100)
  averageSerpPosition: number; // Average SERP position
  totalKeywords: number; // Total unique search queries found
  totalScore: number; // Combined weighted score
  scorePercentage: number; // porcentaje para el PR Health Score
  serpDetails: {
    publicationId: string;
    averagePosition: number;
    mentionsCount: number;
  }[];
  topicDetails: {
    keyword: string;
    frequency: number;
  }[];
}

export interface PRHealthMetrics {
  publishingVelocity: PublishingVelocityData;
  distributionReach: DistributionReachData;
  organicFindability: OrganicFindabilityData;
  pickUpQuality: number;
}

export const prHealthMetricsService = {
  /**
   * Calcula el Publishing Velocity Score basado en el ejemplo proporcionado:
   * 
   * Ejemplo:
   * Media Room: Monday 9:00 AM (Day 0, Hour 0) - Original
   * Twitter: Tuesday 9:00 AM (Day 1, Hour 0) - Delay: 24h
   * LinkedIn: Tuesday 9:00 PM (Day 1, Hour 12) - Delay: 36h
   * 
   * Average Delay = (24 + 36) ÷ 2 = 30 hours
   * Channel Factor = 2 channels × 0.5 = 1 hour
   * Publishing Velocity Score = 30 + 1 = 31 hours (≈1.3 days)
   */
  async calculatePublishingVelocity(accountId: string): Promise<PublishingVelocityData> {
    try {
      // Obtener publicaciones de los últimos 30 días
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      console.log('📊 Publishing Velocity Debug: Current date:', now.toISOString());
      console.log('📊 Publishing Velocity Debug: Current date (local):', now.toLocaleDateString('es-ES'));
      console.log('📊 Publishing Velocity Debug: Searching from', thirtyDaysAgo.toISOString(), 'to', now.toISOString());
      console.log('📊 Publishing Velocity Debug: Date range (local):', thirtyDaysAgo.toLocaleDateString('es-ES'), 'to', now.toLocaleDateString('es-ES'));

      // Obtener publicaciones con sus content sources
      const { data: publications, error: pubError } = await supabase
        .from('publications')
        .select(`
          id,
          publication_date,
          scraped_at,
          content_source_id,
          content_sources (
            id,
            source_type,
            label
          )
        `)
        .eq('account_id', accountId)
        .gte('publication_date', thirtyDaysAgo.toISOString())
        .not('publication_date', 'is', null)
        .not('scraped_at', 'is', null)
        .order('publication_date', { ascending: true });

      if (pubError) {
        console.error('Error fetching publications for publishing velocity:', pubError);
        return this.getDefaultPublishingVelocity();
      }

      if (!publications || publications.length === 0) {
        console.log('📊 Publishing Velocity Debug: No publications found for account', accountId);
        console.log('📊 Publishing Velocity Debug: Date range:', thirtyDaysAgo.toISOString(), 'to now');
        return this.getDefaultPublishingVelocity();
      }

      console.log('📊 Publishing Velocity Debug: Found', publications.length, 'publications');

      // Agrupar publicaciones por fecha de publicación original
      const publicationGroups = this.groupPublicationsByOriginalDate(publications);
      
      let totalDelays: number[] = [];
      let allChannels: { sourceType: string; delay: number; publicationDate: string; scrapedDate: string }[] = [];

      // Calcular delays para cada grupo de publicaciones
      for (const [originalDate, groupPublications] of Object.entries(publicationGroups)) {
        if (groupPublications.length === 0) continue;

        // Las publicaciones ya están ordenadas: Media Room primero, luego otros
        const originalPublication = groupPublications[0];
        const originalDateObj = new Date(originalPublication.publication_date);
        
        console.log(`📊 Publishing Velocity Debug: Processing group for date ${originalDate}`);
        console.log(`📊 Publishing Velocity Debug: Original publication (${originalPublication.content_sources?.source_type || 'Unknown'}) at ${originalPublication.publication_date}`);

        // Calcular delays para las demás publicaciones (distribución en canales)
        for (let i = 1; i < groupPublications.length; i++) {
          const pub = groupPublications[i];
          const pubDate = new Date(pub.publication_date);
          
          // Calcular delay en horas (como en tu ejemplo: Twitter = 24h, LinkedIn = 36h)
          const delayHours = (pubDate.getTime() - originalDateObj.getTime()) / (1000 * 60 * 60);
          
          if (delayHours > 0 && delayHours < 168) { // Máximo 7 días de delay
            totalDelays.push(delayHours);
            
            allChannels.push({
              sourceType: pub.content_sources?.source_type || 'Unknown',
              delay: delayHours,
              publicationDate: pub.publication_date,
              scrapedDate: pub.scraped_at
            });
            
            console.log(`📊 Publishing Velocity Debug: Channel ${pub.content_sources?.source_type || 'Unknown'} delay: ${delayHours.toFixed(1)}h`);
          }
        }
      }

      // Calcular métricas según la definición exacta
      const averageDelay = totalDelays.length > 0 
        ? totalDelays.reduce((sum, delay) => sum + delay, 0) / totalDelays.length 
        : 0;

      // Channel Factor: número de canales únicos × 0.5 (configurable)
      const uniqueChannels = new Set(allChannels.map(ch => ch.sourceType)).size;
      const channelFactor = uniqueChannels * 0.5; // factor_value = 0.5

      // Publishing Velocity Score = average_delay + channel_factor
      const totalScore = averageDelay + channelFactor;

      // Convertir a porcentaje (menor tiempo = mejor score)
      // Basado en el ejemplo: 31h = ~1.3 días = score alto
      let scorePercentage = 100;
      if (totalScore > 72) scorePercentage = 40;      // > 3 días
      else if (totalScore > 48) scorePercentage = 60;  // 2-3 días  
      else if (totalScore > 24) scorePercentage = 80;  // 1-2 días
      else if (totalScore > 12) scorePercentage = 90;  // 0.5-1 día
      else if (totalScore > 0) scorePercentage = 95;   // < 0.5 día

      console.log('📊 Publishing Velocity Debug - Final Calculation:');
      console.log(`📊 Average Delay: ${averageDelay.toFixed(1)}h`);
      console.log(`📊 Unique Channels: ${uniqueChannels}`);
      console.log(`📊 Channel Factor: ${channelFactor.toFixed(1)}h`);
      console.log(`📊 Total Score: ${totalScore.toFixed(1)}h`);
      console.log(`📊 Score Percentage: ${scorePercentage}%`);

      return {
        averageDelay: Math.round(averageDelay * 100) / 100,
        channelFactor: Math.round(channelFactor * 100) / 100,
        totalScore: Math.round(totalScore * 100) / 100,
        scorePercentage,
        channels: allChannels
      };

    } catch (error) {
      console.error('Error calculating publishing velocity:', error);
      return this.getDefaultPublishingVelocity();
    }
  },

  /**
   * Agrupa publicaciones por fecha de publicación original
   * Identifica la publicación original (Media Room) basándose en el tipo de fuente
   */
  groupPublicationsByOriginalDate(publications: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    for (const pub of publications) {
      const dateKey = pub.publication_date.split('T')[0]; // Solo la fecha, sin hora
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(pub);
    }
    
    // Para cada grupo, ordenar para identificar la publicación original
    for (const dateKey in groups) {
      const group = groups[dateKey];
      
      // Ordenar por tipo de fuente: Media Room primero, luego otros
      group.sort((a, b) => {
        const aSourceType = a.content_sources?.source_type?.toLowerCase() || '';
        const bSourceType = b.content_sources?.source_type?.toLowerCase() || '';
        
        // Media Room tiene prioridad (es la publicación original)
        if (aSourceType.includes('media room') || aSourceType.includes('press room')) return -1;
        if (bSourceType.includes('media room') || bSourceType.includes('press room')) return 1;
        
        // Luego ordenar por fecha de publicación
        return new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime();
      });
    }
    
    return groups;
  },

  /**
   * Retorna valores por defecto cuando no hay datos suficientes
   */
  getDefaultPublishingVelocity(): PublishingVelocityData {
    return {
      averageDelay: 0,
      channelFactor: 0,
      totalScore: 0,
      scorePercentage: 0, // Sin datos = 0
      channels: []
    };
  },


  /**
   * Calculates Organic Findability using the new comprehensive service
   */
  async calculateOrganicFindability(accountId: string): Promise<OrganicFindabilityData> {
    // Use the new comprehensive organic findability service
    const result = await organicFindabilityService.calculateOrganicFindability(accountId);
    
    // Transform the result to match the expected interface
    return {
      serpScore: result.metrics.serpScore,
      prTopicsCoverage: result.metrics.prTopicsCoverage,
      trendsScore: result.metrics.trendsScore,
      averageSerpPosition: result.details.averageSerpPosition,
      totalKeywords: result.details.uniqueKeywords,
      totalScore: result.metrics.compositeScore,
      scorePercentage: result.metrics.compositeScore,
      serpDetails: [], // Not provided by new service
      topicDetails: [] // Not provided by new service
    };
  },



  /**
   * Calcula todas las métricas de PR Health Score
   */
  async calculatePRHealthMetrics(accountId: string): Promise<PRHealthMetrics> {
    const publishingVelocity = await this.calculatePublishingVelocity(accountId);
    const distributionReach = await distributionReachService.calculateDistributionReach(accountId);
    const organicFindability = await this.calculateOrganicFindability(accountId);
    const coverageQualityData = await coverageQualityService.calculateCoverageQuality(accountId);
    const pickUpQuality = coverageQualityData.totalScore;

    return {
      publishingVelocity,
      distributionReach,
      organicFindability,
      pickUpQuality
    };
  }
};
