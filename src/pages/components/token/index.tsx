import { useState } from "react";
import { isAddress, type Address } from "viem";
import { useAccount } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { erc20Abi } from "../../../abis/erc20";

// ─────────────────────────────────────────────────────────────
// 실습 2주차 · 토큰 대시보드 (컨트랙트 읽기 + ABI + ERC-20)
//
// 이 파일은 "뼈대"만 있음:
//   ✅ 주제 1 (주소 입력 + isAddress 검증)  — 완성
//   ❌ 주제 2 (ABI로 읽기)                  — TokenInfo 안에서 직접 구현
//   ❌ 주제 3 (decimals 단위 변환)          — TokenInfo 안에서 직접 구현
//
// erc20Abi는 src/abis/erc20.ts 에 준비됨.
// ─────────────────────────────────────────────────────────────

// 테스트용 예시 토큰 주소. 주소는 네트워크마다 다르므로 chainId를 함께 둠.
const EXAMPLE_TOKENS = [
  { network: "Sepolia", chainId: sepolia.id, symbol: "USDC (Circle 테스트)", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", decimals: 6 },
  { network: "Sepolia", chainId: sepolia.id, symbol: "WETH", address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", decimals: 18 },
  { network: "Ethereum 메인넷", chainId: mainnet.id, symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  { network: "Ethereum 메인넷", chainId: mainnet.id, symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
] as const;

export function TokenDashboard() {
  const [input, setInput] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true); 

  const isValidTokenAddress = (value: string) => {
     if(isAddress(value.trim()) === true) {
      setIsValidAddress(true);
     }else {
      setIsValidAddress(false)
     }
  };

  return (
    <div style={{ border: "1px solid orange", padding: "1rem" }}>
      <strong>Token Dashboard</strong>

      {/* 주제 1. 토큰 주소 입력 폼 */}
      <div style={{ marginTop: "0.5rem", display: 'flex' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ERC-20 토큰 컨트랙트 주소 (0x...)"
          style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box" }}
        />
          <button
              type="button"
              onClick={() => isValidTokenAddress(input)}
            >
              주소 정보 보기
          </button>
      </div>

      {!isValidAddress && <strong style={{ color: 'red' }}>유효하지 않은 주소입니다.</strong>}
      
      {/* 테스트용 예시 주소 (복사 / 입력) */}
      <ExampleTokens onPick={setInput} />

      <TokenInfo tokenAddress={input as Address}/>
    </div>
  );
}

// 테스트용 예시 주소 목록. 현재 연결된 네트워크와 chainId가 일치할 때만 복사 활성화.
function ExampleTokens({ onPick }: { onPick: (address: string) => void }) {
  const { chainId } = useAccount();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(address);
  };

  return (
    <div style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
      <div style={{ color: "#888", marginBottom: "0.35rem" }}>
        테스트용 예시 주소{" "}
        {chainId ? `(현재 네트워크 chainId: ${chainId})` : "(지갑 미연결)"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {EXAMPLE_TOKENS.map((token) => {
          // 현재 연결된 네트워크와 토큰의 네트워크가 같아야 실제로 읽을 수 있음
          const usable = chainId === token.chainId;
          const isCopied = copied === token.address;

          return (
            <div
              key={token.address}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.5rem",
                border: "1px solid #eee",
                borderRadius: 4,
                opacity: usable ? 1 : 0.45,
              }}
            >
              <span style={{ width: 110, color: "#666" }}>{token.network}</span>
              <span style={{ width: 150 }}>{token.symbol}</span>
              <code style={{ flex: 1, fontFamily: "monospace" }}>
                {token.address}
              </code>
              <span style={{ width: 40, color: "#999" }}>d{token.decimals}</span>

              <button
                type="button"
                disabled={!usable}
                onClick={() => handleCopy(token.address)}
                title={usable ? "주소 복사" : "현재 네트워크와 달라 사용할 수 없음"}
              >
                {isCopied ? "복사됨" : "복사"}
              </button>
              <button
                type="button"
                disabled={!usable}
                onClick={() => onPick(token.address)}
                title={usable ? "입력창에 채우기" : "현재 네트워크와 달라 사용할 수 없음"}
              >
                입력
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 여기서부터 손으로 구현 ✋
// ─────────────────────────────────────────────────────────────
function TokenInfo({ tokenAddress }: { tokenAddress: Address | null }) {
  return (
    <div style={{ marginTop: "0.75rem", opacity: 0.7 }}>
      <p style={{ margin: 0 }}>주소: {tokenAddress}</p>
      <p style={{ margin: "0.25rem 0 0" }}>
        👉 여기에 주제 2·3을 손으로 구현하세요.
      </p>
    </div>
  );
}
