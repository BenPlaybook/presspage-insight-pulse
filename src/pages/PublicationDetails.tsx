
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent } from '@/components/ui/card';
import { DistributionTimeline } from '@/components/publications/DistributionTimeline';
import { PublicationMetrics } from '@/components/publications/PublicationMetrics';
import { Publication } from '@/types/publications';

const mockPublication: Publication = {
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
  content: 'Shopify Inc. (NYSE: SHOP) (TSX: SHOP), a provider of essential internet infrastructure for commerce, announced today its financial results for the quarter ended September 30, 2024.',
  source: 'shopify.com/news',
  trackingPeriod: {
    start: '2025-01-15',
    end: '2025-02-15'
  },
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
  newswireDistribution: [
    {
      service: 'BusinessWire',
      time: '2025-01-15 09:00 AM',
      reach: 5000000
    },
    {
      service: 'PR Newswire',
      time: '2025-01-15 09:30 AM',
      reach: 4500000
    }
  ],
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
};

const PublicationDetails = () => {
  const { id, publicationId } = useParams<{ id: string; publicationId: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="account" title="Publication Details" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-presspage-teal">Dashboard</Link> &gt; 
          <Link to={`/account/${id}`} className="hover:text-presspage-teal ml-1">Shopify</Link> &gt; 
          <span className="ml-1">Publication Details</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#122F4A]">{mockPublication.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Source: {mockPublication.source}</span>
              <span className="hidden md:block text-gray-300 mx-2">•</span>
              <span className="text-sm text-gray-500">Detected: {new Date(mockPublication.detectedDate).toLocaleDateString()}</span>
              <span className="hidden md:block text-gray-300 mx-2">•</span>
              <span className="text-sm text-gray-500">Classification: {mockPublication.classification}</span>
              <span className="hidden md:block text-gray-300 mx-2">•</span>
              <span className="text-sm text-gray-500">Tracking Period: {mockPublication.trackingPeriod.start} - {mockPublication.trackingPeriod.end}</span>
            </div>
          </div>
        </div>
        
        <PublicationMetrics publication={mockPublication} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Distribution Time"
            value={mockPublication.distributionTime}
            valueClassName="text-presspage-teal"
          />
          <MetricCard
            title="SERP Position"
            value={`NA: #${mockPublication.serpPosition.na} / EU: #${mockPublication.serpPosition.eu}`}
            valueClassName="text-[#122F4A]"
          />
          <MetricCard
            title="Social Matches"
            value={`${mockPublication.socialCoverage.matched}/${mockPublication.socialCoverage.total}`}
          />
          <MetricCard
            title="Total Locations"
            value={mockPublication.totalLocations.toString()}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Article Thumbnail</h3>
                <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
                  <img 
                    src="/placeholder.svg" 
                    alt="Article thumbnail"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{mockPublication.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-3">{mockPublication.content}</p>
                  <a 
                    href={mockPublication.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-presspage-teal hover:text-opacity-80"
                  >
                    View original article →
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <DistributionTimeline publication={mockPublication} />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <Link 
            to={`/account/${id}`} 
            className="bg-[#122F4A] hover:bg-opacity-90 text-white py-3 px-4 rounded-md font-medium transition-colors block text-center"
          >
            Back to Account
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PublicationDetails;
