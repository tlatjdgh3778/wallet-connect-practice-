import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { fallback, http } from 'wagmi';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  baseSepolia
} from 'wagmi/chains';

export const config = getDefaultConfig({
  // transport는 wagmi/viem이 블록체인 노드와 실제로 통신하는 통로
  // dapp 자체는 잔액 조회, 컨트랙트 읽기 같은 것을 직접 할 수 없음
  // 누군가 블록체인에 물어봐야 하는데, 그 "누군가"가 RPC 노드(Alchemy, Public Node)이고, 
  // 거기로 요청을 보내는 설정이 transport 임
  transports: {
    [mainnet.id]: fallback([
      http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL!),
      http(process.env.NEXT_PUBLIC_PUBLIC_NODE_RPC_URL!)
    ]),
    [base.id]:http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_RPC_URL!),
    [baseSepolia.id]:http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL!),
    [sepolia.id]: fallback([
      http(process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC_URL!),
      http(process.env.NEXT_PUBLIC_PUBLIC_NODE_SEPOLIA_RPC_URL!)
    ]),
  },
  appName: 'RainbowKit App',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [
    mainnet,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia, baseSepolia] : []),
  ],
  ssr: true,
});
