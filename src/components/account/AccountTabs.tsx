
import React from 'react';
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
          
          <PublicationsTable publications={publications} />
          
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
