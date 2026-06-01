import { useState } from 'react'
import { ARC_TOKENS, type Token } from '@/lib/tokens'
import { TokenAvatar } from '@/components/shared/TokenAvatar'
import { useTokenBalance } from '@/hooks/useTokenBalance'

type Props = {
  onSelect: (token: Token) => void
  onClose: () => void
  exclude?: `0x${string}`
}

function TokenRow({ token, onSelect, exclude }: { token: Token; onSelect: (t: Token) => void; exclude?: string }) {
  const { formatted } = useTokenBalance(token)
  const disabled = token.address === exclude
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors rounded-xl ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onSelect(token)}
      disabled={disabled}
    >
      <TokenAvatar token={token} size={36} />
      <div className="flex-1 text-left">
        <p className="font-semibold text-arc-text">{token.symbol}</p>
        <p className="text-xs text-arc-text-subtle">{token.name}</p>
      </div>
      <p className="text-sm text-arc-text-subtle font-medium">{parseFloat(formatted).toFixed(4)}</p>
    </button>
  )
}

export function TokenSelector({ onSelect, onClose, exclude }: Props) {
  const [search, setSearch] = useState('')

  const filtered = ARC_TOKENS.filter(t =>
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-arc-text font-heading">Select Token</h3>
          <button className="text-arc-text-subtle hover:text-arc-text transition-colors text-xl" onClick={onClose}>✕</button>
        </div>

        <div className="relative mb-3">
          <input
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-arc-text placeholder-arc-text-subtle outline-none focus:border-arc-primary/50 transition-colors"
            placeholder="Search name or paste address"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="absolute right-3 top-3.5 text-arc-text-subtle">🔍</span>
        </div>

        <div className="space-y-0.5 max-h-72 overflow-y-auto -mx-1">
          {filtered.length === 0
            ? <p className="text-center text-arc-text-subtle py-8">No tokens found</p>
            : filtered.map(token => (
                <TokenRow key={token.address} token={token} onSelect={onSelect} exclude={exclude} />
              ))
          }
        </div>
      </div>
    </div>
  )
}
