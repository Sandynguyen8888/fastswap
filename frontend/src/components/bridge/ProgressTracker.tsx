import type { TransferStatus } from '@/hooks/useBridge'
import type { ChainConfig } from '@/lib/chains'

type Props = {
  status: TransferStatus
  burnTx: string | null
  mintTx: string | null
  srcChain: ChainConfig
  dstChain: ChainConfig
  onClose: () => void
}

type StepState = 'pending' | 'active' | 'completed'

function getStepStates(status: TransferStatus): [StepState, StepState, StepState] {
  switch (status) {
    case 'burning':   return ['active', 'pending', 'pending']
    case 'attesting': return ['completed', 'active', 'pending']
    case 'minting':   return ['completed', 'completed', 'active']
    case 'done':      return ['completed', 'completed', 'completed']
    default:          return ['pending', 'pending', 'pending']
  }
}

function Step({ n, label, detail, state }: { n: number; label: string; detail: string; state: StepState }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`step-dot ${state}`}>
        {state === 'completed' ? '✓' : state === 'active' ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
        ) : n}
      </div>
      <div className="flex-1 pb-6">
        <p className={`font-semibold ${state === 'pending' ? 'text-arc-text-subtle' : 'text-arc-text'}`}>{label}</p>
        <p className="text-xs text-arc-text-subtle mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

export function ProgressTracker({ status, burnTx, mintTx, srcChain, dstChain, onClose }: Props) {
  if (status === 'idle') return null

  const [burnState, attestState, mintState] = getStepStates(status)
  const isDone = status === 'done'
  const isFailed = status === 'failed'

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-arc-text font-heading">Bridge in Progress</h3>
          {(isDone || isFailed) && (
            <button className="text-arc-text-subtle hover:text-arc-text transition-colors text-xl" onClick={onClose}>✕</button>
          )}
        </div>

        <div className="relative pl-2">
          {/* Connecting line */}
          <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-white/10" />

          <Step
            n={1}
            label="Burn on Source"
            detail={`Burning USDC on ${srcChain.name} via TokenMessenger`}
            state={burnState}
          />
          <Step
            n={2}
            label="Circle Attestation"
            detail="Waiting for Circle Iris API to sign the message"
            state={attestState}
          />
          <Step
            n={3}
            label="Mint on Destination"
            detail={`Minting native USDC on ${dstChain.name}`}
            state={mintState}
          />
        </div>

        {(isDone || isFailed) && (
          <div className="mt-4 space-y-2">
            {isDone && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <p className="text-green-400 font-semibold text-sm">✓ Bridge Complete!</p>
                <p className="text-green-400/70 text-xs mt-0.5">USDC successfully bridged — native, no wrapping</p>
              </div>
            )}
            {isFailed && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 font-semibold text-sm">✗ Bridge Failed</p>
              </div>
            )}

            {burnTx && (
              <a
                href={`${srcChain.explorerUrl}/tx/${burnTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
              >
                <span className="text-xs text-arc-text-subtle">Burn tx ({srcChain.shortName})</span>
                <span className="text-xs text-arc-primary-light">{burnTx.slice(0, 10)}… →</span>
              </a>
            )}
            {mintTx && (
              <a
                href={`${dstChain.explorerUrl}/tx/${mintTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
              >
                <span className="text-xs text-arc-text-subtle">Mint tx ({dstChain.shortName})</span>
                <span className="text-xs text-arc-primary-light">{mintTx.slice(0, 10)}… →</span>
              </a>
            )}

            <button className="btn-primary mt-2" onClick={onClose}>
              {isDone ? 'Done' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
