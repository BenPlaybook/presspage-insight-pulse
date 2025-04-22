import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { PublicationTimeline } from '@/components/PublicationTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AISummary from '@/components/AISummary';

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
  const [activeTab, setActiveTab] = useState('timeline');
  
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
              <h1 className="text-2xl font-bold text-presspage-blue">{accountData.name}</h1>
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
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="w-full mb-6 border-b">
            <TabsTrigger value="timeline" className="text-sm">Timeline</TabsTrigger>
            <TabsTrigger value="serp" className="text-sm">SERP Results</TabsTrigger>
            <TabsTrigger value="social" className="text-sm">Social Media</TabsTrigger>
            <TabsTrigger value="distribution" className="text-sm">Distribution</TabsTrigger>
            <TabsTrigger value="media" className="text-sm">Media Rooms</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="bg-white rounded-lg shadow-sm p-6">
            <PublicationTimeline />
          </TabsContent>
          <TabsContent value="serp">
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <p className="text-gray-500">SERP Results content will appear here</p>
            </div>
          </TabsContent>
          <TabsContent value="social">
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <p className="text-gray-500">Social Media content will appear here</p>
            </div>
          </TabsContent>
          <TabsContent value="distribution">
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <p className="text-gray-500">Distribution content will appear here</p>
            </div>
          </TabsContent>
          <TabsContent value="media">
            <div className="bg-white rounded-lg shadow-sm p-6 h-64 flex items-center justify-center">
              <p className="text-gray-500">Media Rooms content will appear here</p>
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
