import { AIAssistant } from "@/components/organisms/AIAssistant";
import Layout from "@/layout/Layout";
import CompanyPage from "@/pages/CompanyPage";
import HomePage from "@/pages/HomePage";
import InventoryPage from "@/pages/InventoryPage";
import LoginPage from "@/pages/LoginPage";
import ProductsPage from "@/pages/ProductsPage";
import { BrowserRouter, Route, Routes } from "react-router";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/companies" element={<CompanyPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/ia" element={<AIAssistant />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
