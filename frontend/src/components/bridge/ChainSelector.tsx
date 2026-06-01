import { SUPPORTED_CHAINS, type ChainConfig } from '@/lib/chains'

type Props = {
  selected: ChainConfig
  exclude?: number | string
  onSelect: (chain: ChainConfig) => void
  onClose: () => void
}

export function ChainSelector({ selected, exclude, onSelect, onClose }: Props) {
  const chains = SUPPORTED_CHAINS.filter(c => c.id !== exclude)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-arc-text font-heading">Select Network</h3>
          <button className="text-arc-text-subtle hover:text-arc-text transition-colors text-xl" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-1">
          {chains.map(chain => (
            <button
              key={String(chain.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                selected.id === chain.id
                  ? 'bg-arc-primary/10 border border-arc-primary/30'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => { onSelect(chain); onClose() }}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: chain.dotColor, boxShadow: `0 0 6px ${chain.dotColor}60` }}
              />
              <span className="flex-1 text-left font-semibold text-arc-text">{chain.name}</span>
              <div className="flex items-center gap-1.5">
                <span className={`cctp-badge ${chain.cctpVersion === 'V2' ? 'cctp-v2' : 'cctp-v1'}`}>
                  CCTP {chain.cctpVersion}
                </span>
                {chain.supportsFast && (
                  <span className="text-xs text-amber-400 font-semibold">⚡</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-xs text-arc-text-subtle">
            ⚡ = Fast Transfer (~30s) available &nbsp;|&nbsp;
            CCTP V1 chains (Sui) do not support Fast Transfer
          </p>
        </div>
      </div>
    </div>
  )
}
