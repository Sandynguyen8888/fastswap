import type { Token } from '@/lib/tokens'
import type { SwapQuote } from '@/hooks/useSwap'
import { TokenAvatar } from '@/components/shared/TokenAvatar'

type Props = {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  amountOut: string
  minReceived: string
  quote: SwapQuote
  slippage: number
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  tokenIn, tokenOut, amountIn, amountOut, minReceived, quote, slippage, onConfirm, onClose,
}: Props) {
  const impactClass =
    quote.priceImpact < 1 ? 'impact-low' :
    quote.priceImpact < 2 ? 'impact-medium' : 'impact-high'

  const rate = amountIn && amountOut
    ? (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)
    : '—'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-arc-text font-heading">Confirm Swap</h3>
          <button className="text-arc-text-subtle hover:text-arc-text transition-colors text-xl" onClick={onClose}>✕</button>
        </div>

        {/* Token flow */}
        <div className="space-y-2 mb-4">
          <div className="glass-card-inner p-3 flex items-center gap-3">
            <TokenAvatar token={tokenIn} size={32} />
            <div>
              <p className="text-xs text-arc-text-subtle">You pay</p>
              <p className="font-semibold text-arc-text">{amountIn} {tokenIn.symbol}</p>
            </div>
          </div>
          <div className="text-center text-arc-text-subtle text-lg">↓</div>
          <div className="glass-card-inner p-3 flex items-center gap-3">
            <TokenAvatar token={tokenOut} size={32} />
            <div>
              <p className="text-xs text-arc-text-subtle">You receive (estimated)</p>
              <p className="font-semibold text-arc-text">{parseFloat(amountOut).toFixed(6)} {tokenOut.symbol}</p>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 py-3 border-t border-b border-white/10 mb-4">
          <div className="info-row">
            <span className="info-row-label">Rate</span>
            <span className="info-row-value">1 {tokenIn.symbol} = {rate} {tokenOut.symbol}</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Price impact</span>
            <span className={impactClass}>{quote.priceImpact.toFixed(2)}%</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Slippage</span>
            <span className="info-row-value">{slippage}%</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Min received</span>
            <span className="info-row-value">{parseFloat(minReceived).toFixed(6)} {tokenOut.symbol}</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Route</span>
            <span className="info-row-value text-xs">{quote.route.join(' → ')}</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Gas (est.)</span>
            <span className="info-row-value">~0.012 USDC</span>
          </div>
        </div>

        {quote.priceImpact > 2 && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
            <p className="text-red-400 text-sm font-semibold">⚠ High price impact ({quote.priceImpact.toFixed(2)}%)</p>
            <p className="text-red-400/80 text-xs mt-0.5">Your trade will significantly move the price.</p>
          </div>
        )}

        <button className="btn-primary" onClick={onConfirm}>Confirm Swap</button>
      </div>
    </div>
  )
}
