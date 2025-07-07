
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export const StickyBenchmarkButton: React.FC = () => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <Link 
        to="/benchmark" 
        className="bg-presspage-teal hover:bg-opacity-90 text-white py-4 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-base"
      >
        <BarChart3 className="h-5 w-5" />
        Compare your PR to your top competitors
      </Link>
    </div>
  );
};
