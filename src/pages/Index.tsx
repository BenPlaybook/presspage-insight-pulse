
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { AccountsTable } from '@/components/AccountsTable';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const Index = () => {
  // Mock data for metrics
  const metrics = {
    totalAccounts: 127,
    activeTracking: 42,
    averageDistributionTime: '2.3 hrs',
    averageSerpPosition: '#4'
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
              placeholder="Search accounts..." 
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <Select>
              <option value="">Status</option>
              <option value="active">Active</option>
              <option value="processing">Processing</option>
            </Select>
            <Select>
              <option value="">Region</option>
              <option value="na">North America</option>
              <option value="eu">Europe</option>
              <option value="asia">Asia</option>
            </Select>
            <Select>
              <option value="">Last Updated</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
          </div>
        </div>
        
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <MetricCard
            title="Avg. SERP Position"
            value={metrics.averageSerpPosition}
            className="border-l-4 border-green-500"
            valueClassName="text-green-600"
          />
        </div>
        
        {/* Accounts table */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <AccountsTable />
        </div>
      </main>
    </div>
  );
};

export default Index;
