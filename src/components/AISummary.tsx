
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
      
      // Trigger backend workflow for PDF generation and email
      const response = await fetch('https://presspage.app.n8n.cloud/webhook/share-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          summaryId,
          shareUrl,
          summaryType: activeVersion,
          summaryContent: activeVersion === 'internal' ? internalSummary : customerSummary,
        }),
      });

      if (response.ok) {
        toast({
          title: "Summary Shared Successfully",
          description: "Link copied to clipboard and PDF sent to your email.",
        });
      } else {
        throw new Error('Failed to process share request');
      }
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
            variant="outline"
            size="sm"
            className="text-white border-white/20 hover:bg-white/10 hover:text-white"
          >
            {isSharing ? (
              <Copy className="h-4 w-4 animate-spin" />
            ) : (
              <Share className="h-4 w-4" />
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
