
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DistributionTimeline } from '@/components/publications/DistributionTimeline';
import { SerpResultsTable } from '@/components/publications/SerpResultsTable';
import { SocialCoverageTable } from '@/components/publications/SocialCoverageTable';
import { PublicationMetrics } from '@/components/publications/PublicationMetrics';
import { ArticleInformation } from '@/components/publications/ArticleInformation';
import { Publication } from '@/types/publications';
import { databaseService } from '@/services/databaseService';
import { publicationAdapter } from '@/services/publicationAdapter';
import { Account as SupabaseAccount } from '@/types/database';

const PublicationDetails = () => {
  const { id, publicationId } = useParams<{ id: string; publicationId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [publication, setPublication] = useState<Publication | null>(null);
  const [account, setAccount] = useState<SupabaseAccount | null>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load publication and account data from Supabase
  useEffect(() => {
    const loadPublicationData = async () => {
      if (!publicationId || !id) return;
      
      try {
        setLoading(true);
        
        // Load publication data
        const { data: publicationData, error: publicationError } = await databaseService.getPublicationById(publicationId);
        
        if (publicationError) {
          console.error('Error loading publication:', publicationError);
          setError('Failed to load publication');
          return;
        }
        
        if (!publicationData) {
          setError('Publication not found');
          return;
        }
        
        // Convert publication to frontend format
        const convertedPublication = publicationAdapter.fromSupabase(publicationData);
        setPublication(convertedPublication);

        // Extract AI summary from the publication
        if (publicationData.ai_summary) {
          setAiSummary(publicationData.ai_summary);
        }
        
        // Load account data
        const { data: accountData, error: accountError } = await databaseService.getAccountById(id);
        
        if (accountError) {
          console.error('Error loading account:', accountError);
          // Don't set error here, just log it
        } else {
          setAccount(accountData);
        }
      } catch (err) {
        console.error('Error loading publication data:', err);
        setError('Failed to load publication data');
      } finally {
        setLoading(false);
      }
    };

    loadPublicationData();
  }, [publicationId, id]);

  // Temporary flag to hide tabs - set to true to show tabs again in the future
  const showTabs = false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="account" title="Loading..." />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-presspage-blue"></div>
            <span className="ml-2 text-gray-600">Loading publication...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="account" title="Error" />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-8">
            <span className="text-red-600">{error || 'Publication not found'}</span>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="account" title="Publication Details" />
      
      <main className="container mx-auto px-4 py-6">
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-presspage-teal">Dashboard</Link> &gt; 
          <Link to={`/account/${id}`} className="hover:text-presspage-teal ml-1">{account?.name || 'Account'}</Link> &gt; 
          <span className="ml-1">Publication Details</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#122F4A]">{publication.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Source: {publication.source || 'N/A'}</span>
              <span className="hidden md:block text-gray-300 mx-2">•</span>
              <span className="text-sm text-gray-500">Detected: {new Date(publication.detectedDate).toLocaleDateString()}</span>
              <span className="hidden md:block text-gray-300 mx-2">•</span>
              <span className="text-sm text-gray-500">Classification: {publication.classification}</span>
              <span className="hidden md:block text-gray-300 mx-2">•</span>
              <span className="text-sm text-gray-500">Tracking Period: {publication.trackingPeriod.start} - {publication.trackingPeriod.end}</span>
            </div>
          </div>
        </div>
        
        <PublicationMetrics publication={publication} />
        
        {/* AI Summary Section */}
        {aiSummary && (
          <div className="mb-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Analysis</h3>
                    <p className="text-cyan-300 text-sm">Powered by Advanced Analytics</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aiSummary.internal && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <h4 className="font-semibold text-cyan-300 text-sm uppercase tracking-wide">Internal Analysis</h4>
                      </div>
                      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {aiSummary.internal}
                      </div>
                    </div>
                  )}
                  
                  {aiSummary.customer && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <h4 className="font-semibold text-purple-300 text-sm uppercase tracking-wide">Customer Summary</h4>
                      </div>
                      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {aiSummary.customer}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-700">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Export
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Distribution Time"
            value={publication.distributionTime}
            valueClassName="text-presspage-teal"
          />
          <MetricCard
            title="SERP Position"
            value={`NA: #${publication.serpPosition.na} / EU: #${publication.serpPosition.eu}`}
            valueClassName="text-[#122F4A]"
          />
          <MetricCard
            title="Social Matches"
            value={`${publication.socialCoverage.matched}/${publication.socialCoverage.total}`}
          />
          <MetricCard
            title="Total Locations"
            value={publication.totalLocations.toString()}
          />
        </div>
        
        {showTabs ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full mb-6 border-b">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="article" className="text-sm">Article Information</TabsTrigger>
              <TabsTrigger value="serp" className="text-sm">SERP Results</TabsTrigger>
              <TabsTrigger value="social" className="text-sm">Social Media</TabsTrigger>
              <TabsTrigger value="historical" className="text-sm">Historical Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-6">
                                        <h3 className="text-lg font-medium mb-4">Article Thumbnail</h3>
                  {publication.image ? (
                    <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
                      <img 
                        src={publication.image} 
                        alt="Article thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          // Si la imagen falla, ocultar el contenedor
                          e.currentTarget.parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
                      <div className="text-gray-400 text-sm text-center">
                        <p>No image available</p>
                      </div>
                    </div>
                  )}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{publication.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-3">{publication.content || 'No content available'}</p>
                        <a 
                          href={publication.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-presspage-teal hover:text-opacity-80"
                        >
                          View original article →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="p-6">
                      <DistributionTimeline publication={publication} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="article" className="space-y-6">
              <ArticleInformation publication={publication} />
            </TabsContent>
            
            <TabsContent value="serp" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">SERP Results</h3>
                  <SerpResultsTable results={publication.serpResults} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Social Media Coverage</h3>
                  <SocialCoverageTable platforms={publication.socialCoverage.platforms} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="historical" className="space-y-6">
              <Card>
                <CardContent className="p-6 h-64 flex items-center justify-center">
                  <p className="text-gray-500">Historical comparison data will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Simplified layout without tabs - temporarily hidden
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Article Thumbnail</h3>
                  {publication.image ? (
                    <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
                      <img 
                        src={publication.image} 
                        alt="Article thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          // Si la imagen falla, ocultar el contenedor
                          e.currentTarget.parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
                      <div className="text-gray-400 text-sm text-center">
                        <p>No image available</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{publication.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-3">{publication.content || 'No content available'}</p>
                    <a 
                      href={publication.source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-presspage-teal hover:text-opacity-80"
                    >
                      View original article →
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <DistributionTimeline publication={publication} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <Link 
            to={`/account/${id}`} 
            className="bg-[#122F4A] hover:bg-opacity-90 text-white py-3 px-4 rounded-md font-medium transition-colors block text-center"
          >
            Back to Account
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PublicationDetails;
