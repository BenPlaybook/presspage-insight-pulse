import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { databaseService } from '@/services/databaseService';
import { sendIntakeAccountData, webhookService } from '@/services/webhookService';
import { supabase } from '@/lib/supabase';
import { Account } from '@/types/database';

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
}

export const BenchmarkConfigModal: React.FC<BenchmarkConfigModalProps> = ({
  isOpen,
  onClose,
  onStartBenchmark
}) => {
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

  // Load existing accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data, error } = await databaseService.getAccounts(1, 100);
        if (!error && data) {
          setAccounts(data);
        }
      } catch (error) {
        console.error('Error loading accounts:', error);
      }
    };

    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

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

    const newCompetitor = {
      name: newName.trim(),
      domain: newDomain.trim().toLowerCase(),
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
          // Create account in Supabase
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

  const selectedChampion = accounts.find(acc => acc.id === championId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configure Benchmark Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 How to Configure Your Benchmark</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Champion:</strong> Select your main company to benchmark against</p>
              <p>• <strong>Competitors:</strong> Add up to 10 companies to compare (existing accounts or new domains)</p>
              <p>• <strong>Analysis:</strong> We'll compare publications, speed, SERP position, and efficiency scores</p>
            </div>
          </div>

          {/* Champion Selection */}
          <div className="space-y-3">
            <Label htmlFor="champion" className="text-base font-medium">
              Select Champion Company *
            </Label>
            <p className="text-sm text-gray-600">
              Choose the company you want to use as the baseline for comparison. This will be highlighted as the "champion" in the results.
            </p>
            <Select value={championId} onValueChange={setChampionId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose the company to benchmark against" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedChampion && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Champion:</strong> {selectedChampion.name}
                </p>
              </div>
            )}
          </div>

          {/* Competitors Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">
                Add Competitors ({competitors.length}/10)
              </Label>
            </div>
            
            <p className="text-sm text-gray-600">
              Add companies to compare against your champion. You can select from existing accounts or add new ones by domain.
            </p>

            {/* Add Existing Competitor */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add from existing accounts</Label>
              <p className="text-xs text-gray-500">
                Select from companies already in our database with historical data
              </p>
              <Select onValueChange={addExistingCompetitor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an existing account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter(account => account.id !== championId)
                    .filter(account => !competitors.some(comp => comp.id === account.id))
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add New Competitor */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add new competitor by domain</Label>
              <p className="text-xs text-gray-500">
                Add a new company by entering their domain (e.g., company.com). We'll track their performance going forward.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="newName" className="text-xs">Company Name</Label>
                  <Input
                    id="newName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="newDomain" className="text-xs">Domain</Label>
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
                <Label className="text-sm font-medium">Selected Competitors</Label>
                <p className="text-xs text-gray-500">
                  Review your selected competitors. Click the X to remove any you don't want to include.
                </p>
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
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Ready to analyze?</strong> We'll compare your champion against {competitors.length} competitor {competitors.length !== 1 ? 's' : ''} 
                 using real performance data from the last 30 days.
              </p>
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
      </DialogContent>
    </Dialog>
  );
}; 