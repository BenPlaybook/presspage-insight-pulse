
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface PublicationsFiltersProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onClassificationChange: (classification: string) => void;
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export const PublicationsFilters: React.FC<PublicationsFiltersProps> = ({
  onSearchChange,
  onStatusChange,
  onClassificationChange,
  onDateRangeChange
}) => {
  const [search, setSearch] = React.useState('');
  const [date, setDate] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    const newDate = {
      from: date.from,
      to: date.to
    };
    
    if (!date.from) {
      newDate.from = selectedDate;
    } else if (!date.to && selectedDate && selectedDate >= date.from) {
      newDate.to = selectedDate;
    } else {
      newDate.from = selectedDate;
      newDate.to = undefined;
    }

    setDate(newDate);
    onDateRangeChange(newDate);
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
      
      <div className="flex flex-wrap gap-2">
        <Select onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="analyzing">Analyzing</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="distributed">Distributed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select onValueChange={onClassificationChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="non-financial">Non-Financial</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[150px] justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MMM d")} - {format(date.to, "MMM d")}
                  </>
                ) : (
                  format(date.from, "MMM d, yyyy")
                )
              ) : (
                <span>Date Range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date.from}
              selected={{ from: date.from, to: date.to }}
              onSelect={(selectedDate) => {
                setDate(selectedDate || { from: undefined, to: undefined });
                onDateRangeChange(selectedDate || { from: undefined, to: undefined });
              }}
              numberOfMonths={1}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
