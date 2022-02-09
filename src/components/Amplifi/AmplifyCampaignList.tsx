import React, {useState } from 'react'

import { useActiveWeb3React } from '../../hooks'

export function AmplifyCampaignList() {
    const { chainId, account } = useActiveWeb3React()
    const [utmCampaign, setUtmCampaign] = useState()
    const [utmSource, setUtmSource] = useState()

    const handleCampaign = (event: React.FormEvent<HTMLInputElement>) => {
        setUtmCampaign(event.currentTarget.value)
    }

    return (
        <form>
            <h2>UTM Campaign Generator</h2>
            <label htmlFor="utm_campaign"></label>
            <input type="text" value={utmCampaign} onChange={handleCampaign} />
        </form>
    )
}

export default AmplifyCampaignList