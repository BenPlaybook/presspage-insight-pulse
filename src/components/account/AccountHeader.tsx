
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
  performanceScore?: number;
  showUnlockModal?: boolean;
  onRunAnalysis?: () => void;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  name,
  url,
  status,
  lastAnalyzed,
  performanceScore,
  showUnlockModal = false,
  onRunAnalysis
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
      <div className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-presspage-teal">Dashboard</Link> &gt; {name}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#122F4A]">{name}</h1>
            <p className="text-sm text-gray-500">{url} • {status} • Last analyzed: {lastAnalyzed}</p>
          </div>
          <div className="flex items-center gap-4">
            {performanceScore !== undefined && (
              <div className="text-center">
                <div className="text-3xl font-bold text-presspage-teal">
                  {performanceScore}
                </div>
                <div className="text-xs text-gray-500">
                  PR Score
                </div>
              </div>
            )}
            <Button 
              onClick={handleRunAnalysis}
              className="bg-presspage-teal hover:bg-opacity-90 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Run Analysis
            </Button>
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
