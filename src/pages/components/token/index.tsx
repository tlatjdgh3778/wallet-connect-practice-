import { useState } from "react";
import { isAddress, type Address } from "viem";
import { erc20Abi } from "../../../abis/erc20";

// ─────────────────────────────────────────────────────────────
// 실습 2주차 · 토큰 대시보드 (컨트랙트 읽기 + ABI + ERC-20)
//
// 이 파일은 "뼈대"만 있음:
//   ✅ 주제 1 (주소 입력 + isAddress 검증)  — 완성
//   ❌ 주제 2 (ABI로 읽기)                  — TokenInfo 안에서 직접 구현
//   ❌ 주제 3 (decimals 단위 변환)          — TokenInfo 안에서 직접 구현
//
// erc20Abi는 src/abis/erc20.ts 에 준비됨.
// ─────────────────────────────────────────────────────────────

export function TokenDashboard() {
  const [input, setInput] = useState("");

  // 주제 1. 주소 형식 검증 — isAddress로 유효한 주소인지 체크
  const trimmed = input.trim();
  const isValid = isAddress(trimmed);
  const showError = trimmed.length > 0 && !isValid;

  return (
    <div style={{ border: "1px solid orange", padding: "1rem" }}>
      <strong>Token Dashboard</strong>

      {/* 주제 1. 토큰 주소 입력 폼 */}
      <div style={{ marginTop: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ERC-20 토큰 컨트랙트 주소 (0x...)"
          style={{ width: "100%", padding: "0.4rem", boxSizing: "border-box" }}
        />
        {showError && (
          <p style={{ color: "red", margin: "0.25rem 0 0" }}>
            유효한 주소가 아닙니다.
          </p>
        )}
      </div>

      {/* 유효한 주소일 때만 정보 읽기 시도 */}
      {isValid && <TokenInfo tokenAddress={trimmed as Address} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 여기서부터 손으로 구현 ✋
// ─────────────────────────────────────────────────────────────
function TokenInfo({ tokenAddress }: { tokenAddress: Address }) {
  // TODO 주제 2. ERC-20 정보 읽기 (ABI로 읽기)
  //   - useReadContract 로 name / symbol / decimals / balanceOf 읽기
  //     · abi: erc20Abi, address: tokenAddress, functionName: 'name' ...
  //     · balanceOf 는 args 로 조회할 주소가 필요 → args: [account.address]
  //   - useReadContracts 로 위 값들을 하나로 묶어 멀티콜(배칭) → RPC 1번에 조회
  //
  // TODO 주제 3. 단위 변환
  //   - balanceOf 가 준 raw 값(bigint) → formatUnits(value, decimals) 로 변환
  //   - decimals 는 절대 하드코딩 금지 — 컨트랙트에서 읽은 값을 그대로 사용
  //
  // TODO 주제 4. 상태 처리
  //   - isLoading → 스켈레톤/스피너
  //   - isError   → 존재하지 않는 컨트랙트 / ERC-20 아님
  //   - 지갑 미연결 시 balanceOf 분기 처리

  return (
    <div style={{ marginTop: "0.75rem", opacity: 0.7 }}>
      <p style={{ margin: 0 }}>주소: {tokenAddress}</p>
      <p style={{ margin: "0.25rem 0 0" }}>
        👉 여기에 주제 2·3을 손으로 구현하세요.
      </p>
    </div>
  );
}
