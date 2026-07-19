import { useEffect } from "react";
import { Address } from "viem";
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { erc20Abi } from "../../abis/erc20";

type Props = {
  tokenAddress: Address;
  owner?: Address;
  spender?: Address;
  raw: bigint | null;
  onSuccess?: () => void;
};

export function TransferFromButton({ tokenAddress, owner, spender, raw, onSuccess }: Props) {
  const { address: connectedAccount } = useAccount();
  const isSpenderConnected = !!spender && connectedAccount === spender;

  const simulate = useSimulateContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "transferFrom",
    args: [owner!, spender!, raw!],
    query: { enabled: !!owner && !!spender && !!raw },
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
        disabled={!isSpenderConnected || isPending || receipt.isFetching || !simulate.isSuccess}
      >
        2. transferFrom
      </button>

      <div style={{ fontSize: "0.85rem" }}>
        {!isSpenderConnected && spender && (
          <p style={{ color: "#c60" }}>transferFrom은 spender 계정으로 연결해야 합니다.</p>
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