
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
    <div className="border-0 shadow-lg bg-gradient-to-br from-presspage-blue via-presspage-blue/90 to-presspage-blue overflow-hidden relative rounded-lg">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-presspage-teal via-white to-presspage-teal"></div>
      
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-presspage-teal to-white rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-presspage-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Summary</h2>
            <p className="text-presspage-teal text-sm">Powered by Advanced Analytics</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <ToggleGroup type="single" value={activeVersion} onValueChange={(value) => value && setActiveVersion(value)}>
              <ToggleGroupItem 
                value="internal" 
                aria-label="Internal version" 
                className="text-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 data-[state=on]:bg-presspage-teal/20 data-[state=on]:border-presspage-teal data-[state=on]:text-presspage-teal"
              >
                Internal
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="customer" 
                aria-label="Customer version" 
                className="text-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 data-[state=on]:bg-white/30 data-[state=on]:border-white data-[state=on]:text-white"
              >
                Customer
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Button
            onClick={handleOpenShareDialog}
            size="sm"
            className="bg-gradient-to-r from-presspage-teal to-white hover:from-presspage-teal/90 hover:to-white/90 text-presspage-blue border-0 transition-all duration-200 transform hover:scale-105"
          >
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-sm text-white leading-relaxed">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>
              {activeVersion === 'internal' ? internalSummary : customerSummary}
            </ReactMarkdown>
          </div>
        </div>
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
