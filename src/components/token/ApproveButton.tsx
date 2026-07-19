import { useEffect } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi } from "../../abis/erc20";

// 주제 2. approve 쓰기 — 시뮬레이션 → 서명 → 채굴 대기 3단.
//
// tx 하나당 훅 3개가 한 세트다. transferFrom과 한 컴포넌트에 두면 hash가 서로
// 덮어써지고 isPending이 어느 tx 것인지 구분이 안 되므로 버튼 단위로 나눈다.
//
// approve는 owner를 인자로 받지 않는다 — 컨트랙트가 msg.sender를 owner로 쓴다.
// 즉 연결된 계정이 곧 allowance의 주인이라, owner로 연결돼 있어야만 의미가 있다.
type Props = {
  tokenAddress: Address;
  owner?: Address;
  spender?: Address;
  raw: bigint | null;
  onSuccess?: () => void;
};

export function ApproveButton({ tokenAddress, owner, spender, raw, onSuccess }: Props) {
  const { address: connectedAccount } = useAccount();
  const isOwnerConnected = !!owner && connectedAccount === owner;

  const simulate = useSimulateContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender!, raw!],
    query: { enabled: isOwnerConnected && !!spender && !!raw },
  });

  const { data: hash, writeContract, isPending } = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  // 확정된 순간에만 한 번. queryKey를 의존성에 넣으면 매 렌더 새 배열이라 무한 루프.
  useEffect(() => {
    if (receipt.isSuccess) onSuccess?.();
  }, [receipt.isSuccess]);

  const onClick = () => {
    if (simulate.data?.request) writeContract(simulate.data.request);
  };

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        // 진행 중은 서명 대기와 채굴 대기 둘 다 — 문구는 구분해 보여주되
        // 잠금은 합쳐야 중복 클릭으로 tx가 두 번 나가지 않는다.
        disabled={!isOwnerConnected || isPending || receipt.isFetching || !simulate.isSuccess}
      >
        1. approve
      </button>

      <div style={{ fontSize: "0.85rem" }}>
        {!isOwnerConnected && owner && (
          <p style={{ color: "#c60" }}>approve는 owner 계정으로 연결해야 합니다.</p>
        )}
        {simulate.isLoading && <p>시뮬레이션 검증 중..</p>}
        {isPending && <p>사용자 승인 대기 중...</p>}
        {receipt.isFetching && <p>블록에 쓰는 중...</p>}
        {receipt.data?.status === "reverted" && <p>Revert 됨</p>}
        {receipt.data?.status === "success" && <p>Success 됨</p>}
      </div>
    </div>
  );
}
