
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AISummary from '@/components/AISummary';
import { PublicationsTable } from '@/components/publications/PublicationsTable';
import { PublicationsFilters } from '@/components/publications/PublicationsFilters';
import { PublicationsPagination } from '@/components/publications/PublicationsPagination';
import { Publication } from '@/types/publications';

// Mock publications data
const mockPublications: Publication[] = [
  {
    id: '101',
    title: 'Q3 2024 Financial Results',
    status: 'Published',
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
        detected: '2025-01-15'
      },
      {
        region: 'EU',
        position: 3,
        url: 'https://example.eu/news/financial-results',
        detected: '2025-01-15'
      }
    ]
  },
  {
    id: '102',
    title: 'New Product Launch Announcement for Shopify Commerce Platform with Enhanced Features',
    status: 'Matched',
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
        detected: '2025-01-12'
      },
      {
        region: 'EU',
        position: 4,
        url: 'https://example.eu/news/product-launch',
        detected: '2025-01-12'
      }
    ]
  },
  {
    id: '103',
    title: 'Partnership with Leading Tech Company',
    status: 'Distributed',
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
        detected: '2025-01-08'
      },
      {
        region: 'EU',
        position: 6,
        url: 'https://example.eu/news/partnership',
        detected: '2025-01-08'
      }
    ]
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
    serpResults: []
  },
  {
    id: '105',
    title: 'Annual Sustainability Report',
    status: 'Published',
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
        detected: '2024-12-28'
      },
      {
        region: 'EU',
        position: 5,
        url: 'https://example.eu/news/sustainability',
        detected: '2024-12-28'
      }
    ]
  }
];

// Mock account data
const accountData = {
  id: '1',
  name: 'Shopify',
  url: 'shopify.com',
  status: 'Active',
  lastAnalyzed: '3 hours ago',
  metrics: {
    distributionTime: {
      value: '1.5 hrs',
      trend: '20% vs last month'
    },
    serpPosition: {
      value: '#3',
      positions: '+2 positions'
    },
    publications: {
      count: 47,
      period: 'Last 30 days'
    },
    channels: {
      count: 5,
      description: 'Active channels'
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
  const [activeTab, setActiveTab] = useState('publications');
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
  
  const handleStatusChange = (status: string) => {
    if (status === 'all') {
      setFilteredPublications(mockPublications);
    } else {
      const filtered = mockPublications.filter(
        pub => pub.status.toLowerCase() === status
      );
      setFilteredPublications(filtered);
    }
    setCurrentPage(1);
  };
  
  const handleClassificationChange = (classification: string) => {
    if (classification === 'all') {
      setFilteredPublications(mockPublications);
    } else {
      const filtered = mockPublications.filter(
        pub => pub.classification.toLowerCase() === classification
      );
      setFilteredPublications(filtered);
    }
    setCurrentPage(1);
  };
  
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    if (!range.from) {
      setFilteredPublications(mockPublications);
      return;
    }
    
    const filtered = mockPublications.filter(pub => {
      const pubDate = new Date(pub.detectedDate);
      if (range.from && range.to) {
        return pubDate >= range.from && pubDate <= range.to;
      } else if (range.from) {
        return pubDate >= range.from;
      }
      return true;
    });
    
    setFilteredPublications(filtered);
    setCurrentPage(1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="account" title={accountData.name} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Navigation breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-presspage-teal">Dashboard</Link> &gt; {accountData.name}
        </div>
        
        {/* Account header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#122F4A]">{accountData.name}</h1>
              <p className="text-sm text-gray-500">{accountData.url} • {accountData.status} • Last analyzed: {accountData.lastAnalyzed}</p>
            </div>
            <button className="bg-presspage-teal text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
              Run Analysis
            </button>
          </div>
        </div>
        
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Avg. Publication to Distribution"
            value={accountData.metrics.distributionTime.value}
            trend={{
              value: accountData.metrics.distributionTime.trend,
              positive: true
            }}
          />
          <MetricCard
            title="Average SERP Position"
            value={accountData.metrics.serpPosition.value}
            subtext={accountData.metrics.serpPosition.positions}
            valueClassName="text-presspage-teal"
          />
          <MetricCard
            title="Total Publications"
            value={accountData.metrics.publications.count}
            subtext={accountData.metrics.publications.period}
          />
          <MetricCard
            title="Distribution Channels"
            value={accountData.metrics.channels.count}
            subtext={accountData.metrics.channels.description}
          />
        </div>
        
        {/* AI Summary */}
        <div className="mb-6">
          <AISummary 
            internalSummary={accountData.aiSummary.internal}
            customerSummary={accountData.aiSummary.customer}
          />
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="publications" className="w-full">
          <TabsList className="w-full mb-6 border-b">
            <TabsTrigger value="publications" className="text-sm">Publications</TabsTrigger>
            <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="publications" className="bg-white rounded-lg shadow-sm p-6">
            <PublicationsFilters 
              onSearchChange={handleSearchChange}
              onStatusChange={handleStatusChange}
              onClassificationChange={handleClassificationChange}
              onDateRangeChange={handleDateRangeChange}
            />
            
            <PublicationsTable publications={paginatedPublications} />
            
            <PublicationsPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <p className="text-gray-500">Analytics content will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <p className="text-gray-500">Settings content will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Create benchmark report button */}
        <div className="mt-8">
          <Link 
            to="/benchmark" 
            className="w-full bg-presspage-teal text-white py-3 px-4 rounded-md font-medium hover:bg-opacity-90 transition-colors block text-center"
          >
            Create Benchmark Report
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AccountDetails;
