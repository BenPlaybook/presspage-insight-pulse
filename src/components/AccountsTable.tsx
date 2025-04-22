
import { Link } from 'react-router-dom';

// Mock data type definitions
type Account = {
  id: string;
  name: string;
  status: 'Active' | 'Processing';
  lastPublished: string;
  avgSpeed: string;
  serpPosition: number;
  publications: {
    count: number;
    days: number;
  };
};

// Mock data
const accounts: Account[] = [
  {
    id: '1',
    name: 'Shopify',
    status: 'Active',
    lastPublished: '2d ago',
    avgSpeed: '1.5 hrs',
    serpPosition: 3,
    publications: {
      count: 47,
      days: 30
    }
  },
  {
    id: '2',
    name: 'Lotus Cars',
    status: 'Processing',
    lastPublished: '5d ago',
    avgSpeed: '3.2 hrs',
    serpPosition: 8,
    publications: {
      count: 23,
      days: 30
    }
  },
  {
    id: '3',
    name: 'Volvo',
    status: 'Active',
    lastPublished: '1d ago',
    avgSpeed: '0.8 hrs',
    serpPosition: 1,
    publications: {
      count: 62,
      days: 30
    }
  },
  {
    id: '4',
    name: 'Tesla',
    status: 'Active',
    lastPublished: '3d ago',
    avgSpeed: '2.1 hrs',
    serpPosition: 2,
    publications: {
      count: 51,
      days: 30
    }
  },
  {
    id: '5',
    name: 'Sony',
    status: 'Processing',
    lastPublished: '4d ago',
    avgSpeed: '3.8 hrs',
    serpPosition: 6,
    publications: {
      count: 19,
      days: 30
    }
  }
];

export const AccountsTable = () => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-presspage-blue text-white">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Account
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Last Pub.
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Avg. Speed
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              SERP Pos.
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Publications
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full mr-2" 
                       style={{ backgroundColor: account.status === 'Active' ? '#00A99D' : '#FFB547' }} />
                  <div className="font-medium text-gray-900">{account.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`status-${account.status.toLowerCase()}`}>{account.status}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {account.lastPublished}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {account.publications.count} ({account.publications.days}d)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/account/${account.id}`} className="bg-presspage-teal text-white px-3 py-1 rounded text-xs">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
