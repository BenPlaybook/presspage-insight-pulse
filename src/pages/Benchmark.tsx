
import React, { useState } from 'react';
import { Search, Plus, X, Sparkles, Lock, HelpCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { BenchmarkTable } from '@/components/BenchmarkTable';
import { ContactSalesDialog } from '@/components/ContactSalesDialog';
import { PRTopicComparison } from '@/components/PRTopicComparison';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Mock selected accounts
const selectedAccounts = [
  { id: '1', name: 'Shopify' },
  { id: '2', name: 'Lotus Cars' },
  { id: '3', name: 'Volvo' },
];

// Mock AI suggested competitors
const aiSuggestedCompetitors = [
  { id: '4', name: 'Tesla' },
  { id: '5', name: 'BMW' },
  { id: '6', name: 'Mercedes-Benz' },
  { id: '7', name: 'Audi' },
  { id: '8', name: 'Ford' },
];

const COMPETITOR_LIMIT = 10;

const Benchmark = () => {
  const [viewType, setViewType] = useState('table');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [salesUnlocked, setSalesUnlocked] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [contactDialogProps, setContactDialogProps] = useState({
    title: "Unlock Full Competitor Insights",
    description: "Get access to detailed competitor data and export features by contacting our sales team."
  });

  // Listen for header export click
  React.useEffect(() => {
    const handleExportClick = (event: CustomEvent) => {
      setContactDialogProps({
        title: event.detail.title,
        description: event.detail.description
      });
      setContactDialogOpen(true);
    };

    window.addEventListener('openContactSales', handleExportClick as EventListener);
    return () => window.removeEventListener('openContactSales', handleExportClick as EventListener);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="benchmark" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-presspage-blue mb-1">Benchmark Analysis</h2>
          <p className="text-sm text-gray-500 mb-4">Compare performance across multiple accounts</p>
          
          {/* Account selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Select Accounts to Compare</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compare up to {COMPETITOR_LIMIT} competitors maximum</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs text-gray-500">
                ({selectedAccounts.length}/{COMPETITOR_LIMIT})
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Input 
                  className="pl-9" 
                  placeholder="Search accounts..." 
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Suggestions
                </Button>
                <Button
                  size="sm"
                  className="bg-presspage-teal hover:bg-presspage-teal/90"
                  disabled={selectedAccounts.length >= COMPETITOR_LIMIT}
                >
                  Add
                </Button>
              </div>
            </div>
            
            {/* AI Suggestions */}
            {showAISuggestions && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">AI Suggested Competitors</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestedCompetitors.slice(0, COMPETITOR_LIMIT - selectedAccounts.length).map(competitor => (
                    <button
                      key={competitor.id}
                      className="flex items-center bg-white border border-blue-200 text-sm rounded-full px-3 py-1 hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {competitor.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
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
          {viewType === 'table' && (
            <div className="relative">
              <BenchmarkTable />
              {!salesUnlocked && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                  <div className="text-center p-6">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Competitor Insights</h3>
                    <p className="text-gray-600 mb-4">Get full access to competitor data and analytics</p>
                    <Button
                      onClick={() => setContactDialogOpen(true)}
                      className="bg-presspage-teal hover:bg-presspage-teal/90"
                    >
                      Contact Sales to Unlock
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {viewType === 'tiles' && (
            <div className="relative">
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
              {!salesUnlocked && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                  <div className="text-center p-6">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Competitor Insights</h3>
                    <p className="text-gray-600 mb-4">Get full access to competitor data and analytics</p>
                    <Button
                      onClick={() => setContactDialogOpen(true)}
                      className="bg-presspage-teal hover:bg-presspage-teal/90"
                    >
                      Contact Sales to Unlock
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {viewType === 'graphs' && (
            <div className="relative">
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Visualization graphs would appear here</p>
              </div>
              {!salesUnlocked && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                  <div className="text-center p-6">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Competitor Insights</h3>
                    <p className="text-gray-600 mb-4">Get full access to competitor data and analytics</p>
                    <Button
                      onClick={() => setContactDialogOpen(true)}
                      className="bg-presspage-teal hover:bg-presspage-teal/90"
                    >
                      Contact Sales to Unlock
                    </Button>
                  </div>
                </div>
              )}
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
              
              {/* PR Topic Comparison */}
              <PRTopicComparison />
            </div>
          </div>
          
          {/* Contact Sales Dialog */}
          <ContactSalesDialog
            open={contactDialogOpen}
            onOpenChange={setContactDialogOpen}
            title={contactDialogProps.title}
            description={contactDialogProps.description}
            onSubmit={() => setSalesUnlocked(true)}
          />
        </div>
      </main>
    </div>
  );
};

export default Benchmark;
