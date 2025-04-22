
import React from 'react';

// Mock data type definitions
type BenchmarkAccount = {
  id: string;
  name: string;
  avgSpeed: string;
  serpPosition: number;
  publications: number;
  socialCoverage: number;
  efficiencyScore: {
    value: number;
    total: number;
  };
};

// Mock data
const benchmarkAccounts: BenchmarkAccount[] = [
  {
    id: '1',
    name: 'Shopify',
    avgSpeed: '1.5 hrs',
    serpPosition: 3,
    publications: 47,
    socialCoverage: 95,
    efficiencyScore: {
      value: 92,
      total: 100
    }
  },
  {
    id: '2',
    name: 'Lotus Cars',
    avgSpeed: '3.2 hrs',
    serpPosition: 8,
    publications: 23,
    socialCoverage: 75,
    efficiencyScore: {
      value: 68,
      total: 100
    }
  },
  {
    id: '3',
    name: 'Volvo',
    avgSpeed: '0.8 hrs',
    serpPosition: 1,
    publications: 62,
    socialCoverage: 98,
    efficiencyScore: {
      value: 95,
      total: 100
    }
  }
];

export const BenchmarkTable = () => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-presspage-blue text-white">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Account
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Avg. Speed
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              SERP Position
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Publications (30d)
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Social Coverage
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Efficiency Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {benchmarkAccounts.map((account) => (
            <tr key={account.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{account.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {account.avgSpeed}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-medium ${
                  account.serpPosition <= 3 ? 'text-green-600' : 
                  account.serpPosition <= 5 ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  #{account.serpPosition}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {account.publications}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {account.socialCoverage}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`
                  ${account.efficiencyScore.value >= 85 ? 'efficiency-score-high' : 
                    account.efficiencyScore.value >= 70 ? 'efficiency-score-medium' : 
                    'efficiency-score-low'}
                `}>
                  {account.efficiencyScore.value}/{account.efficiencyScore.total}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
