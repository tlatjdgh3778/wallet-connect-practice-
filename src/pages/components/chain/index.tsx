import { useAccount, useChains, useSwitchChain,http  } from "wagmi";
import * as allChains from "viem/chains"

// chainId → chain 객체 맵 생성
const chainMap = Object.values(allChains).reduce((acc, chain) => {
  acc[chain.id] = chain;
  return acc;
}, {} as Record<number, (typeof allChains)[keyof typeof allChains]>);

export function Chain() {
    const account = useAccount();
  
    const chainName = account.chain?.name
    ?? chainMap[account.chainId!]?.name
    ?? `Unknown Chain (${account.chainId})`;
    
    return (
      <div style={{ border: "1px solid purple", padding: '1rem'}}>
        {account.isConnected ? 
          <>
            <strong>Connected Chain: {account.chain?.name ?? `지원하지 않는 체인입니다. (${chainName})`}</strong>
            <SwitchChain currentChainId={account.chainId} />
          </>
          : 
          <strong>계정에 연결되지 않았습니다.</strong>
        }
      </div>
    )
}

// Sepolia ↔ Mainnet
const SwitchChain = ({ currentChainId }: { currentChainId:  number | undefined }) => {
  const switchChain = useSwitchChain();
  const chains = useChains();
  
  const isChainSwitching = switchChain.isPending;

  return (
    <div>
      {chains.map((chain) => {
        const isCurrentChain = chain.id === currentChainId;
        return (
          <button key={chain.id} onClick={() => switchChain.switchChain({ chainId: chain.id })} disabled={isCurrentChain || isChainSwitching}>
            {chain.name}
          </button>
        )
      })}
      {isChainSwitching && <p>체인 전환중..</p>}
    </div>
  )
}
