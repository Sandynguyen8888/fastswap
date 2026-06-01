import type { BridgeSpeed } from '@/lib/bridgekit'
import type { ChainConfig } from '@/lib/chains'

type Props = {
  value: BridgeSpeed
  dstChain: ChainConfig
  onChange: (speed: BridgeSpeed) => void
}

export function SpeedSelector({ value, dstChain, onChange }: Props) {
  const fastDisabled = !dstChain.supportsFast

  return (
    <div className="space-y-2">
      <p className="text-sm text-arc-text-subtle">Transfer Speed</p>
      <div className="flex gap-2">
        <button
          className={`speed-btn ${value === 'FAST' && !fastDisabled ? 'active' : ''}`}
          disabled={fastDisabled}
          onClick={() => onChange('FAST')}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span>⚡</span>
            <span>Fast</span>
          </div>
          <p className="text-xs font-normal mt-0.5 opacity-70">~30 seconds</p>
        </button>

        <button
          className={`speed-btn ${value === 'STANDARD' ? 'active' : ''}`}
          onClick={() => onChange('STANDARD')}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span>🕐</span>
            <span>Standard</span>
          </div>
          <p className="text-xs font-normal mt-0.5 opacity-70">
            {dstChain.id === 1 ? '13-19 min' : '~5 min'}
          </p>
        </button>
      </div>

      {fastDisabled && (
        <p className="text-xs text-arc-text-subtle">
          {dstChain.name} uses CCTP V1 — Fast Transfer not available
        </p>
      )}
    </div>
  )
}
