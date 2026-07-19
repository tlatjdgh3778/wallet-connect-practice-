import { useState } from "react";
import { formatUnits, isAddress, parseUnits, type Address } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { erc20Abi } from "../../abis/erc20";
import { AllowancePanel } from "./AllowancePanel";

// ─────────────────────────────────────────────────────────────
// 실습 2주차 · 토큰 대시보드 (컨트랙트 읽기 + ABI + ERC-20)
//
//   주제 1  주소 입력 + isAddress 검증        → TokenDashboard
//   주제 2  ABI로 읽기 (useReadContracts)     → TokenInfo
//   주제 3  decimals 단위 변환                → TokenInfo(format) / ParseUnitsPlayground(parse)
//   주제 4  상태 처리                         → TokenInfo
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
  const [inputAddress, setInputAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true); 

  const isValidTokenAddress = (value: string) => {
     if(isAddress(value.trim()) === true) {
      setIsValidAddress(true);
      setInputAddress(value.trim());
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

      <TokenInfo tokenAddress={inputAddress as Address}/>
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

// 주제 2·4. ERC-20 정보를 멀티콜 1건으로 읽고, 상태별로 분기.
//
// allowFailure(기본 true) 때문에 개별 호출 실패는 isError로 안 잡힘 —
// 멀티콜 요청 자체는 성공했고 안의 call만 revert한 것이므로 status를 봐야 함.
// 그래서 비-ERC20 판별은 name.status === 'failure'로 한다.
function TokenInfo({ tokenAddress }: { tokenAddress: Address }) {
  const { address, isDisconnected } = useAccount();
  
  const erc20Contract = { address: tokenAddress, abi: erc20Abi } as const;

  const { data, isLoading, isError } = useReadContracts({
    contracts: [
        { ...erc20Contract, functionName: 'name' },
        { ...erc20Contract, functionName: 'symbol' },
        { ...erc20Contract, functionName: 'decimals' },
        { ...erc20Contract, functionName: 'balanceOf', args: [address!] },
      ],
      query: { enabled: isAddress(tokenAddress) && !!address },
  });

  const [name, symbol, decimals, balanceOf] = data ?? [];
  
  if(isDisconnected) {
    return <p>지갑에 연결되지 않았어요.</p>
  }
  if(!tokenAddress) {
    return <p>확인할 주소를 입력해보세요.</p>
  }
  return (
    <div style={{ marginTop: "0.75rem", opacity: 0.7 }}>
      <p style={{ margin: 0 }}>주소: {tokenAddress}</p>
      {isError ? <p>유효한 토큰 주소가 아닙니다.</p>
      :
      name?.status === 'failure' ? <p>유효한 토큰 주소가 아닙니다.</p>
      :
      isLoading ? <p>불러오는 중...</p>
      :
        <div>
              <p style={{ margin: "0.25rem 0 0" }}>토큰 이름 : {name?.result}</p>
              <p style={{ margin: "0.25rem 0 0" }}>토큰 심볼 : {symbol?.result}</p>
              <p style={{ margin: "0.25rem 0 0" }}>토큰 단위 : {decimals?.result}</p>
              <p style={{ margin: "0.25rem 0 0" }}>토큰 잔액 : {balanceOf?.status === 'success' && decimals?.status === 'success' &&  formatUnits(balanceOf.result, decimals.result)}</p>

              {decimals?.status === 'success' && (
                <>
                  <ParseUnitsPlayground decimals={decimals.result} symbol={symbol?.result} />
                  <AllowancePanel
                    tokenAddress={tokenAddress}
                    decimals={decimals.result}
                    symbol={symbol?.result}
                  />
                </>
              )}
        </div>
      }
    </div>
  );
}

// parseUnits는 유효하지 않은 문자열('abc', '1e5', '1.2.3')에 예외를 던진다.
// 렌더 중에 무방비로 부르면 컴포넌트가 통째로 죽으므로, 예외를 null이라는 값으로 강등시킨다.
// (입력창의 type="number"는 방어선이 못 된다 — 지수 표기 '1e5'가 그대로 통과함)
export function toRawAmount(amount: string, decimals: number): bigint | null {
  try {
    return parseUnits(amount, decimals);
  } catch {
    return null;
  }
}

// 주제 3 (후반). 사람이 입력한 값 → 온체인 값(bigint) 변환 연습.
// 3주차 전송(approve/transfer)에서 사용자 입력을 컨트랙트에 넘길 때 그대로 쓰임.
function ParseUnitsPlayground({ decimals, symbol }: { decimals: number; symbol?: string }) {
  const [amount, setAmount] = useState("");

  const raw = toRawAmount(amount, decimals);

  return (
    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed #ccc" }}>
      <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.35rem" }}>
        parseUnits 연습 (decimals: {decimals})
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="보낼 수량 (예: 1.5)"
          style={{ padding: "0.4rem", flex: 1 }}
        />
        <span style={{ color: "#666" }}>{symbol}</span>
      </div>

      <p style={{ margin: "0.5rem 0 0", fontFamily: "monospace" }}>
        온체인 값: {raw === null ? "—" : raw.toString()}
      </p>
    </div>
  );
}
