
export type PublicationStatus = 'Published' | 'Analyzing' | 'Matched' | 'Distributed';

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
    na: number;
    eu: number;
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
  trackingPeriod?: string;
  serpResults: SerpResult[];
  newswireDistribution?: {
    service: string;
    time: string;
    reach: number;
  }[];
};
