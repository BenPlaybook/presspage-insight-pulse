
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ShareOptionsDialog } from './ShareOptionsDialog';

type AISummaryProps = {
  internalSummary: string;
  customerSummary: string;
  accountId: string;
  summaryId: string;
  accountName?: string;
};

const AISummary = ({ internalSummary, customerSummary, accountId, summaryId, accountName = "Account" }: AISummaryProps) => {
  const [activeVersion, setActiveVersion] = React.useState<string>('internal');
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);

  const handleOpenShareDialog = () => {
    setIsShareDialogOpen(true);
  };

  return (
    <div className="bg-presspage-blue text-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">AI Summary</h2>
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" value={activeVersion} onValueChange={(value) => value && setActiveVersion(value)}>
            <ToggleGroupItem value="internal" aria-label="Internal version" className="text-sm data-[state=on]:bg-white/20">
              Internal
            </ToggleGroupItem>
            <ToggleGroupItem value="customer" aria-label="Customer version" className="text-sm data-[state=on]:bg-white/20">
              Customer
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            onClick={handleOpenShareDialog}
            size="sm"
            className="bg-white/10 text-white border-0 hover:bg-white/20 hover:text-white transition-all duration-200"
          >
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>
          {activeVersion === 'internal' ? internalSummary : customerSummary}
        </ReactMarkdown>
      </div>
      
      <ShareOptionsDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        accountId={accountId}
        summaryId={summaryId}
        accountName={accountName}
        summaryType={activeVersion as 'internal' | 'customer'}
        summaryContent={activeVersion === 'internal' ? internalSummary : customerSummary}
      />
    </div>
  );
};

export default AISummary;
