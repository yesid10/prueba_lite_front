import PageContainer from "@/components/organisms/PageContainer"
import CompaniesTable from "@/components/organisms/CompaniesTable"
import CompanyForm from "@/components/organisms/CompanyForm"
import { userAuth } from "@/zustand/authUser"
import { Building2 } from "lucide-react"

const CompanyPage = () => {
    const { user } = userAuth();

    return (
        <PageContainer
            title="Empresas"
            subtitle="Gestión de Empresas (NIT como llave primaria)"
            icon={<Building2 className="h-5 w-5 text-emerald-600" />}
        >
            {user?.role === "admin" && <CompanyForm />}
            <CompaniesTable />
        </PageContainer>
    )
}

export default CompanyPage