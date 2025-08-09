import { useQuery } from "@tanstack/react-query"

export function useRates() {
  return useQuery({
    queryKey: ["rates"],
    queryFn: async () => {
      const res = await fetch("/api/rates")
      const json = await res.json()
      if (!json?.success) throw new Error("Failed")
      // exchangerate.host returns { rates: { USD:1, ... }, base: 'USD' }
      return json.data
    },
    staleTime: 1000 * 60 * 30,
  })
}
