import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useEffect } from "react";
import { FormRow } from "../molecules/FormRow";
import { useCompanies } from "@/zustand/companies";
import { useProducts } from "@/zustand/products";
import axios from "axios";

const schema = z.object({
  code: z.string().min(2, "Código requerido"),
  name: z.string().min(2, "Nombre requerido"),
  features: z.string().min(3, "Características requeridas"),
  basePrice: z.coerce.number().positive("Precio debe ser positivo"),
  baseCurrency: z.string().min(3),
  company_nit: z.string().min(1, "Empresa requerida"),
});

type FormValues = z.infer<typeof schema>;

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  date?: string;
}

export function ProductForm() {
  const { companies } = useCompanies();
  const { addProduct } = useProducts();
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [previewPrices, setPreviewPrices] = useState<Record<string, number>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      features: "",
      basePrice: 0,
      baseCurrency: "USD",
      company_nit: "",
    },
  });

  // Cargar tasas desde la API al montar el componente
  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true);
      setRatesError(null);
      
      try {
        // Usando exchangerate-api.com (gratuita y confiable)
        const urlRates = import.meta.env.VITE_RATES_URL || "https://api.exchangerate-api.com/v4/latest/USD";
        const response = await axios.get(urlRates);
        
        const data = response.data;
        
        // Validar estructura de respuesta
        if (!data.rates || typeof data.rates !== 'object') {
          throw new Error("Formato de respuesta inválido");
        }
        
        // Asegurar que USD esté en las tasas (base = USD, rate = 1)
        const ratesWithUSD = {
          ...data.rates,
          USD: 1
        };
        
        setRates({
          base: data.base || "USD",
          rates: ratesWithUSD,
          date: data.date
        });
        
      } catch (error) {
        console.error("Error cargando tasas:", error);
        setRatesError(error instanceof Error ? error.message : "Error desconocido");
        
        // Fallback con tasas fijas básicas
        setRates({
          base: "USD",
          rates: {
            USD: 1,
            EUR: 0.85,
            COP: 4000,
            MXN: 18,
            ARS: 350,
            BRL: 5
          }
        });
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, []);

  const selectCompanyOptions = useMemo(
    () => companies.map((c) => ({ label: c.name, value: c.nit })),
    [companies]
  );

  const supportedCurrencies = useMemo(() => {
    const currencies = ["USD", "EUR", "COP", "MXN", "ARS", "BRL"];
    
    if (!rates?.rates) return currencies;
    
    // Solo retornar monedas que existen en las tasas
    return currencies.filter(cur => rates.rates[cur] !== undefined);
  }, [rates]);

  const computePrices = (basePrice: number, baseCurrency: string): Record<string, number> => {
    const out: Record<string, number> = {};
    
    if (!rates?.rates || !basePrice || basePrice <= 0) {
      return out;
    }
    
    try {
      // Paso 1: Convertir precio base a USD
      let priceInUSD: number;
      
      if (baseCurrency === 'USD') {
        priceInUSD = basePrice;
      } else {
        const baseRate = rates.rates[baseCurrency];
        if (!baseRate || baseRate <= 0) {
          console.warn(`Tasa no disponible para ${baseCurrency}`);
          return out;
        }
        priceInUSD = basePrice / baseRate;
      }
      
      // Paso 2: Convertir USD a todas las monedas soportadas
      supportedCurrencies.forEach(currency => {
        if (currency === 'USD') {
          out[currency] = Math.round(priceInUSD * 100) / 100;
        } else {
          const rate = rates.rates[currency];
          if (rate && rate > 0) {
            out[currency] = Math.round(priceInUSD * rate * 100) / 100;
          }
        }
      });
      
    } catch (error) {
      console.error("Error calculando precios:", error);
    }
    
    return out;
  };

  // Actualizar precios cuando cambien los valores del formulario
  const updatePreviewPrices = () => {
    const basePrice = form.getValues("basePrice");
    const baseCurrency = form.getValues("baseCurrency");
    
    if (basePrice && baseCurrency) {
      const newPrices = computePrices(basePrice, baseCurrency);
      setPreviewPrices(newPrices);
    }
  };

  const onSubmit = (v: FormValues) => {
    const prices = computePrices(v.basePrice, v.baseCurrency);
    
    // Validar que se pudieron calcular las monedas principales
    const requiredCurrencies = ['COP', 'USD', 'EUR'];
    const missingCurrencies = requiredCurrencies.filter(cur => !prices[cur]);
    
    if (missingCurrencies.length > 0) {
      window.alert(
        `No se pudieron calcular los precios para: ${missingCurrencies.join(', ')}. ` +
        "Verifica la moneda base y tu conexión a internet."
      );
      return;
    }
    
    addProduct({
      code: v.code,
      name: v.name,
      features: v.features,
      price_cop: prices.COP,
      price_usd: prices.USD,
      price_eur: prices.EUR,
      company_nit: v.company_nit,
    }).then((product) => {
      if (product) {
        window.alert("Producto creado correctamente");
        form.reset();
        setPreviewPrices({});
      }
    }).catch((error) => {
      console.error("Error creando producto:", error);
      window.alert("Error al crear el producto. Intenta nuevamente.");
    });
  };

  return (
    <Card className="mb-6 border-gray-200">
      <CardHeader>
        <CardTitle>Registrar Producto</CardTitle>
        {ratesLoading && (
          <p className="text-xs text-blue-600">Cargando tasas de cambio...</p>
        )}
        {ratesError && (
          <p className="text-xs text-amber-600">
            Usando tasas de respaldo. Error: {ratesError}
          </p>
        )}
        {rates && !ratesLoading && !ratesError && (
          <p className="text-xs text-green-600">
            Tasas actualizadas {rates.date ? `(${rates.date})` : ''}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormRow label="Código" htmlFor="code">
            <Input
              className="border-gray-200"
              id="code"
              placeholder="SKU-001"
              {...form.register("code")}
            />
            {form.formState.errors.code && (
              <p className="text-xs text-red-500">
                {form.formState.errors.code.message}
              </p>
            )}
          </FormRow>

          <FormRow label="Nombre" htmlFor="name">
            <Input
              className="border-gray-200"
              id="name"
              placeholder="Producto X"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </FormRow>

          <div className="md:col-span-2">
            <FormRow label="Características" htmlFor="features">
              <Textarea
                className="border-gray-200"
                id="features"
                placeholder="Detalle y especificaciones..."
                {...form.register("features")}
              />
              {form.formState.errors.features && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.features.message}
                </p>
              )}
            </FormRow>
          </div>

          <FormRow label="Precio base" htmlFor="basePrice">
            <Input
              className="border-gray-200"
              id="basePrice"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="100.00"
              {...form.register("basePrice", {
                onChange: updatePreviewPrices,
              })}
            />
            {form.formState.errors.basePrice && (
              <p className="text-xs text-red-500">
                {form.formState.errors.basePrice.message}
              </p>
            )}
          </FormRow>

          <FormRow label="Moneda base" htmlFor="baseCurrency">
            <Select
              value={form.watch("baseCurrency")}
              onValueChange={(value) => {
                form.setValue("baseCurrency", value);
                // Actualizar precios después de cambiar moneda
                setTimeout(updatePreviewPrices, 0);
              }}
            >
              <SelectTrigger id="baseCurrency" className="border-gray-200">
                <SelectValue placeholder="Selecciona moneda" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {supportedCurrencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.baseCurrency && (
              <p className="text-xs text-red-500">
                {form.formState.errors.baseCurrency.message}
              </p>
            )}
          </FormRow>

          <FormRow
            label="Empresa"
            htmlFor="company_nit"
            hint="Empresa propietaria del producto"
          >
            <Select
              value={form.watch("company_nit")}
              onValueChange={(value) => form.setValue("company_nit", value)}
            >
              <SelectTrigger className="border-gray-200" id="company_nit">
                <SelectValue placeholder="Selecciona empresa" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border-gray-200">
                {selectCompanyOptions.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Primero registra una empresa.
                  </div>
                ) : (
                  selectCompanyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.company_nit && (
              <p className="text-xs text-red-500">
                {form.formState.errors.company_nit.message}
              </p>
            )}
          </FormRow>

          <div className="md:col-span-2 grid gap-2">
            <div className="text-sm text-muted-foreground">
              Precios estimados:
            </div>
            {Object.keys(previewPrices).length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                {Object.entries(previewPrices).map(([currency, value]) => (
                  <div
                    key={currency}
                    className="rounded-md border p-2 text-center text-sm bg-gray-50"
                  >
                    <div className="font-medium text-gray-900">{currency}</div>
                    <div className="text-muted-foreground">
                      {value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                {ratesLoading 
                  ? "Cargando..." 
                  : "Ingresa un precio base para ver las conversiones"
                }
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={ratesLoading}
            >
              {ratesLoading ? "Cargando..." : "Guardar producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}