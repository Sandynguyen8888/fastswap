import { useBalance, useReadContract, useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import type { Token } from '@/lib/tokens'

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export function useTokenBalance(token: Token | undefined) {
  const { address } = useAccount()

  // Native gas token (USDC trên Arc) — dùng useBalance
  const { data: nativeData, isLoading: nativeLoading, refetch: nativeRefetch } = useBalance({
    address,
    query: { enabled: Boolean(token?.isNative && address) },
  })

  // ERC20 token — dùng balanceOf
  const { data: erc20Data, isLoading: erc20Loading, refetch: erc20Refetch } = useReadContract({
    address: token?.isNative ? undefined : token?.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(token && !token.isNative && address) },
  })

  if (token?.isNative) {
    const raw = nativeData?.value ?? 0n
    const formatted = nativeData?.formatted ?? '0'
    return { raw, formatted, isLoading: nativeLoading, refetch: nativeRefetch }
  }

  const raw = (erc20Data as bigint | undefined) ?? 0n
  const formatted = token && raw > 0n ? formatUnits(raw, token.decimals) : '0'
  return { raw, formatted, isLoading: erc20Loading, refetch: erc20Refetch }
}
