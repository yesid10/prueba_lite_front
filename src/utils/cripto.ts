export function createInventoryHash(payload: unknown): string {
  const json = JSON.stringify(payload)
  // Simple SHA-256 using Web Crypto
  // Note: in Next.js this runs on client.
  const encoder = new TextEncoder()
  const data = encoder.encode(json)
  // Synchronous wrapper using subtle.digest requires async; here we fake immediate with cached hash.
  // We'll compute a quick JS hash for stability plus include json length to avoid async in UI:
  let h = 2166136261
  for (let i = 0; i < data.length; i++) {
    h ^= data[i]
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  // Convert to pseudo-hex (demo). For strong hash, prefer async SubtleCrypto.
  const pseudo = ("00000000" + (h >>> 0).toString(16)).slice(-8)

  return `poe-${pseudo}-${json.length}`
}

// If you want a true SHA-256 hex, use this async function instead:
/*
export async function sha256Hex(str: string): Promise<string> {
  const data = new TextEncoder().encode(str)
  const buf = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(buf))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
*/
