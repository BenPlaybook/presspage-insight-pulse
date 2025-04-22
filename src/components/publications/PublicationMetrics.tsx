
import React from 'react';
import { Publication } from '@/types/publications';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, FileArchive, DollarSign, MapPin, Map, Database, Newspaper, Link, Twitter, Linkedin } from 'lucide-react';

interface PublicationMetricsProps {
  publication: Publication;
}

export const PublicationMetrics: React.FC<PublicationMetricsProps> = ({ publication }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Article Title</p>
              <p className="font-medium">{publication.title}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Detected Date</p>
              <p className="font-medium">{new Date(publication.detectedDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <FileArchive className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Source</p>
              <p className="font-medium">{publication.source}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Classification</p>
              <p className="font-medium">{publication.classification}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Total Locations</p>
              <p className="font-medium">{publication.totalLocations}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Map className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">SERP Position</p>
              <p className="font-medium">NA: #{publication.serpPosition.na} / EU: #{publication.serpPosition.eu}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Twitter className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Twitter Match</p>
              <p className="font-medium">
                {publication.socialMatches?.twitter?.matched ? 
                  `Matched (${publication.socialMatches.twitter.timeDifference} delay)` : 
                  'Not matched'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Linkedin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">LinkedIn Match</p>
              <p className="font-medium">
                {publication.socialMatches?.linkedin?.matched ? 
                  `Matched (${publication.socialMatches.linkedin.timeDifference} delay)` : 
                  'Not matched'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Database className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Newswires</p>
              <p className="font-medium">{publication.newswireDistribution?.length || 0}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
