
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ReactMarkdown from 'react-markdown';

type AISummaryProps = {
  internalSummary: string;
  customerSummary: string;
};

const AISummary = ({ internalSummary, customerSummary }: AISummaryProps) => {
  const [activeVersion, setActiveVersion] = React.useState<string>('internal');

  return (
    <div className="bg-presspage-blue text-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">AI Summary</h2>
        <ToggleGroup type="single" value={activeVersion} onValueChange={(value) => value && setActiveVersion(value)}>
          <ToggleGroupItem value="internal" aria-label="Internal version" className="text-sm data-[state=on]:bg-white/20">
            Internal
          </ToggleGroupItem>
          <ToggleGroupItem value="customer" aria-label="Customer version" className="text-sm data-[state=on]:bg-white/20">
            Customer
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>
          {activeVersion === 'internal' ? internalSummary : customerSummary}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default AISummary;
