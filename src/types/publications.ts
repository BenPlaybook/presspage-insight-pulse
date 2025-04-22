export type PublicationStatus = 'Analyzing' | 'In Progress' | 'Completed' | 'Pending';

export type SocialMatch = {
  platform: 'Twitter' | 'LinkedIn' | 'Facebook';
  matched: boolean;
  timeDifference: string;
  postDate: string;
  url: string;
};

export type SerpResult = {
  region: 'NA' | 'EU';
  position: number;
  url: string;
  detected: string;
};

export type Publication = {
  id: string;
  title: string;
  status: PublicationStatus;
  detectedDate: string;
  classification: 'Financial' | 'Non-Financial';
  serpPosition: {
    na?: number;
    eu?: number;
  };
  extractionProgress?: number;
  trackingPeriod: {
    start: string;
    end: string;
  };
  totalThirdPartyLocations?: number;
  uniqueNewswires?: number;
  newswireB4Local?: {
    indexed: boolean;
    name?: string;
  };
  socialMatches: {
    twitter?: {
      matched: boolean;
      timeDifference?: string;
    };
    linkedin?: {
      matched: boolean;
      timeDifference?: string;
    };
  };
  socialCoverage: {
    matched: number;
    total: number;
    platforms: SocialMatch[];
  };
  distributionTime: string;
  totalLocations: number;
  content?: string;
  source?: string;
  serpResults: Array<SerpResult & {
    title: string;
    articleDate: string;
    matchStatus: string;
    confidence: 'High' | 'Medium' | 'Low';
    reasoning: string;
    domain: string;
    notAMatchSocial?: boolean;
    originalPublicationDate?: string;
    publicationDateDiff?: number;
    searchQuery: string;
    searchType: string;
    partialMatch: boolean;
  }>;
  newswireDistribution?: {
    service: string;
    time: string;
    reach: number;
  }[];
};
