// Source: https://docs.arc.io/arc/references/contract-addresses
// Source: https://developers.circle.com/stablecoins/cctp-getting-started

const IRIS_API = 'https://iris-api.circle.com/attestations'

// CCTP Domain IDs
export const CCTP_DOMAIN_IDS: Record<string, number> = {
  ethereum: 0,   // Mainnet + Sepolia
  avalanche: 1,
  op: 2,
  arbitrum: 3,
  solana: 5,
  base: 6,
  polygon: 7,
  sui: 8,
  arc: 26,       // Confirmed — Arc Testnet Domain 26
}

// CCTP V2 Contract Addresses — Arc Testnet
// Source: https://docs.arc.io/arc/references/contract-addresses
export const ARC_CCTP_CONTRACTS = {
  tokenMessengerV2:      '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  messageTransmitterV2:  '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275',
  tokenMinterV2:         '0xb43db544E2c27092c107639Ad201b3dEfAbcF192',
  message:               '0xbaC0179bB358A8936169a63408C8481D582390C4',
  gatewayWallet:         '0x0077777d7EBA4688BDeF3E311b846F25870A19B9',
  gatewayMinter:         '0x0022222ABE238Cc2C7Bb1f21003F0a260052475B',
} as const

// Common utility contracts — Arc Testnet
export const ARC_UTILITY_CONTRACTS = {
  create2Factory: '0x4e59b44847b379578588920cA78FbF26c0B4956C',
  multicall3:     '0xcA11bde05977b3631167028862bE2a173976CA11',
  permit2:        '0x000000000022D473030F116dDEE9F6B43aC78BA3',
} as const

// CCTP V2 Contract Addresses — Ethereum Sepolia (testnet)
// Source: https://developers.circle.com/stablecoins/cctp-getting-started
export const SEPOLIA_CCTP_CONTRACTS = {
  tokenMessengerV2:      '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA',
  messageTransmitterV2:  '0x7865fAfC2db2093669d92c0197e5d6f4Fefbe427',
} as const

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
  if (chainId === 'solana-devnet') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }
  if (chainId === 'sui-testnet') {
    return /^0x[0-9a-fA-F]{64}$/.test(address)
  }
  // EVM: 0x + 40 hex chars
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}
