import { useAccount } from "wagmi"

export function Chain() {
    const account = useAccount();

    return (
         <div style={{ border: "1px solid purple", padding: '1rem'}}>
            <strong>Connected Chain: {account.chain?.name}</strong> {/* useAccount - chain or chainId */}
          </div>
    )
}