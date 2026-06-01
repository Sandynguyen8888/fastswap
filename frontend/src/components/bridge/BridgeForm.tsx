import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ChainSelector } from '@/components/bridge/ChainSelector'
import { SpeedSelector } from '@/components/bridge/SpeedSelector'
import { ProgressTracker } from '@/components/bridge/ProgressTracker'
import { useBridge } from '@/hooks/useBridge'
import { ARC_CHAIN, DESTINATION_CHAINS } from '@/lib/chains'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { getTokenBySymbol } from '@/lib/tokens'

export function BridgeForm() {
  const { address, isConnected } = useAccount()
  const [showSrcSelector, setShowSrcSelector] = useState(false)
  const [showDstSelector, setShowDstSelector] = useState(false)

  const usdc = getTokenBySymbol('USDC')

  const { state, update, swapChains, validate, fetchEstimate, executeBridge, reset } =
    useBridge(ARC_CHAIN, DESTINATION_CHAINS[0])

  const { formatted: usdcBalance } = useTokenBalance(usdc)

  // Sync recipient to connected address when first connected
  useEffect(() => {
    if (address && !state.recipient) {
      update({ recipient: address })
    }
  }, [address])

  // Re-fetch estimate on amount/speed/chain changes
  useEffect(() => {
    if (state.amount && parseFloat(state.amount) > 0) {
      const t = setTimeout(() => fetchEstimate(), 500)
      return () => clearTimeout(t)
    }
  }, [state.amount, state.speed, state.srcChain.id, state.dstChain.id])

  const validationError = validate()
  const canBridge = !validationError && isConnected && state.status === 'idle'

  const isInProgress = ['burning', 'attesting', 'minting'].includes(state.status)

  return (
    <>
      <div className="glass-card p-5 w-full max-w-md mx-auto space-y-4 animate-slide-up">
        <h2 className="text-base font-semibold text-arc-text font-heading">Bridge USDC</h2>

        {/* Chain selectors */}
        <div className="space-y-2">
          {/* Source */}
          <div>
            <p className="text-xs text-arc-text-subtle mb-1.5">From</p>
            <button
              className="w-full glass-card-inner px-4 py-3 flex items-center gap-3 hover:border-arc-primary/30 transition-colors rounded-xl border border-white/5"
              onClick={() => setShowSrcSelector(true)}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: state.srcChain.dotColor, boxShadow: `0 0 6px ${state.srcChain.dotColor}60` }}
              />
              <span className="flex-1 text-left font-semibold text-arc-text">{state.srcChain.name}</span>
              <svg className="w-4 h-4 text-arc-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Flip */}
          <div className="flex justify-center">
            <button
              className="w-9 h-9 rounded-xl glass-card-inner flex items-center justify-center text-arc-text-subtle hover:text-arc-text hover:border-arc-primary/30 transition-all duration-150"
              onClick={swapChains}
            >
              ⇅
            </button>
          </div>

          {/* Destination */}
          <div>
            <p className="text-xs text-arc-text-subtle mb-1.5">To</p>
            <button
              className="w-full glass-card-inner px-4 py-3 flex items-center gap-3 hover:border-arc-primary/30 transition-colors rounded-xl border border-white/5"
              onClick={() => setShowDstSelector(true)}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: state.dstChain.dotColor, boxShadow: `0 0 6px ${state.dstChain.dotColor}60` }}
              />
              <span className="flex-1 text-left font-semibold text-arc-text">{state.dstChain.name}</span>
              <div className="flex items-center gap-2">
                <span className={`cctp-badge ${state.dstChain.cctpVersion === 'V2' ? 'cctp-v2' : 'cctp-v1'}`}>
                  CCTP {state.dstChain.cctpVersion}
                </span>
                <svg className="w-4 h-4 text-arc-text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <div className="glass-card-inner p-4">
            <div className="flex items-center justify-between text-xs text-arc-text-subtle mb-2">
              <span>Amount (USDC)</span>
              {isConnected && (
                <span>
                  Balance: {parseFloat(usdcBalance).toFixed(2)} USDC
                  {parseFloat(usdcBalance) > 0 && (
                    <button
                      className="ml-1.5 text-arc-primary-light font-semibold hover:text-white transition-colors"
                      onClick={() => update({ amount: parseFloat(usdcBalance).toFixed(2) })}
                    >
                      MAX
                    </button>
                  )}
                </span>
              )}
            </div>
            <input
              className="arc-input text-xl font-semibold"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={state.amount}
              onChange={e => update({ amount: e.target.value })}
            />
          </div>
        </div>

        {/* Recipient */}
        <div>
          <p className="text-xs text-arc-text-subtle mb-1.5">Recipient Address</p>
          <div className="glass-card-inner p-3">
            <input
              className="arc-input text-sm"
              placeholder={`${state.dstChain.name} address`}
              value={state.recipient}
              onChange={e => update({ recipient: e.target.value })}
            />
          </div>
          <p className="text-xs text-arc-text-subtle mt-1 px-1">
            {state.dstChain.id === 'solana-mainnet'
              ? 'Solana base58 address'
              : state.dstChain.id === 'sui-mainnet'
              ? 'Sui address (0x + 64 hex chars)'
              : 'EVM checksum address (0x...)'}
          </p>
        </div>

        {/* Speed */}
        <SpeedSelector
          value={state.speed}
          dstChain={state.dstChain}
          onChange={speed => update({ speed })}
        />

        {/* Info rows */}
        <div className="space-y-1.5 px-1">
          <div className="info-row">
            <span className="info-row-label">You receive</span>
            <span className="info-row-value">
              ~{state.amount || '0'} USDC on {state.dstChain.name}
            </span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Speed</span>
            <span className="info-row-value">
              {state.speed === 'FAST' ? '⚡ ~30s (Fast)' : '~13-19min (Standard)'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Bridge fee</span>
            <span className="text-green-400 font-medium text-sm">Free</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Gas (src)</span>
            <span className="info-row-value">~0.05 USDC</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Mechanism</span>
            <span className="info-row-value text-xs">CCTP {state.dstChain.cctpVersion} Burn & Mint</span>
          </div>
        </div>

        {/* CTA */}
        {!isConnected ? (
          <button className="btn-primary opacity-50 cursor-not-allowed" disabled>Connect Wallet</button>
        ) : (
          <button
            className="btn-primary"
            disabled={!canBridge || isInProgress}
            onClick={executeBridge}
          >
            {isInProgress
              ? state.status === 'burning' ? 'Burning USDC…'
              : state.status === 'attesting' ? 'Awaiting attestation…'
              : 'Minting on destination…'
              : validationError ?? 'Bridge USDC'}
          </button>
        )}
      </div>

      {/* Modals */}
      {showSrcSelector && (
        <ChainSelector
          selected={state.srcChain}
          exclude={state.dstChain.id}
          onSelect={chain => update({ srcChain: chain })}
          onClose={() => setShowSrcSelector(false)}
        />
      )}
      {showDstSelector && (
        <ChainSelector
          selected={state.dstChain}
          exclude={state.srcChain.id}
          onSelect={chain => update({ dstChain: chain })}
          onClose={() => setShowDstSelector(false)}
        />
      )}

      <ProgressTracker
        status={state.status}
        burnTx={state.burnTx}
        mintTx={state.mintTx}
        srcChain={state.srcChain}
        dstChain={state.dstChain}
        onClose={reset}
      />
    </>
  )
}
