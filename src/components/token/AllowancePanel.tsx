import { useState } from "react";
import { formatUnits, isAddress, type Address } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { erc20Abi } from "../../abis/erc20";
import { toRawAmount } from ".";
import { useQueryClient } from "@tanstack/react-query";
import { ApproveButton } from "./ApproveButton";
import { TransferFromButton } from "./TransferFromButton";

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
  // 잔액 쿼리는 부모(TokenInfo)에 있으므로 무효화도 부모가 해야 한다.
  onBalanceChanged?: () => void;
};

export function AllowancePanel({ tokenAddress, decimals, symbol, onBalanceChanged }: Props) {
  // owner   = 토큰 주인. 실습에선 계정 A.
  // spender = owner의 토큰을 끌어갈 권한을 받는 주소. 실습에선 계정 B.
  //
  // ⚠️ owner를 useAccount()로 잡으면 안 된다 — 주제 3에서 계정 B로 전환하는 순간
  //    owner까지 B로 바뀌어 allowance(A,B)가 allowance(B,B)로 둔갑한다.
  //    "토큰 주인"과 "지금 연결된 계정"은 별개 개념이므로 입력으로 분리한다.
  const [ownerInput, setOwnerInput] = useState("");
  const [owner, setOwner] = useState<Address | undefined>();
  const [isValidOwner, setIsValidOwner] = useState(true);

  const [spenderInput, setSpenderInput] = useState("");
  const [spender, setSpender] = useState<Address | undefined>();
  const [isValidSpender, setIsValidSpender] = useState(true);

  // 승인/전송할 수량. 사람이 읽는 문자열 — 온체인에 넘길 땐 parseUnits로 bigint 변환.
  const [amount, setAmount] = useState("");

  const queryClient = useQueryClient();

  const commitOwner = (value: string) => {
    const trimmed = value.trim();
    if (isAddress(trimmed)) {
      setIsValidOwner(true);
      setOwner(trimmed);
    } else {
      setIsValidOwner(false);
    }
  };

  const commitSpender = (value: string) => {
    const trimmed = value.trim();
    if (isAddress(trimmed)) {
      setIsValidSpender(true);
      setSpender(trimmed);
    } else {
      setIsValidSpender(false);
    }
  };

  // 지금 지갑에 연결된 계정. owner와 별개다 — 누가 tx에 서명하는지를 결정한다.
  //   approve      는 owner(A)가 서명해야 함  (msg.sender가 곧 allowance의 주인)
  //   transferFrom 은 spender(B)가 서명해야 함
  const { address: connectedAccount } = useAccount();

  // approve는 msg.sender 기준으로 allowance를 기록하므로,
  // 연결된 계정이 owner가 아니면 화면에 보는 allowance와 실제로 바뀌는 값이 어긋난다.
  const isOwnerConnected = !!owner && connectedAccount === owner;

  // 주제 1. allowance(owner, spender) 읽기.
  // owner/spender 둘 다 있어야 args가 성립하므로 enabled로 막는다.

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

  // 쓰기 버튼들이 tx 확정을 알려오면 읽기 쿼리를 무효화한다 (주제 5).
  // 체인 상태가 바뀌어도 프론트 캐시는 모르므로 갱신은 이쪽에서 해야 한다.
  //
  // 무효화 대상은 tx마다 다르다 — 바뀐 것만 무효화하는 게 정석.
  //   approve      → allowance만 변함
  //   transferFrom → allowance가 차감되고 잔액도 옮겨감
  const invalidateAllowance = () => {
    queryClient.invalidateQueries({ queryKey: allowance.queryKey });
  };

  const invalidateAllowanceAndBalance = () => {
    invalidateAllowance();
    onBalanceChanged?.();
  };

  return (
    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed #ccc" }}>
      <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
        approve → transferFrom (3주차)
      </div>

      {/* owner 주소 입력 (토큰 주인 = 계정 A) */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <input
          value={ownerInput}
          onChange={(e) => setOwnerInput(e.target.value)}
          placeholder="owner 주소 — 토큰 주인 (0x...)"
          style={{ flex: 1, padding: "0.4rem" }}
        />
        {/* 계정 A로 연결된 상태에서 한 번 눌러두면, 이후 계정 B로 바꿔도 owner는 유지됨 */}
        <button
          type="button"
          onClick={() => connectedAccount && setOwnerInput(connectedAccount)}
          disabled={!connectedAccount}
        >
          내 주소
        </button>
        <button type="button" onClick={() => commitOwner(ownerInput)}>
          적용
        </button>
      </div>

      {!isValidOwner && (
        <strong style={{ color: "red", fontSize: "0.85rem" }}>유효하지 않은 주소입니다.</strong>
      )}

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
            <p>owner(토큰 주인): {owner}</p>
            <p>spender(끌어갈 계정): {spender}</p>
            <p>
              연결된 계정: {connectedAccount}
              {isOwnerConnected ? " — owner로 연결됨 (approve 가능)" : ""}
              {!!spender && connectedAccount === spender ? " — spender로 연결됨 (transferFrom 가능)" : ""}
            </p>
            <p>allowance(남아있는 한도): {allowance.data && formatUnits(allowance.data, decimals)} {symbol}</p>
            {raw ? <p>승인 {isAllowanceBalance ? "충분 (allowance가 큼)" : "필요 (allowance가 작음)"}</p> : <p>spender 수량 입력 필요</p>}
          </div>
        </div>
      </div>

      {/* 주제 2·3. 쓰기 버튼. tx마다 훅 3개 세트가 필요해 버튼 단위로 컴포넌트를 나눴다. */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", alignItems: "flex-start" }}>
        <ApproveButton
          tokenAddress={tokenAddress}
          owner={owner}
          spender={spender}
          raw={raw}
          onSuccess={invalidateAllowance}
        />
        <TransferFromButton
          tokenAddress={tokenAddress}
          owner={owner}
          spender={spender}
          raw={raw}
          onSuccess={invalidateAllowanceAndBalance}
        />

      </div>

      {/* TODO(주제 4) 에러 처리
          시뮬 실패(원인 메시지) / 사용자 거부(= 실패 아님, "취소됨") / 채굴 후 revert
          실패 지점이 3군데라 에러 소스도 3개 — 각각 다른 훅에서 나옴 */}
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "#aaa" }}>
        상태: (주제 4 미구현) · 토큰 {tokenAddress.slice(0, 6)}… · decimals {decimals}
        {spender && ` · spender ${spender.slice(0, 6)}…`}
      </p>
    </div>
  );
}
