import React from 'react'
import ReactDOM from 'react-dom/client'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import { wagmiConfig } from '@/lib/wagmi'
import IndexPage from '@/pages/index'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10_000, retry: 1 },
  },
})

const rkTheme = darkTheme({
  accentColor: '#3E74BB',
  accentColorForeground: 'white',
  borderRadius: 'medium',
  overlayBlur: 'small',
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rkTheme}>
          <IndexPage />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1F2F44',
                color: '#F5F5F8',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
