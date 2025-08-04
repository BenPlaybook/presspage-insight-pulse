import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ShareOptionsDialog } from '../ShareOptionsDialog';

type AccountInsightsProps = {
  internalSummary: string;
  customerSummary: string;
  accountId: string;
  summaryId: string;
  accountName?: string;
  aiSummary?: any;
  customerAiSummary?: any;
};

const AccountInsights = ({ 
  internalSummary, 
  customerSummary, 
  accountId, 
  summaryId, 
  accountName = "Account", 
  aiSummary, 
  customerAiSummary 
}: AccountInsightsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeVersion, setActiveVersion] = useState<string>('internal');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const handleOpenShareDialog = () => {
    setIsShareDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header - Always visible */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-presspage-teal to-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-presspage-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Account Insights</h2>
              <p className="text-sm text-gray-500 italic">This is an AI Powered Summary of the account data</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <ToggleGroup type="single" value={activeVersion} onValueChange={(value) => value && setActiveVersion(value)}>
                  <ToggleGroupItem 
                    value="internal" 
                    aria-label="Internal version" 
                    className="text-sm bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 data-[state=on]:bg-presspage-teal/20 data-[state=on]:border-presspage-teal data-[state=on]:text-presspage-teal"
                  >
                    Internal
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="customer" 
                    aria-label="Customer version" 
                    className="text-sm bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 data-[state=on]:bg-white data-[state=on]:border-gray-300 data-[state=on]:text-gray-900"
                  >
                    Customer
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <Button
                onClick={handleOpenShareDialog}
                size="sm"
                className="bg-presspage-teal hover:bg-presspage-teal/90 text-white border-0 transition-all duration-200"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {activeVersion === 'internal' 
                    ? (aiSummary || internalSummary) 
                    : (customerAiSummary || customerSummary)
                  }
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ShareOptionsDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        accountId={accountId}
        summaryId={summaryId}
        accountName={accountName}
        summaryType={activeVersion as 'internal' | 'customer'}
        summaryContent={activeVersion === 'internal' 
          ? (aiSummary || internalSummary) 
          : (customerAiSummary || customerSummary)
        }
      />
    </div>
  );
};

export default AccountInsights; 