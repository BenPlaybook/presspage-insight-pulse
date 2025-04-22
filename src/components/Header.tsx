
import { Link, useLocation } from 'react-router-dom';

type HeaderProps = {
  variant?: 'default' | 'dashboard' | 'account' | 'benchmark';
  title?: string;
};

export const Header = ({ variant = 'default', title }: HeaderProps) => {
  const location = useLocation();
  
  return (
    <header className="bg-presspage-blue text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">
          <Link to="/">Content Analyzer</Link>
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
      <div className="flex gap-2">
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
          <button className="bg-presspage-teal text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors">
            Export
          </button>
        )}
      </div>
    </header>
  );
};
