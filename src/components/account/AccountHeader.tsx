
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UnlockFeaturesModal } from '@/components/UnlockFeaturesModal';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface AccountHeaderProps {
  name: string;
  url: string;
  status: string;
  lastAnalyzed: string;
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
  healthScore,
  showUnlockModal = false,
  onRunAnalysis,
  disableInteractions = false
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleRunAnalysis = () => {
    if (user) {
      // Usuario autenticado - ir a benchmark
      navigate('/benchmark');
    } else {
      // Usuario no autenticado - mostrar modal
      setShowModal(true);
    }
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
            <p className="text-sm text-gray-500">{url} • {status} • Last analyzed: {lastAnalyzed}</p>
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
