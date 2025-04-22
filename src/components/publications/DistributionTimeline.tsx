
import React from 'react';
import { Twitter, Linkedin } from 'lucide-react';
import { Publication } from '@/types/publications';

interface DistributionTimelineProps {
  publication: Publication;
}

export const DistributionTimeline: React.FC<DistributionTimelineProps> = ({ publication }) => {
  const platforms = publication.socialCoverage.platforms;
  const sortedPlatforms = platforms.sort((a, b) => {
    if (!a.matched) return 1;
    if (!b.matched) return -1;
    return parseFloat(a.timeDifference) - parseFloat(b.timeDifference);
  });
  
  return (
    <div className="py-4">
      <h3 className="text-lg font-medium mb-4">Distribution Timeline</h3>
      
      <div className="relative">
        <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200"></div>
        
        <div className="relative pl-8 pb-6">
          <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-[#122F4A] flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
          <div>
            <p className="font-medium">Original Publication</p>
            <p className="text-sm text-gray-500">
              {new Date(publication.detectedDate).toLocaleString()}
            </p>
          </div>
        </div>
        
        {sortedPlatforms.map((platform, index) => (
          platform.matched && (
            <div key={platform.platform} className="relative pl-8 pb-6">
              <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-presspage-teal flex items-center justify-center">
                {platform.platform === 'Twitter' && <Twitter size={12} color="white" />}
                {platform.platform === 'LinkedIn' && <Linkedin size={12} color="white" />}
              </div>
              <div>
                <p className="font-medium">{platform.platform}</p>
                <p className="text-sm text-gray-500">
                  {platform.postDate} ({platform.timeDifference} after publication)
                </p>
              </div>
            </div>
          )
        ))}
        
        {publication.newswireDistribution?.map((newswire, index) => (
          <div key={index} className="relative pl-8 pb-6">
            <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
            <div>
              <p className="font-medium">{newswire.service}</p>
              <p className="text-sm text-gray-500">
                {newswire.time} • Potential Reach: {newswire.reach.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
