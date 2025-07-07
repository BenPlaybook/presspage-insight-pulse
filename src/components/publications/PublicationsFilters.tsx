
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PublicationsFiltersProps {
  onSearchChange: (search: string) => void;
}

export const PublicationsFilters: React.FC<PublicationsFiltersProps> = ({
  onSearchChange
}) => {
  const [search, setSearch] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search publications..."
          value={search}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>
    </div>
  );
};
