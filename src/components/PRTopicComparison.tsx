import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, User } from 'lucide-react';

const yourTopics = ['Sustainability', 'Tires', 'EV', 'China'];
const competitorTopics = ['Sustainability', 'Formula 1', 'EV', 'Engines'];

export const PRTopicComparison = () => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Your PR Topics */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-presspage-blue" />
          <h4 className="font-medium text-presspage-blue">Your PR Topics</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {yourTopics.map((topic, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="bg-presspage-blue/10 text-presspage-blue hover:bg-presspage-blue/20"
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Competitor PR Topics */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium text-gray-600">Competitor PR Topics</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {competitorTopics.map((topic, index) => {
            const isCommon = yourTopics.includes(topic);
            return (
              <Badge 
                key={index} 
                variant={isCommon ? "default" : "outline"}
                className={isCommon 
                  ? "bg-presspage-teal text-white" 
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }
              >
                {topic}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};