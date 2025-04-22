
import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { BenchmarkTable } from '@/components/BenchmarkTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock selected accounts
const selectedAccounts = [
  { id: '1', name: 'Shopify' },
  { id: '2', name: 'Lotus Cars' },
  { id: '3', name: 'Volvo' },
];

const Benchmark = () => {
  const [viewType, setViewType] = useState('table');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="benchmark" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-presspage-blue mb-1">Benchmark Analysis</h2>
          <p className="text-sm text-gray-500 mb-4">Compare performance across multiple accounts</p>
          
          {/* Account selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Select Accounts to Compare</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Input 
                  className="pl-9" 
                  placeholder="Search accounts..." 
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button className="bg-presspage-teal text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors">
                Add
              </button>
            </div>
            
            {/* Selected accounts */}
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedAccounts.map(account => (
                <div key={account.id} className="flex items-center bg-gray-100 text-sm rounded-full px-3 py-1">
                  <span>{account.name}</span>
                  <button className="ml-2 text-gray-500 hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* View type selection */}
          <div className="flex mb-6">
            <span className="text-sm font-medium mr-4">View Type:</span>
            <Tabs defaultValue="table" onValueChange={setViewType}>
              <TabsList>
                <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>
                <TabsTrigger value="tiles" className="text-xs">Tiles</TabsTrigger>
                <TabsTrigger value="graphs" className="text-xs">Graphs</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Benchmark data */}
          {viewType === 'table' && <BenchmarkTable />}
          
          {viewType === 'tiles' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedAccounts.map(account => (
                <div key={account.id} className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium text-presspage-blue">{account.name}</h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-500">Avg. Speed:</span>
                      <span className="text-sm font-medium">{account.id === '1' ? '1.5 hrs' : account.id === '2' ? '3.2 hrs' : '0.8 hrs'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-500">SERP Position:</span>
                      <span className="text-sm font-medium">#{account.id === '1' ? '3' : account.id === '2' ? '8' : '1'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-500">Publications:</span>
                      <span className="text-sm font-medium">{account.id === '1' ? '47' : account.id === '2' ? '23' : '62'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-gray-500">Social Coverage:</span>
                      <span className="text-sm font-medium">{account.id === '1' ? '95%' : account.id === '2' ? '75%' : '98%'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {viewType === 'graphs' && (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Visualization graphs would appear here</p>
            </div>
          )}
          
          {/* Key insights */}
          <div className="mt-8">
            <div className="bg-presspage-blue text-white rounded-lg p-4">
              <h3 className="font-medium mb-3">Key Insights</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Best Performers:</p>
                <p>• Volvo leads with 0.8 hrs average distribution time and #1 SERP position</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Benchmark;
