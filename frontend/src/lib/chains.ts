import { defineChain } from 'viem'
import { sepolia } from 'wagmi/chains'

// Chain ID: 5042002 — source: https://docs.arc.io/arc/references/connect-to-arc
// Native gas token is USDC with 18 decimals (EVM-compatible representation)
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USD Coin', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
    public: {
      http: [
        'https://rpc.testnet.arc.network',
        'https://rpc.blockdaemon.testnet.arc.network',
        'https://rpc.drpc.testnet.arc.network',
      ],
    },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
})

export type ChainConfig = {
  id: number | string
  name: string
  shortName: string
  dotColor: string
  cctpDomain: number
  cctpVersion: 'V1' | 'V2'
  supportsFast: boolean
  explorerUrl: string
  isEvm: boolean
}

// Testnet-only chains for bridge
export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: arcTestnet.id,
    name: 'Arc Testnet',
    shortName: 'Arc',
    dotColor: '#ACC6E9',
    cctpDomain: 26, // Confirmed — source: https://docs.arc.io/arc/references/contract-addresses
    cctpVersion: 'V2',
    supportsFast: true,
    explorerUrl: 'https://testnet.arcscan.app',
    isEvm: true,
  },
  {
    id: sepolia.id, // 11155111
    name: 'Sepolia',
    shortName: 'SEP',
    dotColor: '#627EEA',
    cctpDomain: 0,
    cctpVersion: 'V2',
    supportsFast: true,
    explorerUrl: 'https://sepolia.etherscan.io',
    isEvm: true,
  },
  {
    id: 'solana-devnet',
    name: 'Solana Devnet',
    shortName: 'SOL',
    dotColor: '#9945FF',
    cctpDomain: 5,
    cctpVersion: 'V2',
    supportsFast: true,
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    isEvm: false,
  },
  {
    id: 'sui-testnet',
    name: 'Sui Testnet',
    shortName: 'SUI',
    dotColor: '#4DA2FF',
    cctpDomain: 8,
    cctpVersion: 'V1',
    supportsFast: false,
    explorerUrl: 'https://suiscan.xyz/testnet',
    isEvm: false,
  },
]

export const ARC_CHAIN = SUPPORTED_CHAINS[0]

export const DESTINATION_CHAINS = SUPPORTED_CHAINS.filter(c => c.id !== arcTestnet.id)
