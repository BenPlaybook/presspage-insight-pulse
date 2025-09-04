
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export const StickyBenchmarkButton: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Preserve current URL parameters when navigating to benchmark
  const benchmarkUrl = searchParams.toString() ? `/benchmark?${searchParams.toString()}` : '/benchmark';
  
  console.log('🎯 StickyBenchmarkButton: Rendering button');
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999]">
      <Link 
        to={benchmarkUrl}
        className="bg-presspage-teal hover:bg-presspage-teal/90 text-white py-4 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-base"
      >
        <BarChart3 className="h-5 w-5" />
        Compare your PR to your top competitors
      </Link>
    </div>
  );
};
