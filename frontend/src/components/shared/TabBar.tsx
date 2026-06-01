type Tab = 'swap' | 'bridge'

type Props = {
  active: Tab
  onChange: (tab: Tab) => void
}

export function TabBar({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 rounded-xl border border-white/10 bg-white/[0.03] w-fit mx-auto">
      <button
        className={`tab-btn ${active === 'swap' ? 'active' : ''}`}
        onClick={() => onChange('swap')}
      >
        ⇄ Swap
      </button>
      <button
        className={`tab-btn ${active === 'bridge' ? 'active' : ''}`}
        onClick={() => onChange('bridge')}
      >
        ⛓ Bridge
      </button>
    </div>
  )
}
