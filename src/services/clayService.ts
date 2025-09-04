interface ClayWebhookRequest {
  email?: string;
  domain?: string;
  company_name?: string;
  industry?: string;
}

interface ClayWebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const clayService = {
  /**
   * Envía datos al webhook de Clay para obtener sugerencias de competitors
   */
  async getCompetitorSuggestions(request: ClayWebhookRequest): Promise<ClayWebhookResponse> {
    try {
      console.log('🎯 Clay Service: Sending request to webhook:', request);
      
      // Usar el proxy local de Vite para evitar CORS
      const response = await fetch('/api/clay/v3/sources/webhook/pull-in-data-from-a-webhook-1d333a5f-a7b1-455a-b109-90ff57a15bf0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Clay API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🎯 Clay Service: Response received:', data);
      
      return {
        success: true,
        data
      };
      
    } catch (error) {
      console.error('🎯 Clay Service: Error calling webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Envía solo el dominio al webhook de Clay (versión simplificada)
   */
  async getCompetitorsByDomain(domain: string): Promise<ClayWebhookResponse> {
    return this.getCompetitorSuggestions({ domain });
  },

  /**
   * Envía el dominio y nombre de la empresa al webhook de Clay para obtener sugerencias más precisas
   */
  async getCompetitorsByDomainAndCompany(domain: string, companyName: string): Promise<ClayWebhookResponse> {
    return this.getCompetitorSuggestions({ 
      domain, 
      company_name: companyName 
    });
  }
};
