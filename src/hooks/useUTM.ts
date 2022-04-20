import { getUrl } from "data/url";
import { useActiveWeb3React } from "hooks";
import { useEffect, useState } from "react";
import { GovernanceInfo, SUPPORTED_PROTOCOLS } from "state/governance/reducer";
import { useVerifiedHandle } from "state/social/hooks";


export default function useUTM() : { [id: string]: GovernanceInfo } | undefined  {
  const { account } = useActiveWeb3React()
  const verifiedHandleEntry = useVerifiedHandle(account)
  const [urls, setUrls] = useState({})
  useEffect(() => {
    if (!verifiedHandleEntry) return;
    const protocolUrls : { [id: string]: GovernanceInfo }  = {}
    Promise.all(Object.keys(SUPPORTED_PROTOCOLS).map(key => {
      return getUrl(verifiedHandleEntry?.handle || 'user_not_known', SUPPORTED_PROTOCOLS[key]).then(url1 => {
        protocolUrls[key] = url1
        setUrls(u => ({...u,...protocolUrls}))
      })
    }))
    console.log(protocolUrls)
  }, [verifiedHandleEntry])
  return urls 
}