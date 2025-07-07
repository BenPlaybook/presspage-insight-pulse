
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AccountHeader } from '@/components/account/AccountHeader';
import { AccountMetrics } from '@/components/account/AccountMetrics';
import { AccountTabs } from '@/components/account/AccountTabs';
import { Publication } from '@/types/publications';

const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  // Mock data - replace with actual data fetching
  const mockPublications: Publication[] = [
    {
      id: '1',
      title: 'Q3 2024 Financial Results Announcement',
      status: 'Completed',
      detectedDate: '2024-01-15T10:00:00Z',
      classification: 'Financial',
      serpPosition: { na: 3, eu: 5 },
      socialCoverage: { matched: 8, total: 10, platforms: [] },
      distributionTime: '2.5 hours',
      totalLocations: 45,
      serpResults: []
    },
    {
      id: '2',
      title: 'New Product Launch: Revolutionary AI Platform',
      status: 'In Progress',
      detectedDate: '2024-01-14T14:30:00Z',
      classification: 'Non-Financial',
      serpPosition: { na: 1, eu: 2 },
      socialCoverage: { matched: 12, total: 15, platforms: [] },
      distributionTime: '1.8 hours',
      totalLocations: 67,
      serpResults: []
    },
    {
      id: '3',
      title: 'Strategic Partnership with Tech Giant',
      status: 'Analyzing',
      detectedDate: '2024-01-13T09:15:00Z',
      classification: 'Non-Financial',
      serpPosition: { na: 7, eu: 4 },
      socialCoverage: { matched: 6, total: 8, platforms: [] },
      distributionTime: '3.2 hours',
      totalLocations: 32,
      serpResults: []
    },
  ];

  const totalPages = Math.ceil(mockPublications.length / 10);

  if (!id) {
    return <div className="p-6">Account not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountHeader accountId={id} />
      <AccountMetrics accountId={id} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AccountTabs
          accountId={id}
          publications={mockPublications}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onClassificationChange={setClassificationFilter}
          onDateRangeChange={setDateRange}
        />
      </div>
    </div>
  );
};

export default AccountDetails;
