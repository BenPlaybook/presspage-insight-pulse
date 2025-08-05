
import React, { useState, useEffect } from 'react';
import { Publication } from '@/types/publications';
import { PublicationsTable } from '@/components/publications/PublicationsTable';
import { PublicationsFilters } from '@/components/publications/PublicationsFilters';
import { PublicationsPagination } from '@/components/publications/PublicationsPagination';
import { StickyBenchmarkButton } from './StickyBenchmarkButton';

interface AccountTabsProps {
  accountId: string;
  publications: Publication[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
}

export const AccountTabs: React.FC<AccountTabsProps> = ({
  accountId,
  publications,
  currentPage,
  totalPages,
  onPageChange,
  onSearchChange,
}) => {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedPublications, setSortedPublications] = useState<Publication[]>(publications);

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...publications].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (column) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'detectedDate':
          aValue = new Date(a.detectedDate).getTime();
          bValue = new Date(b.detectedDate).getTime();
          break;
        default:
          return 0;
      }

      if (newDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setSortedPublications(sorted);
  };

  // Update sorted publications when publications prop changes
  useEffect(() => {
    setSortedPublications(publications);
  }, [publications]);
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tracked Publications</h2>
          <p className="text-sm text-gray-500">View and manage publications tracked from media room</p>
        </div>
        
        <PublicationsFilters 
          onSearchChange={onSearchChange}
        />
        
        <PublicationsTable 
          publications={sortedPublications} 
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
        
        <PublicationsPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
      
      <StickyBenchmarkButton />
    </>
  );
};
