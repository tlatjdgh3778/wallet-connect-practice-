import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// 페이지 전환 네비게이션 (Next.js Pages Router)
const NAV = [
  { href: "/", label: "지갑 연결" },
  { href: "/token", label: "토큰 대시보드" },
];

export function Header() {
  const { pathname } = useRouter();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <nav style={{ display: "flex", gap: "1.5rem" }}>
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontWeight: isActive ? "bold" : "normal",
                textDecoration: isActive ? "underline" : "none",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <ConnectButton />
    </header>
  );
}
