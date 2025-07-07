
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Publication } from '@/types/publications';
import { Eye, CheckCircle, Clock, Circle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PublicationsTableProps {
  publications: Publication[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'In Progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'Pending':
      return <Circle className="h-4 w-4 text-purple-600" />;
    case 'Analyzing':
      return <Search className="h-4 w-4 text-yellow-600" />;
    default:
      return <Circle className="h-4 w-4 text-gray-600" />;
  }
};

export const PublicationsTable: React.FC<PublicationsTableProps> = ({ 
  publications 
}) => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const handleDateClick = () => {
    toast({
      title: "Want deeper insights?",
      description: "Contact our PR consultant to learn more.",
    });
  };

  return (
    <TooltipProvider>
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Article Title</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Title of the press release or article</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Detected Date</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Date when the article was first detected by our system.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">SERP Position</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search engine ranking: NA = North America, EU = Europe.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Social Coverage</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of social channels where the article appeared vs. total expected.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Distribution Time</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Time it took for the article to reach all tracked media locations.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Total Locations</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of websites or platforms where the article was published.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-right">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Actions</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to view detailed metrics and coverage map.</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publications.map((publication) => (
              <TableRow key={publication.id}>
                <TableCell className="font-medium max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-shrink-0">
                          {getStatusIcon(publication.status)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{publication.status}</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="truncate">{publication.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <button 
                    onClick={handleDateClick}
                    className="text-left hover:text-presspage-teal cursor-pointer transition-colors"
                  >
                    {new Date(publication.detectedDate).toLocaleDateString()}
                  </button>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  NA: #{publication.serpPosition.na}, EU: #{publication.serpPosition.eu}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {publication.socialCoverage.matched}/{publication.socialCoverage.total}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {publication.distributionTime}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {publication.totalLocations}
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    to={`/account/${id}/publication/${publication.id}`} 
                    className="bg-presspage-teal hover:bg-opacity-90 text-white px-3 py-1 rounded inline-flex items-center text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
