import { Account as SupabaseAccount } from '@/types/database';
import { Account } from '@/types/accounts';
import { databaseService } from './databaseService';

export const accountAdapter = {
  // Convierte datos de Supabase al formato del frontend
  fromSupabase(supabaseAccount: SupabaseAccount): Account {
    return {
      id: supabaseAccount.id,
      name: supabaseAccount.name,
      status: supabaseAccount.is_actively_tracked ? 'Active' : 'Processing',
      dateAdded: supabaseAccount.created_at,
      industry: supabaseAccount.industry || 'N/A',
      headcount: supabaseAccount.pr_comms_headcount || 0,
      publications: {
        financial: {
          last30Days: Math.floor((supabaseAccount.search_period_publications || 0) * 0.3),
          last90Days: Math.floor((supabaseAccount.search_period_publications || 0) * 0.6),
          lastYear: supabaseAccount.search_period_publications || 0
        },
        nonFinancial: {
          last30Days: Math.floor((supabaseAccount.search_period_publications || 0) * 0.7),
          last90Days: Math.floor((supabaseAccount.search_period_publications || 0) * 1.4),
          lastYear: Math.floor((supabaseAccount.search_period_publications || 0) * 2.5)
        }
      }
    };
  },

  // Convierte múltiples cuentas
  fromSupabaseArray(supabaseAccounts: SupabaseAccount[]): Account[] {
    return supabaseAccounts.map(account => this.fromSupabase(account));
  },

  // Convierte cuenta con estadísticas reales de publicaciones
  async fromSupabaseWithStats(supabaseAccount: SupabaseAccount): Promise<Account> {
    // Obtener estadísticas de clasificación de publicaciones
    const { financial, nonFinancial } = await databaseService.getPublicationsClassificationStats(supabaseAccount.id);

    return {
      id: supabaseAccount.id,
      name: supabaseAccount.name,
      status: supabaseAccount.is_actively_tracked ? 'Active' : 'Processing',
      dateAdded: supabaseAccount.created_at,
      industry: supabaseAccount.industry || 'N/A',
      headcount: supabaseAccount.pr_comms_headcount || 0,
      publications: {
        financial: {
          last30Days: financial,
          last90Days: Math.floor(financial * 2), // Estimación para 90 días
          lastYear: Math.floor(financial * 4) // Estimación para el año
        },
        nonFinancial: {
          last30Days: nonFinancial,
          last90Days: Math.floor(nonFinancial * 2), // Estimación para 90 días
          lastYear: Math.floor(nonFinancial * 4) // Estimación para el año
        }
      }
    };
  },

  // Convierte múltiples cuentas con estadísticas reales
  async fromSupabaseArrayWithStats(supabaseAccounts: SupabaseAccount[]): Promise<Account[]> {
    const accountsWithStats = await Promise.all(
      supabaseAccounts.map(account => this.fromSupabaseWithStats(account))
    );
    return accountsWithStats;
  }
}; 