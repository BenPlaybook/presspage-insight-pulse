
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      <Tabs defaultValue="publications" className="w-full">
        <TabsList className="w-full mb-6 border-b">
          <TabsTrigger value="publications" className="text-sm">Publications</TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
          <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="publications" className="bg-white rounded-lg shadow-sm p-6">
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
      
      <StickyBenchmarkButton />
    </>
  );
};
