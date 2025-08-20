
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { AccountsTable } from '@/components/AccountsTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { databaseService } from '@/services/databaseService';
import { accountAdapter } from '@/services/accountAdapter';
import { Account } from '@/types/accounts';

const Index = () => {
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('all');
  const [industry, setIndustry] = useState<string>('all');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [activeAccountsCount, setActiveAccountsCount] = useState(0);
  const [industries, setIndustries] = useState<string[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const ITEMS_PER_PAGE = 10;

  // Load industries for filter
  useEffect(() => {
    const loadIndustries = async () => {
      const { data } = await databaseService.getIndustries();
      setIndustries(data);
    };
    loadIndustries();
  }, []);

  // Load accounts from Supabase and convert to frontend format
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        
        // Prepare filters
        const filters: { status?: 'Active' | 'Processing'; industry?: string } = {};
        if (status && status !== 'all') {
          filters.status = status as 'Active' | 'Processing';
        }
        if (industry && industry !== 'all') {
          filters.industry = industry;
        }

                      const { data, error, total, totalPages: pages, currentPage: page } = await databaseService.getAccounts(
                currentPage, 
                ITEMS_PER_PAGE, 
                search || undefined, 
                Object.keys(filters).length > 0 ? filters : undefined
              );
              
              if (error) {
                console.error('Error loading accounts:', error);
                setError('Failed to load accounts');
              } else {
                // Convert Supabase data to frontend format with real stats
                const convertedAccounts = await accountAdapter.fromSupabaseArrayWithStats(data || []);
                setAccounts(convertedAccounts);
                setTotalPages(pages);
                setTotalAccounts(total);
              }

              // Load total active accounts count
              const { count: activeCount, error: activeError } = await databaseService.getActiveAccountsCount();
              if (activeError) {
                console.error('Error loading active accounts count:', activeError);
              } else {
                setActiveAccountsCount(activeCount);
              }
      } catch (err) {
        console.error('Error loading accounts:', err);
        setError('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [currentPage, search, status, industry]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Calculate metrics from real data
  const metrics = {
    totalAccounts: totalAccounts,
    activeTracking: activeAccountsCount,
    averageDistributionTime: 'Coming Soon'
  };

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page when searching
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      // The useEffect will handle the actual search
    }, 500);
    setSearchTimeout(timeout);
  };

  // Handle filter changes
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="default" />
      
      <main className="container mx-auto px-4 py-6">
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input 
              className="pl-9" 
              placeholder="Search accounts by name or domain..." 
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={industry} onValueChange={handleIndustryChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Total Accounts"
            value={metrics.totalAccounts}
            className="border-l-4 border-presspage-blue"
          />
          <MetricCard
            title="Active Tracking"
            value={metrics.activeTracking}
            className="border-l-4 border-presspage-teal"
            valueClassName="text-presspage-teal"
          />
          <MetricCard
            title="Avg. Distribution Time"
            value={metrics.averageDistributionTime}
            className="border-l-4 border-yellow-500"
          />
        </div>
        
        {/* Accounts table */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-presspage-blue"></div>
              <span className="ml-2 text-gray-600">Loading accounts...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-red-600">{error}</span>
            </div>
          ) : (
            <>
              <AccountsTable 
                accounts={accounts}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalAccounts)} of {totalAccounts} accounts
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="w-8 h-8"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
