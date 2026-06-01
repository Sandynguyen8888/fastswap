import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'
import { arcTestnet } from '@/lib/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'Arc dApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'demo-project-id',
  chains: [arcTestnet, sepolia],
  ssr: false,
})
