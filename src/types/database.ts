// Tipos para las tablas de Supabase

export interface Account {
  id: string;
  name: string;
  main_website_url: string;
  logo_url?: string; // URL del logo de la empresa
  industry: string;
  pr_comms_headcount: number;
  is_actively_tracked: boolean;
  ai_performance_summary: string;
  customer_ai_summary?: any; // JSONB para el resumen del cliente
  created_at: string;
  updated_at: string;
  airtable_account_id_original: string;
  search_period_publications: number;
  status_group: string;
  status_value: string;
}

export interface ContentSource {
  id: string;
  account_id: string;
  source_url: string;
  source_type: string;
  label: string;
  status: string;
  last_scraped_at: string;
  fail_counter: number;
  created_at: string;
  updated_at: string;
  airtable_original_source_id: string;
  scraping_status: string;
  scrape_counter: number;
  status_group: string;
  status_value: string;
  retry_count: number;
}

export interface Publication {
  id: string;
  account_id: string;
  content_source_id: string;
  title: string;
  article_url: string;
  publication_date: string;
  body_content: string;
  summary: string;
  status_in_funnel: string;
  extraction_method_sw1: string;
  extraction_method_sw2_date: string;
  extraction_method_sw3_content: string;
  is_url_problematic: boolean;
  financial_classification: string;
  scraped_at: string;
  distribution_processed_at: string;
  serp_position_na: number;
  serp_position_eu: number;
  created_at: string;
  updated_at: string;
  airtable_original_publication_id: string;
  stock_price_status: string;
  stock_price_value: number;
  status: string;
  category: string;
  status_group: string;
  status_value: string;
  classification: string;
  ai_summary: any; // JSONB
  last_related_publications_search: string;
  image?: string; // URL de la imagen del artículo
}

export interface PublicationRelationship {
  id: string;
  publication_id: string; // ID de la publicación relacionada
  relationship_type: string;
  confidence_score: number;
  discovered_by: string;
  created_at: string;
  updated_at: string;
  source: string;
  status: string;
  body: string;
  content_sources: string;
  publication_date: string;
  tweet_type: string;
  label: string;
  post_language: string;
  linkedin_type: string;
  status_group: string;
  status_value: string;
  account_id: string;
  type: string;
  fail_counter: number;
  extract_counter: number;
  data_extract_result: string;
  views?: number; // Estimated audience size in int8 format
  serp_index_position?: number; // Organic position in Google search results
  snippet?: string; // Search result snippet
  title?: string; // Publication title for topic analysis
}

// Tipos para respuestas de API
export interface AccountsResponse {
  data: Account[];
  error: any;
}

export interface ContentSourcesResponse {
  data: ContentSource[];
  error: any;
}

export interface PublicationsResponse {
  data: Publication[];
  error: any;
}

export interface PublicationRelationshipsResponse {
  data: PublicationRelationship[];
  error: any;
}

export interface PickUpQualityData {
  accountId: string;
  averagePickUpQuality: number;
  totalPickUpQuality: number;
  publicationsWithPickups: number;
  totalPublications: number;
  normalizedScore: number;
  scorePercentage: number;
  pickUpDetails: Array<{
    publicationId: string;
    pickUpScore: number;
    thirdPartyCount: number;
    totalAudience: number;
    averageFit: number;
  }>;
  calculationDate: string;
} 