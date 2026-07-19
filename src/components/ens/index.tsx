import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { mainnet } from 'wagmi/chains'

const TEST_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

export function ENSInfo() { 
    const { data: ensName, isPending: ensNameLoading, error: ensNameError } = useEnsName({ 
        address: TEST_ADDRESS,
        chainId: mainnet.id
    });
    const { data: ensAvatar, isPending: ensAvatarLoading, error: ensAvatarError } = useEnsAvatar({
        name: normalize('vitalik.eth'),
    });

    return (
         <div style={{ border: "1px solid blue", padding: '1rem'}}>
            <div>
                {ensNameError ?
                <strong>ENS Name Error</strong> 
                :
                <strong>ENS Name: {ensNameLoading && "Loading..."} {ensName || "ensName 없음"}</strong> 
                }
            </div>
            <div>
                {ensAvatarError ?
                    <strong>ENS Avatar Error</strong> 
                    :
                    <strong>ENS Avatar: {ensAvatarLoading && "Loading..."} <img src={ensAvatar || undefined} width={30} height={30} /></strong> 
                }
            </div>
         </div>
    )
}