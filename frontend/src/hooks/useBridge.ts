import { useState } from 'react'
import { useAccount, useConnectorClient } from 'wagmi'
import type { ChainConfig } from '@/lib/chains'
import { getBridgeKit, chainConfigToKitChain, type BridgeSpeed, type BridgeEstimate } from '@/lib/bridgekit'
import { validateRecipientAddress } from '@/lib/cctp'

export type TransferStatus = 'idle' | 'burning' | 'attesting' | 'minting' | 'done' | 'failed'

export type BridgeState = {
  srcChain: ChainConfig
  dstChain: ChainConfig
  amount: string
  recipient: string
  speed: BridgeSpeed
  status: TransferStatus
  burnTx: string | null
  mintTx: string | null
  error: string | null
}

export function useBridge(initialSrc: ChainConfig, initialDst: ChainConfig) {
  const { address } = useAccount()
  const { data: connectorClient } = useConnectorClient()

  const [state, setState] = useState<BridgeState>({
    srcChain: initialSrc,
    dstChain: initialDst,
    amount: '',
    recipient: address ?? '',
    speed: 'FAST',
    status: 'idle',
    burnTx: null,
    mintTx: null,
    error: null,
  })

  const [estimate, setEstimate] = useState<BridgeEstimate | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)

  function update(partial: Partial<BridgeState>) {
    setState(prev => ({ ...prev, ...partial }))
  }

  function swapChains() {
    setState(prev => ({
      ...prev,
      srcChain: prev.dstChain,
      dstChain: prev.srcChain,
    }))
  }

  function validate(): string | null {
    if (!state.amount || parseFloat(state.amount) <= 0) return 'Enter amount'
    if (!state.recipient) return 'Enter recipient address'
    if (!validateRecipientAddress(state.recipient, state.dstChain.id)) {
      return `Invalid ${state.dstChain.name} address format`
    }
    if (!state.dstChain.supportsFast && state.speed === 'FAST') {
      return `${state.dstChain.name} does not support Fast Transfer`
    }
    return null
  }

  async function fetchEstimate() {
    if (!address || !connectorClient || !state.amount || parseFloat(state.amount) <= 0) return
    setIsEstimating(true)
    try {
      const kit = await getBridgeKit()
      const adapter = connectorClient as unknown as Parameters<typeof kit.estimate>[0]['from']['adapter']
      const est = await kit.estimate({
        from: { adapter, chain: chainConfigToKitChain(state.srcChain), address },
        to: { adapter, chain: chainConfigToKitChain(state.dstChain), address: state.recipient || address },
        amount: state.amount,
        config: { transferSpeed: state.speed },
      })
      setEstimate(est)
    } catch {
      setEstimate(null)
    } finally {
      setIsEstimating(false)
    }
  }

  async function executeBridge() {
    if (!address || !connectorClient) return
    const validationError = validate()
    if (validationError) {
      update({ error: validationError })
      return
    }

    update({ status: 'burning', error: null, burnTx: null, mintTx: null })
    try {
      const kit = await getBridgeKit()
      const adapter = connectorClient as unknown as Parameters<typeof kit.bridge>[0]['from']['adapter']

      update({ status: 'attesting' })
      const result = await kit.bridge({
        from: { adapter, chain: chainConfigToKitChain(state.srcChain), address },
        to: {
          adapter,
          chain: chainConfigToKitChain(state.dstChain),
          address: state.recipient,
          useForwarder: true, // BridgeKit handles attestation internally
        },
        amount: state.amount,
        config: { transferSpeed: state.speed },
      })

      update({
        status: 'done',
        burnTx: result.sourceTxHash,
        mintTx: result.destinationTxHash,
      })
    } catch (e) {
      update({
        status: 'failed',
        error: e instanceof Error ? e.message : 'Bridge failed',
      })
    }
  }

  function reset() {
    setState(prev => ({
      ...prev,
      amount: '',
      status: 'idle',
      burnTx: null,
      mintTx: null,
      error: null,
    }))
    setEstimate(null)
  }

  return { state, estimate, isEstimating, update, swapChains, validate, fetchEstimate, executeBridge, reset }
}
