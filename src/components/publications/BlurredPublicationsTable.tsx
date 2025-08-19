import React, { useState } from 'react';
import { Publication } from '@/types/publications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock, Eye, Calendar, TrendingUp, Share2, MapPin } from 'lucide-react';
import { UnlockFeaturesModal } from '@/components/UnlockFeaturesModal';
import { LiveIndicator } from '@/components/LiveIndicator';
import { useNavigate } from 'react-router-dom';

interface BlurredPublicationsTableProps {
  publications: Publication[];
  accountId: string;
}

export const BlurredPublicationsTable: React.FC<BlurredPublicationsTableProps> = ({
  publications,
  accountId,
}) => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const navigate = useNavigate();

  const handleRunAnalysis = () => {
    setShowUnlockModal(true);
  };

  const handleContactSales = () => {
    // Aquí puedes implementar la lógica para contactar ventas
    window.open('mailto:sales@presspage.com?subject=Unlock Competitor Insights', '_blank');
    setShowUnlockModal(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setShowUnlockModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatSerpPosition = (na: number, eu: number) => {
    const naText = na > 0 ? `#${na}` : 'N/A';
    const euText = eu > 0 ? `#${eu}` : 'N/A';
    return `NA: ${naText}, EU: ${euText}`;
  };

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-presspage-blue" />
              Tracked Publications
              <Badge variant="secondary" className="ml-2">
                Preview Mode
              </Badge>
              <LiveIndicator />
            </CardTitle>
            <Button 
              onClick={handleRunAnalysis}
              className="bg-presspage-blue hover:bg-presspage-blue/90"
            >
              Run Analysis
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Sign in or upgrade to access full competitor insights and analytics
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Overlay borroso */}
          <div className="relative">
            <div className="blur-sm pointer-events-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article Title</TableHead>
                    <TableHead>Detected Date</TableHead>
                    <TableHead>SERP Position</TableHead>
                    <TableHead>Social Coverage</TableHead>
                    <TableHead>Distribution Time</TableHead>
                    <TableHead>Total Locations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publications.slice(0, 4).map((publication) => (
                    <TableRow key={publication.id}>
                      <TableCell className="font-medium">
                        {publication.title}
                      </TableCell>
                      <TableCell>
                        {formatDate(publication.detectedDate)}
                      </TableCell>
                      <TableCell>
                        {formatSerpPosition(
                          publication.serpPosition.na,
                          publication.serpPosition.eu
                        )}
                      </TableCell>
                      <TableCell>
                        {publication.socialCoverage.matched}/{publication.socialCoverage.total}
                      </TableCell>
                      <TableCell>
                        {publication.distributionTime}
                      </TableCell>
                      <TableCell>
                        {publication.totalLocations}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Overlay de bloqueo */}
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-presspage-blue/10 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-presspage-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Unlock Full Access
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md">
                    Get complete access to competitor data, advanced analytics, and detailed insights
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={handleRunAnalysis}
                      className="bg-presspage-blue hover:bg-presspage-blue/90"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Unlock Insights
                    </Button>
                    <Button 
                      onClick={handleLogin}
                      variant="outline"
                    >
                      Sign In
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 text-presspage-blue mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">{publications.length}</p>
              <p className="text-xs text-gray-500">Total Publications</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Share2 className="w-6 h-6 text-presspage-blue mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Coming Soon</p>
              <p className="text-xs text-gray-500">Distribution Channels</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-6 h-6 text-presspage-blue mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Coming Soon</p>
              <p className="text-xs text-gray-500">Geographic Coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <UnlockFeaturesModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onContactSales={handleContactSales}
        onLogin={handleLogin}
      />
    </>
  );
};
