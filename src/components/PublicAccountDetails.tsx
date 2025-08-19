import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AccountHeaderWrapper } from '@/components/account/AccountHeaderWrapper';
import { AccountMetrics } from '@/components/account/AccountMetrics';
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

  const totalPages = Math.ceil(filteredPublications.length / 10);

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
          performanceScore={undefined}
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

        {/* Public Preview Banner - Solo para usuarios no logueados */}
        {!user && (
          <Card className="mb-6 border-presspage-blue/20 bg-gradient-to-r from-presspage-blue/5 to-presspage-teal/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-presspage-blue/10 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-presspage-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Public Preview Mode</h3>
                    <p className="text-sm text-gray-600">
                      You're viewing limited data. Sign in for full access to competitor insights.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleLogin} variant="outline">
                    Sign In
                  </Button>
                  <Button onClick={handleSignUp} className="bg-presspage-blue hover:bg-presspage-blue/90">
                    Get Started
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
            publications={filteredPublications}
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
