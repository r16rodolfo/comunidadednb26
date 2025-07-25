import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { TravelPlanForm } from '@/components/travel/TravelPlanForm';
import { TravelDashboard } from '@/components/travel/TravelDashboard';
import { ItineraryModule } from '@/components/travel/ItineraryModule';
import { useTravel } from '@/hooks/useTravel';
import { useToast } from '@/hooks/use-toast';
import { TravelPlanInput } from '@/types/travel';

export default function TravelPlanner() {
  const { module } = useParams();
  const { 
    currentPlan, 
    travelReports, 
    isGenerating,
    createTravelPlan, 
    generateTravelReport,
    activateMonitoring,
    canActivateMonitoring 
  } = useTravel();
  
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<string | null>(module || null);

  const currentReport = currentPlan ? travelReports[currentPlan.id] : null;

  const handleCreatePlan = async (planData: TravelPlanInput) => {
    try {
      const newPlan = await createTravelPlan(planData);
      
      toast({
        title: "Plano criado com sucesso!",
        description: "A gerar o seu relatório de viagem personalizado...",
      });

      await generateTravelReport(newPlan.id);
      
      toast({
        title: "Relatório gerado!",
        description: "O seu plano de viagem está pronto. Explore os módulos disponíveis.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o plano de viagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleViewModule = (moduleId: string) => {
    setSelectedModule(moduleId);
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
  };

  const renderModuleContent = () => {
    if (!currentReport) return null;
    
    switch (selectedModule || module) {
      case 'roteiro':
        return (
          <ItineraryModule
            destination={currentReport.plan.destinationPrimary}
            onBack={handleBackToDashboard}
          />
        );
      default:
        return null;
    }
  };

  const handleGeneratePDF = () => {
    // TODO: Implementar geração de PDF
    toast({
      title: "PDF em geração",
      description: "O seu checklist será baixado em breve",
    });
  };

  const handleActivateMonitoring = () => {
    if (currentPlan) {
      activateMonitoring(currentPlan.id);
      toast({
        title: "Roteiro Vivo ativado!",
        description: "Irá receber notificações sobre novos eventos e informações importantes.",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {!currentReport ? (
          <TravelPlanForm 
            onSubmit={handleCreatePlan}
            isLoading={isGenerating}
          />
        ) : selectedModule || module ? (
          renderModuleContent()
        ) : (
          <TravelDashboard
            report={currentReport}
            onViewModule={handleViewModule}
            onGeneratePDF={handleGeneratePDF}
            onActivateMonitoring={handleActivateMonitoring}
            canActivateMonitoring={canActivateMonitoring(currentPlan!)}
          />
        )}
      </div>
    </Layout>
  );
}