import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Clock, Globe } from 'lucide-react';
import { Publication } from '@/types/publications';
import { generatePublicationTitle, cleanPublicationContent, formatPublicationContent } from '@/utils/publicationUtils';

interface RelatedPublicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: Publication | null;
  accountId: string;
}

export const RelatedPublicationDetailModal: React.FC<RelatedPublicationDetailModalProps> = ({
  isOpen,
  onClose,
  publication,
  accountId
}) => {
  if (!publication) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPublicationStatus = (publication: Publication) => {
    if (publication.financial_classification === 'Financial') {
      return { label: 'Financial', variant: 'default' as const };
    }
    return { label: 'Non-Financial', variant: 'secondary' as const };
  };

  const status = getPublicationStatus(publication);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Publication Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {generatePublicationTitle(publication)}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {publication.sentiment && (
                    <Badge variant="outline">
                      {publication.sentiment}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="ml-4"
              >
                Close
              </Button>
            </div>

            {/* Publication URL */}
            {publication.article_url && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <a
                  href={publication.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-presspage-teal hover:text-presspage-teal/80 text-sm flex items-center gap-1"
                >
                  View Original Article
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Dates Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Publication Date:</span>
              </div>
              <p className="text-sm text-gray-900">
                {publication.publication_date ? formatDate(publication.publication_date) : 'Not available'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Detected Date:</span>
              </div>
              <p className="text-sm text-gray-900">
                {publication.detectedDate ? formatDate(publication.detectedDate) : 'Not available'}
              </p>
            </div>
          </div>

          {/* Content */}
          {publication.content && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Content</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {(() => {
                    console.log('🎭 Modal: Processing content for publication:', publication.id);
                    const cleaned = cleanPublicationContent(publication.content);
                    const formatted = formatPublicationContent(cleaned);
                    console.log('🎭 Modal: Final formatted content:', formatted.substring(0, 200) + '...');
                    return formatted;
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {publication.summary && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Summary</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 leading-relaxed">
                  {publication.summary}
                </p>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publication.author && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Author</h3>
                <p className="text-sm text-gray-600">{publication.author}</p>
              </div>
            )}

            {publication.source && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Source</h3>
                <p className="text-sm text-gray-600">{publication.source}</p>
              </div>
            )}

            {publication.language && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Language</h3>
                <p className="text-sm text-gray-600">{publication.language}</p>
              </div>
            )}

            {publication.read_time && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Read Time</h3>
                <p className="text-sm text-gray-600">{publication.read_time} minutes</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 