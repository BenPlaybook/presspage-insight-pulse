import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Publication } from '@/types/publications';
import { generatePublicationTitle } from '@/utils/publicationUtils';

interface RelatedPublicationsProps {
  publications: Publication[];
  accountId: string;
}

export const RelatedPublications: React.FC<RelatedPublicationsProps> = ({ publications, accountId }) => {
  if (!publications || publications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Related Publications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No related publications found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Related Publications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {publications.map((publication) => (
            <div key={publication.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {generatePublicationTitle(publication)}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Detected: {new Date(publication.detectedDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {publication.content || 'No content available'}
                  </p>
                </div>
                <Link
                  to={`/account/${accountId}/publication/${publication.id}`}
                  className="ml-4 text-sm text-presspage-teal hover:text-presspage-teal/80 font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 