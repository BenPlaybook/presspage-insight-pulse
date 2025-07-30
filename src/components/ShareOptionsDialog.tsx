import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pdf } from '@react-pdf/renderer';
import { PDFSummaryDocument } from './PDFSummaryDocument';

type ShareOptionsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  summaryId: string;
  accountName: string;
  summaryType: 'internal' | 'customer';
  summaryContent: string;
};

export const ShareOptionsDialog = ({
  isOpen,
  onClose,
  accountId,
  summaryId,
  accountName,
  summaryType,
  summaryContent,
}: ShareOptionsDialogProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [isSharingLink, setIsSharingLink] = React.useState(false);
  const { toast } = useToast();

  const handleShareLink = async () => {
    setIsSharingLink(true);
    
    try {
      // Generate unique URL
      const shareUrl = `https://presspage-insight-pulse.lovable.app/account/${accountId}/summary/${summaryId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      // Trigger backend workflow for email sharing
      await fetch('https://presspage.app.n8n.cloud/webhook/share-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          accountId,
          summaryId,
          shareUrl,
          summaryType,
          summaryContent,
          timestamp: new Date().toISOString(),
          action: 'share_link',
        }),
      });

      toast({
        title: "Link Shared Successfully",
        description: "Link copied to clipboard and shared via email.",
      });
      
      onClose();
    } catch (error) {
      console.error('Share link error:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharingLink(false);
    }
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Generate PDF document
      const pdfDocument = PDFSummaryDocument({
        accountName,
        summaryType,
        summaryContent,
        generatedDate: new Date().toLocaleDateString(),
      });
      
      // Create blob and download
      const blob = await pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${accountName}-AI-Summary-${summaryType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Exported Successfully",
        description: "AI Summary has been downloaded as PDF.",
      });
      
      onClose();
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share AI Summary</DialogTitle>
          <DialogDescription>
            Choose how you would like to share this AI summary.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleShareLink}
            disabled={isSharingLink}
            className="w-full justify-start"
            variant="outline"
          >
            {isSharingLink ? (
              <Copy className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Share className="h-4 w-4 mr-2" />
            )}
            {isSharingLink ? 'Sharing Link...' : 'Share Link'}
          </Button>
          
          <Button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="w-full justify-start"
            variant="outline"
          >
            {isGeneratingPDF ? (
              <Download className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGeneratingPDF ? 'Generating PDF...' : 'Export to PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};