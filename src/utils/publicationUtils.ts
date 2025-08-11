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

/**
 * Cleans and formats publication content that comes in JSON format
 * @param content - The raw content string that may contain JSON
 * @returns Clean, readable content string
 */
export const cleanPublicationContent = (content: string): string => {
  if (!content) return '';

  console.log('🔍 Original content:', content.substring(0, 200) + '...');

  try {
    // Check if content is wrapped in JSON format
    if (content.includes('```json') && content.includes('```')) {
      console.log('📦 Detected JSON format with ```json');
      
      // First, clean the content to remove escaped characters that might interfere with regex
      const cleanedForParsing = content
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r');
      
      console.log('🧹 Cleaned for parsing:', cleanedForParsing.substring(0, 200) + '...');
      
      // Extract JSON content between ```json and ```
      const jsonMatch = cleanedForParsing.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      console.log('🔍 JSON match result:', jsonMatch ? 'Found' : 'Not found');
      if (jsonMatch) {
        console.log('🔍 JSON match groups:', jsonMatch.length);
      }
      
             if (jsonMatch) {
         const jsonContent = jsonMatch[1];
         console.log('📋 Extracted JSON content:', jsonContent.substring(0, 200) + '...');
         
         // Clean the JSON content before parsing to handle escaped characters
         const cleanedJsonContent = cleanEscapedCharacters(jsonContent);
         console.log('🧹 Cleaned JSON content for parsing:', cleanedJsonContent.substring(0, 200) + '...');
         
         try {
           const parsed = JSON.parse(cleanedJsonContent);
           
           // If it has a content property, return that
           if (parsed.content) {
             console.log('🎯 Found content property, content is already clean');
             console.log('✨ Final content:', parsed.content.substring(0, 200) + '...');
             return parsed.content;
           }
           
           // If no content property, return the full parsed object as string
           return JSON.stringify(parsed, null, 2);
         } catch (parseError) {
           console.log('❌ JSON parsing failed even after cleaning:', parseError);
           // If JSON parsing still fails, try to extract content manually
           const contentMatch = cleanedJsonContent.match(/"content":\s*"([^"]*(?:\\.[^"]*)*)"/);
           if (contentMatch) {
             console.log('🔧 Manually extracted content from JSON');
             const manualContent = cleanEscapedCharacters(contentMatch[1]);
             console.log('✨ Manually cleaned content:', manualContent.substring(0, 200) + '...');
             return manualContent;
           }
           // Last resort: return the cleaned JSON content
           return cleanedJsonContent;
         }
       } else {
         console.log('❌ No JSON match found in ```json format');
       }
    }

    // Check if content is a JSON string
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.content) {
          console.log('🎯 Found content property in JSON string, cleaning escaped characters...');
          const cleaned = cleanEscapedCharacters(parsed.content);
          console.log('✨ Cleaned content from JSON string:', cleaned.substring(0, 200) + '...');
          return cleaned;
        }
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        console.log('❌ JSON parsing failed:', error);
        // If JSON parsing fails, return original content
        return content;
      }
    }

    // If content contains escaped characters, try to unescape them
    if (content.includes('\\n') || content.includes('\\"')) {
      console.log('🔧 Content contains escaped characters, cleaning...');
      const cleaned = content
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r');
      console.log('✨ Cleaned escaped characters:', cleaned.substring(0, 200) + '...');
      return cleaned;
    }

    console.log('📝 No special formatting detected, returning original content');
    // Return original content if no special formatting detected
    return content;
  } catch (error) {
    console.warn('Error cleaning publication content:', error);
    return content;
  }
};

/**
 * Cleans escaped characters from content strings
 * @param content - The content string that may contain escaped characters
 * @returns Content with escaped characters converted to their actual characters
 */
const cleanEscapedCharacters = (content: string): string => {
  if (!content) return '';

  return content
    // Convert escaped newlines to actual newlines
    .replace(/\\n/g, '\n')
    // Convert escaped quotes to actual quotes
    .replace(/\\"/g, '"')
    // Convert escaped tabs to actual tabs
    .replace(/\\t/g, '\t')
    // Convert escaped carriage returns to actual carriage returns
    .replace(/\\r/g, '\r')
    // Convert escaped backslashes to actual backslashes
    .replace(/\\\\/g, '\\')
    // Remove trailing backslashes at the end of lines
    .replace(/\\\s*\n/g, '\n')
    .replace(/\\\s*$/g, '');
};

/**
 * Formats content for display with proper line breaks and spacing
 * @param content - The cleaned content string
 * @returns Formatted content with proper spacing
 */
export const formatPublicationContent = (content: string): string => {
  if (!content) return '';

  return content
    // Remove any remaining trailing backslashes
    .replace(/\\\s*$/gm, '')
    // Replace multiple newlines with double newlines for better readability
    .replace(/\n\s*\n/g, '\n\n')
    // Remove excessive whitespace at the beginning of lines
    .replace(/^\s+/gm, '')
    // Trim extra whitespace
    .trim();
}; 