// ERC-20 표준 ABI (필요한 함수만)
// 전체 ABI가 필요 없음 — 내가 호출할 함수만 있으면 읽힘 (주제 0 이해 포인트)
//
// ⚠️ 반드시 `as const`로 내보낼 것.
//   viem/wagmi가 이 리터럴에서 함수명·인자·반환 타입을 자동 추론함 (Orval의 OpenAPI 코드젠과 같은 개념).
//   `as const`가 없으면 타입이 그냥 string[]로 뭉개져서 추론이 안 됨.
export const erc20Abi = [
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;
