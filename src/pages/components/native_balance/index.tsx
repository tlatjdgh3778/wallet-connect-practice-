import { formatUnits } from "viem";
import { useBalance } from "wagmi";

const TEST_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

export function BalanaceInfo() { 
    const { data, isPending, error } = useBalance({
        address : TEST_ADDRESS,
    })

    console.log(data?.formatted);
    
    return (
            <div style={{ border: "1px solid green", padding: '1rem'}}>
                <div>
                    {error ?
                    <strong>Balance Error</strong> 
                    :
                    <strong>Balance: {isPending && "Loading..."} {data?.value ? `${Number(formatUnits(data?.value, data?.decimals)).toFixed(4)} ${data.symbol}` : "no balance"}</strong> 
                    }
                </div>
          </div>
    )
}