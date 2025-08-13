
export type Publication = {
  last30Days: number;
  last90Days: number;
  lastYear: number;
};

export type Account = {
  id: string;
  name: string;
  status: 'Active' | 'Processing';
  dateAdded: string;
  industry: string;
  headcount: number;
  domain?: string;
  publications: {
    financial: Publication;
    nonFinancial: Publication;
  };
};
