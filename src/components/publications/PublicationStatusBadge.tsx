
import React from 'react';
import { PublicationStatus } from '@/types/publications';

interface PublicationStatusBadgeProps {
  status: PublicationStatus;
}

export const PublicationStatusBadge: React.FC<PublicationStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Analyzing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Matched':
        return 'bg-blue-100 text-blue-800';
      case 'Distributed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {status}
    </span>
  );
};
