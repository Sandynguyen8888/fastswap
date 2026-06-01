import type { Token } from '@/lib/tokens'

type Props = { token: Token; size?: number }

export function TokenAvatar({ token, size = 28 }: Props) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: token.logoColor,
        fontSize: size * 0.38,
      }}
    >
      {token.symbol.slice(0, 2)}
    </div>
  )
}
