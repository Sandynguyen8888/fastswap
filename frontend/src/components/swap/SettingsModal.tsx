import { useState } from 'react'

const PRESET_SLIPPAGES = [0.1, 0.5, 1.0]

type Props = {
  slippage: number
  deadline: number
  onSave: (slippage: number, deadline: number) => void
  onClose: () => void
}

export function SettingsModal({ slippage, deadline, onSave, onClose }: Props) {
  const [localSlippage, setLocalSlippage] = useState(slippage)
  const [customSlippage, setCustomSlippage] = useState('')
  const [localDeadline, setLocalDeadline] = useState(deadline)
  const [isCustom, setIsCustom] = useState(!PRESET_SLIPPAGES.includes(slippage))

  function handlePreset(value: number) {
    setLocalSlippage(value)
    setCustomSlippage('')
    setIsCustom(false)
  }

  function handleCustomInput(value: string) {
    setCustomSlippage(value)
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0 && num <= 50) {
      setLocalSlippage(num)
      setIsCustom(true)
    }
  }

  function handleSave() {
    onSave(localSlippage, localDeadline)
    onClose()
  }

  const slippageWarning = localSlippage > 5
    ? 'High slippage — your transaction may be frontrun'
    : localSlippage < 0.05
    ? 'Low slippage — transaction may fail'
    : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-arc-text font-heading">Swap Settings</h3>
          <button className="text-arc-text-subtle hover:text-arc-text transition-colors text-xl" onClick={onClose}>✕</button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-arc-text-subtle mb-2">Slippage Tolerance</p>
            <div className="flex items-center gap-2">
              {PRESET_SLIPPAGES.map(v => (
                <button
                  key={v}
                  className={`slippage-btn ${!isCustom && localSlippage === v ? 'active' : ''}`}
                  onClick={() => handlePreset(v)}
                >
                  {v}%
                </button>
              ))}
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors ${isCustom ? 'border-arc-primary/50 bg-arc-primary/10' : 'border-white/5 bg-transparent'}`}>
                <input
                  className="w-14 bg-transparent text-arc-text text-sm outline-none"
                  placeholder="0.5"
                  value={customSlippage}
                  onChange={e => handleCustomInput(e.target.value)}
                  onClick={() => setIsCustom(true)}
                />
                <span className="text-arc-text-subtle">%</span>
              </div>
            </div>
            {slippageWarning && (
              <p className="text-amber-400 text-xs mt-1.5">⚠ {slippageWarning}</p>
            )}
          </div>

          <div>
            <p className="text-sm text-arc-text-subtle mb-2">Transaction Deadline</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-arc-text outline-none focus:border-arc-primary/50"
                value={localDeadline}
                min={1}
                max={4320}
                onChange={e => setLocalDeadline(Number(e.target.value))}
              />
              <span className="text-sm text-arc-text-subtle">minutes</span>
            </div>
          </div>
        </div>

        <button className="btn-primary mt-6" onClick={handleSave}>Save Settings</button>
      </div>
    </div>
  )
}
