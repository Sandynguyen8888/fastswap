const IRIS_API = 'https://iris-api.circle.com/attestations'

export const CCTP_DOMAIN_IDS: Record<string, number> = {
  ethereum: 0,
  avalanche: 1,
  op: 2,
  arbitrum: 3,
  solana: 5,
  base: 6,
  polygon: 7,
  sui: 8,
  // arc: TBD — check docs.arc.network before deploying
}

export async function pollAttestation(
  messageHash: string,
  onStatus?: (status: 'waiting' | 'signed') => void,
): Promise<string> {
  onStatus?.('waiting')
  const maxAttempts = 120 // 10 minutes max (5s * 120)
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000))
    try {
      const res = await fetch(`${IRIS_API}/${messageHash}`)
      if (res.ok) {
        const data = (await res.json()) as { status: string; attestation: string }
        if (data.status === 'complete') {
          onStatus?.('signed')
          return data.attestation
        }
      }
    } catch {
      // network error — continue polling
    }
  }
  throw new Error('Attestation timeout after 10 minutes')
}

export function validateRecipientAddress(address: string, chainId: number | string): boolean {
  if (chainId === 'solana-mainnet') {
    // Solana base58 address: 32-44 chars, base58 chars
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }
  if (chainId === 'sui-mainnet') {
    // Sui: 0x + 64 hex chars
    return /^0x[0-9a-fA-F]{64}$/.test(address)
  }
  // EVM: 0x + 40 hex chars
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}
