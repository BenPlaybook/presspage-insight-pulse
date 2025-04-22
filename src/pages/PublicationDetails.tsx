
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Twitter, Linkedin, Clock, CircleCheck, CircleX } from 'lucide-react';
import { Publication } from '@/types/publications';

// Mock publication data (we would fetch this based on ID in a real app)
const mockPublication: Publication = {
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
  content: 'Shopify Inc. (NYSE: SHOP) (TSX: SHOP), a provider of essential internet infrastructure for commerce, announced today its financial results for the quarter ended September 30, 2024.',
  source: 'shopify.com/news',
  trackingPeriod: '30 days',
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
  ]
};

const DistributionTimeline: React.FC<{ publication: Publication }> = ({ publication }) => {
  const platforms = publication.socialCoverage.platforms;
  const sortedPlatforms = platforms.sort((a, b) => {
    if (!a.matched) return 1;
    if (!b.matched) return -1;
    return parseFloat(a.timeDifference) - parseFloat(b.timeDifference);
  });
  
  return (
    <div className="py-4">
      <h3 className="text-lg font-medium mb-4">Distribution Timeline</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
        
        {/* Original publication */}
        <div className="relative pl-8 pb-6">
          <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-[#122F4A] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
          <div>
            <p className="font-medium">Original Publication</p>
            <p className="text-sm text-gray-500">
              {new Date(publication.detectedDate).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Platform distribution */}
        {sortedPlatforms.map((platform, index) => (
          platform.matched && (
            <div key={platform.platform} className="relative pl-8 pb-6">
              <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-presspage-teal flex items-center justify-center">
                {platform.platform === 'Twitter' && <Twitter size={12} color="white" />}
                {platform.platform === 'LinkedIn' && <Linkedin size={12} color="white" />}
              </div>
              <div>
                <p className="font-medium">{platform.platform}</p>
                <p className="text-sm text-gray-500">
                  {platform.postDate} ({platform.timeDifference} after publication)
                </p>
              </div>
            </div>
          )
        ))}
        
        {/* Newswire distribution */}
        {publication.newswireDistribution?.map((newswire, index) => (
          <div key={index} className="relative pl-8 pb-6">
            <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
            <div>
              <p className="font-medium">{newswire.service}</p>
              <p className="text-sm text-gray-500">
                {newswire.time} • Potential Reach: {newswire.reach.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PublicationDetails = () => {
  const { id, publicationId } = useParams<{ id: string; publicationId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="account" title="Publication Details" />
      
      <main className="container mx-auto px-4 py-6">
        {/* Navigation breadcrumbs */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-presspage-teal">Dashboard</Link> &gt; 
          <Link to={`/account/${id}`} className="hover:text-presspage-teal ml-1">Shopify</Link> &gt; 
          <span className="ml-1">Publication Details</span>
        </div>
        
        {/* Publication header */}
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
              <span className="text-sm text-gray-500">Tracking Period: {mockPublication.trackingPeriod}</span>
            </div>
          </div>
        </div>
        
        {/* Key metrics */}
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
        
        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full mb-6 border-b">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="serp" className="text-sm">SERP Results</TabsTrigger>
            <TabsTrigger value="social" className="text-sm">Social Media</TabsTrigger>
            <TabsTrigger value="historical" className="text-sm">Historical Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Publication content */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-2">Publication Content</h3>
                <p className="text-gray-700">{mockPublication.content}</p>
              </CardContent>
            </Card>
            
            {/* Distribution timeline */}
            <Card>
              <CardContent className="p-6">
                <DistributionTimeline publication={mockPublication} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="serp" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">SERP Results</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Detected Date</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPublication.serpResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.region}</TableCell>
                        <TableCell>{`#${result.position}`}</TableCell>
                        <TableCell>{new Date(result.detected).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{result.url}</TableCell>
                        <TableCell className="text-right">
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-presspage-teal hover:text-opacity-80"
                          >
                            View
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Social Media Coverage</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time Difference</TableHead>
                      <TableHead>Post Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPublication.socialCoverage.platforms.map((platform, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {platform.platform === 'Twitter' && (
                              <div className="bg-blue-400 p-1 rounded">
                                <Twitter size={16} color="white" />
                              </div>
                            )}
                            {platform.platform === 'LinkedIn' && (
                              <div className="bg-blue-700 p-1 rounded">
                                <Linkedin size={16} color="white" />
                              </div>
                            )}
                            {platform.platform}
                          </div>
                        </TableCell>
                        <TableCell>
                          {platform.matched ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CircleCheck size={16} />
                              <span>Matched</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-500">
                              <CircleX size={16} />
                              <span>Not Found</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {platform.matched ? (
                            <div className="flex items-center gap-1">
                              <Clock size={16} className="text-gray-400" />
                              <span>{platform.timeDifference}</span>
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>{platform.matched ? platform.postDate : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {platform.matched && (
                            <a 
                              href={platform.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-presspage-teal hover:text-opacity-80"
                            >
                              View
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historical" className="space-y-6">
            <Card>
              <CardContent className="p-6 h-64 flex items-center justify-center">
                <p className="text-gray-500">Historical comparison data will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Back button */}
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
