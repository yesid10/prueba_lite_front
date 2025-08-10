import { AIAssistant } from "@/components/organisms/AIAssistant";
import PageContainer from "@/components/organisms/PageContainer";
import { Bot } from "lucide-react";

const AIAssistantPage = () => {
  return (
    <PageContainer
      title="Asistente IA"
      subtitle="Genera nombres y características de productos con IA on-device (WebGPU)"
      icon={<Bot className="h-5 w-5 text-violet-600" />}
    >
      <AIAssistant />
    </PageContainer>
  );
};

export default AIAssistantPage;
