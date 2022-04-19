import { AutoColumn } from 'components/Column'
import React, { useState } from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { useTwitterAccount } from '../../state/user/hooks'
import { useActiveProtocol } from '../../state/governance/hooks'
import { CONNECT_CONFIG, CRE8R_ADDRESS } from 'state/governance/reducer'
import { useActiveWeb3React } from '../../hooks'
import { useSignedHandle } from '../../hooks/useSignedHandle'
import { RowBetween, RowFixed } from 'components/Row'
import { getUrl } from 'data/url'

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

    const [twitterShareURL, setTwitterShareURL] = useState('https://cre8r.vip')
    const [tweetContent, setTweetContent] = useState(
        'Hello Guys, This is a testing of twitter share example',
    )


    const campaignHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!twitterHandle) {
          console.error('Twitterhandle is undefined')
        }
        const url1 = await getUrl(twitterHandle || 'user_not_known', activeProtocol)
        console.log(url1)
        setUrl(url1)
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
                <CampaignItem onClick={campaignHandler}>
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
                </CampaignItem>
            </AutoColumn>
        </Wrapper>
    )
}
