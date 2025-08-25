import React from 'react';
import { AccountHeader } from './AccountHeader';
import { Account as SupabaseAccount } from '@/types/database';

interface AccountHeaderWrapperProps {
  account?: SupabaseAccount;
  name?: string;
  url?: string;
  status?: string;
  lastAnalyzed?: string;
  healthScore?: number;
  disableInteractions?: boolean;
}

export const AccountHeaderWrapper: React.FC<AccountHeaderWrapperProps> = ({
  account,
  name,
  url,
  status,
  lastAnalyzed,
  healthScore,
  disableInteractions = false
}) => {
  // Si se pasa un account, usar sus datos
  if (account) {
    return (
      <AccountHeader
        name={account.name}
        url={account.main_website_url}
        status={account.is_actively_tracked ? 'Active' : 'Processing'}
        lastAnalyzed="Coming Soon"
        healthScore={healthScore}
        disableInteractions={disableInteractions}
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
      healthScore={healthScore}
      disableInteractions={disableInteractions}
    />
  );
};
