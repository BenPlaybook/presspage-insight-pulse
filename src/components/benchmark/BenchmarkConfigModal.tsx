import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, AlertCircle, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { databaseService } from '@/services/databaseService';
import { sendIntakeAccountData, webhookService } from '@/services/webhookService';
import { clayService } from '@/services/clayService';
import { supabase } from '@/lib/supabase';
import { Account as DatabaseAccount } from '@/types/database';
import { useAuthContext } from '@/contexts/AuthContext';

interface BenchmarkConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBenchmark: (config: BenchmarkConfig) => void;
}

interface BenchmarkConfig {
  championId: string;
  championName: string;
  competitors: Array<{
    id?: string;
    name: string;
    domain: string;
    isNew: boolean;
  }>;
}

interface Account {
  id: string;
  name: string;
  main_website_url: string;
  industry?: string;
}

// Componente helper para tooltips con icono de información
const InfoTooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => (
  <Tooltip delayDuration={300}>
    <TooltipTrigger asChild>
      <div className="inline-flex items-center gap-1">
        {children}
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
      </div>
    </TooltipTrigger>
    <TooltipContent 
      className="max-w-xs z-[9999] bg-white border border-gray-200 shadow-lg"
      side="top"
      align="start"
      sideOffset={8}
      avoidCollisions={true}
      collisionPadding={20}
      sticky="always"
    >
      <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
    </TooltipContent>
  </Tooltip>
);

export const BenchmarkConfigModal: React.FC<BenchmarkConfigModalProps> = ({
  isOpen,
  onClose,
  onStartBenchmark
}) => {
  const { userProfile } = useAuthContext();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [championId, setChampionId] = useState<string>('');
  const [competitors, setCompetitors] = useState<Array<{
    id?: string;
    name: string;
    domain: string;
    isNew: boolean;
  }>>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [competitorSearchTerm, setCompetitorSearchTerm] = useState('');
  const [autoPopulatedChampion, setAutoPopulatedChampion] = useState<Account | null>(null);
  const [claySuggestions, setClaySuggestions] = useState<any[]>([]);
  const [clayLoading, setClayLoading] = useState(false);

  // Función para obtener sugerencias de Clay
  const getClaySuggestions = async (domain: string, companyName: string) => {
    if (!domain) return;
    
    console.log('🎯 Getting competitor suggestions from Clay for domain:', domain, 'and company:', companyName);
    setClayLoading(true);
    try {
      const clayResponse = await clayService.getCompetitorsByDomainAndCompany(domain, companyName);
      if (clayResponse.success) {
        console.log('🎯 Clay suggestions received:', clayResponse.data);
        setClaySuggestions(clayResponse.data || []);
        // TODO: Procesar las sugerencias de Clay y agregarlas como competitors sugeridos
      } else {
        console.warn('🎯 Clay API error:', clayResponse.error);
        setClaySuggestions([]);
      }
    } catch (error) {
      console.error('🎯 Error calling Clay API:', error);
      setClaySuggestions([]);
    } finally {
      setClayLoading(false);
    }
  };

  // Función para auto-preseleccionar competitors por industry
  const autoSelectCompetitorsByIndustry = (championAccount: Account) => {
    console.log('🎯 Auto-selecting competitors by industry for champion:', championAccount.name);
    
    // Obtener la industria del champion (necesitamos cargar los datos completos)
    const championWithIndustry = accounts.find(acc => acc.id === championAccount.id);
    if (!championWithIndustry) {
      console.log('🎯 Champion not found in accounts list, skipping auto-selection');
      return;
    }

    // Buscar competitors que coincidan en industry (máximo 10)
    const industryCompetitors = accounts
      .filter(account => 
        account.id !== championId && // Excluir el champion
        account.industry && // Debe tener industry
        championWithIndustry.industry && // Champion debe tener industry
        account.industry === championWithIndustry.industry // Mismo industry
      )
      .slice(0, 10); // Máximo 10 competitors

    if (industryCompetitors.length > 0) {
      console.log(`🎯 Found ${industryCompetitors.length} competitors in same industry:`, industryCompetitors.map(c => c.name));
      
      // Convertir a formato de competitors
      const suggestedCompetitors = industryCompetitors.map(account => ({
        id: account.id,
        name: account.name,
        domain: account.main_website_url || '',
        isNew: false
      }));

      setCompetitors(suggestedCompetitors);
      console.log('🎯 Auto-selected competitors:', suggestedCompetitors.map(c => c.name));
    } else {
      console.log('🎯 No competitors found in same industry, keeping empty list');
    }
  };

  // Función para cargar accounts y champion
  const loadAccountsAndChampion = async () => {
    try {
      console.log('🎯 Starting parallel load: accounts + champion search');
      
      // 1. Buscar champion específico por dominio (rápido)
      if (userProfile?.domain && !championId) {
        console.log('🎯 Searching for champion by domain:', userProfile.domain);
        const { data: championAccounts, error: championError } = await databaseService.findAccountsByDomain(userProfile.domain);
        
        if (!championError && championAccounts && championAccounts.length > 0) {
          const championAccount = championAccounts[0];
          console.log('🎯 Champion found immediately:', championAccount.name);
          console.log('🎯 Champion account details:', {
            id: championAccount.id,
            name: championAccount.name,
            url: championAccount.main_website_url
          });
          
          setChampionId(championAccount.id);
          setAutoPopulatedChampion(championAccount);
          
          // Agregar la cuenta del champion a la lista de accounts para que esté disponible en el dropdown
          setAccounts(prev => {
            const exists = prev.some(acc => acc.id === championAccount.id);
            if (!exists) {
              console.log('🎯 Adding champion account to accounts list for dropdown');
              return [...prev, championAccount];
            }
            return prev;
          });

          // Obtener sugerencias de Clay usando el nombre del account champion
          await getClaySuggestions(userProfile.domain, championAccount.name);
        } else if (!championError && userProfile.domain) {
          // Crear nueva cuenta si no existe
          console.log('🎯 Creating new champion account for domain:', userProfile.domain);
          const newAccount = {
            name: userProfile.domain.charAt(0).toUpperCase() + userProfile.domain.slice(1),
            main_website_url: `https://${userProfile.domain}`,
            is_actively_tracked: false,
            industry: 'Technology'
          };
          
          const { data: createdAccount, error: createError } = await databaseService.createAccount(newAccount);
          if (!createError && createdAccount) {
            setChampionId(createdAccount.id);
            setAutoPopulatedChampion(createdAccount);
            
            // Agregar la nueva cuenta del champion a la lista de accounts
            setAccounts(prev => {
              const exists = prev.some(acc => acc.id === createdAccount.id);
              if (!exists) {
                console.log('🎯 Adding new champion account to accounts list for dropdown');
                return [...prev, createdAccount];
              }
              return prev;
            });
            
            console.log('🎯 New champion account created:', createdAccount.name);

            // Obtener sugerencias de Clay usando el nombre del nuevo account champion
            await getClaySuggestions(userProfile.domain, createdAccount.name);
          }
        }
      }
      
      // 2. Cargar TODAS las cuentas sin paginación (para el dropdown)
      console.log('🎯 Loading ALL accounts for dropdown (no pagination)...');
      const { data: allAccounts, error: accountsError, total: totalAccounts } = await databaseService.getAllAccounts();
      if (!accountsError && allAccounts) {
        console.log('🎯 Successfully loaded', allAccounts.length, 'accounts out of', totalAccounts, 'total');
        
        setAccounts(prev => {
          // Combinar cuentas existentes (incluyendo champion) con TODAS las cuentas
          const combined = [...prev, ...allAccounts];
          const unique = combined.filter((acc, index, self) => 
            index === self.findIndex(a => a.id === acc.id)
          );
          console.log('🎯 Combined accounts (champion + ALL):', unique.length, 'accounts out of', totalAccounts, 'total');
          return unique;
        });
      } else {
        console.error('🎯 Error loading all accounts:', accountsError);
      }
      
    } catch (error) {
      console.error('Error in parallel load:', error);
    }
  };

  // Load accounts and auto-populate champion in parallel
  useEffect(() => {
    if (!isOpen) return; // Solo ejecutar cuando el modal esté abierto
    
    loadAccountsAndChampion();
  }, [isOpen, userProfile?.domain]);

  // Monitor championId changes and get Clay suggestions when champion changes
  useEffect(() => {
    if (!isOpen || !championId || !userProfile?.domain) return; // Solo ejecutar cuando el modal esté abierto y haya un champion
    
    // Encontrar el account del champion seleccionado
    const championAccount = accounts.find(acc => acc.id === championId);
    if (championAccount) {
      console.log('🎯 Champion changed to:', championAccount.name, 'Getting new Clay suggestions...');
      // Obtener sugerencias de Clay usando el nombre del nuevo account champion
      getClaySuggestions(userProfile.domain, championAccount.name);
    }
  }, [championId, isOpen, userProfile?.domain]); // Removido 'accounts' de las dependencias

  // Auto-preseleccionar competitors cuando se cargan las cuentas y hay un champion seleccionado
  useEffect(() => {
    if (!isOpen || !championId || !userProfile || accounts.length === 0 || competitors.length > 0) return;
    
    const championAccount = accounts.find(acc => acc.id === championId);
    if (championAccount) {
      console.log('🎯 Accounts loaded, auto-selecting competitors for champion:', championAccount.name);
      autoSelectCompetitorsByIndustry(championAccount);
    }
  }, [accounts, championId, isOpen, userProfile, competitors.length]);





  // Validate domain format
  const validateDomain = (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  // Add new competitor by domain
  const addNewCompetitor = () => {
    if (!newDomain.trim() || !newName.trim()) {
      setErrors(['Please enter both domain and company name']);
      return;
    }

    if (!validateDomain(newDomain)) {
      setErrors(['Please enter a valid domain format (e.g., company.com)']);
      return;
    }

    if (competitors.length >= 10) {
      setErrors(['Maximum 10 competitors allowed']);
      return;
    }

    // Check if domain already exists in competitors (both new and existing)
    const domainToAdd = newDomain.trim().toLowerCase();
    const domainExists = competitors.some(comp => 
      comp.domain.toLowerCase() === domainToAdd ||
      (comp.domain && comp.domain.toLowerCase().includes(domainToAdd)) ||
      (domainToAdd.includes(comp.domain.toLowerCase()))
    );

    if (domainExists) {
      setErrors(['This domain is already added as a competitor']);
      return;
    }

    // Check if domain already exists in accounts (to avoid creating duplicates)
    const existingAccount = accounts.find(acc => 
      acc.main_website_url && 
      acc.main_website_url.toLowerCase().includes(domainToAdd)
    );

    if (existingAccount) {
      setErrors([`This domain already exists in our database. Please select "${existingAccount.name}" from the existing accounts list.`]);
      return;
    }

    const newCompetitor = {
      name: newName.trim(),
      domain: domainToAdd,
      isNew: true
    };

    setCompetitors([...competitors, newCompetitor]);
    setNewDomain('');
    setNewName('');
    setErrors([]);
  };

  // Add existing competitor
  const addExistingCompetitor = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    if (competitors.some(comp => comp.id === accountId)) {
      setErrors(['This competitor is already added']);
      return;
    }

    if (competitors.length >= 10) {
      setErrors(['Maximum 10 competitors allowed']);
      return;
    }

    const newCompetitor = {
      id: account.id,
      name: account.name,
      domain: account.main_website_url || '',
      isNew: false
    };

    setCompetitors([...competitors, newCompetitor]);
    setErrors([]);
  };

  // Remove competitor
  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  // Start benchmark
  const handleStartBenchmark = async () => {
    if (!championId) {
      setErrors(['Please select a champion company']);
      return;
    }

    if (competitors.length === 0) {
      setErrors(['Please add at least one competitor']);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // Create new accounts for competitors that are marked as new
      const newCompetitors = competitors.filter(c => c.isNew);
      const createdAccounts: Array<{ id: string; name: string; domain: string }> = [];

      for (const newCompetitor of newCompetitors) {
        try {
          // Check if account already exists before creating
          const { data: existingAccount, error: checkError } = await supabase
            .from('accounts')
            .select('id, name, main_website_url')
            .or(`main_website_url.eq.https://${newCompetitor.domain},main_website_url.eq.http://${newCompetitor.domain}`)
            .single();

          if (existingAccount) {
            console.log(`Account already exists for domain ${newCompetitor.domain}:`, existingAccount);
            createdAccounts.push({
              id: existingAccount.id,
              name: existingAccount.name,
              domain: newCompetitor.domain
            });
            continue; // Skip creation, use existing account
          }

          // Create account in Supabase only if it doesn't exist
          const { data: accountData, error: createError } = await supabase
            .from('accounts')
            .insert([
              {
                name: newCompetitor.name.trim(),
                main_website_url: `https://${newCompetitor.domain}`,
                industry: null,
                description: null,
                country: null,
                employee_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select('id, name, main_website_url')
            .single();

          if (createError) {
            console.error('Error creating account for new competitor:', createError);
            setErrors([`Failed to create account for ${newCompetitor.name}`]);
            setLoading(false);
            return;
          }

          if (accountData) {
            createdAccounts.push({
              id: accountData.id,
              name: accountData.name,
              domain: newCompetitor.domain
            });

            // Send data to intake webhook for new account
            const webhookData = {
              domain: `https://${newCompetitor.domain}`,
              name: newCompetitor.name.trim(),
              source: 'web_app',
              endpoint: 'benchmark_new_competitor',
              status_group: 'INTAKE',
              status_value: 'received_from_web_app'
            };

                         const webhookResult = await sendIntakeAccountData(webhookData);
            
            if (!webhookResult.success) {
              console.warn(`Webhook failed for new competitor ${newCompetitor.name}:`, webhookResult.error);
              // Continue even if webhook fails
            }
          }
        } catch (error) {
          console.error('Error creating account for new competitor:', error);
          setErrors([`Failed to create account for ${newCompetitor.name}`]);
          setLoading(false);
          return;
        }
      }

      // Get all account IDs (champion + existing competitors + newly created competitors)
      const existingCompetitorIds = competitors.filter(c => !c.isNew).map(c => c.id!);
      const newCompetitorIds = createdAccounts.map(acc => acc.id);
      const accountIds = [championId, ...existingCompetitorIds, ...newCompetitorIds];
      
      console.log('BenchmarkConfigModal: Champion ID:', championId);
      console.log('BenchmarkConfigModal: Competitors:', competitors);
      console.log('BenchmarkConfigModal: Created accounts:', createdAccounts);
      console.log('BenchmarkConfigModal: Account IDs to query:', accountIds);
      
      // Get complete account data from database
      const { data: accountData, error } = await databaseService.getAccountsForBenchmark(accountIds);
      
      if (error) {
        setErrors(['Error loading account data']);
        setLoading(false);
        return;
      }

      // Find champion data
      const championData = accountData.find(acc => acc.id === championId);
      if (!championData) {
        setErrors(['Champion account not found']);
        setLoading(false);
        return;
      }

      // Get competitor data (existing + newly created accounts)
      const competitorData = accountData.filter(acc => acc.id !== championId);

      // Prepare data for benchmark webhook
      const webhookData = {
        champion: championData,
        competitors: competitorData,
        timestamp: new Date().toISOString(),
        analysis_type: 'benchmark' as const
      };

             // Send data to benchmark webhook
       const webhookResult = await webhookService.sendBenchmarkData(webhookData);
      
      if (!webhookResult.success) {
        console.warn('Benchmark webhook failed but continuing with benchmark:', webhookResult.error);
        // Continue with benchmark even if webhook fails
      }

      // Prepare config for benchmark analysis
      const champion = accounts.find(acc => acc.id === championId);
      if (!champion) {
        setErrors(['Champion account not found']);
        setLoading(false);
        return;
      }

      // Update competitors list with newly created account IDs
      const updatedCompetitors = competitors.map(comp => {
        if (comp.isNew) {
          const createdAccount = createdAccounts.find(acc => acc.domain === comp.domain);
          return {
            ...comp,
            id: createdAccount?.id
          };
        }
        return comp;
      });

      const config: BenchmarkConfig = {
        championId,
        championName: champion.name,
        competitors: updatedCompetitors
      };

      onStartBenchmark(config);
    } catch (error) {
      console.error('Error starting benchmark:', error);
      setErrors(['An error occurred while starting the benchmark']);
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      account.name.toLowerCase().includes(searchLower) ||
      (account.main_website_url && account.main_website_url.toLowerCase().includes(searchLower))
    );
  });

  // Filter accounts for competitors based on competitor search term
  const filteredCompetitorAccounts = accounts.filter(account => {
    if (!competitorSearchTerm) return true;
    const searchLower = competitorSearchTerm.toLowerCase();
    return (
      account.name.toLowerCase().includes(searchLower) ||
      (account.main_website_url && account.main_website_url.toLowerCase().includes(searchLower))
    );
  });

  const selectedChampion = accounts.find(acc => acc.id === championId);
  
  // Verificar si hay empresas "NEW" seleccionadas
  const hasNewCompanies = competitors.some(comp => comp.isNew);
  const newCompaniesCount = competitors.filter(comp => comp.isNew).length;
  
  // Debug logs para el champion selection
  console.log('🎯 Champion Selection Debug:', {
    championId,
    selectedChampion: selectedChampion?.name,
    selectedChampionId: selectedChampion?.id,
    autoPopulatedChampion: autoPopulatedChampion?.name,
    autoPopulatedChampionId: autoPopulatedChampion?.id,
    accountsCount: accounts.length,
    filteredAccountsCount: filteredAccounts.length,
    accounts: accounts.map(acc => ({ id: acc.id, name: acc.name })),
    isChampionIdInAccounts: accounts.some(acc => acc.id === championId),
    hasNewCompanies,
    newCompaniesCount
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <TooltipProvider delayDuration={300} skipDelayDuration={100}>
        <DialogHeader>
          <InfoTooltip content="Configure your benchmark by selecting a champion company and adding competitors. We'll analyze publication performance, speed, SERP positioning, and efficiency scores to give you actionable insights.">
            <DialogTitle className="text-xl font-bold">Configure Benchmark Analysis</DialogTitle>
          </InfoTooltip>
        </DialogHeader>

        <div className="space-y-6">

          {/* Champion Selection */}
          <div className="space-y-3">
            <InfoTooltip content="Choose the company you want to use as the baseline for comparison. This will be highlighted as the 'champion' in the results and used to measure performance against competitors.">
              <Label htmlFor="champion" className="text-base font-medium">
                Select Champion Company *
              </Label>
            </InfoTooltip>
            
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Search accounts</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name or website..."
                className="w-full"
              />
              {searchTerm && (
                <p className="text-xs text-gray-500">
                  Found {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Select value={championId} onValueChange={setChampionId}>
                <SelectTrigger className={`w-full ${
                  championId ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}>
                  <SelectValue 
                    placeholder={
                      championId 
                        ? `Selected: ${selectedChampion?.name || 'Unknown'}` 
                        : "Choose the company to benchmark against"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{account.name}</span>
                        <span className="text-xs text-gray-500">
                          {account.main_website_url || 'No website'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Status indicator */}
              {championId && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    autoPopulatedChampion?.id === championId ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-gray-600">
                    {autoPopulatedChampion?.id === championId ? 'Auto-selected' : 'Manually selected'}
                  </span>
                </div>
              )}
            </div>
            {selectedChampion && (
              <div className={`p-3 rounded-lg ${
                autoPopulatedChampion?.id === selectedChampion.id 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      autoPopulatedChampion?.id === selectedChampion.id 
                        ? 'text-green-800' 
                        : 'text-blue-800'
                    }`}>
                      <strong>Champion:</strong> {selectedChampion.name}
                    </p>
                    {selectedChampion.main_website_url && (
                      <p className={`text-sm ${
                        autoPopulatedChampion?.id === selectedChampion.id 
                          ? 'text-green-700' 
                          : 'text-blue-700'
                      }`}>
                        <strong>Website:</strong> {selectedChampion.main_website_url}
                      </p>
                    )}
                  </div>
                  {autoPopulatedChampion?.id === selectedChampion.id && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                      Auto-selected
                    </Badge>
                  )}
                </div>
                {autoPopulatedChampion?.id === selectedChampion.id && (
                  <p className="text-xs text-green-600 mt-2">
                    Based on your company domain: <strong>{userProfile?.domain}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Competitors Section */}
          <div className="space-y-4">
            <InfoTooltip content="Add companies to compare against your champion. You can select from existing accounts with historical data or add new ones by domain. Maximum 10 competitors allowed.">
              <Label className="text-base font-medium">
                Add Competitors ({competitors.length}/10)
              </Label>
            </InfoTooltip>

            {/* Add Existing Competitor */}
            <div className="space-y-3">
              <InfoTooltip content="Select from companies already in our database with historical data. These accounts have existing performance metrics and publication history.">
                <Label className="text-sm font-medium">Add from existing accounts</Label>
              </InfoTooltip>
              
              {/* Competitor Search Input */}
              <div className="space-y-2">
                <Label htmlFor="competitorSearch" className="text-xs font-medium">Search competitors</Label>
                <Input
                  id="competitorSearch"
                  value={competitorSearchTerm}
                  onChange={(e) => setCompetitorSearchTerm(e.target.value)}
                  placeholder="Search by company name or website..."
                  className="w-full"
                />
                {competitorSearchTerm && (
                  <p className="text-xs text-gray-500">
                    Found {filteredCompetitorAccounts.filter(account => account.id !== championId && !competitors.some(comp => comp.id === account.id)).length} available account{filteredCompetitorAccounts.filter(account => account.id !== championId && !competitors.some(comp => comp.id === account.id)).length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              <Select onValueChange={addExistingCompetitor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an existing account" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCompetitorAccounts
                    .filter(account => account.id !== championId)
                    .filter(account => !competitors.some(comp => comp.id === account.id))
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{account.name}</span>
                          <span className="text-xs text-gray-500">
                            {account.main_website_url || 'No website'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add New Competitor */}
            <div className="space-y-3">
              <InfoTooltip content="Add a new company by entering their domain (e.g., company.com). We'll create a new account and start tracking their performance going forward.">
                <Label className="text-sm font-medium">Add new competitor by domain</Label>
              </InfoTooltip>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <InfoTooltip content="Enter the official company name as it appears on their website or in business directories.">
                    <Label htmlFor="newName" className="text-xs">Company Name</Label>
                  </InfoTooltip>
                  <Input
                    id="newName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <InfoTooltip content="Enter the company's main domain (e.g., company.com). This will be used to track their website and publications.">
                    <Label htmlFor="newDomain" className="text-xs">Domain</Label>
                  </InfoTooltip>
                  <Input
                    id="newDomain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="company.com"
                  />
                </div>
              </div>
              <Button
                onClick={addNewCompetitor}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Competitor
              </Button>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Competitors List */}
            {competitors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <InfoTooltip content="Review your selected competitors. Click the X to remove any you don't want to include in the benchmark analysis.">
                    <Label className="text-sm font-medium">Selected Competitors</Label>
                  </InfoTooltip>
                  {competitors.length > 0 && !competitors.some(c => c.isNew) && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                      Auto-selected by industry
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {competitors.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{competitor.name}</p>
                        <p className="text-sm text-gray-500">{competitor.domain}</p>
                        {competitor.isNew && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            New
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompetitor(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {competitors.length > 0 && !competitors.some(c => c.isNew) && (
                  <p className="text-xs text-blue-600 italic">
                    💡 Competitors were auto-selected based on industry match. You can remove or add others as needed.
                  </p>
                )}
              </div>
            )}

            {/* Contextual Message for NEW Companies */}
            {hasNewCompanies && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 text-sm">⏱️</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-800 mb-1">
                      New Company Analysis
                    </h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      {newCompaniesCount === 1 
                        ? "New analyses can take up to 30 minutes. We'll reach out when your report is ready."
                        : `${newCompaniesCount} new companies selected. New analyses can take up to 30 minutes. We'll reach out when your report is ready.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <InfoTooltip content={`We'll compare your champion against ${competitors.length} competitor${competitors.length !== 1 ? 's' : ''} using real performance data from the last 30 days, including publication metrics, SERP positioning, and efficiency scores.`}>
                <p className="text-sm text-gray-600">
                  <strong>Ready to analyze?</strong> Champion vs {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} 
                </p>
              </InfoTooltip>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleStartBenchmark}
                disabled={!championId || competitors.length === 0 || loading}
                className="bg-presspage-teal hover:bg-presspage-teal/90"
              >
                {loading ? 'Starting Analysis...' : 'Start Benchmark Analysis'}
              </Button>
            </div>
          </div>
        </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}; 