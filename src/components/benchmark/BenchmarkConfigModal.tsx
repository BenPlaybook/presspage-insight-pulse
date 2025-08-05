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
  const handleStartBenchmark = () => {
    if (!championId) {
      setErrors(['Please select a champion company']);
      return;
    }

    if (competitors.length === 0) {
      setErrors(['Please add at least one competitor']);
      return;
    }

    const champion = accounts.find(acc => acc.id === championId);
    if (!champion) return;

    const config: BenchmarkConfig = {
      championId,
      championName: champion.name,
      competitors
    };

    onStartBenchmark(config);
  };

  const selectedChampion = accounts.find(acc => acc.id === championId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configure Benchmark Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Champion Selection */}
          <div className="space-y-3">
            <Label htmlFor="champion" className="text-base font-medium">
              Select Champion Company *
            </Label>
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

            {/* Add Existing Competitor */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add from existing accounts</Label>
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
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleStartBenchmark}
              disabled={!championId || competitors.length === 0}
              className="bg-presspage-teal hover:bg-presspage-teal/90"
            >
              Start Benchmark Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 