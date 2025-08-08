import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sendIntakeAccountData } from '@/services/webhookService';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AccountFormData {
  name: string;
  main_website_url: string;
  industry: string;
  description: string;
  country: string;
  employee_count: number;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    main_website_url: '',
    industry: '',
    description: '',
    country: '',
    employee_count: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof AccountFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!formData.main_website_url.trim()) {
      setError('Website URL is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create account in Supabase
      const { data, error } = await supabase
        .from('accounts')
        .insert([
          {
            name: formData.name.trim(),
            main_website_url: formData.main_website_url.trim(),
            industry: formData.industry.trim() || null,
            description: formData.description.trim() || null,
            country: formData.country.trim() || null,
            employee_count: formData.employee_count || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Error inserting account:', error);
        setError(error.message || 'Failed to create account');
        return;
      }

      // Send data to intake webhook
      const webhookData = {
        domain: formData.main_website_url.trim(),
        name: formData.name.trim(),
        source: 'web_app',
        endpoint: 'add_account',
        status_group: 'INTAKE',
        status_value: 'received_from_web_app'
      };

      const webhookResult = await sendIntakeAccountData(webhookData);
      
      if (!webhookResult.success) {
        console.warn('Webhook failed but account was created:', webhookResult.error);
        // Don't fail the entire operation if webhook fails
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setFormData({
          name: '',
          main_website_url: '',
          industry: '',
          description: '',
          country: '',
          employee_count: 0
        });
        setSuccess(false);
      }, 1500);

    } catch (error) {
      console.error('Error creating account:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        main_website_url: '',
        industry: '',
        description: '',
        country: '',
        employee_count: 0
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Account</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Account created successfully!</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="main_website_url">Website URL *</Label>
              <Input
                id="main_website_url"
                value={formData.main_website_url}
                onChange={(e) => handleInputChange('main_website_url', e.target.value)}
                placeholder="https://company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="media">Media & Entertainment</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="ES">Spain</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                  <SelectItem value="NL">Netherlands</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_count">Employee Count</Label>
              <Input
                id="employee_count"
                type="number"
                value={formData.employee_count}
                onChange={(e) => handleInputChange('employee_count', parseInt(e.target.value) || 0)}
                placeholder="Enter number of employees"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter company description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-presspage-teal hover:bg-presspage-teal/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 