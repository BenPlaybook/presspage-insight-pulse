
import React from 'react';
import { Publication } from '@/types/publications';
import { Card, CardContent } from '@/components/ui/card';

interface ArticleInformationProps {
  publication: Publication;
}

export const ArticleInformation: React.FC<ArticleInformationProps> = ({ publication }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Article Information</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Full Content</h4>
            <p className="mt-1 text-gray-900">{publication.content}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Source URL</h4>
              <p className="mt-1 text-gray-900">{publication.source}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Classification</h4>
              <p className="mt-1 text-gray-900">{publication.classification}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Detection Date</h4>
              <p className="mt-1 text-gray-900">
                {new Date(publication.detectedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Tracking Period</h4>
              <p className="mt-1 text-gray-900">
                {new Date(publication.trackingPeriod?.start || '').toLocaleDateString()} - {new Date(publication.trackingPeriod?.end || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
