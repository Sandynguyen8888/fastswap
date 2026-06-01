import { useState, useCallback, useRef } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import type { Token } from '@/lib/tokens'
import { useAllowance } from '@/hooks/useAllowance'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { arcTestnet } from '@/lib/chains'

const SWAP_ROUTER_ADDRESS = (import.meta.env.VITE_SWAP_ROUTER_ADDRESS ?? '0x0000000000000000000000000000000000000000') as `0x${string}`
const QUOTE_API_URL = import.meta.env.VITE_QUOTE_API_URL ?? ''

const SWAP_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
      },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
] as const

export type TxStatus = 'idle' | 'approving' | 'swapping' | 'confirmed' | 'failed'

export type SwapQuote = {
  amountOut: string
  priceImpact: number
  route: string[]
  fee: number
}

export function useSwap(
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  slippage: number,
) {
  const { address } = useAccount()
  const [amountIn, setAmountIn] = useState('')
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isQuoting, setIsQuoting] = useState(false)
  const [txStatus, setTxStatus] = useState<TxStatus>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { raw: balanceRaw } = useTokenBalance(tokenIn)
  const { allowance, approve, isApproving } = useAllowance(tokenIn, SWAP_ROUTER_ADDRESS)
  const { writeContractAsync } = useWriteContract()
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  })

  const fetchQuote = useCallback(async (amount: string) => {
    if (!tokenIn || !tokenOut || !amount || parseFloat(amount) <= 0) {
      setQuote(null)
      return
    }
    setIsQuoting(true)
    try {
      let amountOut: string
      let priceImpact: number

      if (QUOTE_API_URL) {
        const res = await fetch(
          `${QUOTE_API_URL}/quote?tokenIn=${tokenIn.address}&tokenOut=${tokenOut.address}&amount=${amount}`
        )
        const data = (await res.json()) as { amountOut: string; priceImpact: number }
        amountOut = data.amountOut
        priceImpact = data.priceImpact
      } else {
        // Simulated quote for dev — replace with real QuoterV2 call
        await new Promise(r => setTimeout(r, 400))
        const mockRatio = tokenIn.symbol === 'USDC' && tokenOut.symbol === 'WETH'
          ? 1 / 3200
          : tokenIn.symbol === 'WETH' && tokenOut.symbol === 'USDC'
          ? 3200
          : 1.0
        const rawOut = parseFloat(amount) * mockRatio * 0.997 // 0.3% fee
        amountOut = rawOut.toFixed(tokenOut.decimals > 8 ? 6 : tokenOut.decimals)
        priceImpact = parseFloat(amount) > 1000 ? 0.8 : 0.1
      }

      setQuote({
        amountOut,
        priceImpact,
        route: priceImpact > 1 ? [tokenIn.symbol, 'USDC', tokenOut.symbol] : [tokenIn.symbol, tokenOut.symbol],
        fee: 3000,
      })
    } catch {
      setQuote(null)
    } finally {
      setIsQuoting(false)
    }
  }, [tokenIn, tokenOut])

  function handleAmountChange(value: string) {
    setAmountIn(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchQuote(value), 500)
  }

  function getAmountOutMin(): bigint {
    if (!quote || !tokenOut) return 0n
    const raw = parseFloat(quote.amountOut) * (1 - slippage / 100)
    return parseUnits(raw.toFixed(tokenOut.decimals), tokenOut.decimals)
  }

  function validate(): string | null {
    if (!tokenIn || !tokenOut) return 'Select tokens'
    if (tokenIn.address === tokenOut.address) return 'Tokens must differ'
    if (!amountIn || parseFloat(amountIn) <= 0) return 'Enter amount'
    if (!quote) return 'Fetching quote…'
    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
    if (amountInParsed > balanceRaw) return `Insufficient ${tokenIn.symbol} balance`
    if (quote.priceImpact > 10) return 'Price impact too high (>10%)'
    return null
  }

  async function executeSwap() {
    if (!address || !tokenIn || !tokenOut || !quote) return
    setError(null)
    try {
      const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
      const amountOutMin = getAmountOutMin()
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)

      if (allowance < amountInParsed) {
        setTxStatus('approving')
        await approve()
      }

      setTxStatus('swapping')
      const hash = await writeContractAsync({
        address: SWAP_ROUTER_ADDRESS,
        abi: SWAP_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [
          {
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            fee: quote.fee,
            recipient: address,
            deadline,
            amountIn: amountInParsed,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0n,
          },
        ],
        chainId: arcTestnet.id,
      })
      setTxHash(hash)
      setTxStatus('confirmed')
    } catch (e) {
      setTxStatus('failed')
      setError(e instanceof Error ? e.message : 'Swap failed')
    }
  }

  const amountOutFormatted = quote?.amountOut ?? ''
  const minReceived = quote && tokenOut
    ? formatUnits(getAmountOutMin(), tokenOut.decimals)
    : ''

  return {
    amountIn,
    amountOut: amountOutFormatted,
    minReceived,
    quote,
    isQuoting,
    txStatus: isConfirmed ? 'confirmed' : txStatus,
    txHash,
    error,
    isApproving,
    handleAmountChange,
    executeSwap,
    validate,
    reset: () => { setTxStatus('idle'); setTxHash(null); setError(null) },
  }
}
