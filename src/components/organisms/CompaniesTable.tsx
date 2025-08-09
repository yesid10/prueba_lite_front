import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState, useEffect } from "react";
import { userAuth } from "@/zustand/authUser";
import { useCompanies } from "@/zustand/companies";

const CompaniesTable = () => {
  const {
    companies,
    loading,
    error,
    fetchCompanies,
    removeCompany,
    updateCompany,
  } = useCompanies();
  const { user } = userAuth();
  const [editNit, setEditNit] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filtered = useMemo(() => {
    return companies.filter(
      (c) =>
        c.nit.toLowerCase().includes(query.toLowerCase()) ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.address.toLowerCase().includes(query.toLowerCase())
    );
  }, [companies, query]);
  return (
    <Card className="p-4 border-gray-200">
      <div className="mb-3 flex items-center gap-2">
        <Input
          className="border-gray-200"
          placeholder="Buscar por NIT, nombre o dirección..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="border-b border-gray-200 bg-muted/50 text-left">
              <th className="p-2">{"NIT"}</th>
              <th className="p-2">{"Nombre"}</th>
              <th className="p-2">{"Dirección"}</th>
              <th className="p-2">{"Teléfono"}</th>
              {user?.role === "admin" ? (
                <th className="p-2">{"Acciones"}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={5}>
                  {"Sin empresas registradas."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.nit} className="border-b border-gray-200">
                  <td className="p-2">{c.nit}</td>
                  <td className="p-2">
                    {editNit === c.nit ? (
                      <Input
                        defaultValue={c.name}
                        onBlur={(e) => {
                          updateCompany(c.nit, { ...c, name: e.target.value });
                          setEditNit(null);
                        }}
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="p-2">
                    {editNit === c.nit ? (
                      <Input
                        defaultValue={c.address}
                        onBlur={(e) => {
                          updateCompany(c.nit, {
                            ...c,
                            address: e.target.value,
                          });
                          setEditNit(null);
                        }}
                      />
                    ) : (
                      c.address
                    )}
                  </td>
                  <td className="p-2">
                    {editNit === c.nit ? (
                      <Input
                        defaultValue={c.phone}
                        onBlur={async (e) => {
                          try {
                            await updateCompany(c.nit!, {
                              ...c,
                              phone: e.target.value,
                            });
                            setEditNit(null);
                          } catch (error) {
                            console.error("Error al actualizar:", error);
                          }
                        }}
                      />
                    ) : (
                      c.phone
                    )}
                  </td>
                  {user?.role === "admin" ? (
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditNit(c.nit)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={async () => {
                            if (
                              confirm("¿Estás seguro de eliminar esta empresa?")
                            ) {
                              try {
                                await removeCompany(c.nit!);
                              } catch (error) {
                                console.error("Error al eliminar:", error);
                              }
                            }
                          }}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CompaniesTable;
