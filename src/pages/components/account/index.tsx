import { useAccount } from "wagmi";

export function AccountInfo() { 
    const account = useAccount();

    const isConnecting = account.isConnecting;
    const isConnected = account.isConnected;
    const isDisConnected = account.isDisconnected;

    return (
        <div>
            <div style={{ border: "1px solid black", padding: '1rem'}}>
                <strong>Wallet Connected Status</strong>
                {isDisConnected && <p>연결되지 않음</p>}
                {isConnecting && <p>연결 중...</p>}
                {isConnected && <p>연결됨</p>}
                <strong>Wallet Address: {account.address || "0x..."}</strong> {/* useAccount */}
            </div>
          </div>
    )
}