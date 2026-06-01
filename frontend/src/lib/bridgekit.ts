// BridgeKit wrapper — @circle-fin/bridge-kit
// Attestation polling is handled internally by BridgeKit when useForwarder: true

import type { ChainConfig } from '@/lib/chains'

export type BridgeSpeed = 'FAST' | 'STANDARD'

export type BridgeEstimate = {
  fee: string
  estimatedTime: string
  gasEstimate: string
}

export type BridgeResult = {
  sourceTxHash: string
  destinationTxHash: string
}

export type AdapterLike = {
  signMessage?: (msg: string) => Promise<string>
  sendTransaction?: (tx: unknown) => Promise<string>
  [key: string]: unknown
}

type BridgeKitInstance = {
  estimate: (params: {
    from: { adapter: AdapterLike; chain: { id: number | string; name: string }; address: string }
    to: { adapter: AdapterLike; chain: { id: number | string; name: string }; address: string }
    amount: string
    config: { transferSpeed: BridgeSpeed }
  }) => Promise<BridgeEstimate>
  bridge: (params: {
    from: { adapter: AdapterLike; chain: { id: number | string; name: string }; address: string }
    to: {
      adapter: AdapterLike
      chain: { id: number | string; name: string }
      address: string
      useForwarder: boolean
    }
    amount: string
    config: { transferSpeed: BridgeSpeed }
  }) => Promise<BridgeResult>
}

let kitInstance: BridgeKitInstance | null = null

export async function getBridgeKit(): Promise<BridgeKitInstance> {
  if (kitInstance) return kitInstance
  const { BridgeKit } = await import('@circle-fin/bridge-kit')
  kitInstance = new BridgeKit() as unknown as BridgeKitInstance
  return kitInstance
}

export function chainConfigToKitChain(chain: ChainConfig): { id: number | string; name: string } {
  return { id: chain.id, name: chain.name }
}
