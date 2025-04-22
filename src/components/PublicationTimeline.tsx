
import React from 'react';

type Publication = {
  id: string;
  title: string;
  publishDate: string;
  serpPosition: number;
  distributionTime: string;
  channels: string[];
};

// Mock data
const publications: Publication[] = [
  {
    id: '1',
    title: 'Q3 2024 Financial Results',
    publishDate: 'Jan 15, 2025',
    serpPosition: 1,
    distributionTime: '0.8 hours',
    channels: ['Newsroom', 'Twitter', 'LinkedIn']
  },
  {
    id: '2',
    title: 'New Product Launch Announcement',
    publishDate: 'Jan 12, 2025',
    serpPosition: 2,
    distributionTime: '1.3 hours',
    channels: ['Newsroom', 'Twitter']
  },
  {
    id: '3',
    title: 'Partnership with Leading Tech Company',
    publishDate: 'Jan 8, 2025',
    serpPosition: 4,
    distributionTime: '1.8 hours',
    channels: ['Newsroom', 'LinkedIn', 'Facebook']
  }
];

export const PublicationTimeline = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Publication Timeline</h3>
      
      <div className="space-y-8">
        {publications.map((publication, index) => (
          <div key={publication.id} className="relative pl-8">
            {/* Timeline dot and line */}
            <div className="absolute left-0 top-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-presspage-teal text-white flex items-center justify-center text-xs">
                {index + 1}
              </div>
              {index < publications.length - 1 && (
                <div className="absolute top-6 left-3 w-0.5 h-16 bg-gray-200"></div>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-base font-medium text-presspage-blue">{publication.title}</h4>
              <div className="mt-2 text-sm text-gray-600">
                <p>Published: {publication.publishDate} • SERP Position: #{publication.serpPosition}</p>
              </div>
              
              {/* Distribution timeline visualization */}
              <div className="mt-3">
                <div className="h-2 bg-gray-100 rounded-full w-full relative">
                  <div 
                    className="absolute h-2 bg-presspage-teal rounded-full" 
                    style={{ width: `${Math.min(parseInt(publication.distributionTime) * 30, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                  <span>Distributed: {publication.distributionTime} Channels: {publication.channels.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
