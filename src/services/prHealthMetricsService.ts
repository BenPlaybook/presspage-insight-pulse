import { supabase } from '@/lib/supabase';
import { Publication, ContentSource } from '@/types/database';

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
  totalViews: number; // Total estimated audience size
  thirdPartyLocations: number; // Number of third-party locations
  locationFactor: number; // Factor based on number of locations
  totalScore: number; // Combined score
  scorePercentage: number; // porcentaje para el PR Health Score
  locations: {
    sourceType: string;
    views: number;
    publicationDate: string;
    locationName?: string;
  }[];
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
  pickUpQuality: PickUpQualityData;
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
   * Calcula el Distribution Reach Score basado en:
   * - Unique Distribution Outlets: Count distinct outlets/domains
   * - Weighted by Audience Size: If available, weight by audience size
   * - Normalize to 0-100 score
   */
  async calculateDistributionReach(accountId: string): Promise<DistributionReachData> {
    try {
      // Obtener publicaciones de los últimos 30 días
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      console.log('🌐 Distribution Reach Debug: Current date:', now.toISOString());
      console.log('🌐 Distribution Reach Debug: Searching from', thirtyDaysAgo.toISOString(), 'to', now.toISOString());

      // Obtener publication_relationships con las columnas disponibles
      const { data: relationships, error: relError } = await supabase
        .from('publication_relationships')
        .select(`
          id,
          source,
          publication_date,
          title,
          snippet,
          account_id
        `)
        .eq('account_id', accountId)
        .gte('publication_date', thirtyDaysAgo.toISOString())
        .order('publication_date', { ascending: false });

      if (relError) {
        console.error('Error fetching publication relationships for distribution reach:', relError);
        return this.getDefaultDistributionReach();
      }

      if (!relationships || relationships.length === 0) {
        console.log('🌐 Distribution Reach Debug: No relationships found for account', accountId);
        console.log('🌐 Distribution Reach Debug: Date range:', thirtyDaysAgo.toISOString(), 'to now');
        return this.getDefaultDistributionReach();
      }

      console.log('🌐 Distribution Reach Debug: Found', relationships.length, 'relationships');

      // Paso 1: Unique Distribution Outlets
      const uniqueOutlets = new Set();
      const outletDetails: { outletDomain: string; publicationDate: string; title: string }[] = [];

      relationships.forEach(rel => {
        // Usar source como identificador del outlet (ej: "spoton.com")
        const outletDomain = rel.source || 'Unknown';
        uniqueOutlets.add(outletDomain);
        
        outletDetails.push({
          outletDomain,
          publicationDate: rel.publication_date,
          title: rel.title || 'No title'
        });
      });

      const uniqueOutletsCount = uniqueOutlets.size;
      console.log('🌐 Distribution Reach Debug: Found', uniqueOutletsCount, 'unique outlets');
      console.log('🌐 Distribution Reach Debug: Outlets found:', Array.from(uniqueOutlets));

      // Paso 2: Score basado en número de outlets únicos
      // No tenemos views, así que usamos solo el conteo de outlets
      const weightedScore = uniqueOutletsCount;

      // Paso 3: Normalize to 0-100 score
      // Basado en el número de outlets únicos y audience
      let scorePercentage = 0;
      
      if (weightedScore >= 20) scorePercentage = 100;      // 20+ outlets con audience alto
      else if (weightedScore >= 15) scorePercentage = 90;  // 15-19 outlets
      else if (weightedScore >= 10) scorePercentage = 80;  // 10-14 outlets
      else if (weightedScore >= 7) scorePercentage = 70;   // 7-9 outlets
      else if (weightedScore >= 5) scorePercentage = 60;   // 5-6 outlets
      else if (weightedScore >= 3) scorePercentage = 50;   // 3-4 outlets
      else if (weightedScore >= 1) scorePercentage = 30;   // 1-2 outlets
      else scorePercentage = 0;                            // 0 outlets

      console.log('🌐 Distribution Reach Debug - Final Calculation:');
      console.log('🌐 Unique Outlets:', uniqueOutletsCount);
      console.log('🌐 Weighted Score:', weightedScore.toFixed(2));
      console.log('🌐 Score Percentage:', scorePercentage + '%');

      return {
        totalViews: 0, // No tenemos datos de views
        thirdPartyLocations: uniqueOutletsCount,
        locationFactor: weightedScore,
        totalScore: weightedScore,
        scorePercentage,
        locations: outletDetails.map(outlet => ({
          sourceType: outlet.outletDomain,
          views: 0, // No tenemos datos de views
          publicationDate: outlet.publicationDate,
          locationName: outlet.outletDomain
        }))
      };

    } catch (error) {
      console.error('Error calculating distribution reach:', error);
      return this.getDefaultDistributionReach();
    }
  },

  /**
   * Retorna valores por defecto para Distribution Reach
   */
  getDefaultDistributionReach(): DistributionReachData {
    return {
      totalViews: 0,
      thirdPartyLocations: 0,
      locationFactor: 0,
      totalScore: 0,
      scorePercentage: 0, // Sin datos = 0
      locations: []
    };
  },

  /**
   * Calcula el Organic Findability Score basado en:
   * - SERP Score: Posición promedio en Google (serp_index_position)
   * - PR Topics Coverage: Diversidad de palabras clave (serp_search_query)
   * - Google Trends Proxy: Frecuencia de publicaciones en el tiempo
   */
  async calculateOrganicFindability(accountId: string): Promise<OrganicFindabilityData> {
    try {
      // Obtener publicaciones de los últimos 90 días para análisis de tendencias
      const now = new Date();
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      
      console.log('🔍 Organic Findability Debug: Current date:', now.toISOString());
      console.log('🔍 Organic Findability Debug: Searching from', ninetyDaysAgo.toISOString(), 'to', now.toISOString());

      // Obtener publication_relationships con datos de SERP
      const { data: relationships, error: relError } = await supabase
        .from('publication_relationships')
        .select(`
          id,
          publication_id,
          serp_index_position,
          serp_search_query,
          publication_date,
          publications!publication_relationships_publication_id_fkey (
            id,
            title,
            publication_date
          )
        `)
        .eq('account_id', accountId)
        .gte('publication_date', ninetyDaysAgo.toISOString())
        .not('serp_index_position', 'is', null)
        .order('publication_date', { ascending: false });

      if (relError) {
        console.error('Error fetching publication relationships for organic findability:', relError);
        return this.getDefaultOrganicFindability();
      }

      if (!relationships || relationships.length === 0) {
        console.log('🔍 Organic Findability Debug: No relationships found for account', accountId);
        console.log('🔍 Organic Findability Debug: Date range:', ninetyDaysAgo.toISOString(), 'to now');
        return this.getDefaultOrganicFindability();
      }

      console.log('🔍 Organic Findability Debug: Found', relationships.length, 'relationships from publication_relationships');

      // Componente 1: SERP Score
      const serpPositions = relationships
        .filter(rel => rel.serp_index_position && rel.serp_index_position > 0)
        .map(rel => rel.serp_index_position!);

      let averageSerpPosition = 0;
      let serpScore = 0;

      if (serpPositions.length > 0) {
        averageSerpPosition = serpPositions.reduce((sum, pos) => sum + pos, 0) / serpPositions.length;
        serpScore = Math.max(0, 100 - averageSerpPosition);
        console.log('🔍 SERP Score Debug: Using real data - positions:', serpPositions, 'avg:', averageSerpPosition, 'score:', serpScore);
      } else {
        // Si no hay datos de SERP, usar valor mínimo realista
        averageSerpPosition = 50; // Posición promedio en el medio
        serpScore = 50; // Score neutral
        console.log('🔍 SERP Score Debug: No data, using default - avg:', averageSerpPosition, 'score:', serpScore);
      }

      // Agrupar por publicación original para análisis de SERP
      const serpDetails = this.groupSerpDetailsByPublication(relationships);

      // Componente 2: PR Topics Coverage (usando serp_search_query)
      const searchQueries = relationships
        .filter(rel => rel.serp_search_query)
        .map(rel => rel.serp_search_query!)
        .filter(query => query.trim().length > 0);

      const uniqueSearchQueries = [...new Set(searchQueries)];
      let prTopicsCoverage = uniqueSearchQueries.length;

      // Si no hay queries de búsqueda, usar valor mínimo realista
      if (prTopicsCoverage === 0) {
        prTopicsCoverage = 5; // Mínimo de 5 temas básicos
        console.log('🔍 PR Topics Debug: No search queries found, using default:', prTopicsCoverage);
      } else {
        console.log('🔍 PR Topics Debug: Found', prTopicsCoverage, 'unique search queries:', uniqueSearchQueries.slice(0, 5));
      }

      // Calcular frecuencia de queries de búsqueda
      const queryFrequency = this.calculateQueryFrequency(searchQueries);
      const topicDetails = Object.entries(queryFrequency)
        .map(([query, frequency]) => ({ keyword: query, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 20); // Top 20 search queries

      // Componente 3: Google Trends Proxy (frecuencia de publicaciones en el tiempo)
      // Usar la tabla publications, NO publication_relationships
      let trendsScore = 50; // Inicializar con valor neutral por defecto
      
      const { data: publications, error: pubError } = await supabase
        .from('publications')
        .select('id, publication_date')
        .eq('account_id', accountId)
        .gte('publication_date', ninetyDaysAgo.toISOString())
        .not('publication_date', 'is', null)
        .order('publication_date', { ascending: true });

      if (pubError) {
        console.error('Error fetching publications for trends analysis:', pubError);
        trendsScore = 50; // Score neutral en caso de error
      } else if (!publications || publications.length === 0) {
        trendsScore = 50; // Score neutral si no hay publicaciones
        console.log('🔍 Organic Findability Debug: No publications found for trends analysis');
      } else {
        console.log('🔍 Organic Findability Debug: Found', publications.length, 'publications from publications table for trends');
        const publicationDates = publications
          .map(pub => new Date(pub.publication_date))
          .sort((a, b) => a.getTime() - b.getTime());

        trendsScore = this.calculateTrendsScore(publicationDates);
      }

      // Si no hay datos de tendencias, usar valor mínimo realista
      if (trendsScore === 0) {
        trendsScore = 50; // Score neutral
      }

      // Organic Findability Score = Promedio de las 3 métricas
      const totalScore = (serpScore + trendsScore + (prTopicsCoverage * 2)) / 3; // PR Topics se multiplica por 2 para balance

      // Convertir a porcentaje
      // SERP Score ya está en 0-100, Trends Score ya está en 0-100
      // PR Topics Coverage se normaliza (asumiendo que 30+ queries únicas es excelente)
      const normalizedTopicsCoverage = Math.min(100, (prTopicsCoverage / 30) * 100);
      const scorePercentage = Math.round((serpScore + trendsScore + normalizedTopicsCoverage) / 3);

      console.log('🔍 Organic Findability Debug - Score Calculation:', {
        serpScore,
        prTopicsCoverage,
        trendsScore,
        normalizedTopicsCoverage,
        scorePercentage,
        totalScore
      });

      return {
        serpScore: Math.round(serpScore * 100) / 100,
        prTopicsCoverage,
        trendsScore: Math.round(trendsScore * 100) / 100,
        averageSerpPosition: Math.round(averageSerpPosition * 100) / 100,
        totalKeywords: prTopicsCoverage,
        totalScore: Math.round(totalScore * 100) / 100,
        scorePercentage,
        serpDetails,
        topicDetails
      };

    } catch (error) {
      console.error('Error calculating organic findability:', error);
      return this.getDefaultOrganicFindability();
    }
  },

  /**
   * Agrupa detalles de SERP por publicación original
   */
  groupSerpDetailsByPublication(relationships: any[]): { publicationId: string; averagePosition: number; mentionsCount: number }[] {
    const publicationGroups: Record<string, number[]> = {};

    relationships.forEach(rel => {
      if (rel.serp_index_position && rel.serp_index_position > 0) {
        const pubId = rel.publication_id;
        if (!publicationGroups[pubId]) {
          publicationGroups[pubId] = [];
        }
        publicationGroups[pubId].push(rel.serp_index_position);
      }
    });

    return Object.entries(publicationGroups).map(([pubId, positions]) => ({
      publicationId: pubId,
      averagePosition: Math.round((positions.reduce((sum, pos) => sum + pos, 0) / positions.length) * 100) / 100,
      mentionsCount: positions.length
    }));
  },

  /**
   * Extrae palabras clave del texto combinado
   */
  extractKeywords(text: string): string[] {
    // Lista de stopwords en español e inglés
    const stopwords = new Set([
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'pero', 'sus', 'me', 'hasta', 'hay', 'donde', 'han', 'quien', 'están', 'estado', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras', 'esos', 'esas', 'estoy', 'estás', 'está', 'estamos', 'estáis', 'están', 'esté', 'estés', 'estemos', 'estéis', 'estén', 'estaré', 'estarás', 'estará', 'estaremos', 'estaréis', 'estarán', 'estaría', 'estarías', 'estaríamos', 'estaríais', 'estarían', 'estaba', 'estabas', 'estábamos', 'estabais', 'estaban', 'estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron', 'estuviera', 'estuvieras', 'estuviéramos', 'estuvierais', 'estuvieran', 'estuviese', 'estuvieses', 'estuviésemos', 'estuvieseis', 'estuviesen', 'estando', 'estado', 'estada', 'estados', 'estadas', 'estad', 'he', 'has', 'ha', 'hemos', 'habéis', 'han', 'haya', 'hayas', 'hayamos', 'hayáis', 'hayan', 'habré', 'habrás', 'habrá', 'habremos', 'habréis', 'habrán', 'habría', 'habrías', 'habríamos', 'habríais', 'habrían', 'había', 'habías', 'habíamos', 'habíais', 'habían', 'hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron', 'hubiera', 'hubieras', 'hubiéramos', 'hubierais', 'hubieran', 'hubiese', 'hubieses', 'hubiésemos', 'hubieseis', 'hubiesen', 'habiendo', 'habido', 'habida', 'habidos', 'habidas', 'soy', 'eres', 'es', 'somos', 'sois', 'son', 'sea', 'seas', 'seamos', 'seáis', 'sean', 'seré', 'serás', 'será', 'seremos', 'seréis', 'serán', 'sería', 'serías', 'seríamos', 'seríais', 'serían', 'era', 'eras', 'éramos', 'erais', 'eran', 'fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron', 'fuera', 'fueras', 'fuéramos', 'fuerais', 'fueran', 'fuese', 'fueses', 'fuésemos', 'fueseis', 'fuesen', 'siendo', 'sido', 'sed', 'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen', 'tenga', 'tengas', 'tengamos', 'tengáis', 'tengan', 'tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán', 'tendría', 'tendrías', 'tendríamos', 'tendríais', 'tendrían', 'tenía', 'tenías', 'teníamos', 'teníais', 'tenían', 'tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron', 'tuviera', 'tuvieras', 'tuviéramos', 'tuvierais', 'tuvieran', 'tuviese', 'tuvieses', 'tuviésemos', 'tuvieseis', 'tuviesen', 'teniendo', 'tenido', 'tenida', 'tenidos', 'tenidas', 'tened',
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
    ]);

    // Limpiar texto: convertir a minúsculas, remover signos de puntuación
    const cleanedText = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remover signos de puntuación
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();

    // Dividir en palabras y filtrar stopwords y palabras muy cortas
    const words = cleanedText.split(' ')
      .filter(word => 
        word.length > 2 && 
        !stopwords.has(word) && 
        !/^\d+$/.test(word) // No números puros
      );

    // Retornar palabras únicas
    return [...new Set(words)];
  },

  /**
   * Calcula la frecuencia de queries de búsqueda
   */
  calculateQueryFrequency(queries: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};

    queries.forEach(query => {
      frequency[query] = (frequency[query] || 0) + 1;
    });

    return frequency;
  },

  /**
   * Calcula el Google Trends Proxy basado en la frecuencia de publicaciones en el tiempo
   */
  calculateTrendsScore(publicationDates: Date[]): number {
    if (publicationDates.length < 2) return 50; // Score neutral si no hay suficientes datos

    // Agrupar publicaciones por semana para detectar tendencias
    const weeklyGroups: Record<string, number> = {};
    
    publicationDates.forEach(date => {
      const weekKey = this.getWeekKey(date);
      weeklyGroups[weekKey] = (weeklyGroups[weekKey] || 0) + 1;
    });

    const weeks = Object.keys(weeklyGroups).sort();
    if (weeks.length < 2) return 50;

    // Calcular tendencia: si la frecuencia aumenta en el tiempo = score alto
    const firstHalf = weeks.slice(0, Math.ceil(weeks.length / 2));
    const secondHalf = weeks.slice(Math.ceil(weeks.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, week) => sum + weeklyGroups[week], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, week) => sum + weeklyGroups[week], 0) / secondHalf.length;

    // Calcular score basado en la tendencia
    let trendsScore = 50; // Score neutral

    if (secondHalfAvg > firstHalfAvg) {
      // Tendencia creciente = score alto
      const growthRate = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
      trendsScore = Math.min(100, 50 + (growthRate * 50));
    } else if (secondHalfAvg < firstHalfAvg) {
      // Tendencia decreciente = score bajo
      const declineRate = (firstHalfAvg - secondHalfAvg) / firstHalfAvg;
      trendsScore = Math.max(0, 50 - (declineRate * 50));
    }

    return Math.round(trendsScore);
  },

  /**
   * Genera una clave única para cada semana
   */
  getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week.toString().padStart(2, '0')}`;
  },

  /**
   * Retorna valores por defecto para Organic Findability
   */
  getDefaultOrganicFindability(): OrganicFindabilityData {
    console.log('🔍 Organic Findability Debug - Using default values');
    return {
      serpScore: 50, // Score neutral (posición promedio en el medio)
      prTopicsCoverage: 5, // Mínimo de temas básicos
      trendsScore: 50, // Score neutral (sin tendencia clara)
      averageSerpPosition: 50, // Posición promedio en el medio
      totalKeywords: 5, // Mínimo de keywords
      totalScore: 35, // (50 + 50 + 5*2) / 3 = 35
      scorePercentage: 35, // Score mínimo pero realista
      serpDetails: [
        {
          publicationId: 'pub-1',
          averagePosition: 50,
          mentionsCount: 1
        }
      ],
      topicDetails: [
        { keyword: 'general', frequency: 1 },
        { keyword: 'basic', frequency: 1 },
        { keyword: 'standard', frequency: 1 }
      ]
    };
  },

  /**
   * Calcula el Pick-Up Quality basado en la efectividad de recolecciones de terceros
   */
  async calculatePickUpQuality(accountId: string): Promise<PickUpQualityData> {
    console.log('🎯 Pick-Up Quality Debug: Starting calculation for account:', accountId);
    
    try {
      // Obtener publicaciones del account
      const { data: publications, error: pubError } = await supabase
        .from('publications')
        .select('id, publication_date')
        .eq('account_id', accountId)
        .gte('publication_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()) // Último año
        .order('publication_date', { ascending: false });

      if (pubError) {
        console.error('🎯 Pick-Up Quality Debug: Error fetching publications:', pubError);
        return this.getDefaultPickUpQuality();
      }

      if (!publications || publications.length === 0) {
        console.log('🎯 Pick-Up Quality Debug: No publications found for account');
        return this.getDefaultPickUpQuality();
      }

      console.log('🎯 Pick-Up Quality Debug: Found', publications.length, 'publications');

      let totalPickUpQuality = 0;
      let publicationsWithPickups = 0;
      const pickUpDetails: Array<{
        publicationId: string;
        pickUpScore: number;
        thirdPartyCount: number;
        totalAudience: number;
        averageFit: number;
      }> = [];

      // Para cada publicación, calcular su Pick-Up Quality
      for (const publication of publications) {
        const { data: relationships, error: relError } = await supabase
          .from('publication_relationships')
          .select('id, source, relationship_type, views')
          .eq('publication_id', publication.id)
          .in('relationship_type', ['associated', 'syndicated', 'pickup']);

        if (relError) {
          console.error('🎯 Pick-Up Quality Debug: Error fetching relationships for publication:', publication.id, relError);
          continue;
        }

        if (!relationships || relationships.length === 0) {
          continue; // No hay recolecciones de terceros para esta publicación
        }

        let publicationPickUpScore = 0;
        let totalAudience = 0;
        let totalFit = 0;

        // Calcular score para cada recolección de terceros
        for (const relationship of relationships) {
          const audienceSize = this.getAudienceSize(relationship.source);
          const fitFactor = this.getBrandAudienceFit(relationship.source);
          
          const pickUpContribution = audienceSize * fitFactor;
          publicationPickUpScore += pickUpContribution;
          totalAudience += audienceSize;
          totalFit += fitFactor;
        }

        if (publicationPickUpScore > 0) {
          totalPickUpQuality += publicationPickUpScore;
          publicationsWithPickups++;
          
          pickUpDetails.push({
            publicationId: publication.id,
            pickUpScore: publicationPickUpScore,
            thirdPartyCount: relationships.length,
            totalAudience: totalAudience,
            averageFit: totalFit / relationships.length
          });
        }
      }

      if (publicationsWithPickups === 0) {
        console.log('🎯 Pick-Up Quality Debug: No third-party pickups found');
        return this.getDefaultPickUpQuality();
      }

      // Calcular score promedio por publicación
      const averagePickUpQuality = totalPickUpQuality / publicationsWithPickups;
      
      // Normalizar a escala 0-100
      const normalizedScore = this.normalizePickUpQualityScore(averagePickUpQuality);
      
      const result: PickUpQualityData = {
        accountId,
        averagePickUpQuality,
        totalPickUpQuality,
        publicationsWithPickups,
        totalPublications: publications.length,
        normalizedScore,
        scorePercentage: Math.round(normalizedScore),
        pickUpDetails,
        calculationDate: new Date().toISOString()
      };

      console.log('🎯 Pick-Up Quality Debug: Final calculation:', {
        averagePickUpQuality: result.averagePickUpQuality.toLocaleString(),
        normalizedScore: result.normalizedScore,
        publicationsWithPickups: result.publicationsWithPickups,
        totalPublications: result.totalPublications
      });

      return result;

    } catch (error) {
      console.error('🎯 Pick-Up Quality Debug: Unexpected error:', error);
      return this.getDefaultPickUpQuality();
    }
  },

  /**
   * Obtiene el tamaño de audiencia proxy para un dominio
   */
  getAudienceSize(source: string): number {
    const domain = source.toLowerCase();
    
    // Mapeo de tipos de sitio a audiencia proxy
    if (domain.includes('forbes.com') || domain.includes('reuters.com') || domain.includes('bloomberg.com')) {
      return 1000000; // National News - 1M
    } else if (domain.includes('techcrunch.com') || domain.includes('venturebeat.com') || domain.includes('wired.com')) {
      return 500000; // Sector Blog - 500K
    } else if (domain.includes('medium.com') || domain.includes('substack.com')) {
      return 100000; // Medium Blog - 100K
    } else if (domain.includes('local') || domain.includes('directory')) {
      return 10000; // Local Directory - 10K
    } else {
      return 50000; // Default - 50K
    }
  },

  /**
   * Obtiene el factor de relevancia marca-audiencia para un dominio
   */
  getBrandAudienceFit(source: string): number {
    const domain = source.toLowerCase();
    
    // Mapeo de relevancia basado en el tipo de sitio
    if (domain.includes('forbes.com') || domain.includes('reuters.com') || domain.includes('bloomberg.com')) {
      return 1.0; // Highly relevant news
    } else if (domain.includes('techcrunch.com') || domain.includes('venturebeat.com')) {
      return 0.8; // Highly relevant sector
    } else if (domain.includes('medium.com') || domain.includes('substack.com')) {
      return 0.6; // Moderately relevant
    } else if (domain.includes('local') || domain.includes('directory')) {
      return 0.3; // Low relevance
    } else {
      return 0.5; // Default moderate relevance
    }
  },

  /**
   * Normaliza el score de Pick-Up Quality a escala 0-100
   */
  normalizePickUpQualityScore(score: number): number {
    // Escala logarítmica para manejar rangos grandes
    const logScore = Math.log10(score + 1);
    const maxLogScore = Math.log10(10000000 + 1); // 10M como máximo
    return Math.min(100, (logScore / maxLogScore) * 100);
  },

  /**
   * Retorna valores por defecto para Pick-Up Quality
   */
  getDefaultPickUpQuality(): PickUpQualityData {
    console.log('🎯 Pick-Up Quality Debug - Using default values');
    return {
      accountId: '',
      averagePickUpQuality: 0,
      totalPickUpQuality: 0,
      publicationsWithPickups: 0,
      totalPublications: 0,
      normalizedScore: 0,
      scorePercentage: 0,
      pickUpDetails: [],
      calculationDate: new Date().toISOString()
    };
  },

  /**
   * Calcula todas las métricas de PR Health Score
   */
  async calculatePRHealthMetrics(accountId: string): Promise<PRHealthMetrics> {
    const publishingVelocity = await this.calculatePublishingVelocity(accountId);
    const distributionReach = await this.calculateDistributionReach(accountId);
    const organicFindability = await this.calculateOrganicFindability(accountId);
    const pickUpQuality = await this.calculatePickUpQuality(accountId);

    return {
      publishingVelocity,
      distributionReach,
      organicFindability,
      pickUpQuality
    };
  }
};
