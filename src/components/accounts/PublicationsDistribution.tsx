
type PublicationsDistributionProps = {
  financial: number;
  nonFinancial: number;
};

export const PublicationsDistribution = ({ financial, nonFinancial }: PublicationsDistributionProps) => {
  const total = financial + nonFinancial;
  const financialPercentage = (financial / total) * 100;
  const nonFinancialPercentage = (nonFinancial / total) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-900">
        {total}
      </span>
      <div className="flex-1 h-2 bg-gray-200 rounded">
        <div 
          className="h-full rounded" 
          style={{ 
            width: `${financialPercentage}%`,
            backgroundColor: '#F2FCE2'
          }}
        />
        <div 
          className="h-full rounded" 
          style={{ 
            width: `${nonFinancialPercentage}%`,
            backgroundColor: '#F1F0FB',
            marginTop: '-8px'
          }}
        />
      </div>
      <div className="flex gap-2 text-xs">
        <span className="flex items-center">
          <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: '#F2FCE2'}} />
          Financial: {financial}
        </span>
        <span className="flex items-center">
          <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: '#F1F0FB'}} />
          Non-Financial: {nonFinancial}
        </span>
      </div>
    </div>
  );
};
