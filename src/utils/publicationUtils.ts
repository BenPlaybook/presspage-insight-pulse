import { Publication } from '@/types/publications';

// Helper function to generate appropriate titles for social media posts
export const generatePublicationTitle = (publication: Publication): string => {
  const detectedDate = new Date(publication.detectedDate);
  const formattedDate = detectedDate.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  
  // Check if it's a social media post based on source or content
  const isSocialMedia = publication.source?.includes('linkedin.com') || 
                       publication.source?.includes('twitter.com') ||
                       publication.source?.includes('x.com') ||
                       publication.title?.toLowerCase().includes('linkedin') ||
                       publication.title?.toLowerCase().includes('twitter');
  
  if (isSocialMedia) {
    if (publication.source?.includes('linkedin.com')) {
      return `LinkedIn Post ${formattedDate}`;
    } else if (publication.source?.includes('twitter.com') || publication.source?.includes('x.com')) {
      return `Twitter Post ${formattedDate}`;
    } else {
      return `Social Media Post ${formattedDate}`;
    }
  }
  
  // For regular articles, use the original title
  return publication.title;
}; 