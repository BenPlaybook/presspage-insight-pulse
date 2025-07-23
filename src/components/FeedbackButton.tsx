import React from 'react';
import { MessageSquare } from 'lucide-react';

export const FeedbackButton: React.FC = () => {
  const handleClick = () => {
    window.open('https://presspage.app.n8n.cloud/form/827752e6-d783-44aa-8505-88c8aca0ccf4', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 text-sm"
    >
      <MessageSquare className="h-4 w-4" />
      Leave Feedback
    </button>
  );
};