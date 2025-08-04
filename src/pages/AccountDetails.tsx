import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import AccountInsights from '@/components/account/AccountInsights';
import { AccountHeader } from '@/components/account/AccountHeader';
import { AccountMetrics } from '@/components/account/AccountMetrics';
import { AccountTabs } from '@/components/account/AccountTabs';
import { Publication } from '@/types/publications';
import { databaseService } from '@/services/databaseService';
import { Account as SupabaseAccount } from '@/types/database';
import { accountAdapter } from '@/services/accountAdapter';
import { publicationAdapter } from '@/services/publicationAdapter';

// Helper function to extract text content from JSONB fields
const extractTextFromJSONB = (jsonbContent: any): string => {
  if (!jsonbContent) return '';
  
  // If it's already a string, return it
  if (typeof jsonbContent === 'string') {
    return jsonbContent;
  }
  
  // If it's an object, try to extract text content
  if (typeof jsonbContent === 'object') {
    // If it has a 'content' or 'text' property
    if (jsonbContent.content) return jsonbContent.content;
    if (jsonbContent.text) return jsonbContent.text;
    if (jsonbContent.summary) return jsonbContent.summary;
    
    // If it's an array, join the elements
    if (Array.isArray(jsonbContent)) {
      return jsonbContent.join('\n');
    }
    
    // If it's an object with nested content, try to find text
    const textContent = Object.values(jsonbContent)
      .filter(value => typeof value === 'string')
      .join('\n');
    
    if (textContent) return textContent;
  }
  
  // Fallback: convert to string
  return String(jsonbContent);
};

const AccountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [account, setAccount] = useState<SupabaseAccount | null>(null);
  const [distributionChannels, setDistributionChannels] = useState<any[]>([]);
  const [distributionTime, setDistributionTime] = useState<{ averageHours: number; trend: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load account data and publications from Supabase
  useEffect(() => {
    const loadAccountData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load account data
        const { data: accountData, error: accountError } = await databaseService.getAccountById(id);
        
        if (accountError) {
          console.error('Error loading account:', accountError);
          setError('Failed to load account');
          return;
        }
        
        setAccount(accountData);
        
        // Load publications for this account (last 30 days)
        const { data: publicationsData, error: publicationsError } = await databaseService.getPublicationsLast30Days(id);
        
        if (publicationsError) {
          console.error('Error loading publications:', publicationsError);
          // Don't set error here, just log it
        } else {
          // Convert publications to frontend format
          const convertedPublications = publicationAdapter.fromSupabaseArray(publicationsData || []);
          setPublications(convertedPublications);
          setFilteredPublications(convertedPublications);
        }



        // Load distribution channels for this account
        const { data: channelsData, error: channelsError } = await databaseService.getDistributionChannels(id);
        
        if (channelsError) {
          console.error('Error loading distribution channels:', channelsError);
          // Don't set error here, just log it
        } else {
          setDistributionChannels(channelsData || []);
        }

        // Load average distribution time for this account
        const { averageHours, trend, error: timeError } = await databaseService.getAverageDistributionTime(id);
        
        if (timeError) {
          console.error('Error loading distribution time:', timeError);
          // Don't set error here, just log it
        } else {
          setDistributionTime({ averageHours, trend });
        }
      } catch (err) {
        console.error('Error loading account data:', err);
        setError('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, [id]);

  // Convert account data to frontend format
  const accountData = account ? {
    id: account.id,
    name: account.name,
    url: account.main_website_url || 'N/A',
    status: account.is_actively_tracked ? 'Active' : 'Inactive',
    lastAnalyzed: 'Coming Soon', // This would need to be calculated from actual data
    performanceScore: 0, // This would need to be calculated from actual data
    metrics: {
      publications: {
        count: publications.length, // Use real publications count
        period: 'Last 30 days'
      },
          channels: {
      count: distributionChannels.length, // Use real channels count
      description: 'Active channels',
      channels: distributionChannels // Pass the actual channels data
    },
          distributionTime: {
      value: distributionTime ? `${distributionTime.averageHours} hrs` : 'N/A',
      trend: distributionTime?.trend || 'No data available'
    },
      serpPosition: {
        value: 'Coming Soon', // This would need to be calculated from publications
        positions: 'Coming Soon'
      }
    },
    aiSummary: {
      internal: account.ai_performance_summary || `### Key Performance Insights
* Distribution efficiency at 1.5 hours average - **20% improvement** from last month
* Twitter channel showing 2.3 hours delay - requires optimization
* Product updates coverage gap in newsroom (40% below target)
* Enterprise announcement distribution on LinkedIn at 75% - needs improvement

### Action Items
1. Optimize social media scheduling
2. Increase newsroom product coverage
3. Review LinkedIn distribution strategy`,
      customer: account.ai_performance_summary || `### Performance Overview
* Consistently fast distribution across channels
* Strong social media presence with multi-channel coverage
* Comprehensive newsroom content strategy
* Effective enterprise announcement distribution

### Opportunities
* Enhanced social media timing optimization
* Expanded product update coverage
* Strengthened LinkedIn presence`
    }
  } : null;
  
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  const paginatedPublications = filteredPublications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSearchChange = (search: string) => {
    if (!search.trim()) {
      setFilteredPublications(publications);
    } else {
      const filtered = publications.filter(
        pub => pub.title.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPublications(filtered);
    }
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="account" title="Loading..." />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-presspage-blue"></div>
            <span className="ml-2 text-gray-600">Loading account...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !accountData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="account" title="Error" />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-8">
            <span className="text-red-600">{error || 'Account not found'}</span>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="account" title={accountData.name} />
      
      <main className="container mx-auto px-4 py-6 pb-32">
        <AccountHeader
          name={accountData.name}
          url={accountData.url}
          status={accountData.status}
          lastAnalyzed={accountData.lastAnalyzed}
          performanceScore={accountData.performanceScore}
        />
        
        <div className="mb-6">
          <AccountInsights 
            internalSummary={extractTextFromJSONB(account?.ai_performance_summary) || "No internal analysis available"}
            customerSummary={extractTextFromJSONB(account?.customer_ai_summary) || "No customer summary available"}
            accountId={id || '1'}
            summaryId={`summary-${id || '1'}-${Date.now()}`}
            accountName={accountData.name}
            aiSummary={extractTextFromJSONB(account?.ai_performance_summary)}
            customerAiSummary={extractTextFromJSONB(account?.customer_ai_summary)}
          />
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
