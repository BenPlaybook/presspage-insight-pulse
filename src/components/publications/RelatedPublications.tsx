import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeTab, setActiveTab] = useState('all');

  // Filter publications based on active tab
  const filteredPublications = useMemo(() => {
    // Debug: Log all publication labels to see what values we're getting
    console.log('🔍 All publication labels:', publications.map(pub => ({ id: pub.id, label: pub.label })));
    
    switch (activeTab) {
      case 'publications':
        return publications.filter(pub => {
          const label = pub.label?.toLowerCase()?.trim();
          return label === 'article';
        });
      case 'social':
        return publications.filter(pub => {
          const label = pub.label?.toLowerCase()?.trim();
          // Show publications that have a label but it's not "article"
          return label && label !== 'article';
        });
      case 'all':
      default:
        return publications;
    }
  }, [publications, activeTab]);

  const publicationsPerPage = 5;
  const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);
  const startIndex = (currentPage - 1) * publicationsPerPage;
  const endIndex = startIndex + publicationsPerPage;
  const currentPublications = filteredPublications.slice(startIndex, endIndex);

  // Reset to first page when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
            {filteredPublications.length > 0 && (
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredPublications.length)} of {filteredPublications.length}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Publications</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
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
            </TabsContent>
            
            <TabsContent value="publications" className="mt-6">
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
                  <p className="text-gray-500 text-sm">No article publications found.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="social" className="mt-6">
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
                  <p className="text-gray-500 text-sm">No social media publications found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination Controls */}
          {totalPages > 1 && filteredPublications.length > 0 && (
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