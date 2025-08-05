
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

type HeaderProps = {
  variant?: 'default' | 'dashboard' | 'account' | 'benchmark';
  title?: string;
};

export const Header = ({ variant = 'default', title }: HeaderProps) => {
  const location = useLocation();
  const { user, signOut } = useAuthContext();
  
  return (
    <header className="bg-presspage-blue text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">
          <Link to="/">Content Analyzer</Link>
          <span className="text-xs bg-presspage-teal text-white px-2 py-0.5 rounded ml-2 font-medium">Beta</span>
          {variant === 'account' && (
            <span className="text-presspage-teal font-normal text-sm ml-2">
              {title}
            </span>
          )}
          {variant === 'benchmark' && (
            <span className="text-presspage-teal font-normal text-sm ml-2">
              Benchmark
            </span>
          )}
        </h1>
        {variant === 'default' && <span className="text-xs text-gray-400">by Presspage</span>}
      </div>
      <div className="flex gap-2 items-center">
        {user && (
          <div className="flex items-center gap-2 mr-4">
            <Link
              to="/profile"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              {user.email}
            </Link>
            <button
              onClick={signOut}
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
        {location.pathname === '/' && (
          <>
            <Link to="/account/new" className="bg-presspage-teal text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center gap-1">
              + Add Account
            </Link>
            <Link to="/benchmark" className="bg-transparent border border-white text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-white hover:bg-opacity-10 transition-colors">
              Benchmark
            </Link>
          </>
        )}
        {location.pathname.includes('/account/') && !location.pathname.includes('/account/new') && (
          <button className="bg-presspage-teal text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors">
            Run Analysis
          </button>
        )}
        {location.pathname === '/benchmark' && (
          <button 
            className="bg-presspage-teal text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center gap-1"
            onClick={() => {
              // Trigger contact sales dialog for export
              const event = new CustomEvent('openContactSales', {
                detail: { 
                  title: 'Unlock Export Features',
                  description: 'Contact our sales team to access PDF, CSV export and sharing features.'
                }
              });
              window.dispatchEvent(event);
            }}
          >
            Export
          </button>
        )}
      </div>
    </header>
  );
};
