import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import AISummary from '@/components/AISummary';
import { AccountHeader } from '@/components/account/AccountHeader';
import { AccountMetrics } from '@/components/account/AccountMetrics';
import { AccountTabs } from '@/components/account/AccountTabs';
import { Publication } from '@/types/publications';

// Mock publications data
const mockPublications: Publication[] = [
  {
    id: '101',
    title: 'Q3 2024 Financial Results',
    status: 'Completed',
    detectedDate: '2025-01-15',
    classification: 'Financial',
    serpPosition: {
      na: 1,
      eu: 3
    },
    socialCoverage: {
      matched: 3,
      total: 3,
      platforms: [
        {
          platform: 'Twitter',
          matched: true,
          timeDifference: '0.8 hrs',
          postDate: '2025-01-15',
          url: '#'
        },
        {
          platform: 'LinkedIn',
          matched: true,
          timeDifference: '1.2 hrs',
          postDate: '2025-01-15',
          url: '#'
        },
        {
          platform: 'Facebook',
          matched: true,
          timeDifference: '1.5 hrs',
          postDate: '2025-01-15',
          url: '#'
        }
      ]
    },
    distributionTime: '0.8 hours',
    totalLocations: 3,
    serpResults: [
      {
        region: 'NA',
        position: 1,
        url: 'https://example.com/news/financial-results',
        detected: '2025-01-15',
        title: 'Q3 2024 Financial Results',
        articleDate: '2025-01-15',
        matchStatus: 'Exact Match',
        confidence: 'High',
        reasoning: 'Exact title match',
        domain: 'example.com',
        searchQuery: 'financial results shopify',
        searchType: 'google',
        partialMatch: false
      },
      {
        region: 'EU',
        position: 3,
        url: 'https://example.eu/news/financial-results',
        detected: '2025-01-15',
        title: 'Q3 2024 Financial Results',
        articleDate: '2025-01-15',
        matchStatus: 'Exact Match',
        confidence: 'High',
        reasoning: 'Exact title match',
        domain: 'example.eu',
        searchQuery: 'financial results shopify',
        searchType: 'google',
        partialMatch: false
      }
    ],
    trackingPeriod: {
      start: '2025-01-15',
      end: '2025-02-15'
    },
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
  },
  {
    id: '102',
    title: 'New Product Launch Announcement for Shopify Commerce Platform with Enhanced Features',
    status: 'In Progress',
    detectedDate: '2025-01-12',
    classification: 'Non-Financial',
    serpPosition: {
      na: 2,
      eu: 4
    },
    socialCoverage: {
      matched: 2,
      total: 2,
      platforms: [
        {
          platform: 'Twitter',
          matched: true,
          timeDifference: '1.1 hrs',
          postDate: '2025-01-12',
          url: '#'
        },
        {
          platform: 'LinkedIn',
          matched: true,
          timeDifference: '1.8 hrs',
          postDate: '2025-01-12',
          url: '#'
        }
      ]
    },
    distributionTime: '1.3 hours',
    totalLocations: 2,
    serpResults: [
      {
        region: 'NA',
        position: 2,
        url: 'https://example.com/news/product-launch',
        detected: '2025-01-12',
        title: 'New Product Launch',
        articleDate: '2025-01-12',
        matchStatus: 'Partial Match',
        confidence: 'Medium',
        reasoning: 'Title matches partially',
        domain: 'example.com',
        searchQuery: 'shopify product launch',
        searchType: 'google',
        partialMatch: true
      },
      {
        region: 'EU',
        position: 4,
        url: 'https://example.eu/news/product-launch',
        detected: '2025-01-12',
        title: 'New Product Launch',
        articleDate: '2025-01-12',
        matchStatus: 'Partial Match',
        confidence: 'Medium',
        reasoning: 'Title matches partially',
        domain: 'example.eu',
        searchQuery: 'shopify product launch',
        searchType: 'google',
        partialMatch: true
      }
    ],
    trackingPeriod: {
      start: '2025-01-12',
      end: '2025-02-12'
    },
    socialMatches: {
      twitter: {
        matched: true,
        timeDifference: '1.1 hrs'
      },
      linkedin: {
        matched: true,
        timeDifference: '1.8 hrs'
      }
    }
  },
  {
    id: '103',
    title: 'Partnership with Leading Tech Company',
    status: 'Pending',
    detectedDate: '2025-01-08',
    classification: 'Non-Financial',
    serpPosition: {
      na: 4,
      eu: 6
    },
    socialCoverage: {
      matched: 2,
      total: 3,
      platforms: [
        {
          platform: 'Twitter',
          matched: true,
          timeDifference: '1.5 hrs',
          postDate: '2025-01-08',
          url: '#'
        },
        {
          platform: 'LinkedIn',
          matched: true,
          timeDifference: '2.1 hrs',
          postDate: '2025-01-08',
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
    distributionTime: '1.8 hours',
    totalLocations: 3,
    serpResults: [
      {
        region: 'NA',
        position: 4,
        url: 'https://example.com/news/partnership',
        detected: '2025-01-08',
        title: 'Partnership Announcement',
        articleDate: '2025-01-08',
        matchStatus: 'Partial Match',
        confidence: 'Medium',
        reasoning: 'Title matches partially',
        domain: 'example.com',
        searchQuery: 'shopify partnership',
        searchType: 'google',
        partialMatch: true
      },
      {
        region: 'EU',
        position: 6,
        url: 'https://example.eu/news/partnership',
        detected: '2025-01-08',
        title: 'Partnership Announcement',
        articleDate: '2025-01-08',
        matchStatus: 'Partial Match',
        confidence: 'Medium',
        reasoning: 'Title matches partially',
        domain: 'example.eu',
        searchQuery: 'shopify partnership',
        searchType: 'google',
        partialMatch: true
      }
    ],
    trackingPeriod: {
      start: '2025-01-08',
      end: '2025-02-08'
    },
    socialMatches: {
      twitter: {
        matched: true,
        timeDifference: '1.5 hrs'
      },
      linkedin: {
        matched: true,
        timeDifference: '2.1 hrs'
      }
    }
  },
  {
    id: '104',
    title: 'Leadership Team Changes Announcement',
    status: 'Analyzing',
    detectedDate: '2025-01-05',
    classification: 'Financial',
    serpPosition: {
      na: 0,
      eu: 0
    },
    socialCoverage: {
      matched: 0,
      total: 3,
      platforms: []
    },
    distributionTime: 'Pending',
    totalLocations: 0,
    serpResults: [],
    trackingPeriod: {
      start: '2025-01-05',
      end: '2025-02-05'
    },
    socialMatches: {
      twitter: {
        matched: false
      },
      linkedin: {
        matched: false
      }
    }
  },
  {
    id: '105',
    title: 'Annual Sustainability Report',
    status: 'Completed',
    detectedDate: '2024-12-28',
    classification: 'Non-Financial',
    serpPosition: {
      na: 3,
      eu: 5
    },
    socialCoverage: {
      matched: 3,
      total: 3,
      platforms: [
        {
          platform: 'Twitter',
          matched: true,
          timeDifference: '0.9 hrs',
          postDate: '2024-12-28',
          url: '#'
        },
        {
          platform: 'LinkedIn',
          matched: true,
          timeDifference: '1.4 hrs',
          postDate: '2024-12-28',
          url: '#'
        },
        {
          platform: 'Facebook',
          matched: true,
          timeDifference: '1.6 hrs',
          postDate: '2024-12-28',
          url: '#'
        }
      ]
    },
    distributionTime: '1.2 hours',
    totalLocations: 3,
    serpResults: [
      {
        region: 'NA',
        position: 3,
        url: 'https://example.com/news/sustainability',
        detected: '2024-12-28',
        title: 'Annual Sustainability Report',
        articleDate: '2024-12-28',
        matchStatus: 'Exact Match',
        confidence: 'High',
        reasoning: 'Exact title match',
        domain: 'example.com',
        searchQuery: 'shopify sustainability',
        searchType: 'google',
        partialMatch: false
      },
      {
        region: 'EU',
        position: 5,
        url: 'https://example.eu/news/sustainability',
        detected: '2024-12-28',
        title: 'Annual Sustainability Report',
        articleDate: '2024-12-28',
        matchStatus: 'Exact Match',
        confidence: 'High',
        reasoning: 'Exact title match',
        domain: 'example.eu',
        searchQuery: 'shopify sustainability',
        searchType: 'google',
        partialMatch: false
      }
    ],
    trackingPeriod: {
      start: '2024-12-28',
      end: '2025-01-28'
    },
    socialMatches: {
      twitter: {
        matched: true,
        timeDifference: '0.9 hrs'
      },
      linkedin: {
        matched: true,
        timeDifference: '1.4 hrs'
      }
    }
  }
];

// Mock account data
const accountData = {
  id: '1',
  name: 'Shopify',
  url: 'shopify.com',
  status: 'Active',
  lastAnalyzed: '3 hours ago',
  performanceScore: 85,
  metrics: {
    publications: {
      count: 47,
      period: 'Last 30 days'
    },
    channels: {
      count: 5,
      description: 'Active channels'
    },
    distributionTime: {
      value: '1.5 hrs',
      trend: '20% vs last month'
    },
    serpPosition: {
      value: '#3',
      positions: '+2 positions'
    }
  },
  aiSummary: {
    internal: `### Key Performance Insights
* Distribution efficiency at 1.5 hours average - **20% improvement** from last month
* Twitter channel showing 2.3 hours delay - requires optimization
* Product updates coverage gap in newsroom (40% below target)
* Enterprise announcement distribution on LinkedIn at 75% - needs improvement

### Action Items
1. Optimize social media scheduling
2. Increase newsroom product coverage
3. Review LinkedIn distribution strategy`,
    customer: `### Performance Overview
* Consistently fast distribution across channels
* Strong social media presence with multi-channel coverage
* Comprehensive newsroom content strategy
* Effective enterprise announcement distribution

### Opportunities
* Enhanced social media timing optimization
* Expanded product update coverage
* Strengthened LinkedIn presence`
  }
};

const AccountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPublications, setFilteredPublications] = useState(mockPublications);
  
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  const paginatedPublications = filteredPublications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSearchChange = (search: string) => {
    const filtered = mockPublications.filter(
      pub => pub.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPublications(filtered);
    setCurrentPage(1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="account" title={accountData.name} />
      
      <main className="container mx-auto px-4 py-6 pb-32">
        <AccountHeader
          name={accountData.name}
          url={accountData.url}
          status={accountData.status}
          lastAnalyzed={accountData.lastAnalyzed}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <AISummary 
              internalSummary={accountData.aiSummary.internal}
              customerSummary={accountData.aiSummary.customer}
            />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-presspage-teal mb-2">
                  {accountData.performanceScore}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-2">
                  PR Performance Score
                </div>
                <div className="text-xs text-gray-500">
                  Based on distribution speed, coverage reach, and search visibility. 
                  Scores above 80 indicate excellent performance.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <AccountMetrics metrics={accountData.metrics} />
        
        <AccountTabs
          accountId={id || ''}
          publications={paginatedPublications}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onSearchChange={handleSearchChange}
        />
      </main>
    </div>
  );
};

export default AccountDetails;
