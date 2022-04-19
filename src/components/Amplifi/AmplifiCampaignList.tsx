import { AutoColumn } from 'components/Column'
import {WrappedListLogo} from 'components/Menu/SideMenu'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { useTwitterAccount } from '../../state/user/hooks'
import { useActiveProtocol } from '../../state/governance/hooks'
import {useVerifiedHandle } from '../../state/social/hooks'
import { CONNECT_CONFIG, CRE8R_ADDRESS, CRE8R_GOVERNANCE } from 'state/governance/reducer'
import { useActiveWeb3React } from '../../hooks'
import { useSignedHandle } from '../../hooks/useSignedHandle'
import { RowBetween, RowFixed } from 'components/Row'
import { getUrl } from 'data/url'
import Copy from 'components/AccountDetails/Copy'
import { _100 } from '@uniswap/sdk/dist/constants'
import Youtube from 'components/Youtube'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  width: 100%;
`

export const Break = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
  height: 1px;
  margin: 0;
`

const CampaignItem = styled.button`
  border-radius: 12px;
  padding: 1rem 0;
  margin: 1rem;
  text-decoration: none;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const ResponsiveText = styled(TYPE.black)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `};
`

export default function AmplifiCampaignList() {
    const { chainId, account } = useActiveWeb3React()
    const [activeProtocol] = useActiveProtocol()
    const [url, setUrl] = useState('');
    // monitor user inputs
    const [twitterHandle] = useTwitterAccount()
    const verifiedHandleEntry = useVerifiedHandle(account)
    const [twitterShareURL, setTwitterShareURL] = useState('https://cre8r.vip')
    const [tweetContent, setTweetContent] = useState(
        'Hello Guys, This is a testing of twitter share example',
    )
    useEffect(() => {
      if (!verifiedHandleEntry) return;
      getUrl(verifiedHandleEntry?.handle || 'user_not_known', activeProtocol).then(url1 => {
        console.log(url1)
        setUrl(url1)
      })
    }, [verifiedHandleEntry, activeProtocol])

    const campaignHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!twitterHandle) {
          console.error('Twitterhandle is undefined')
          // return;
        }
        const button: HTMLButtonElement = event.currentTarget;
        const utmParameters = [];
        utmParameters.push('utm_source=' + encodeURI(twitterHandle || ''));
        utmParameters.push('utm_medium=amplifi');
        const longUrl = 'https://cre8r.vip?' + utmParameters.join('&');
        setTweetContent(longUrl);

        const twitterParameters = [];
        if (twitterShareURL)
            twitterParameters.push('url=' + encodeURI(twitterShareURL));
        if (tweetContent)
            twitterParameters.push('text=' + encodeURI(tweetContent));
        if (twitterHandle)
            twitterParameters.push('via=' + encodeURI(twitterHandle));
        const url =
            'https://twitter.com/intent/tweet?'
            + twitterParameters.join('&')

        console.log(url)
    }

    return (
        <Wrapper>
            <AutoColumn gap="0">
                <TYPE.body fontSize="16px" fontWeight="600" mb="1rem">
                    Campaigns
                </TYPE.body>
                <Break />
                {activeProtocol && activeProtocol.description && (<>
                  <TYPE.body fontSize="14px" fontWeight="600" mb="1rem" mt="1rem">
                    Campaigns Budget <span >50</span> {activeProtocol.token.symbol} 
                    {/* <WrappedListLogo src={activeProtocol.logo} style={{width: 100, height: 100}}/> */}
                </TYPE.body>
                <TYPE.body fontSize="14px" fontWeight="300" mb="1rem">
                  {activeProtocol.description}
                </TYPE.body>
                </>)}
                {/* {activeProtocol && <TYPE.body fontSize="16px" fontWeight="600" mb="1rem">
                    {activeProtocol.token}
                </TYPE.body>} */}
                {/* <CampaignItem onClick={campaignHandler}>
                    <RowBetween>
                        <RowFixed>
                            <ResponsiveText mr="10px" ml='10px'>Click here to get referal link (look in console)</ResponsiveText>
                        </RowFixed>
                    </RowBetween>
                </CampaignItem>
                <CampaignItem>
                    <RowBetween>
                        <RowFixed>
                            <ResponsiveText mr="10px" ml='10px'>{url}</ResponsiveText>
                        </RowFixed>
                    </RowBetween>
                </CampaignItem> */}
                {url && (
                  <Copy toCopy={url}>
                    <span style={{ marginLeft: '4px', marginBottom: '16px' }}>{url}</span>
                  </Copy>
                )}
                {activeProtocol && activeProtocol.video && <Youtube video={activeProtocol?.video}/>}
            </AutoColumn>
        </Wrapper>
    )
}
