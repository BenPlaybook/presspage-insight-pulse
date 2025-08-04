
type PublicationsDistributionProps = {
  financial: number;
  nonFinancial: number;
};

export const PublicationsDistribution = ({ financial, nonFinancial }: PublicationsDistributionProps) => {
  const total = financial + nonFinancial;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-900">
        {total}
      </span>
      <div className="flex gap-2 text-xs">
        <span className="flex items-center">
          <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: '#10B981'}} />
          Financial: {financial}
        </span>
        <span className="flex items-center">
          <div className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: '#EF4444'}} />
          Non-Financial: {nonFinancial}
        </span>
      </div>
    </div>
  );
};
