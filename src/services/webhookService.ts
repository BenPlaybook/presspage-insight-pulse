interface BenchmarkData {
  champion: {
    id: string;
    name: string;
    main_website_url: string;
    industry: string;
    ai_performance_summary: string | null;
    customer_ai_summary: string | null;
  };
  competitors: Array<{
    id: string;
    name: string;
    main_website_url: string;
    industry: string;
    ai_performance_summary: string | null;
    customer_ai_summary: string | null;
  }>;
  timestamp: string;
  analysis_type: 'benchmark';
}

export const webhookService = {
  async sendBenchmarkData(data: BenchmarkData): Promise<{ success: boolean; error?: string }> {
    try {
      const webhookUrl = 'https://presspage.app.n8n.cloud/webhook/d3df0b3e-c30a-4e25-85f6-a5ee408174f3';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Benchmark data sent successfully to webhook');
      return { success: true };
    } catch (error) {
      console.error('Error sending benchmark data to webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}; 

export interface IntakeAccountData {
  domain: string;
  name: string;
  source: string;
  endpoint: string;
  status_group: string;
  status_value: string;
}

export const sendIntakeAccountData = async (accountData: IntakeAccountData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Sending intake account data to webhook:', accountData);
    
    const response = await fetch('https://presspage.app.n8n.cloud/webhook/98342d08-ade7-42e0-8909-c0cbcf04c271', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      console.error('Webhook response not ok:', response.status, response.statusText);
      return { success: false, error: `Webhook failed: ${response.status}` };
    }

    console.log('Intake webhook sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending intake webhook:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 