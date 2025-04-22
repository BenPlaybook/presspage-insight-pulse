
import React from 'react';
import { Link } from 'react-router-dom';

interface AccountHeaderProps {
  name: string;
  url: string;
  status: string;
  lastAnalyzed: string;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  name,
  url,
  status,
  lastAnalyzed
}) => {
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
          <button className="bg-presspage-teal text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
            Run Analysis
          </button>
        </div>
      </div>
    </>
  );
};
