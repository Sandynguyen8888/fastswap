# CLAUDE.md — Arc dApp (Swap & Bridge)

Tài liệu này là hướng dẫn dành cho **Claude Code** khi làm việc với dự án Arc dApp.
Đọc kỹ trước khi bắt đầu bất kỳ task nào.

---

## 1. Tổng quan dự án

**Arc dApp** là một ứng dụng phi tập trung (dApp) chạy trên **Arc Network** — một Layer-1 blockchain được thiết kế đặc biệt cho tài chính stablecoin.

### Hai tính năng chính
| Feature | Mô tả |
|---------|-------|
| **Swap** | Hoán đổi token trên Arc (UniswapV3-fork), quote real-time, slippage control |
| **Bridge** | Cross-chain USDC qua CCTP (Arc ↔ Sepolia / Solana Devnet / Sui Testnet) — testnet only |

### Đặc điểm quan trọng của Arc Network
- **Gas token = USDC** — KHÔNG dùng ETH hay token biến động. Mọi ước tính gas phải tính bằng USDC.
- **USDC là native token** — address `0x3600000000000000000000000000000000000000`, 18 decimals (EVM-compatible), **KHÔNG cần approve()**.
- **Finality < 1 giây** — Không cần long-polling sau khi swap. Cập nhật UI ngay khi tx confirmed.
- **EVM-compatible** — Dùng Solidity, Foundry, Hardhat, viem/wagmi bình thường.
- **Stablecoin native** — USDC (gas), EURC, cirBTC, WETH, USDT, tokenized RWAs.
- **Post-quantum security** — SLH-DSA-SHA2-128s wallet signatures.
- **Opt-in privacy** — ArcaneVM cho confidential contracts.

---

## 2. Tech Stack

### Frontend
```
React + Vite
TailwindCSS
wagmi / viem                — EVM wallet + contract interaction
@rainbow-me/rainbowkit      — Wallet connect UI
@tanstack/react-query       — Data fetching
react-hot-toast             — Notifications
```

### Contracts (Foundry)
```
Solidity ^0.8.20
OpenZeppelin
UniswapV3-fork (SwapRouter.sol trên Arc)
ITokenMessenger.sol         — CCTP burn interface
IMessageTransmitter.sol     — CCTP mint interface
```

### Infrastructure
```
@circle-fin/bridge-kit      — BridgeKit SDK cho CCTP
Chainlink price feeds       — USD price oracle
The Graph                   — Subgraph indexing
Circle Iris API             — Attestation polling (CCTP step 2)
```

---

## 3. Cấu hình mạng (Chain Config)

### Arc Testnet — CHÍNH THỨC (source: https://docs.arc.io/arc/references/connect-to-arc)
```
Chain ID:    5042002
RPC chính:   https://rpc.testnet.arc.network
RPC phụ:     https://rpc.blockdaemon.testnet.arc.network
             https://rpc.drpc.testnet.arc.network
             https://rpc.quicknode.testnet.arc.network
Gas token:   USDC (native, 18 decimals)
Explorer:    https://testnet.arcscan.app
```

### Testnet chains hỗ trợ Bridge (testnet-only)
```
Arc Testnet  | chainId: 5042002    | CCTP: V2 | Fast: ✅
Sepolia      | chainId: 11155111   | CCTP: V2 | Fast: ✅
Solana Devnet|                     | CCTP: V2 | Fast: ✅
Sui Testnet  |                     | CCTP: V1 | Fast: ❌
```

### CCTP Domain IDs
```
Ethereum / Sepolia = 0
Avalanche          = 1
OP                 = 2
Arbitrum           = 3
Solana             = 5
Base               = 6
Polygon            = 7
Sui                = 8
Arc                = TBD — kiểm tra tại docs.arc.network trước khi hardcode
```

---

## 4. Token Addresses — Arc Testnet (CHÍNH THỨC từ Circle)

| Token | Address | Decimals | Ghi chú |
|-------|---------|----------|---------|
| **USDC** | `0x3600000000000000000000000000000000000000` | 18 | Native gas token — **không cần approve()** |
| **EURC** | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 | Source: Circle docs |
| **cirBTC** | `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF` | 8 | Source: Circle docs |
| WETH | placeholder | 18 | Chưa có địa chỉ chính thức |
| USDT | placeholder | 6 | Chưa có địa chỉ chính thức |

### USDC trên các testnet khác
| Chain | Address |
|-------|---------|
| Sepolia | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Solana Devnet | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| Sui Testnet | `0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC` |

**Source:** https://developers.circle.com/stablecoins/usdc-contract-addresses
         https://developers.circle.com/stablecoins/eurc-contract-addresses
         https://developers.circle.com/assets/cirbtc-contract-addresses

---

## 5. Cấu trúc thư mục

```
arc-dapp/
├── contracts/
│   ├── src/
│   │   ├── SwapRouter.sol              # UniV3 fork adapter
│   │   └── interfaces/
│   │       ├── ITokenMessenger.sol     # CCTP burn
│   │       └── IMessageTransmitter.sol # CCTP mint
│   ├── test/
│   └── foundry.toml
├── frontend/
│   ├── src/
│   │   ├── vite-env.d.ts               # import.meta.env types
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
│   │   │       ├── TokenAvatar.tsx
│   │   │       ├── TxStatus.tsx
│   │   │       └── WalletConnect.tsx
│   │   ├── hooks/
│   │   │   ├── useSwap.ts              # quote + execute swap
│   │   │   ├── useBridge.ts            # BridgeKit wrapper
│   │   │   ├── useTokenBalance.ts      # native + ERC20 balance
│   │   │   └── useAllowance.ts         # ERC20 approve (skip nếu native)
│   │   ├── lib/
│   │   │   ├── wagmi.ts                # wagmi + rainbowkit config
│   │   │   ├── bridgekit.ts            # BridgeKit init
│   │   │   ├── cctp.ts                 # Iris polling + domain map
│   │   │   ├── chains.ts               # chain configs
│   │   │   └── tokens.ts               # token list + addresses
│   │   ├── pages/
│   │   │   └── index.tsx               # Tab: Swap | Bridge + header
│   │   └── main.tsx
│   ├── .env.example
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## 6. Biến môi trường

```env
VITE_WALLETCONNECT_PROJECT_ID=  # WalletConnect Cloud — https://cloud.walletconnect.com
VITE_CIRCLE_API_KEY=            # Circle Developer API Key
VITE_ARC_RPC_URL=               # Arc Testnet RPC (default: https://rpc.testnet.arc.network)
VITE_ARC_CHAIN_ID=              # Arc Testnet Chain ID (default: 5042002)
VITE_ALCHEMY_KEY=               # Alchemy API Key (hiện chỉ dùng Sepolia)
VITE_CIRCLE_ENTITY_SECRET=      # Circle Entity Secret (cho BridgeKit)
VITE_SWAP_ROUTER_ADDRESS=       # SwapRouter contract address trên Arc Testnet
VITE_QUOTE_API_URL=             # Off-chain quote API (optional)
```

> ⚠️ Không bao giờ commit các giá trị thực của biến môi trường vào git.

---

## 7. FEATURE: SWAP

### UI State shape
```typescript
{
  tokenIn:  { address, symbol, decimals, balance, usdPrice, isNative? }
  tokenOut: { address, symbol, decimals, balance, usdPrice, isNative? }
  amountIn: string
  amountOut: string        // computed từ quote API
  slippage: 0.1 | 0.5 | 1.0 | custom
  deadline: number         // now + 1200 (20 phút)
  priceImpact: number      // warn > 2%, block > 10%
  route: token[]           // swap path
  txStatus: 'idle' | 'approving' | 'swapping' | 'confirmed' | 'failed'
}
```

### Các màn hình
1. **SwapForm** — tokenIn box / ⇅ flip btn / tokenOut box / info rows / CTA
2. **TokenSelector** — search input + list (symbol, name, balance, address)
3. **SettingsModal** — slippage radio + custom input + deadline input
4. **ConfirmModal** — summary + price impact warning + confirm btn
5. **TxStatus** — spinner → txHash link → success/fail

### Info Rows (SwapForm)
| Label | Value |
|-------|-------|
| Rate | `1 {tokenOut} = X {tokenIn}` |
| Price impact | `%`, màu: green < 1%, amber < 2%, red > 2% |
| Gas (USDC) | `~0.012 USDC` |
| Min received | `amountOut × (1 - slippage)` |
| Route | `A → B` hoặc `A → USDC → B` |

### Contract Interface (SwapRouter.sol — UniV3-fork)
```solidity
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

### Flow thực hiện swap
```
1. User nhập amountIn → debounce 500ms → gọi quote API
2. Tính amountOutMin = quote × (1 - slippage/100)
3. Kiểm tra allowance — BỎ QUA nếu tokenIn.isNative (USDC native không cần approve)
4. Nếu ERC20 và allowance < amountIn: gọi approve(router, MAX_UINT)
5. Gọi exactInputSingle() hoặc exactInput() tùy route
6. Arc confirm < 1s → update balances ngay
```

### Validation rules
- `amountIn > 0`
- `balance >= amountIn`
- `priceImpact < 10%` — nếu > 10%: block với warning, KHÔNG cho phép swap
- `tokenIn !== tokenOut`
- `deadline` chưa hết hạn

---

## 8. FEATURE: BRIDGE

### UI State shape
```typescript
{
  srcChain: { id, name, dotColor, cctpDomain, cctpVersion, supportsFast, explorerUrl, isEvm }
  dstChain: { id, name, dotColor, cctpDomain, cctpVersion, supportsFast, explorerUrl, isEvm }
  amount: string
  recipient: string          // default: connected wallet
  speed: 'FAST' | 'STANDARD'
  transferStatus: 'idle' | 'burning' | 'attesting' | 'minting' | 'done' | 'failed'
  burnTx: string | null
  mintTx: string | null
}
```

### Các màn hình
1. **BridgeForm** — srcChain selector / ⇅ flip / dstChain selector / amount box / recipient input / speed toggle / info rows / CTA
2. **ChainSelector** — list of supported chains with CCTP version badge
3. **SpeedSelector** — Fast (~30s) vs Standard (~13-19min ETH)
4. **ProgressTracker** — 3 bước: Burn → Attestation → Mint
5. **TxComplete** — hiển thị cả 2 txHash (src + dst) + explorer links

### Routes hỗ trợ (TESTNET)
| Route | CCTP | Fast Transfer |
|-------|------|---------------|
| Arc Testnet ↔ Sepolia | V2 | ✅ |
| Arc Testnet ↔ Solana Devnet | V2 | ✅ |
| Arc Testnet ↔ Sui Testnet | V1 | ❌ |

### Info Rows (BridgeForm)
| Label | Value |
|-------|-------|
| You receive | `~{amount} USDC on {dstChain}` |
| Speed | `⚡ ~30s (Fast)` hoặc `~13-19min (Standard)` |
| Bridge fee | `0 — only pay gas on both chains` |
| Gas (src) | `~0.05 USDC` |
| Mechanism | `CCTP V2 Burn & Mint — native USDC, no wrapping` |

### CCTP V2 Flow (3 bước)
```
STEP 1 — BURN (src chain = Arc)
  contract: TokenMessenger
  fn: depositForBurn(amount, destinationDomain, mintRecipient, burnToken)
  emit: DepositForBurn(nonce, burnToken, amount, depositor, mintRecipient, destinationDomain, ...)

STEP 2 — ATTEST (Circle Iris — off-chain, ~5-30s)
  poll: GET https://iris-api.circle.com/attestations/{messageHash}
  chờ: status === "complete"
  lấy: attestation (hex signature)

STEP 3 — MINT (dst chain)
  contract: MessageTransmitter
  fn: receiveMessage(message, attestation)
  kết quả: native USDC được mint 1:1 cho recipient
```

### BridgeKit Integration
```typescript
import { BridgeKit } from '@circle-fin/bridge-kit'
const kit = new BridgeKit()

// Execute — useForwarder: true để BridgeKit tự handle attestation
const result = await kit.bridge({
  from: { adapter, chain: srcChain, address: sender },
  to:   { adapter, chain: dstChain, address: recipient, useForwarder: true },
  amount: amountString,
  config: { transferSpeed: 'FAST' }
})
// result.sourceTxHash, result.destinationTxHash
```

> **Lưu ý:** Khi `useForwarder: true`, BridgeKit tự xử lý attestation polling — không cần poll Iris API thủ công.

---

## 9. Các quy tắc quan trọng cho Claude Code

### Gas & Economics
- ✅ **Gas luôn tính bằng USDC** — không bao giờ hiển thị gas bằng ETH hay Gwei trên Arc
- ✅ Ước tính gas swap: `~0.012 USDC`
- ✅ Ước tính gas bridge (src): `~0.05 USDC`
- ✅ Bridge fee = 0 — người dùng chỉ trả gas trên cả 2 chain

### USDC Native Token — Quy tắc đặc biệt
- ✅ USDC trên Arc là **native gas token** tại `0x3600000000000000000000000000000000000000`
- ✅ **KHÔNG gọi `approve()`** cho USDC — sẽ gây popup lỗi trong ví
- ✅ Dùng `useBalance()` (wagmi native) để đọc số dư USDC, KHÔNG dùng `balanceOf()`
- ✅ USDC native có 18 decimals tại tầng chain, nhưng giá trị hiển thị vẫn là USD
- ✅ Trong `Token` type: set `isNative: true` cho USDC
- ✅ `useAllowance` phải trả về `maxUint256` và skip approve khi `token.isNative === true`

### CCTP & Bridge
- ✅ CCTP đốt USDC thật — **không có wrapped token**, **không có liquidity pool**
- ✅ Sui Testnet dùng CCTP V1 → **không có Fast Transfer**
- ✅ Luôn validate địa chỉ recipient theo đúng format của dst chain:
  - EVM (Sepolia): checksum address `0x...` 40 hex
  - Solana: base58, 32-44 ký tự
  - Sui: `0x` + 64 hex chars

### Swap & DeFi
- ✅ Slippage mặc định = **0.5%**
- ✅ Price impact > **10%** = hard block, KHÔNG cho phép swap
- ✅ Price impact > **2%** = hiển thị cảnh báo đỏ
- ✅ Arc finality < 1s → **không cần long-polling** sau swap
- ✅ Debounce 500ms trước khi gọi quote

### Frontend & UX
- ✅ Header có nút **Faucet** (🚰) link đến https://faucet.circle.com
- ✅ Hiện banner "Wrong Network" khi ví không ở Arc Testnet, kèm nút "Switch Network"
- ✅ `useSwitchChain` từ wagmi để tự động add + switch chain trong MetaMask
- ✅ Show skeleton/spinner trong lúc fetch quote
- ✅ Luôn hiển thị txHash kèm link explorer sau khi confirmed
- ✅ Cập nhật balance ngay sau khi tx confirmed (vì Arc < 1s)

---

## 10. Tài liệu tham khảo

| Tài liệu | Link |
|----------|------|
| Arc Docs chính thức | https://docs.arc.io/ |
| Arc Connect / Chain Config | https://docs.arc.io/arc/references/connect-to-arc |
| Build on Arc | https://docs.arc.io/build |
| App Kits (BridgeKit, SwapKit) | https://docs.arc.io/app-kit |
| Arc Testnet Explorer | https://testnet.arcscan.app |
| USDC Faucet (testnet) | https://faucet.circle.com |
| USDC Contract Addresses | https://developers.circle.com/stablecoins/usdc-contract-addresses |
| EURC Contract Addresses | https://developers.circle.com/stablecoins/eurc-contract-addresses |
| cirBTC Contract Addresses | https://developers.circle.com/assets/cirbtc-contract-addresses |
| Circle Iris API (CCTP attestation) | https://iris-api.circle.com/attestations/{messageHash} |
| CCTP V2 Docs | https://developers.circle.com/stablecoins/cctp-getting-started |
| BridgeKit SDK | https://www.npmjs.com/package/@circle-fin/bridge-kit |
| WalletConnect Cloud | https://cloud.walletconnect.com |

---

## 11. Các lệnh phổ biến

```bash
# Frontend
cd frontend
npm install
npm run dev          # dev server → http://localhost:5173
npm run type-check   # kiểm tra TypeScript

# Contracts (Foundry)
cd contracts
forge build          # compile
forge test           # run tests
forge deploy         # deploy lên Arc Testnet

# Kiểm tra env
cp frontend/.env.example frontend/.env
# Điền các giá trị API key vào .env
```

---

## 12. Lưu ý khi viết code

1. **TypeScript strict** — luôn type đầy đủ, không dùng `any`
2. **Error boundary** — mọi async operation phải có try/catch và hiển thị lỗi thân thiện
3. **Token decimals** — USDC native 18 decimals (chain-level), EURC 6, cirBTC 8, WETH 18. Luôn dùng `parseUnits/formatUnits` từ viem
4. **Big number** — dùng `BigInt` hoặc `viem` utils, không dùng `Number` cho token amounts
5. **Native token** — USDC (`isNative: true`) dùng `useBalance` không dùng `balanceOf`, không gọi `approve()`
6. **Testnet first** — mọi feature đều test trên Arc Testnet trước
7. **Arc Domain ID** — hiện tại là TBD, cần kiểm tra `docs.arc.network` trước khi deploy
8. **Chain ID Arc** — `5042002` (đã xác nhận từ docs chính thức)
