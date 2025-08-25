import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { PublishingVelocityData } from '@/services/prHealthMetricsService';

interface PublishingVelocityDebugProps {
  data: PublishingVelocityData;
  isVisible?: boolean;
}

const PublishingVelocityDebug: React.FC<PublishingVelocityDebugProps> = ({ 
  data, 
  isVisible = false 
}) => {
  if (!isVisible) return null;

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    const days = hours / 24;
    return `${days.toFixed(1)} days`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-lg text-orange-800">Publishing Velocity Debug</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.averageDelay.toFixed(1)}h
            </div>
            <div className="text-sm text-orange-700">Average Delay</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.channelFactor.toFixed(1)}h
            </div>
            <div className="text-sm text-orange-700">Channel Factor</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {data.totalScore.toFixed(1)}h
            </div>
            <div className="text-sm text-orange-700">Total Score</div>
          </div>
        </div>

        {/* Score y porcentaje */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-orange-800">PR Health Score:</span>
          </div>
          <Badge variant="outline" className="text-orange-700 border-orange-300">
            {data.scorePercentage}%
          </Badge>
        </div>

        {/* Canales detallados */}
        {data.channels.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-800 mb-2">Channel Details:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.channels.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      {channel.sourceType}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-orange-600">
                      {formatHours(channel.delay)}
                    </div>
                    <div className="text-xs text-orange-500">
                      {formatDate(channel.publicationDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información del cálculo */}
        <div className="text-xs text-orange-600 bg-white p-2 rounded border border-orange-200">
          <strong>Calculation:</strong> Average Delay ({data.averageDelay.toFixed(1)}h) + Channel Factor ({data.channelFactor.toFixed(1)}h) = {data.totalScore.toFixed(1)}h
          <br />
          <strong>Score:</strong> {data.totalScore.toFixed(1)}h → {data.scorePercentage}% (0-24h=100%, 24-48h=80%, 48-72h=60%, 72h+=40%)
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishingVelocityDebug;
