
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Share, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

type AISummaryProps = {
  internalSummary: string;
  customerSummary: string;
  accountId: string;
  summaryId: string;
};

const AISummary = ({ internalSummary, customerSummary, accountId, summaryId }: AISummaryProps) => {
  const [activeVersion, setActiveVersion] = React.useState<string>('internal');
  const [isSharing, setIsSharing] = React.useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Generate unique URL
      const shareUrl = `https://presspage-insight-pulse.lovable.app/account/${accountId}/summary/${summaryId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Trigger backend workflow for PDF generation and email with CORS handling
      const response = await fetch('https://presspage.app.n8n.cloud/webhook/share-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Handle CORS
        body: JSON.stringify({
          accountId,
          summaryId,
          shareUrl,
          summaryType: activeVersion,
          summaryContent: activeVersion === 'internal' ? internalSummary : customerSummary,
          timestamp: new Date().toISOString(),
        }),
      });

      // Since we're using no-cors, we can't check response status
      // Instead, we'll assume success and provide appropriate feedback
      toast({
        title: "Summary Shared Successfully",
        description: "Link copied to clipboard and PDF request sent.",
      });
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
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
            onClick={handleShare}
            disabled={isSharing}
            size="sm"
            className="bg-white/10 text-white border-0 hover:bg-white/20 hover:text-white disabled:opacity-50 transition-all duration-200"
          >
            {isSharing ? (
              <Copy className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Share className="h-4 w-4 mr-1" />
            )}
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        </div>
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
