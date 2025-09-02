import { supabase } from '@/lib/supabase';

export interface OrganicFindabilityMetrics {
  serpScore: number; // 0-100
  prTopicsCoverage: number; // 0-100
  publicationFrequency: number; // 0-100
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
    try {
      // 1. Calcular Average SERP Score
      const serpScore = await this.calculateSerpScore(accountId);
      
      // 2. Calcular PR Topics Coverage
      const prTopicsCoverage = await this.calculatePrTopicsCoverage(accountId);
      
      // 3. Calcular Publication Frequency
      const publicationFrequency = await this.calculatePublicationFrequency(accountId);
      
      // 4. Calcular score compuesto
      const compositeScore = Math.round((serpScore + prTopicsCoverage + publicationFrequency) / 3);
      
      // 5. Obtener detalles para debugging
      const details = await this.getCalculationDetails(accountId);
      
      return {
        metrics: {
          serpScore,
          prTopicsCoverage,
          publicationFrequency,
          compositeScore
        },
        details
      };
    } catch (error) {
      console.error('Error calculating Organic Findability:', error);
      return {
        metrics: {
          serpScore: 0,
          prTopicsCoverage: 0,
          publicationFrequency: 0,
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
   * Calcula el SERP Score basado en la posición promedio en resultados de búsqueda
   * Mejor posición = score más alto
   */
  private async calculateSerpScore(accountId: string): Promise<number> {
    try {
      // Obtener publicaciones del account con posiciones SERP
      const { data: publications, error } = await supabase
        .from('publications')
        .select('id')
        .eq('account_id', accountId);

      if (error || !publications || publications.length === 0) {
        return 0;
      }

      const publicationIds = publications.map(pub => pub.id);

      // Obtener posiciones SERP desde publication_relationships
      const { data: relationships, error: relError } = await supabase
        .from('publication_relationships')
        .select('serp_index_position')
        .in('publication_id', publicationIds)
        .not('serp_index_position', 'is', null)
        .gt('serp_index_position', 0);

      if (relError || !relationships || relationships.length === 0) {
        return 0;
      }

      // Calcular posición promedio
      const positions = relationships.map(rel => rel.serp_index_position);
      const averagePosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;

      // Normalizar a score 0-100
      // Posición 1 = 100, posición 10 = 90, posición 20 = 80, etc.
      let score = 0;
      if (averagePosition <= 1) {
        score = 100;
      } else if (averagePosition <= 10) {
        score = 100 - (averagePosition - 1) * 1; // 1 punto por posición
      } else if (averagePosition <= 20) {
        score = 91 - (averagePosition - 10) * 0.5; // 0.5 puntos por posición
      } else if (averagePosition <= 50) {
        score = 86 - (averagePosition - 20) * 0.2; // 0.2 puntos por posición
      } else {
        score = Math.max(0, 80 - (averagePosition - 50) * 0.1); // 0.1 puntos por posición
      }

      return Math.round(Math.max(0, Math.min(100, score)));
    } catch (error) {
      console.error('Error calculating SERP score:', error);
      return 0;
    }
  },

  /**
   * Calcula el PR Topics Coverage basado en la diversidad de palabras clave
   * Más diversidad = score más alto
   */
  private async calculatePrTopicsCoverage(accountId: string): Promise<number> {
    try {
      // Obtener publicaciones del account
      const { data: publications, error } = await supabase
        .from('publications')
        .select('id, title, body_content, summary')
        .eq('account_id', accountId);

      if (error || !publications || publications.length === 0) {
        return 0;
      }

      // Extraer palabras clave únicas del contenido
      const keywords = new Set<string>();
      
      publications.forEach(pub => {
        // Extraer palabras del título
        if (pub.title) {
          const titleWords = this.extractKeywords(pub.title);
          titleWords.forEach(word => keywords.add(word));
        }
        
        // Extraer palabras del contenido (primeros 1000 caracteres para rendimiento)
        if (pub.body_content) {
          const contentWords = this.extractKeywords(pub.body_content.substring(0, 1000));
          contentWords.forEach(word => keywords.add(word));
        }
        
        // Extraer palabras del resumen
        if (pub.summary) {
          const summaryWords = this.extractKeywords(pub.summary);
          summaryWords.forEach(word => keywords.add(word));
        }
      });

      const uniqueKeywords = keywords.size;
      
      // Normalizar a score 0-100
      // 0-10 keywords = 0-30, 11-50 = 30-70, 51+ = 70-100
      let score = 0;
      if (uniqueKeywords <= 10) {
        score = (uniqueKeywords / 10) * 30;
      } else if (uniqueKeywords <= 50) {
        score = 30 + ((uniqueKeywords - 10) / 40) * 40;
      } else {
        score = 70 + Math.min(30, (uniqueKeywords - 50) / 10);
      }

      return Math.round(Math.max(0, Math.min(100, score)));
    } catch (error) {
      console.error('Error calculating PR Topics Coverage:', error);
      return 0;
    }
  },

  /**
   * Calcula el Publication Frequency basado en la frecuencia de publicaciones en el tiempo
   * Frecuencia más alta = score más alto
   */
  private async calculatePublicationFrequency(accountId: string): Promise<number> {
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
   * Extrae palabras clave relevantes del texto
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Convertir a minúsculas y dividir en palabras
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remover puntuación
      .split(/\s+/)
      .filter(word => 
        word.length >= 4 && // Palabras de al menos 4 caracteres
        !this.isStopWord(word) // No palabras comunes
      );
    
    // Contar frecuencia y retornar palabras únicas
    return [...new Set(words)];
  },

  /**
   * Lista de palabras comunes a ignorar
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'within', 'without',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
    ];
    
    return stopWords.includes(word);
  },

  /**
   * Obtiene detalles de los cálculos para debugging
   */
  private async getCalculationDetails(accountId: string): Promise<{
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
          this.extractKeywords(pub.title).forEach(word => keywords.add(word));
        }
        if (pub.body_content) {
          this.extractKeywords(pub.body_content.substring(0, 1000)).forEach(word => keywords.add(word));
        }
        if (pub.summary) {
          this.extractKeywords(pub.summary).forEach(word => keywords.add(word));
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
  }
};
