
import React, { useState, useEffect } from 'react';
import { Crown, Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { ContactSalesDialog } from '@/components/ContactSalesDialog';
import { BenchmarkConfigModal } from '@/components/benchmark/BenchmarkConfigModal';
import { CompetitorComparisonModal } from '@/components/benchmark/CompetitorComparisonModal';
import { BenchmarkInsights } from '@/components/benchmark/BenchmarkInsights';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { databaseService } from '@/services/databaseService';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';



const Benchmark = () => {
  const { userProfile } = useAuthContext();
  const [searchParams] = useSearchParams();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null);
  const [benchmarkConfig, setBenchmarkConfig] = useState<any>(null);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [contactDialogProps, setContactDialogProps] = useState({
    title: "Unlock Full Competitor Insights",
    description: "Get access to detailed competitor data and export features by contacting our sales team."
  });

  // Check if this is an external user with URL parameters
  const isExternalUser = !userProfile && (searchParams.get('name') || searchParams.get('industry') || searchParams.get('domain'));
  const externalParams = {
    name: searchParams.get('name'),
    industry: searchParams.get('industry'),
    domain: searchParams.get('domain')
  };

  // Auto-start benchmark for external users
  React.useEffect(() => {
    if (isExternalUser && externalParams.name && externalParams.industry) {
      console.log('🎯 External user detected, auto-starting benchmark with params:', externalParams);
      handleExternalBenchmark();
    }
  }, [isExternalUser, externalParams.name, externalParams.industry]);

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

  // Handle external user benchmark (auto-configured)
  const handleExternalBenchmark = async () => {
    setLoading(true);
    
    try {
      console.log('🎯 Starting external benchmark for:', externalParams);
      
      // Find or create champion account
      let championAccount = null;
      
      // First, try to find existing account by domain
      if (externalParams.domain) {
        const { data: existingAccounts } = await databaseService.findAccountsByDomain(externalParams.domain);
        if (existingAccounts && existingAccounts.length > 0) {
          championAccount = existingAccounts[0];
          console.log('🎯 Found existing champion account:', championAccount);
        }
      }
      
      // If no existing account found, create a mock champion
      if (!championAccount) {
        championAccount = {
          id: `external-champion-${Date.now()}`,
          name: externalParams.name || 'External Company',
          main_website_url: externalParams.domain || '',
          industry: externalParams.industry || 'Unknown'
        };
        console.log('🎯 Created mock champion account:', championAccount);
      }
      
      // Find competitors by industry
      const { data: allAccounts } = await databaseService.getAllAccounts();
      const industryCompetitors = allAccounts?.filter(account => 
        account.industry === externalParams.industry && 
        account.id !== championAccount.id
      ).slice(0, 15) || [];
      
      console.log('🎯 Found competitors by industry:', industryCompetitors.length);
      
      // Create benchmark config
      const config = {
        championId: championAccount.id,
        competitors: industryCompetitors.map(account => ({
          id: account.id,
          name: account.name,
          domain: account.main_website_url
        }))
      };
      
      // Start benchmark with auto-configured data
      await handleStartBenchmark(config);
      
    } catch (error) {
      console.error('Error in external benchmark:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle benchmark configuration
  const handleStartBenchmark = async (config: any) => {
    setLoading(true);
    setBenchmarkConfig(config);
    
    try {
      // Load champion data
      const championData = await loadAccountMetrics(config.championId);
      
      // Load competitors data
      const competitorsData = await Promise.all(
        config.competitors.map(async (competitor: any) => {
          if (competitor.id) {
            return await loadAccountMetrics(competitor.id);
          } else {
            // For new competitors, generate mock data
            return {
              id: `new-${Date.now()}`,
              name: competitor.name,
              metrics: generateMockMetrics(competitor.name)
            };
          }
        })
      );

      setBenchmarkData({
        champion: championData,
        competitors: competitorsData
      });
      
      setConfigModalOpen(false);
    } catch (error) {
      console.error('Error loading benchmark data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load account metrics
  const loadAccountMetrics = async (accountId: string) => {
    try {
      // Get account details
      const account = await databaseService.getAccountById(accountId);
      
      // Get real metrics from Supabase
      const { data: metrics, error } = await databaseService.getBenchmarkMetrics(accountId);
      
      if (error) {
        console.error('Error loading metrics for account:', accountId, error);
        // Fallback to mock data if real metrics fail
        return {
          id: accountId,
          name: account.data?.name || 'Unknown',
          metrics: generateMockMetrics(account.data?.name || 'Unknown')
        };
      }

      // Transform Supabase metrics to match our UI structure
      const transformedMetrics = {
        publications: metrics?.total_publications_30d || 0,
        distributionTime: metrics?.average_speed || 0,
        serpPosition: metrics?.serp_position || 0,
        socialReach: metrics?.social_coverage === "-" ? 0 : parseFloat(metrics?.social_coverage || "0"),
        engagementRate: metrics?.efficiency_score || 0,
        financialPublications: Math.floor((metrics?.total_publications_30d || 0) * 0.4), // Estimate
        nonFinancialPublications: Math.floor((metrics?.total_publications_30d || 0) * 0.6) // Estimate
      };

      return {
        id: accountId,
        name: account.data?.name || 'Unknown',
        metrics: transformedMetrics
      };
    } catch (error) {
      console.error('Error loading account metrics:', error);
      // Fallback to mock data
      return {
        id: accountId,
        name: 'Unknown',
        metrics: generateMockMetrics('Unknown')
      };
    }
  };

  // Generate mock metrics for demonstration
  const generateMockMetrics = (companyName: string) => {
    const baseMetrics = {
      publications: Math.floor(Math.random() * 50) + 10,
      distributionTime: Math.random() * 5 + 1,
      serpPosition: Math.floor(Math.random() * 20) + 1,
      socialReach: Math.floor(Math.random() * 100000) + 10000,
      engagementRate: Math.random() * 5 + 1,
      financialPublications: Math.floor(Math.random() * 20) + 5,
      nonFinancialPublications: Math.floor(Math.random() * 30) + 10
    };

    // Add some variation based on company name
    const seed = companyName.charCodeAt(0);
    return {
      ...baseMetrics,
      publications: baseMetrics.publications + (seed % 20),
      distributionTime: baseMetrics.distributionTime + (seed % 3),
      serpPosition: Math.max(1, baseMetrics.serpPosition - (seed % 10)),
      socialReach: baseMetrics.socialReach + (seed * 1000),
      engagementRate: baseMetrics.engagementRate + (seed % 3)
    };
  };

  // Handle competitor row click
  const handleCompetitorClick = (competitor: any) => {
    setSelectedCompetitor(competitor);
    setComparisonModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="benchmark" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-presspage-blue mb-1">Benchmark Analysis</h2>
          <p className="text-sm text-gray-500 mb-4">Compare performance across multiple accounts</p>
          
          {!benchmarkData ? (
            // Step 1: Configuration
            <div className="text-center py-8">
              <div className="mb-6">
                <Crown className="w-16 h-16 text-presspage-teal mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isExternalUser ? 'Loading Your Benchmark Analysis' : 'Configure Your Benchmark'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isExternalUser 
                    ? `Analyzing ${externalParams.name} against competitors in the ${externalParams.industry} industry...`
                    : 'Select a champion company and add up to 10 competitors to compare performance metrics'
                  }
                </p>
                {!isExternalUser && (
                  <Button
                    onClick={() => setConfigModalOpen(true)}
                    className="bg-presspage-teal hover:bg-presspage-teal/90 text-white px-6 py-3"
                  >
                    Start Benchmark Analysis
                  </Button>
                )}
                {isExternalUser && loading && (
                  <div className="flex items-center justify-center gap-2 text-presspage-teal">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-presspage-teal"></div>
                    <span>Loading benchmark data...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Step 2: Benchmark Results
            <div className="space-y-6 relative">
              {/* Header with champion info */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-presspage-teal" />
                  <div>
                    <h3 className="font-semibold text-presspage-teal">
                      Champion: {benchmarkData.champion.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      vs {benchmarkData.competitors.length} competitors
                    </p>
                  </div>
                </div>
                {!isExternalUser && (
                  <Button
                    variant="outline"
                    onClick={() => setConfigModalOpen(true)}
                    size="sm"
                  >
                    Reconfigure
                  </Button>
                )}
              </div>

              {/* Benchmark Table */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium">Company</th>
                        <th className="text-center py-3 px-4 font-medium">Publications (30d)</th>
                        <th className="text-center py-3 px-4 font-medium">Avg Speed (days)</th>
                        <th className="text-center py-3 px-4 font-medium">SERP Position</th>
                        <th className="text-center py-3 px-4 font-medium">Social Coverage</th>
                        <th className="text-center py-3 px-4 font-medium">Efficiency Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Champion Row */}
                      <tr className="border-b border-gray-100 bg-blue-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-presspage-teal" />
                            <span className="font-semibold text-presspage-teal">
                              {benchmarkData.champion.name}
                            </span>
                            <Badge variant="default" className="text-xs">Champion</Badge>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 font-semibold">
                          {benchmarkData.champion.metrics.publications}
                        </td>
                        <td className="text-center py-3 px-4 font-semibold">
                          {benchmarkData.champion.metrics.distributionTime.toFixed(1)}d
                        </td>
                        <td className="text-center py-3 px-4 font-semibold">
                          #{benchmarkData.champion.metrics.serpPosition.toFixed(1)}
                        </td>
                        <td className="text-center py-3 px-4 font-semibold">
                          {benchmarkData.champion.metrics.socialReach === 0 ? "-" : benchmarkData.champion.metrics.socialReach.toLocaleString()}
                        </td>
                        <td className="text-center py-3 px-4 font-semibold">
                          {benchmarkData.champion.metrics.engagementRate.toFixed(1)}
                        </td>
                      </tr>
                      
                      {/* Competitors Rows */}
                      {benchmarkData.competitors.map((competitor: any, index: number) => (
                        <tr 
                          key={competitor.id} 
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCompetitorClick(competitor)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium">{competitor.name}</span>
                          </td>
                          <td className="text-center py-3 px-4">
                            {competitor.metrics.publications}
                          </td>
                          <td className="text-center py-3 px-4">
                            {competitor.metrics.distributionTime.toFixed(1)}d
                          </td>
                          <td className="text-center py-3 px-4">
                            #{competitor.metrics.serpPosition.toFixed(1)}
                          </td>
                          <td className="text-center py-3 px-4">
                            {competitor.metrics.socialReach === 0 ? "-" : competitor.metrics.socialReach.toLocaleString()}
                          </td>
                          <td className="text-center py-3 px-4">
                            {competitor.metrics.engagementRate.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Click on any competitor row to see detailed comparison
                </p>
              </div>

              {/* Insights Section */}
              <BenchmarkInsights 
                champion={benchmarkData.champion}
                competitors={benchmarkData.competitors}
              />
              
              {/* Overlay de bloqueo único para toda la pantalla */}
              {userProfile && !userProfile.full_access && (
                <div className="absolute inset-x-0 top-16 bottom-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
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
          

          
          {/* Modals */}
          <BenchmarkConfigModal
            isOpen={configModalOpen}
            onClose={() => setConfigModalOpen(false)}
            onStartBenchmark={handleStartBenchmark}
          />
          
          {selectedCompetitor && benchmarkData && (
            <CompetitorComparisonModal
              isOpen={comparisonModalOpen}
              onClose={() => setComparisonModalOpen(false)}
              champion={benchmarkData.champion}
              competitor={selectedCompetitor}
            />
          )}
          
          {/* Contact Sales Dialog */}
          <ContactSalesDialog
            open={contactDialogOpen}
            onOpenChange={setContactDialogOpen}
            title={contactDialogProps.title}
            description={contactDialogProps.description}
            onSubmit={() => console.log('Contact sales submitted')}
          />
        </div>
      </main>
    </div>
  );
};

export default Benchmark;
