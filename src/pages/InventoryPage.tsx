import { InventoryPanel } from "@/components/organisms/InventoryPanel";
import PageContainer from "@/components/organisms/PageContainer";
import { Boxes } from "lucide-react";

const InventoryPage = () => {
  return (
    <PageContainer
      title="Inventario"
      subtitle="Visualiza productos por empresa, descarga PDF y envíalo por API. Firma el hash en Web3."
      icon={<Boxes className="h-5 w-5 text-emerald-600" />}
    >
      <InventoryPanel />
    </PageContainer>
  );
};

export default InventoryPage;
