
import React from 'react';
import { Twitter, Linkedin, CircleCheck, CircleX, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SocialMatch } from '@/types/publications';

interface SocialCoverageTableProps {
  platforms: SocialMatch[];
}

export const SocialCoverageTable: React.FC<SocialCoverageTableProps> = ({ platforms }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Platform</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Time Difference</TableHead>
          <TableHead>Post Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {platforms.map((platform, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-2">
                {platform.platform === 'Twitter' && (
                  <div className="bg-blue-400 p-1 rounded">
                    <Twitter size={16} color="white" />
                  </div>
                )}
                {platform.platform === 'LinkedIn' && (
                  <div className="bg-blue-700 p-1 rounded">
                    <Linkedin size={16} color="white" />
                  </div>
                )}
                {platform.platform}
              </div>
            </TableCell>
            <TableCell>
              {platform.matched ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CircleCheck size={16} />
                  <span>Matched</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-500">
                  <CircleX size={16} />
                  <span>Not Found</span>
                </div>
              )}
            </TableCell>
            <TableCell>
              {platform.matched ? (
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-gray-400" />
                  <span>{platform.timeDifference}</span>
                </div>
              ) : 'N/A'}
            </TableCell>
            <TableCell>{platform.matched ? platform.postDate : 'N/A'}</TableCell>
            <TableCell className="text-right">
              {platform.matched && (
                <a 
                  href={platform.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-presspage-teal hover:text-opacity-80"
                >
                  View
                </a>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
