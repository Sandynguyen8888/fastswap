import type { Token } from '@/lib/tokens'
import { TokenAvatar } from '@/components/shared/TokenAvatar'
import { TOKEN_PRICES } from '@/lib/tokens'

type Props = {
  label: string
  token: Token | undefined
  amount: string
  balance?: string
  showBalance?: boolean
  readonly?: boolean
  loading?: boolean
  onTokenClick: () => void
  onAmountChange?: (value: string) => void
  onMax?: () => void
}

export function TokenBox({
  label,
  token,
  amount,
  balance = '0',
  showBalance = true,
  readonly = false,
  loading = false,
  onTokenClick,
  onAmountChange,
  onMax,
}: Props) {
  const usdValue = token && amount && parseFloat(amount) > 0
    ? (parseFloat(amount) * (TOKEN_PRICES[token.symbol] ?? 0)).toFixed(2)
    : null

  return (
    <div className="glass-card-inner p-4 space-y-2">
      <div className="flex items-center justify-between text-xs text-arc-text-subtle">
        <span>{label}</span>
        {token && showBalance && (
          <span>
            Balance:{' '}
            {isNaN(parseFloat(balance)) ? '0.0000' : parseFloat(balance).toFixed(4)}{' '}
            {token.symbol}
            {onMax && parseFloat(balance) > 0 && !isNaN(parseFloat(balance)) && (
              <button
                className="ml-2 text-arc-primary-light font-semibold hover:text-white transition-colors"
                onClick={onMax}
              >
                MAX
              </button>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          className="token-chip flex-shrink-0"
          onClick={onTokenClick}
        >
          {token ? (
            <>
              <TokenAvatar token={token} size={24} />
              <span className="font-semibold">{token.symbol}</span>
            </>
          ) : (
            <span className="text-arc-text-subtle font-medium text-sm">Select token</span>
          )}
          <svg className="w-3.5 h-3.5 text-arc-text-subtle ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="flex-1 text-right">
          {loading ? (
            <div className="h-8 w-24 ml-auto rounded-lg bg-white/10 animate-pulse" />
          ) : (
            <input
              className="arc-input text-right text-xl font-semibold w-full"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={amount}
              readOnly={readonly}
              onChange={e => onAmountChange?.(e.target.value)}
            />
          )}
          {usdValue && (
            <p className="text-xs text-arc-text-subtle mt-0.5">≈ ${usdValue}</p>
          )}
        </div>
      </div>
    </div>
  )
}
