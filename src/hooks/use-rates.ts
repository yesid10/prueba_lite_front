import { useQuery } from "@tanstack/react-query"

export function useRates() {
  return useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      const res = await fetch("https://api.exchangerate.host/latest?base=USD")
      const json = await res.json()
      if (!json?.rates) throw new Error("Failed")
      // Adaptar al formato esperado por el resto del código
      return { rates: json.rates, base: json.base }
    },
    staleTime: 1000 * 60 * 30,
  })
}
