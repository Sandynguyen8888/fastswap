/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CIRCLE_API_KEY: string
  readonly VITE_ARC_RPC_URL: string
  readonly VITE_ARC_CHAIN_ID: string
  readonly VITE_ALCHEMY_KEY: string
  readonly VITE_CIRCLE_ENTITY_SECRET: string
  readonly VITE_SWAP_ROUTER_ADDRESS: string
  readonly VITE_QUOTE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
