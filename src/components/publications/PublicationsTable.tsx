
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
import { Publication } from '@/types/publications';
import { PublicationStatusBadge } from './PublicationStatusBadge';
import { Eye } from 'lucide-react';

interface PublicationsTableProps {
  publications: Publication[];
}

export const PublicationsTable: React.FC<PublicationsTableProps> = ({ 
  publications 
}) => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Article Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Detected Date</TableHead>
            <TableHead className="hidden sm:table-cell">SERP Position</TableHead>
            <TableHead className="hidden md:table-cell">Social Coverage</TableHead>
            <TableHead className="hidden md:table-cell">Distribution Time</TableHead>
            <TableHead className="hidden lg:table-cell">Total Locations</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {publications.map((publication) => (
            <TableRow key={publication.id}>
              <TableCell className="font-medium max-w-[200px] truncate">
                {publication.title}
              </TableCell>
              <TableCell>
                <PublicationStatusBadge status={publication.status} />
              </TableCell>
              <TableCell>
                {new Date(publication.detectedDate).toLocaleDateString()}
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
  );
};
