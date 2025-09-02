import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AccountHeaderWrapper } from '@/components/account/AccountHeaderWrapper';
import { AccountMetrics } from '@/components/account/AccountMetrics';
import AccountInsights from '@/components/account/AccountInsights';
import { AccountTabs } from '@/components/account/AccountTabs';
import { BlurredPublicationsTable } from '@/components/publications/BlurredPublicationsTable';
import { StickyBenchmarkButton } from '@/components/account/StickyBenchmarkButton';
import { PublicStickyBenchmarkButton } from '@/components/account/PublicStickyBenchmarkButton';
import { Publication } from '@/types/publications';
import { databaseService } from '@/services/databaseService';
import { Account as SupabaseAccount } from '@/types/database';
import { accountAdapter } from '@/services/accountAdapter';
import { publicationAdapter } from '@/services/publicationAdapter';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { samplePublications } from '@/components/publications/SamplePublicationsData';
import { prHealthMetricsService } from '@/services/prHealthMetricsService';

const PublicAccountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuthContext();
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [account, setAccount] = useState<SupabaseAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prHealthMetrics, setPrHealthMetrics] = useState<any>(null);

  // Load account data and publications from Supabase
  useEffect(() => {
    const loadAccountData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load account data
        const { data: accountData, error: accountError } = await databaseService.getAccountById(id);
        
        if (accountError) {
          console.error('Error loading account:', accountError);
          setError('Failed to load account');
          return;
        }
        
        setAccount(accountData);
        
        // Load tracked publications for this account (last 30 days)
        const { data: publicationsData, error: publicationsError } = await databaseService.getTrackedPublicationsLast30Days(id);
        
        if (publicationsError) {
          console.error('Error loading publications:', publicationsError);
        } else {
          // Convert publications to frontend format
          const convertedPublications = publicationAdapter.fromSupabaseArray(publicationsData || []);
          setPublications(convertedPublications);
          setFilteredPublications(convertedPublications);
        }

        // Si no hay publicaciones reales, usar datos de ejemplo para usuarios no autenticados
        if (!user && (!publicationsData || publicationsData.length === 0)) {
          setPublications(samplePublications);
          setFilteredPublications(samplePublications);
        }

                 // Calcular métricas de PR Health Score
         if (id) {
           try {
             const metrics = await prHealthMetricsService.calculatePRHealthMetrics(id);
             setPrHealthMetrics(metrics);
             
             // Debug: Log completo de métricas para PDF
             console.log('🔍 PDF Debug - Complete PR Health Metrics:', {
               metrics,
               hasPublishingVelocity: !!metrics?.publishingVelocity,
               hasDistributionReach: !!metrics?.distributionReach,
               hasOrganicFindability: !!metrics?.organicFindability,
               publishingVelocityScore: metrics?.publishingVelocity?.scorePercentage,
               distributionReachScore: metrics?.distributionReach?.scorePercentage,
               organicFindabilityScore: metrics?.organicFindability?.scorePercentage
             });
            
                         // Log Publishing Velocity calculation details
             if (metrics?.publishingVelocity) {
               console.log('📊 Publishing Velocity Calculation:', {
                 accountId: id,
                 averageDelay: `${metrics.publishingVelocity.averageDelay}h`,
                 channelFactor: `${metrics.publishingVelocity.channelFactor}h`,
                 totalScore: `${metrics.publishingVelocity.totalScore}h`,
                 scorePercentage: `${metrics.publishingVelocity.scorePercentage}%`,
                 channelsCount: metrics.publishingVelocity.channels.length,
                 channels: metrics.publishingVelocity.channels.map(ch => ({
                   sourceType: ch.sourceType,
                   delay: `${ch.delay.toFixed(1)}h`
                 }))
               });
             }

                           // Log Distribution Reach calculation details
              if (metrics?.distributionReach) {
                console.log('🌐 Distribution Reach Calculation:', {
                  accountId: id,
                  totalViews: metrics.distributionReach.totalViews.toLocaleString(),
                  thirdPartyLocations: metrics.distributionReach.thirdPartyLocations,
                  locationFactor: metrics.distributionReach.locationFactor.toLocaleString(),
                  totalScore: metrics.distributionReach.totalScore.toLocaleString(),
                  scorePercentage: `${metrics.distributionReach.scorePercentage}%`,
                  locationsCount: metrics.distributionReach.locations.length,
                  locations: metrics.distributionReach.locations.map(loc => ({
                    sourceType: loc.sourceType,
                    views: loc.views.toLocaleString(),
                    locationName: loc.locationName
                  }))
                });
              }

              // Log Organic Findability calculation details
              if (metrics?.organicFindability) {
                console.log('🔍 Organic Findability Calculation:', {
                  accountId: id,
                  serpScore: `${metrics.organicFindability.serpScore}%`,
                  averageSerpPosition: metrics.organicFindability.averageSerpPosition,
                  prTopicsCoverage: metrics.organicFindability.prTopicsCoverage,
                  totalKeywords: metrics.organicFindability.totalKeywords,
                  totalScore: metrics.organicFindability.totalScore.toFixed(1),
                  scorePercentage: `${metrics.organicFindability.scorePercentage}%`,
                  serpDetailsCount: metrics.organicFindability.serpDetails.length,
                  topKeywords: metrics.organicFindability.topicDetails.slice(0, 5).map(kw => ({
                    keyword: kw.keyword,
                    frequency: kw.frequency
                  }))
                });
              }
          } catch (err) {
            console.error('Error calculating PR Health metrics:', err);
          }
        }
      } catch (err) {
        console.error('Error in loadAccountData:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, [id]);

  const handleSearchChange = (search: string) => {
    if (!search.trim()) {
      setFilteredPublications(publications);
      return;
    }

    const filtered = publications.filter(pub =>
      pub.title.toLowerCase().includes(search.toLowerCase()) ||
      pub.content?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPublications(filtered);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/login?signup=true');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-presspage-blue"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-presspage-blue"></div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Not Found</h1>
          <p className="text-gray-600 mb-6">The account you're looking for doesn't exist or is not accessible.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const itemsPerPage = 15;
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
  const paginatedPublications = filteredPublications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
                 {/* Account Header */}
         <AccountHeaderWrapper 
           name={account.name || "Vinted"}
           url={account.main_website_url || "https://vinted.com"}
           status="Active"
           lastAnalyzed="Coming Soon"
                       healthScore={(() => {
              // Calcular score global basado en métricas reales
              const scores = [
                prHealthMetrics?.publishingVelocity?.scorePercentage || 0,
                prHealthMetrics?.distributionReach?.scorePercentage || 0,
                prHealthMetrics?.organicFindability?.scorePercentage || 0,
                prHealthMetrics?.pickUpQuality?.scorePercentage || 0
              ];
              
              // Filtrar scores válidos (mayores a 0)
              const validScores = scores.filter(score => score > 0);
              
              if (validScores.length === 0) return 0;
              
              // Calcular promedio de métricas disponibles
              const averageScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
              
              console.log('🎯 Header Health Score Calculation:', {
                individualScores: scores,
                validScores,
                averageScore: Math.round(averageScore)
              });
              
              return Math.round(averageScore);
            })()}
           disableInteractions={!user} // Disable interactions for non-authenticated users
         />
        
        {/* Account Metrics */}
        <div className="mb-8">
          <AccountMetrics 
            metrics={{
              publications: {
                count: publications.length,
                period: 'Last 30 days'
              },
              channels: {
                count: 0,
                description: 'Distribution channels',
                channels: []
              },
              distributionTime: {
                value: 'Coming Soon',
                trend: 'stable'
              },
              serpPosition: {
                value: 'N/A',
                positions: 'NA: N/A, EU: N/A'
              }
            }}
          />
        </div>

                 {/* Account Insights */}
         <div className="mb-6">
           <AccountInsights 
             internalSummary={account?.ai_performance_summary || "No internal analysis available"}
             customerSummary={account?.customer_ai_summary || "No customer summary available"}
             accountId={id || '1'}
             summaryId={`summary-${id || '1'}-${Date.now()}`}
             accountName={account?.name || 'Account'}
             aiSummary={account?.ai_performance_summary}
             customerAiSummary={account?.customer_ai_summary}
             prHealthData={{
               overallScore: (() => {
                 // Calcular score global basado en métricas reales
                 const scores = [
                   prHealthMetrics?.publishingVelocity?.scorePercentage || 0,
                   prHealthMetrics?.distributionReach?.scorePercentage || 0,
                   prHealthMetrics?.organicFindability?.scorePercentage || 0,
                   prHealthMetrics?.pickUpQuality?.scorePercentage || 0
                 ];
                 
                 // Filtrar scores válidos (mayores a 0)
                 const validScores = scores.filter(score => score > 0);
                 
                 if (validScores.length === 0) return 0;
                 
                 // Calcular promedio de métricas disponibles
                 const averageScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
                 
                 console.log('🎯 Overall Score Calculation:', {
                   individualScores: scores,
                   validScores,
                   averageScore: Math.round(averageScore)
                 });
                 
                 return Math.round(averageScore);
               })(),
               metrics: {
                 publishingVelocity: prHealthMetrics?.publishingVelocity?.scorePercentage || 0,
                 distributionReach: prHealthMetrics?.distributionReach?.scorePercentage || 0,
                 pickupQuality: prHealthMetrics?.pickUpQuality?.scorePercentage || 0,
                 organicFindability: prHealthMetrics?.organicFindability?.scorePercentage || 0,
                 competitorBenchmark: 0
               },
               recommendation: (() => {
                 // Si tenemos datos reales, construir recomendación detallada
                 if (prHealthMetrics?.publishingVelocity || prHealthMetrics?.distributionReach || prHealthMetrics?.organicFindability) {
                   const parts = [];
                   
                   if (prHealthMetrics?.publishingVelocity) {
                     parts.push(`Publishing Velocity: ${prHealthMetrics.publishingVelocity.totalScore.toFixed(1)}h average delay across ${prHealthMetrics.publishingVelocity.channels.length} channels.`);
                   }
                   
                   if (prHealthMetrics?.distributionReach) {
                     parts.push(`Distribution Reach: ${prHealthMetrics.distributionReach.totalViews.toLocaleString()} total views across ${prHealthMetrics.distributionReach.thirdPartyLocations} third-party locations.`);
                   }
                   
                   if (prHealthMetrics?.organicFindability) {
                     parts.push(`Organic Findability: ${prHealthMetrics.organicFindability.serpScore.toFixed(1)}% SERP score with ${prHealthMetrics.organicFindability.prTopicsCoverage} unique keywords.`);
                   }
                   
                   // Evaluar rendimiento general
                   const pvScore = prHealthMetrics?.publishingVelocity?.scorePercentage || 0;
                   const drScore = prHealthMetrics?.distributionReach?.scorePercentage || 0;
                   const ofScore = prHealthMetrics?.organicFindability?.scorePercentage || 0;
                   const puqScore = prHealthMetrics?.pickUpQuality?.scorePercentage || 0;
                   
                   // Calcular score promedio para la recomendación
                   const scores = [pvScore, drScore, ofScore, puqScore];
                   const validScores = scores.filter(score => score > 0);
                   const averageScore = validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
                   
                   console.log('🎯 Recommendation Calculation:', {
                     scores: { pvScore, drScore, ofScore, puqScore },
                     averageScore: Math.round(averageScore)
                   });
                   
                   if (averageScore >= 80) {
                     parts.push('Excellent performance across all metrics.');
                   } else if (averageScore >= 60) {
                     parts.push('Good performance with room for improvement.');
                   } else if (averageScore >= 40) {
                     parts.push('Moderate performance. Focus on improving key areas.');
                   } else {
                     parts.push('Poor Performance. Consider optimizing your PR strategy.');
                   }
                   
                   return parts.join('\n\n');
                 }
                 
                 // Recomendación por defecto si no hay datos reales
                 return "Excellent performance across all metrics.\n\nFocus on maintaining high distribution reach and consider expanding into new markets to further improve competitor benchmarking.";
               })()
             }}
             forceExpanded={!user} // Force expanded for non-authenticated users
             disableInteractions={!user} // Disable interactions for non-authenticated users
           />
         </div>



                 {/* Public Preview Banner - Solo para usuarios no logueados */}
         {!user && (
           <Card className="mb-6 border-presspage-teal/20 bg-gradient-to-r from-presspage-teal/5 to-presspage-blue/5">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-presspage-teal/10 rounded-full flex items-center justify-center">
                     <Lock className="w-5 h-5 text-presspage-teal" />
                   </div>
                   <div>
                     <h3 className="font-semibold text-gray-900">Shared Account View</h3>
                     <p className="text-sm text-gray-600">
                       You're viewing a shared account summary. Sign in for full access to all features.
                     </p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <Button onClick={handleLogin} variant="outline">
                     Sign In
                   </Button>
                   <Button onClick={handleSignUp} className="bg-presspage-teal hover:bg-presspage-teal/90">
                     Get Full Access
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         )}

        {/* Publications Section */}
        {user ? (
          // Usuario autenticado - mostrar tabla completa
          <AccountTabs
            accountId={id || ''}
            publications={paginatedPublications}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onSearchChange={handleSearchChange}
          />
        ) : (
          // Usuario no autenticado - mostrar tabla borrosa
          <BlurredPublicationsTable
            publications={publications}
            accountId={id || ''}
          />
        )}

        {/* Sticky Benchmark Button */}
        {user ? <StickyBenchmarkButton /> : <PublicStickyBenchmarkButton />}

        {/* Features Preview for Non-authenticated Users */}
        {!user && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-gray-100 hover:border-presspage-blue/20 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-presspage-blue" />
                  <CardTitle className="text-lg">Competitor Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Compare your performance against competitors with detailed metrics and insights.
                </p>
                <Badge variant="secondary">Premium Feature</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-presspage-blue/20 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-presspage-blue" />
                  <CardTitle className="text-lg">Advanced Reporting</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Generate comprehensive reports with custom date ranges and filters.
                </p>
                <Badge variant="secondary">Premium Feature</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 hover:border-presspage-blue/20 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-presspage-blue" />
                  <CardTitle className="text-lg">Team Collaboration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Share insights and collaborate with your team members seamlessly.
                </p>
                <Badge variant="secondary">Premium Feature</Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicAccountDetails;
