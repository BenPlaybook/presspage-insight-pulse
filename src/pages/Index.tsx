import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { AccountsTable } from '@/components/AccountsTable';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [status, setStatus] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('');

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
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="na">North America</SelectItem>
                <SelectItem value="eu">Europe</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Last Updated" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
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
