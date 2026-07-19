import { useEffect } from "react";
import { BaseError, UserRejectedRequestError, type Address } from "viem";
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

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash },
  });

  // 사용자 거부는 서명 단계에서 나오므로 writeContract의 error에 담긴다.
  // 거부하면 해시 자체가 안 생겨서 receipt 훅은 아예 돌지 않는다.
  // viem이 에러를 여러 겹으로 감싸므로 walk로 체인을 파고들어야 한다.
  const isRejected =
    error instanceof BaseError &&
    !!error.walk((e) => e instanceof UserRejectedRequestError);

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

        {/* 거부는 실패가 아니라 사용자가 의도한 취소 — 빨간 에러톤으로 띄우지 않는다.
            error는 다음 writeContract 호출 전까지 남아 있어서, 재시도해 성공한 뒤에도
            같이 보인다. 그래서 성공했을 땐 감춘다. */}
        {!receipt.isSuccess && isRejected && (
          <p style={{ color: "#888" }}>사용자가 전송을 취소했습니다.</p>
        )}

        {/* 시뮬레이션 실패 = 보내기 전에 걸러낸 것. allowance 부족·잔액 부족이 여기 잡힌다.
            message는 스택까지 붙어 장황하므로 한 줄 요약인 shortMessage를 쓴다. */}
        {simulate.isError && (
          <p style={{ color: "#c00" }}>{(simulate.error as BaseError).shortMessage}</p>
        )}
      </div>
    </div>
  );
}