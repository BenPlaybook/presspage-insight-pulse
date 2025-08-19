import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, BarChart3, TrendingUp, Users, Zap } from 'lucide-react';

interface UnlockFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactSales: () => void;
  onLogin: () => void;
}

export const UnlockFeaturesModal: React.FC<UnlockFeaturesModalProps> = ({
  isOpen,
  onClose,
  onContactSales,
  onLogin,
}) => {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Competitor Analytics',
      description: 'Full access to competitor data and performance metrics'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Advanced Insights',
      description: 'Detailed performance analysis and trend predictions'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Collaboration',
      description: 'Share insights and collaborate with your team'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Updates',
      description: 'Live data updates and instant notifications'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Lock className="w-6 h-6 text-presspage-blue" />
            Unlock Competitor Insights
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">
              Get full access to competitor data and analytics
            </p>
            <Badge variant="secondary" className="text-sm">
              Premium Feature
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-presspage-blue/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-presspage-blue mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-r from-presspage-blue/5 to-presspage-teal/5 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete competitor benchmarking data</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Custom alerts and notifications</li>
              <li>• Priority customer support</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onContactSales}
              className="flex-1 bg-presspage-blue hover:bg-presspage-blue/90"
            >
              Contact Sales to Unlock
            </Button>
            <Button 
              onClick={onLogin}
              variant="outline"
              className="flex-1"
            >
              Sign In
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Already have an account? <button onClick={onLogin} className="text-presspage-blue hover:underline">Sign in here</button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
