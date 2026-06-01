import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { TabBar } from '@/components/shared/TabBar'
import { WalletConnect } from '@/components/shared/WalletConnect'
import { SwapForm } from '@/components/swap/SwapForm'
import { BridgeForm } from '@/components/bridge/BridgeForm'
import { arcTestnet } from '@/lib/chains'

type Tab = 'swap' | 'bridge'

export default function IndexPage() {
  const [tab, setTab] = useState<Tab>('swap')
  const { isConnected, chainId } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const isOnArc = chainId === arcTestnet.id

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="FastSwap"
            className="h-10 w-auto object-contain"
          />
          <span className="text-xs px-2 py-0.5 rounded-full border border-arc-primary/40 text-arc-primary-light bg-arc-primary/10 font-medium">
            Testnet
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/30 text-amber-400 bg-amber-400/10 text-sm font-semibold hover:bg-amber-400/20 hover:border-amber-400/50 transition-all duration-150"
          >
            <span>🚰</span>
            <span>Faucet</span>
          </a>
          <WalletConnect />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 gap-6">
        {/* Hero text */}
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold font-heading gradient-text">
            Swap & Bridge
          </h1>
          <p className="text-arc-text-subtle text-sm mt-1">
            Stablecoins on Arc Network — sub-second finality, gas in USDC
          </p>
        </div>

        <TabBar active={tab} onChange={setTab} />

        {/* Wrong network banner */}
        {isConnected && !isOnArc && (
          <div className="w-full max-w-md px-4 py-3 rounded-xl border border-amber-400/40 bg-amber-400/10 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-lg">⚠</span>
              <div>
                <p className="text-amber-400 font-semibold text-sm">Wrong Network</p>
                <p className="text-amber-400/70 text-xs">Switch to Arc Testnet to use the app</p>
              </div>
            </div>
            <button
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #3E74BB 0%, #2d5a9b 100%)' }}
              disabled={isSwitching}
              onClick={() => switchChain({ chainId: arcTestnet.id })}
            >
              {isSwitching ? 'Switching…' : 'Switch Network'}
            </button>
          </div>
        )}

        {tab === 'swap' ? <SwapForm /> : <BridgeForm />}

        {/* Footer note */}
        <p className="text-xs text-arc-text-subtle text-center max-w-xs">
          Bridge powered by{' '}
          <span className="text-arc-primary-light">CCTP V2</span> — native USDC, no wrapped tokens, no liquidity pools.
        </p>
      </main>
    </div>
  )
}
