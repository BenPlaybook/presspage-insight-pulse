import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Publication } from '@/types/publications';
import { generatePublicationTitle, cleanPublicationContent, formatPublicationContent } from '@/utils/publicationUtils';
import { RelatedPublicationDetailModal } from './RelatedPublicationDetailModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RelatedPublicationsProps {
  publications: Publication[];
  accountId: string;
}

export const RelatedPublications: React.FC<RelatedPublicationsProps> = ({ publications, accountId }) => {
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const publicationsPerPage = 5;
  const totalPages = Math.ceil(publications.length / publicationsPerPage);
  const startIndex = (currentPage - 1) * publicationsPerPage;
  const endIndex = startIndex + publicationsPerPage;
  const currentPublications = publications.slice(startIndex, endIndex);

  const handleViewDetails = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPublication(null);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (!publications || publications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Publication Related</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No related publications found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Publication Related</CardTitle>
            {publications.length > 0 && (
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, publications.length)} of {publications.length}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentPublications.length > 0 ? (
            <div className="space-y-4">
              {currentPublications.map((publication) => (
                <div key={publication.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {generatePublicationTitle(publication)}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        Detected: {new Date(publication.detectedDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {publication.content ? formatPublicationContent(cleanPublicationContent(publication.content)) : 'No content available'}
                      </p>
                      {publication.relationship?.label && (
                        <p className="text-xs text-blue-600 mt-1">
                          Type: {publication.relationship.label}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(publication)}
                      className="ml-4 text-presspage-teal hover:text-presspage-teal/80 font-medium"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No related publications found.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && publications.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RelatedPublicationDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        publication={selectedPublication}
        accountId={accountId}
      />
    </>
  );
}; 