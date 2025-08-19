import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { UnlockFeaturesModal } from '@/components/UnlockFeaturesModal';
import { useNavigate } from 'react-router-dom';

export const PublicStickyBenchmarkButton: React.FC = () => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const navigate = useNavigate();

  const handleRunAnalysis = () => {
    setShowUnlockModal(true);
  };

  const handleContactSales = () => {
    window.open('mailto:sales@presspage.com?subject=Unlock Competitor Insights', '_blank');
    setShowUnlockModal(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setShowUnlockModal(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button 
          onClick={handleRunAnalysis}
          className="bg-presspage-teal hover:bg-opacity-90 text-white py-4 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-base"
        >
          <BarChart3 className="h-5 w-5" />
          Run Analysis
        </Button>
      </div>

      <UnlockFeaturesModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onContactSales={handleContactSales}
        onLogin={handleLogin}
      />
    </>
  );
};
