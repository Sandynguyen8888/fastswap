# Arc dApp — Swap & Bridge Spec

## STACK
- Frontend: React+Vite, wagmi/viem, @solana/web3.js, @mysten/sui.js, TailwindCSS
- Contracts: Solidity ^0.8.20, Foundry, OpenZeppelin, UniswapV3-fork
- Infra: Circle BridgeKit (@circle-fin/bridge-kit), Alchemy RPC, Chainlink price feeds, The Graph

## CHAIN CONFIG
```
Arc Testnet | chainId:TBD | RPC:https://rpc.arc.network | gas:USDC | finality:<1s
Ethereum    | chainId:1   | CCTP:V2 | speed:13-19min (standard) / ~30s (fast)
Solana      | CCTP:V2 (added Oct 2025)
Sui         | CCTP:V1
Base        | chainId:8453 | CCTP:V2
```

## TOKENS (Arc)
`USDC` (native gas), `WETH`, `WBTC`, `EURC`, `USDT`, tokenized RWAs

---

## FEATURE 1: SWAP

### UI State
```
tokenIn:  { address, symbol, decimals, balance, usdPrice }
tokenOut: { address, symbol, decimals, balance, usdPrice }
amountIn: string
amountOut: string        // computed
slippage: 0.1|0.5|1.0|custom
deadline: now+1200       // 20min in seconds
priceImpact: number      // warn>2%, block>10%
route: token[]           // swap path
txStatus: idle|approving|swapping|confirmed|failed
```

### Screens
1. **SwapForm** — tokenIn box / ⇅ flip btn / tokenOut box / info rows / CTA
2. **TokenSelector** — search input + list (symbol, name, balance, address)
3. **SettingsModal** — slippage radio + custom input + deadline input
4. **ConfirmModal** — summary + price impact warning + confirm btn
5. **TxStatus** — spinner → txHash link → success/fail

### Info Rows (SwapForm)
| Label | Value |
|---|---|
| Rate | 1 {tokenOut} = X {tokenIn} |
| Price impact | %, color: green<1% amber<2% red>2% |
| Gas (USDC) | ~0.012 USDC |
| Min received | amountOut × (1 - slippage) |
| Route | A → B or A → USDC → B |

### Contract Interface
```solidity
// SwapRouter.sol (UniV3-fork on Arc)
function exactInputSingle(ExactInputSingleParams calldata params)
  returns (uint256 amountOut);

function exactInput(ExactInputParams calldata params)
  returns (uint256 amountOut);

struct ExactInputSingleParams {
  address tokenIn; address tokenOut;
  uint24 fee; address recipient;
  uint256 deadline; uint256 amountIn;
  uint256 amountOutMinimum; uint160 sqrtPriceLimitX96;
}
```

### Flow
```
1. user input → fetch quote (GET /quote?tokenIn&tokenOut&amount)
2. compute amountOutMin = quote × (1 - slippage/100)
3. check allowance → if < amountIn: call approve(router, MAX_UINT)
4. call exactInputSingle() or exactInput() depending on route
5. Arc confirms <1s → update balances + push to history
```

### Validations
- amountIn > 0
- balance >= amountIn
- priceImpact < 10% (else block with warning)
- token not same on both sides
- deadline not expired

---

## FEATURE 2: BRIDGE

### UI State
```
srcChain:  { id, name, rpc, dotColor }
dstChain:  { id, name, rpc, dotColor }
amount:    string
recipient: string        // default: connected wallet
speed:     'FAST'|'SLOW'
transferStatus: idle|burning|attesting|minting|done|failed
burnTx:    string|null
mintTx:    string|null
```

### Screens
1. **BridgeForm** — srcChain selector / ⇅ flip / dstChain selector / amount box / recipient input / speed toggle / info rows / CTA
2. **ChainSelector** — list of supported chains with CCTP version badge
3. **SpeedSelector** — Fast (~30s, small fee) vs Standard (free, ~13-19min ETH)
4. **ProgressTracker** — 3-step: Burn → Attestation → Mint
5. **TxComplete** — show both txHash (src + dst) + explorer links

### Supported Routes
```
Arc ↔ Ethereum  CCTP V2  fast:yes
Arc ↔ Solana    CCTP V2  fast:yes
Arc ↔ Sui       CCTP V1  fast:no
Arc ↔ Base      CCTP V2  fast:yes
Arc ↔ Arbitrum  CCTP V2  fast:yes
Arc ↔ Polygon   CCTP V2  fast:yes
```

### Info Rows (BridgeForm)
| Label | Value |
|---|---|
| You receive | ~{amount} USDC on {dstChain} |
| Speed | ⚡ ~30s (Fast) or ~13-19min (Standard) |
| Bridge fee | 0 — only pay gas on both chains |
| Gas (src) | ~0.05 USDC |
| Mechanism | CCTP V2 Burn & Mint — native USDC, no wrapping |

### CCTP V2 Flow
```
STEP 1 — BURN (src chain = Arc)
  contract: TokenMessenger
  fn: depositForBurn(amount, destinationDomain, mintRecipient, burnToken)
  emit: DepositForBurn(nonce, burnToken, amount, depositor, mintRecipient, destinationDomain, ...)

STEP 2 — ATTEST (Circle Iris off-chain, ~5-30s)
  poll: GET https://iris-api.circle.com/attestations/{messageHash}
  wait for: status === "complete"
  extract: attestation (hex signature)

STEP 3 — MINT (dst chain)
  contract: MessageTransmitter
  fn: receiveMessage(message, attestation)
  result: native USDC minted 1:1 to recipient
```

### BridgeKit Integration
```js
import { BridgeKit } from '@circle-fin/bridge-kit'
const kit = new BridgeKit()

// Estimate
const est = await kit.estimate({
  from: { adapter, chain: srcChain, address: sender },
  to:   { adapter, chain: dstChain, address: recipient },
  amount: amountString,
  config: { transferSpeed: 'FAST' }
})

// Execute
const result = await kit.bridge({
  from: { adapter, chain: srcChain, address: sender },
  to:   { adapter, chain: dstChain, address: recipient, useForwarder: true },
  amount: amountString,
  config: { transferSpeed: 'FAST' }
})
// result.sourceTxHash, result.destinationTxHash
```

### Domain IDs (CCTP)
```
Ethereum  = 0
Avalanche = 1
OP        = 2
Arbitrum  = 3
Base      = 6
Polygon   = 7
Solana    = 5
Sui       = 8
Arc       = TBD (check docs.arc.network)
```

### ProgressTracker States
```
Burn:        pending → confirmed (src txHash)
Attestation: waiting → signed (Iris API)
Mint:        pending → confirmed (dst txHash)
```

---

## PROJECT STRUCTURE
```
arc-dapp/
├── contracts/
│   ├── src/
│   │   ├── SwapRouter.sol        # UniV3 fork adapter
│   │   └── interfaces/
│   │       ├── ITokenMessenger.sol
│   │       └── IMessageTransmitter.sol
│   ├── test/
│   └── foundry.toml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── swap/
│   │   │   │   ├── SwapForm.tsx
│   │   │   │   ├── TokenSelector.tsx
│   │   │   │   ├── SettingsModal.tsx
│   │   │   │   └── ConfirmModal.tsx
│   │   │   ├── bridge/
│   │   │   │   ├── BridgeForm.tsx
│   │   │   │   ├── ChainSelector.tsx
│   │   │   │   ├── SpeedSelector.tsx
│   │   │   │   └── ProgressTracker.tsx
│   │   │   └── shared/
│   │   │       ├── TabBar.tsx
│   │   │       ├── TokenBox.tsx
│   │   │       ├── TxStatus.tsx
│   │   │       └── WalletConnect.tsx
│   │   ├── hooks/
│   │   │   ├── useSwap.ts         # quote + execute swap
│   │   │   ├── useBridge.ts       # BridgeKit wrapper
│   │   │   ├── useTokenBalance.ts
│   │   │   └── useAllowance.ts
│   │   ├── lib/
│   │   │   ├── bridgekit.ts       # BridgeKit init
│   │   │   ├── cctp.ts            # Iris polling + domain map
│   │   │   ├── chains.ts          # chain configs
│   │   │   └── tokens.ts          # token list
│   │   ├── pages/
│   │   │   └── index.tsx          # Tab: Swap | Bridge
│   │   └── main.tsx
│   ├── .env.example
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## ENV VARS
```
VITE_CIRCLE_API_KEY=
VITE_ARC_RPC_URL=
VITE_ALCHEMY_KEY=
VITE_CIRCLE_ENTITY_SECRET=
```

## KEY NOTES FOR CLAUDE CODE
- Arc gas = USDC, so all gas estimates in USDC not ETH
- CCTP burns real USDC — no wrapped tokens, no liquidity pools
- Arc finality <1s → no need for long polling on swap
- BridgeKit handles attestation polling internally when useForwarder:true
- CCTP V1 chains (Sui) = no Fast Transfer, no Hooks
- Slippage default = 0.5%, price impact >10% = hard block
- Always validate recipient address format per dst chain (EVM vs base58 vs sui address)
