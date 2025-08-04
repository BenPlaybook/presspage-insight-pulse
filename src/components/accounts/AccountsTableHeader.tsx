
import { ChevronUp, ChevronDown } from 'lucide-react';

interface AccountsTableHeaderProps {
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc';
}

export const AccountsTableHeader = ({ onSort, sortDirection }: AccountsTableHeaderProps) => (
  <thead className="bg-presspage-blue text-white">
    <tr>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
        <button 
          className="flex items-center gap-1 cursor-pointer hover:text-gray-200 transition-colors"
          onClick={onSort}
        >
          Account
          {sortDirection && (
            sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
        Date Added
      </th>
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
        Industry
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
);
