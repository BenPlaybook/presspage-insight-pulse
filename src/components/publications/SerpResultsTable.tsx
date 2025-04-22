
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SerpResult } from '@/types/publications';

interface SerpResultsTableProps {
  results: SerpResult[];
}

export const SerpResultsTable: React.FC<SerpResultsTableProps> = ({ results }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Region</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Detected Date</TableHead>
          <TableHead>URL</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result, index) => (
          <TableRow key={index}>
            <TableCell>{result.region}</TableCell>
            <TableCell>{`#${result.position}`}</TableCell>
            <TableCell>{new Date(result.detected).toLocaleDateString()}</TableCell>
            <TableCell className="max-w-[200px] truncate">{result.url}</TableCell>
            <TableCell className="text-right">
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-presspage-teal hover:text-opacity-80"
              >
                View
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
