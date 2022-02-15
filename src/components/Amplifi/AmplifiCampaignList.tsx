import { AutoColumn } from 'components/Column'
import React, {useState } from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'

import { useActiveWeb3React } from '../../hooks'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  width: 100%;
`

export const Break = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
  height: 1px;
  margin: 0;
`

export default function AmplifiCampaignList() {
    const { chainId, account } = useActiveWeb3React()
    const [utmCampaign, setUtmCampaign] = useState()
    const [utmSource, setUtmSource] = useState()


    return (
        <Wrapper>
            <AutoColumn gap="0">
                <TYPE.body fontSize="16px" fontWeight="600" mb="1rem">
                    Campaigns
                </TYPE.body>
                <Break />
            </AutoColumn>
        </Wrapper>
    )
}
