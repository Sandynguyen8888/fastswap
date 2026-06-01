import { useState } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { TokenBox } from '@/components/shared/TokenBox'
import { TxStatus } from '@/components/shared/TxStatus'
import { TokenSelector } from '@/components/swap/TokenSelector'
import { SettingsModal } from '@/components/swap/SettingsModal'
import { ConfirmModal } from '@/components/swap/ConfirmModal'
import { useSwap } from '@/hooks/useSwap'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { ARC_TOKENS } from '@/lib/tokens'

export function SwapForm() {
  const { isConnected } = useAccount()
  const [tokenIn, setTokenIn] = useState(ARC_TOKENS[0])  // USDC
  const [tokenOut, setTokenOut] = useState(ARC_TOKENS[2]) // WETH
  const [slippage, setSlippage] = useState(0.5)
  const [deadline, setDeadline] = useState(20)
  const [showTokenInSelector, setShowTokenInSelector] = useState(false)
  const [showTokenOutSelector, setShowTokenOutSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { raw: balanceRaw, formatted: balanceFormatted, refetch: refetchBalance } = useTokenBalance(tokenIn)
  const { formatted: balanceOutFormatted } = useTokenBalance(tokenOut)

  const {
    amountIn, amountOut, minReceived, quote, isQuoting,
    txStatus, txHash, error, isApproving,
    handleAmountChange, executeSwap, validate, reset,
  } = useSwap(tokenIn, tokenOut, slippage)

  function handleFlip() {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
  }

  function handleMax() {
    if (!tokenIn || balanceRaw === 0n) return
    handleAmountChange(formatUnits(balanceRaw, tokenIn.decimals))
  }

  function handleConfirm() {
    setShowConfirm(false)
    executeSwap().then(() => { void refetchBalance() })
  }

  const validationError = validate()
  const canSwap = !validationError && isConnected

  const impactClass =
    !quote ? '' :
    quote.priceImpact < 1 ? 'impact-low' :
    quote.priceImpact < 2 ? 'impact-medium' : 'impact-high'

  return (
    <>
      <div className="glass-card p-5 w-full max-w-md mx-auto space-y-3 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-arc-text font-heading">Swap</h2>
          <button
            className="btn-secondary text-xs px-3 py-1.5"
            onClick={() => setShowSettings(true)}
          >
            ⚙ {slippage}%
          </button>
        </div>

        {/* Token In */}
        <TokenBox
          label="You pay"
          token={tokenIn}
          amount={amountIn}
          balance={balanceFormatted}
          onTokenClick={() => setShowTokenInSelector(true)}
          onAmountChange={handleAmountChange}
          onMax={handleMax}
        />

        {/* Flip button */}
        <div className="flex justify-center -my-1">
          <button
            className="w-9 h-9 rounded-xl glass-card-inner flex items-center justify-center text-arc-text-subtle hover:text-arc-text hover:border-arc-primary/30 transition-all duration-150"
            onClick={handleFlip}
          >
            ⇅
          </button>
        </div>

        {/* Token Out */}
        <TokenBox
          label="You receive"
          token={tokenOut}
          amount={amountOut}
          balance={balanceOutFormatted}
          readonly
          loading={isQuoting}
          onTokenClick={() => setShowTokenOutSelector(true)}
        />

        {/* Info rows */}
        {quote && amountIn && (
          <div className="space-y-1.5 px-1">
            <div className="info-row">
              <span className="info-row-label">Rate</span>
              <span className="info-row-value text-sm">
                1 {tokenOut.symbol} = {(parseFloat(amountIn) / parseFloat(amountOut)).toFixed(4)} {tokenIn.symbol}
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Price impact</span>
              <span className={`text-sm ${impactClass}`}>{quote.priceImpact.toFixed(2)}%</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Gas (est.)</span>
              <span className="info-row-value text-sm">~0.012 USDC</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Min received</span>
              <span className="info-row-value text-sm">{parseFloat(minReceived).toFixed(6)} {tokenOut.symbol}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Route</span>
              <span className="info-row-value text-xs">{quote.route.join(' → ')}</span>
            </div>
          </div>
        )}

        {/* Price impact hard block */}
        {quote && quote.priceImpact > 10 && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm font-semibold">⛔ Price impact too high ({quote.priceImpact.toFixed(2)}%)</p>
            <p className="text-red-400/80 text-xs mt-0.5">Swap blocked to protect your funds.</p>
          </div>
        )}

        {/* CTA */}
        {!isConnected ? (
          <button className="btn-primary opacity-50 cursor-not-allowed" disabled>Connect Wallet</button>
        ) : (
          <button
            className="btn-primary"
            disabled={!canSwap || isApproving}
            onClick={() => setShowConfirm(true)}
          >
            {isApproving
              ? 'Approving…'
              : validationError ?? 'Swap'}
          </button>
        )}
      </div>

      {/* Modals */}
      {showTokenInSelector && (
        <TokenSelector
          onSelect={t => { setTokenIn(t); setShowTokenInSelector(false) }}
          onClose={() => setShowTokenInSelector(false)}
          exclude={tokenOut.address}
        />
      )}
      {showTokenOutSelector && (
        <TokenSelector
          onSelect={t => { setTokenOut(t); setShowTokenOutSelector(false) }}
          onClose={() => setShowTokenOutSelector(false)}
          exclude={tokenIn.address}
        />
      )}
      {showSettings && (
        <SettingsModal
          slippage={slippage}
          deadline={deadline}
          onSave={(s, d) => { setSlippage(s); setDeadline(d) }}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showConfirm && quote && (
        <ConfirmModal
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          amountIn={amountIn}
          amountOut={amountOut}
          minReceived={minReceived}
          quote={quote}
          slippage={slippage}
          onConfirm={handleConfirm}
          onClose={() => setShowConfirm(false)}
        />
      )}

      <TxStatus
        status={txStatus}
        txHash={txHash}
        error={error}
        onClose={reset}
      />
    </>
  )
}
