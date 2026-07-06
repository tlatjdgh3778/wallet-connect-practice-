
# 실습 1주차 · 지갑 연결 페이지

> [!summary] 목표
> RainbowKit + wagmi + Next.js로 **지갑 연결 → 주소·ENS·잔액 표시 → 직접 만든 체인 스위처 → Vercel 배포**까지 끝낸다. 이번 주의 본질은 "wagmi 읽기 훅을 실제로 손에 익히는 것".
>
> 상위 로드맵: [[Web3 개발자 로드맵]] (1주차)

> [!tip] AI 사용 원칙
> - ✅ AI 써도 됨: 레이아웃 · CSS · `<ConnectButton>` 배치 · 보일러플레이트
> - ❌ 손으로: **훅 연결(주제 2)** + **체인 스위처 로직(주제 3)** ← 이게 1주차 실습의 본질

---

## 구현 주제 & 기능 목록

### 주제 0. 프로젝트 셋업

구현해야 할 것:
- [x] RainbowKit 스타터로 프로젝트 생성
- [x] Reown(WalletConnect) Cloud에서 `projectId` 발급해 연결
	- [x] https://dashboard.reown.com
- [x] Alchemy에서 RPC 키 발급 (Sepolia + Mainnet)
- [x] 지원 체인 등록: **Sepolia + Mainnet**
- [x] RPC transport에 **fallback** 구성 (단일 RPC 장애 대비)
- [x] Provider 중첩 구조 구성: `WagmiProvider → QueryClientProvider → RainbowKitProvider`

이해 포인트:
- wagmi는 TanStack Query 위에 얹혀 있어 `QueryClientProvider`가 반드시 안쪽에 있어야 함

---

### 주제 1. 지갑 연결

구현해야 할 것:
- [x] RainbowKit `<ConnectButton />`로 연결/해제 기능

이해 포인트:
- 연결·해제·체인 표시는 RainbowKit이 버튼 하나로 다 처리

---

### 주제 2. 정보 표시 ⭐ (wagmi 읽기 훅 연습 — 손으로)

구현해야 할 기능:
- [x] 지갑 주소 표시 (`useAccount`)
- [x] ENS 이름 표시 (`useEnsName`)
- [x] ENS 아바타 표시 (`useEnsAvatar`)
- [x] 네이티브 잔액 표시 (`useBalance`)
- [x] 현재 연결된 체인 표시 (`useAccount`의 `chain`/`chainId`)

이해 포인트:
- 잔액은 `value`(bigint, wei)와 `formatted`(사람이 읽는 값)로 나뉨 → **2주차 `formatUnits` 개념 미리 등장**. 왜 bigint인지 생각해보기
- ENS는 **메인넷 전용** → Sepolia로 스위치하면 ENS 안 나오는 게 정상

---

### 주제 3. 체인 스위처 직접 구현 ⭐ (손으로)

> `<ConnectButton>`에 내장돼 있지만, **연습을 위해 직접** 만든다. "작동하는 체인 스위처" 산출물의 핵심.

구현해야 할 기능:
- [x] `useSwitchChain`으로 Sepolia ↔ Mainnet 토글 버튼
- [x] 전환 중(`isPending`) 상태 표시
- [x] 현재 체인 버튼은 비활성화 처리

---

### 주제 4. 상태 처리

구현해야 할 기능:
- [x] 지갑 미연결 시 안내 UI
- [x] 연결 중(`isConnecting`) 표시
- [x] 지원하지 않는 체인일 때 처리 (`chain`이 `undefined`)

---

### 주제 5. 배포 (스킵)

> Vercel 환경변수 등록은 이미 경험이 있어 이번 주차에서는 새로 배울 게 없어 스킵.
> 로컬(`localhost`)에서 모든 기능·핵심 체감 포인트 확인 완료.

---

## ✅ 완료 판단 기준

- [x] 지갑 연결 → 주소·ENS·잔액 표시
- [x] **내가 만든 버튼**으로 체인 전환됨
- [x] 체인 바꾸면 **잔액이 그 체인에 맞게 자동으로 바뀜** ← 핵심 체감 포인트

> [!success] 이번 주 진짜 배움
> 체인을 바꿨을 때 `useBalance`가 **알아서 다시 읽어오는 것**을 눈으로 확인하면, 로드맵 3주차 노트의 **"queryKey 입력(chainId)이 바뀌면 자동 refetch"** 원리를 체감한 것. 이게 wagmi 멘탈 모델의 핵심.

---

## 🔗 참고 자료

- [wagmi 문서 — Hooks](https://wagmi.sh/react/api/hooks) (필요한 훅만 참조)
- [RainbowKit 문서](https://www.rainbowkit.com)
- [Reown Cloud (projectId 발급)](https://cloud.reown.com)
- [Alchemy Dashboard (RPC 키)](https://dashboard.alchemy.com)
