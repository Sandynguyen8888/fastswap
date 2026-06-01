export type Token = {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  logoColor: string
  isNative?: boolean // true = native gas token (USDC trên Arc), dùng useBalance thay balanceOf
}

// Source: https://developers.circle.com/stablecoins/usdc-contract-addresses
//         https://developers.circle.com/stablecoins/eurc-contract-addresses
//         https://developers.circle.com/assets/cirbtc-contract-addresses
export const ARC_TOKENS: Token[] = [
  {
    address: '0x3600000000000000000000000000000000000000', // Circle official — Arc Testnet USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18, // native gas token trên Arc dùng 18 decimals
    logoColor: '#2775CA',
    isNative: true,
  },
  {
    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', // Circle official — Arc Testnet EURC
    symbol: 'EURC',
    name: 'Euro Coin',
    decimals: 6,
    logoColor: '#003087',
  },
  {
    address: '0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF', // Circle official — Arc Testnet cirBTC
    symbol: 'cirBTC',
    name: 'Circle Bitcoin',
    decimals: 8,
    logoColor: '#F7931A',
  },
  {
    address: '0x7b79995e5f793A07Bc00c21d5351D4B4F3b44B03', // placeholder — update khi có địa chỉ Arc Testnet
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logoColor: '#627EEA',
  },
  {
    address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // placeholder — update khi có địa chỉ Arc Testnet
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoColor: '#26A17B',
  },
]

// Mock USD prices for UI display — replace with Chainlink price feeds
export const TOKEN_PRICES: Record<string, number> = {
  USDC: 1.0,
  EURC: 1.08,
  cirBTC: 67000,
  WETH: 3200,
  USDT: 1.0,
}

// Địa chỉ testnet trên các chain khác (dùng cho bridge recipient validation)
export const TESTNET_USDC_ADDRESSES = {
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  solanaDevnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  suiTestnet: '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
}

export function getTokenBySymbol(symbol: string): Token | undefined {
  return ARC_TOKENS.find(t => t.symbol === symbol)
}

export function getTokenByAddress(address: string): Token | undefined {
  return ARC_TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase())
}
