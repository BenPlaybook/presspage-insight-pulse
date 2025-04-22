import { Link } from 'react-router-dom';

// Updated type definition
type Account = {
  id: string;
  name: string;
  status: 'Active' | 'Processing';
  dateAdded: string;
  avgSpeed: string;
  headcount: number;
  publications: {
    financial: {
      last30Days: number;
      last90Days: number;
      lastYear: number;
    };
    nonFinancial: {
      last30Days: number;
      last90Days: number;
      lastYear: number;
    };
  };
};

// Updated mock data
const accounts: Account[] = [
  {
    id: '1',
    name: 'Shopify',
    status: 'Active',
    dateAdded: '2024-01-15',
    avgSpeed: '1.5 hrs',
    headcount: 12,
    publications: {
      financial: {
        last30Days: 5,
        last90Days: 15,
        lastYear: 48
      },
      nonFinancial: {
        last30Days: 42,
        last90Days: 127,
        lastYear: 412
      }
    }
  },
  {
    id: '2',
    name: 'Lotus Cars',
    status: 'Processing',
    dateAdded: '2024-02-01',
    avgSpeed: '3.2 hrs',
    headcount: 8,
    publications: {
      financial: {
        last30Days: 3,
        last90Days: 8,
        lastYear: 32
      },
      nonFinancial: {
        last30Days: 20,
        last90Days: 68,
        lastYear: 245
      }
    }
  },
  {
    id: '3',
    name: 'Volvo',
    status: 'Active',
    dateAdded: '2024-03-10',
    avgSpeed: '0.8 hrs',
    headcount: 10,
    publications: {
      financial: {
        last30Days: 2,
        last90Days: 5,
        lastYear: 20
      },
      nonFinancial: {
        last30Days: 15,
        last90Days: 35,
        lastYear: 120
      }
    }
  },
  {
    id: '4',
    name: 'Tesla',
    status: 'Active',
    dateAdded: '2024-04-05',
    avgSpeed: '2.1 hrs',
    headcount: 15,
    publications: {
      financial: {
        last30Days: 4,
        last90Days: 10,
        lastYear: 40
      },
      nonFinancial: {
        last30Days: 25,
        last90Days: 55,
        lastYear: 220
      }
    }
  },
  {
    id: '5',
    name: 'Sony',
    status: 'Processing',
    dateAdded: '2024-05-01',
    avgSpeed: '3.8 hrs',
    headcount: 12,
    publications: {
      financial: {
        last30Days: 1,
        last90Days: 3,
        lastYear: 10
      },
      nonFinancial: {
        last30Days: 10,
        last90Days: 20,
        lastYear: 100
      }
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
              Date Added
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Avg. Speed
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              PR & Comms Headcount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Publications (30d)
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
                {new Date(account.dateAdded).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {account.avgSpeed}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {account.headcount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {account.publications.financial.last30Days + account.publications.nonFinancial.last30Days}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div 
                      className="h-full bg-presspage-teal rounded" 
                      style={{ 
                        width: `${(account.publications.financial.last30Days / (account.publications.financial.last30Days + account.publications.nonFinancial.last30Days)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
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
