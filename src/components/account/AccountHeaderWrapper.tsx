import React from 'react';
import { AccountHeader } from './AccountHeader';
import { Account as SupabaseAccount } from '@/types/database';

interface AccountHeaderWrapperProps {
  account?: SupabaseAccount;
  name?: string;
  url?: string;
  status?: string;
  lastAnalyzed?: string;
  performanceScore?: number;
}

export const AccountHeaderWrapper: React.FC<AccountHeaderWrapperProps> = ({
  account,
  name,
  url,
  status,
  lastAnalyzed,
  performanceScore
}) => {
  // Si se pasa un account, usar sus datos
  if (account) {
    return (
      <AccountHeader
        name={account.name}
        url={account.main_website_url}
        status={account.is_actively_tracked ? 'Active' : 'Processing'}
        lastAnalyzed="Coming Soon"
        performanceScore={performanceScore}
      />
    );
  }

  // Si se pasan propiedades individuales, usarlas
  return (
    <AccountHeader
      name={name || 'Account'}
      url={url || 'https://example.com'}
      status={status || 'Active'}
      lastAnalyzed={lastAnalyzed || 'Coming Soon'}
      performanceScore={performanceScore}
    />
  );
};
