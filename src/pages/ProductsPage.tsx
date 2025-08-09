import { ProductForm } from "@/components/organisms/ProductForm";
import { ProductsTable } from "@/components/organisms/ProductTable";
import PageContainer from "@/components/PageContainer";
import { userAuth } from "@/zustand/authUser";
import { Package } from "lucide-react";

const ProductsPage = () => {
  const { user } = userAuth();
  return (
    <PageContainer
      title="Productos"
      subtitle="Registra productos, características y precios en varias monedas"
      icon={<Package className="h-5 w-5 text-violet-600" />}
    >
      {user?.role === "admin" && <ProductForm/>}
      <ProductsTable />
    </PageContainer>
  );
};

export default ProductsPage;
