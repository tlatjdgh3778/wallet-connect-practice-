import { useAccount } from "wagmi";
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
        <strong>Connected Chain: {account.chain?.name ?? `지원하지 않는 체인입니다. (${chainName})`}</strong>
      </div>
    )
}