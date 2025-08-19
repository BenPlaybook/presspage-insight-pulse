import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi } from 'lucide-react';

interface LiveIndicatorProps {
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ className = '' }) => {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-green-100 text-green-800 border-green-200 flex items-center gap-1 ${className}`}
    >
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <Wifi className="w-3 h-3" />
      <span className="text-xs font-medium">LIVE</span>
    </Badge>
  );
};
