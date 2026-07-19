import { useEffect, useState } from "react";
import { formatUnits, isAddress, type Address } from "viem";
import { useAccount, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { erc20Abi } from "../../abis/erc20";
import { toRawAmount } from ".";
import { useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// 실습 3주차 · approve → transferFrom (트랜잭션 쓰기)
//
//   주제 1  allowance 읽기                                    → AllowancePanel
//   주제 2  approve 쓰기 (simulate → write → waitForReceipt)  → ApproveButton
//   주제 3  transferFrom 쓰기                                 → TransferFromButton
//   주제 4  에러·거부 상태 처리                                → 각 버튼 내부
//   주제 5  tx 확정 후 읽기 쿼리 무효화                        → AllowancePanel
//
// 2주차 TokenInfo가 읽어온 tokenAddress/decimals/symbol을 props로 받는다.
// erc20Abi에 approve/transfer/transferFrom 추가됨 (stateMutability: 'nonpayable').
// ─────────────────────────────────────────────────────────────

type Props = {
  tokenAddress: Address;
  decimals: number;
  symbol?: string;
};

export function AllowancePanel({ tokenAddress, decimals, symbol }: Props) {
  // spender = "내 토큰을 끌어갈 권한을 줄 주소". 실습에선 계정 B.
  // 주소 입력·검증은 2주차 TokenDashboard와 같은 패턴 (commit-on-click).
  const [spenderInput, setSpenderInput] = useState("");
  const [spender, setSpender] = useState<Address | undefined>();
  const [isValidSpender, setIsValidSpender] = useState(true);

  // 승인/전송할 수량. 사람이 읽는 문자열 — 온체인에 넘길 땐 parseUnits로 bigint 변환.
  const [amount, setAmount] = useState("");

  const queryClient = useQueryClient();

  const commitSpender = (value: string) => {
    const trimmed = value.trim();
    if (isAddress(trimmed)) {
      setIsValidSpender(true);
      setSpender(trimmed);
    } else {
      setIsValidSpender(false);
    }
  };

  // 주제 1. allowance(owner, spender) 읽기.
  // owner/spender 둘 다 있어야 args가 성립하므로 enabled로 막는다.
  const { address: owner } = useAccount()

  const allowance = useReadContract({
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner!, spender!],
    address: tokenAddress,
    query: {
      enabled: !!owner && !!spender
    }
  })

  const raw = toRawAmount(amount, decimals);

  // 승인 충분 여부. raw(잘못된 입력이면 null) / allowance.data(로딩 중이면 undefined)를
  // 먼저 걸러야 "모름"이 "0"으로 뭉개지지 않는다. 비교는 bigint끼리.
  const isAllowanceBalance =
    raw !== null && allowance.data !== undefined && raw <= allowance.data

  const simulate = useSimulateContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'approve',
    args: [spender!, raw!],
    query: {
      enabled: !!spender && !!raw
    }
  })

  const { data: hash, writeContract, isPending: isWriteContracPending } = useWriteContract();

  const onClickApprove = () => {
        if(simulate.data?.request) {
          writeContract(simulate.data.request)
        }
  }

  const { data, isFetching, isSuccess } = useWaitForTransactionReceipt({ 
    hash, 
    query: { 
      enabled: !!hash
     } 
  })

  useEffect(() => {
    if(isSuccess) {
      queryClient.invalidateQueries({ queryKey: allowance.queryKey });
    }
  }, [isSuccess])

  return (
    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed #ccc" }}>
      <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
        approve → transferFrom (3주차)
      </div>

      {/* spender 주소 입력 */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={spenderInput}
          onChange={(e) => setSpenderInput(e.target.value)}
          placeholder="spender 주소 — 토큰을 끌어갈 계정 (0x...)"
          style={{ flex: 1, padding: "0.4rem" }}
        />
        <button type="button" onClick={() => commitSpender(spenderInput)}>
          적용
        </button>
      </div>

      {!isValidSpender && (
        <strong style={{ color: "red", fontSize: "0.85rem" }}>유효하지 않은 주소입니다.</strong>
      )}

      {/* 수량 입력 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="수량 (예: 0.005)"
          style={{ flex: 1, padding: "0.4rem" }}
        />
        <span style={{ color: "#666" }}>{symbol}</span>
      </div>

      {/* 주제 1. 현재 allowance 표시 */}
      <div style={{ marginTop: "0.75rem" }}>
        <div style={{ margin: "0.25rem 0" }}>
          현재 allowance : <div style={{ color: "#aaa" }}>
            <p>owner: {owner}</p>
            <p>spender: {spender}</p>
            <p>allowance(남아있는 한도): {allowance.data && formatUnits(allowance.data, decimals)} {symbol}</p>
            {raw ? <p>승인 {isAllowanceBalance ? "충분 (allowance가 큼)" : "필요 (allowance가 작음)"}</p> : <p>spender 수량 입력 필요</p>}
          </div>
        </div>
      </div>

      {/* 주제 2. approve 쓰기 — 시뮬 통과 + 진행 중 아님일 때만 활성.
          진행 중은 서명 대기(isWriteContracPending)와 채굴 대기(isFetching) 둘 다 —
          문구는 구분해 보여주되 버튼 잠금은 합쳐야 중복 클릭으로 tx가 두 번 안 나간다. */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={onClickApprove}
          disabled={isWriteContracPending || isFetching || !simulate.isSuccess}
        >
          1. approve
        </button>
        {/* TODO(주제 3) transferFrom — 계정 B로 전환한 뒤, allowance가 충분할 때만 활성 */}
      </div>

      <div style={{ fontSize: "0.85rem" }}>
        {simulate.isLoading && <p>시뮬레이션 검증 중..</p>}
        {isWriteContracPending && <p>사용자 승인 대기 중...</p>}
        {isFetching && <p>블록에 쓰는 중...</p>}
        {data?.status === 'reverted' && <p>Revert 됨</p>}
        {data?.status === 'success' && <p>Success 됨</p>}
      </div>

      {/* TODO(주제 4) 상태 표시
          시뮬 실패 / 서명 대기 / 채굴 대기 / 성공 / 사용자 거부(= 실패 아님, "취소됨")
          실패 지점이 3군데라 에러 소스도 3개 — 각각 다른 훅에서 나옴 */}
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#aaa" }}>
        상태: (주제 4 미구현) · 토큰 {tokenAddress.slice(0, 6)}… · decimals {decimals}
        {spender && ` · spender ${spender.slice(0, 6)}…`}
      </p>
    </div>
  );
}
