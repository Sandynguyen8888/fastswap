import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { maxUint256 } from 'viem'
import type { Token } from '@/lib/tokens'

const ERC20_ALLOWANCE_ABI = [
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export function useAllowance(token: Token | undefined, spender: `0x${string}` | undefined) {
  const { address } = useAccount()

  // Native gas token (USDC trên Arc) không cần approve — skip ERC20 allowance check
  const isNative = token?.isNative === true

  const { data: allowance, refetch } = useReadContract({
    address: token?.address,
    abi: ERC20_ALLOWANCE_ABI,
    functionName: 'allowance',
    args: address && spender ? [address, spender] : undefined,
    query: { enabled: Boolean(!isNative && token && address && spender) },
  })

  const { writeContractAsync, data: approveTxHash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  })

  async function approve() {
    // Native token không cần approve
    if (isNative || !token || !spender) return
    await writeContractAsync({
      address: token.address,
      abi: ERC20_ALLOWANCE_ABI,
      functionName: 'approve',
      args: [spender, maxUint256],
    })
  }

  return {
    // Native token luôn có allowance đủ (không cần approve)
    allowance: isNative ? maxUint256 : ((allowance as bigint | undefined) ?? 0n),
    approve,
    isApproving: isPending || isConfirming,
    isApproved: isNative ? true : isApproved,
    refetch,
  }
}
