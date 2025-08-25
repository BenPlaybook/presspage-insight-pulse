import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ShareOptionsDialog } from '../ShareOptionsDialog';
import PRHealthScore from './PRHealthScore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type AccountInsightsProps = {
  internalSummary: string;
  customerSummary: string;
  accountId: string;
  summaryId: string;
  accountName?: string;
  aiSummary?: any;
  customerAiSummary?: any;
  prHealthData?: {
    overallScore: number;
    metrics: {
      publishingVelocity: number;
      distributionReach: number;
      pickupQuality: number;
      organicFindability: number;
      competitorBenchmark: number;
    };
    recommendation: string;
  };
  forceExpanded?: boolean; // Force expanded state for shared views
  disableInteractions?: boolean; // Disable interactions for external users
};

const AccountInsights = ({ 
  internalSummary, 
  customerSummary, 
  accountId, 
  summaryId, 
  accountName = "Account", 
  aiSummary, 
  customerAiSummary,
  prHealthData,
  forceExpanded = false,
  disableInteractions = false
}: AccountInsightsProps) => {
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  const [activeVersion, setActiveVersion] = useState<string>('internal');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const { toast } = useToast();

  // Log Publishing Velocity data when Account Insights is expanded
  React.useEffect(() => {
    if (isExpanded && prHealthData) {
      console.log('🔍 Account Insights Expanded - PR Health Data:', {
        overallScore: prHealthData.overallScore,
        publishingVelocity: prHealthData.metrics.publishingVelocity,
        distributionReach: prHealthData.metrics.distributionReach,
        organicFindability: prHealthData.metrics.organicFindability,
        recommendation: prHealthData.recommendation
      });
    }
  }, [isExpanded, prHealthData]);

  const handleOpenShareDialog = () => {
    setIsShareDialogOpen(true);
  };

  // Función para verificar si los insights se han actualizado en Supabase
  const checkInsightsUpdate = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('ai_performance_summary, customer_ai_summary')
        .eq('id', accountId)
        .single();

      if (error) {
        console.error('Error checking insights update:', error);
        return false;
      }

      // Verificar si hay contenido en el campo correspondiente
      const currentInsight = activeVersion === 'internal' 
        ? data?.ai_performance_summary 
        : data?.customer_ai_summary;

      return currentInsight && currentInsight.trim().length > 0;
    } catch (error) {
      console.error('Error in checkInsightsUpdate:', error);
      return false;
    }
  };

  // Función para polling de verificación
  const pollForInsightsUpdate = async () => {
    const maxAttempts = 30; // 5 minutos máximo (30 * 10 segundos)
    let attempts = 0;

    const poll = async () => {
      attempts++;
      console.log(`🔍 Checking for insights update (attempt ${attempts}/${maxAttempts})`);

      const isUpdated = await checkInsightsUpdate();
      
      if (isUpdated) {
        console.log('✅ Insights updated in Supabase!');
        setShowSpinner(false);
        toast({
          title: "Success!",
          description: "AI Insights generated and updated successfully!",
          duration: 3000,
        });
        // Recargar la página para mostrar nuevos insights
        window.location.reload();
        return;
      }

      if (attempts >= maxAttempts) {
        console.log('⏰ Timeout waiting for insights update');
        setShowSpinner(false);
        toast({
          title: "Warning",
          description: "Insights generation is taking longer than expected. Please check back in a few minutes.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      // Continuar polling cada 10 segundos
      setTimeout(poll, 10000);
    };

    poll();
  };

  const handleGenerateInsights = async () => {
    if (disableInteractions) return;
    
    setIsGenerating(true);
    setShowSpinner(true);
    
    try {
      console.log('🔄 Generating insights for account:', accountId);
      
      // Llamada al webhook de n8n existente
      const response = await fetch('https://presspage.app.n8n.cloud/webhook/8ddad4f6-eaba-4fac-9f2f-f89bac9bf3e5', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: accountId,
          accountName: accountName,
          version: activeVersion, // 'internal' o 'customer'
          prHealthData: finalPrHealthData,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Webhook called successfully:', result);
      
      // Iniciar polling para verificar cuando se actualicen los insights
      pollForInsightsUpdate();
      
    } catch (error) {
      console.error('❌ Error generating insights:', error);
      setShowSpinner(false);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Default PR Health Score data if not provided
  const defaultPrHealthData = {
    overallScore: 69,
    metrics: {
      publishingVelocity: 75,
      distributionReach: 82,
      pickupQuality: 68,
      organicFindability: 71,
      competitorBenchmark: 65
    },
    recommendation: "Focus on improving pickup quality and competitor benchmarking. Consider expanding distribution channels to increase reach."
  };

  const finalPrHealthData = prHealthData || defaultPrHealthData;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header - Always visible */}
             <div 
         className={`p-6 ${!disableInteractions ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
         onClick={() => !disableInteractions && setIsExpanded(!isExpanded)}
       >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-presspage-teal to-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-presspage-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Account Insights</h2>
              <p className="text-sm text-gray-500 italic">This is an AI Powered Summary of the account data</p>
            </div>
          </div>
                     {!disableInteractions && (
             isExpanded ? (
               <ChevronDown className="h-5 w-5 text-gray-400" />
             ) : (
               <ChevronRight className="h-5 w-5 text-gray-400" />
             )
           )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-6">
            {/* 3:1 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column - Account Summary (3/4 width) */}
              <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <ToggleGroup 
                      type="single" 
                      value={activeVersion} 
                      onValueChange={(value) => value && setActiveVersion(value)}
                      disabled={false} // Permitir switch para todos los usuarios
                    >
                      <ToggleGroupItem 
                        value="internal" 
                        aria-label="Internal version" 
                        className="text-sm bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 data-[state=on]:bg-presspage-teal/20 data-[state=on]:border-presspage-teal data-[state=on]:text-presspage-teal"
                      >
                        Internal
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="customer" 
                        aria-label="Customer version" 
                        className="text-sm bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 data-[state=on]:bg-white data-[state=on]:border-gray-300 data-[state=on]:text-gray-900"
                      >
                        Customer
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  {!disableInteractions && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerateInsights}
                        size="sm"
                        disabled={isGenerating}
                        className="bg-presspage-blue hover:bg-presspage-blue/90 text-white border-0 transition-all duration-200"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        {isGenerating ? 'Generating...' : 'Generate Insights'}
                      </Button>
                      <Button
                        onClick={handleOpenShareDialog}
                        size="sm"
                        className="bg-presspage-teal hover:bg-presspage-teal/90 text-white border-0 transition-all duration-200"
                      >
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                  {showSpinner ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-presspage-blue mb-4" />
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900 mb-2">Generating AI Insights...</h3>
                        <p className="text-sm text-gray-600">
                          This may take a few minutes. We're analyzing your account data and creating personalized insights.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {activeVersion === 'internal' 
                          ? (aiSummary || internalSummary) 
                          : (customerAiSummary || customerSummary)
                        }
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - PR Health Score (1/4 width) */}
              <div className="lg:col-span-1">
                <PRHealthScore
                  overallScore={finalPrHealthData.overallScore}
                  metrics={finalPrHealthData.metrics}
                  recommendation={finalPrHealthData.recommendation}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
             <ShareOptionsDialog
         isOpen={isShareDialogOpen}
         onClose={() => setIsShareDialogOpen(false)}
         accountId={accountId}
         summaryId={summaryId}
         accountName={accountName}
         summaryType={activeVersion as 'internal' | 'customer'}
         summaryContent={activeVersion === 'internal' 
           ? (aiSummary || internalSummary) 
           : (customerAiSummary || customerSummary)
         }
         prHealthData={finalPrHealthData}
       />
    </div>
  );
};

export default AccountInsights; 