import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import AISummary from '@/components/AISummary';

// Mock data - in a real app, this would fetch data based on the summaryId
const getSharedSummaryData = (accountId: string, summaryId: string) => {
  return {
    accountName: 'Shopify',
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
};

const SharedSummary = () => {
  const { accountId, summaryId } = useParams<{ accountId: string; summaryId: string }>();
  
  if (!accountId || !summaryId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Share Link</h1>
          <p className="text-gray-600">The shared summary link is not valid or has expired.</p>
        </div>
      </div>
    );
  }

  const summaryData = getSharedSummaryData(accountId, summaryId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="default" title={`${summaryData.accountName} - Shared Summary`} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Shared AI Summary - {summaryData.accountName}
          </h1>
          <p className="text-gray-600">
            This is a shared view of the AI-generated summary for {summaryData.accountName}.
          </p>
        </div>

        <div className="max-w-4xl">
          <AISummary 
            internalSummary={summaryData.aiSummary.internal}
            customerSummary={summaryData.aiSummary.customer}
            accountId={accountId}
            summaryId={summaryId}
            accountName={summaryData.accountName}
          />
        </div>
      </main>
    </div>
  );
};

export default SharedSummary;