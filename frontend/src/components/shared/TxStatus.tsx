import type { TxStatus as Status } from '@/hooks/useSwap'

type Props = {
  status: Status
  txHash: string | null
  explorerUrl?: string
  error?: string | null
  onClose: () => void
}

export function TxStatus({ status, txHash, explorerUrl = 'https://testnet.arcscan.app', error, onClose }: Props) {
  if (status === 'idle') return null

  const isLoading = status === 'approving' || status === 'swapping'
  const isDone = status === 'confirmed'
  const isFailed = status === 'failed'

  return (
    <div className="modal-overlay" onClick={isDone || isFailed ? onClose : undefined}>
      <div className="modal-content max-w-sm text-center" onClick={e => e.stopPropagation()}>
        {isLoading && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-arc-primary/30 border-t-arc-primary animate-spin" />
            <p className="font-semibold text-arc-text text-lg">
              {status === 'approving' ? 'Approving token…' : 'Swapping…'}
            </p>
            <p className="text-arc-text-subtle text-sm mt-1">Confirm in your wallet</p>
          </>
        )}

        {isDone && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center text-3xl animate-step-complete">
              ✓
            </div>
            <p className="font-semibold text-arc-text text-lg">Swap Confirmed</p>
            <p className="text-arc-text-subtle text-sm mt-1">Transaction finalized on Arc</p>
            {txHash && (
              <a
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-arc-primary-light hover:text-white transition-colors underline underline-offset-2"
              >
                View on ArcScan →
              </a>
            )}
            <button className="btn-primary mt-4" onClick={onClose}>Done</button>
          </>
        )}

        {isFailed && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center text-3xl">
              ✗
            </div>
            <p className="font-semibold text-arc-text text-lg">Swap Failed</p>
            {error && <p className="text-red-400 text-sm mt-1 break-words">{error}</p>}
            <button className="btn-primary mt-4" onClick={onClose}>Try Again</button>
          </>
        )}
      </div>
    </div>
  )
}
