
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UnlockFeaturesModal } from '@/components/UnlockFeaturesModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Building2 } from 'lucide-react';

interface AccountHeaderProps {
  name: string;
  url: string;
  status: string;
  lastAnalyzed: string;
  industry?: string;
  healthScore?: number;
  showUnlockModal?: boolean;
  onRunAnalysis?: () => void;
  disableInteractions?: boolean; // Disable interactions for external users
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  name,
  url,
  status,
  lastAnalyzed,
  industry,
  healthScore,
  showUnlockModal = false,
  onRunAnalysis,
  disableInteractions = false
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);

  const handleRunAnalysis = () => {
    // Preserve current URL parameters when navigating to benchmark
    const benchmarkUrl = searchParams.toString() ? `/benchmark?${searchParams.toString()}` : '/benchmark';
    navigate(benchmarkUrl);
  };

  const handleContactSales = () => {
    window.open('mailto:sales@presspage.com?subject=Unlock Competitor Insights', '_blank');
    setShowModal(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setShowModal(false);
  };
  return (
    <>
      {!disableInteractions && (
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-presspage-teal">Dashboard</Link> &gt; {name}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#122F4A]">{name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{url}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status}
              </span>
              {industry && industry.trim() !== '' && industry !== 'N/A' && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {industry}
                  </span>
                </>
              )}
              <span>•</span>
              <span>Last analyzed: {lastAnalyzed}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {healthScore !== undefined && (
              <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className={`text-3xl font-bold ${
                  healthScore >= 80 ? 'text-green-600' : 
                  healthScore >= 60 ? 'text-yellow-600' : 
                  healthScore >= 40 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {healthScore}%
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  PR Health Score
                </div>
                <div className={`text-xs mt-1 ${
                  healthScore >= 80 ? 'text-green-600' : 
                  healthScore >= 60 ? 'text-yellow-600' : 
                  healthScore >= 40 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {healthScore >= 80 ? 'Excellent' : 
                   healthScore >= 60 ? 'Good' : 
                   healthScore >= 40 ? 'Moderate' : 'Poor'}
                </div>
              </div>
            )}
            {!disableInteractions && (
              <Button 
                onClick={handleRunAnalysis}
                className="bg-presspage-teal hover:bg-opacity-90 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Run Analysis
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de desbloqueo para usuarios no autenticados */}
      {!user && (
        <UnlockFeaturesModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onContactSales={handleContactSales}
          onLogin={handleLogin}
        />
      )}
    </>
  );
};
