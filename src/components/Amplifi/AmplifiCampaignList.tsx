import Copy from 'components/AccountDetails/Copy'
import { AutoColumn } from 'components/Column'
import Youtube from 'components/Youtube'
import useUTM from 'hooks/useUTM'
import React from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'
import parse from 'html-react-parser';
import { useActiveProtocol } from '../../state/governance/hooks'

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

    const [activeProtocol] = useActiveProtocol()
    const utmLinks = useUTM();
    // monitor user inputs
    // const [twitterHandle] = useTwitterAccount()
    // const [twitterShareURL, setTwitterShareURL] = useState('https://cre8r.vip')
    // const [tweetContent, setTweetContent] = useState(
    //     'Hello Guys, This is a testing of twitter share example',
    // )

    // const campaignHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    //     event.preventDefault();
    //     if (!twitterHandle) {
    //       console.error('Twitterhandle is undefined')
    //       // return;
    //     }
    //     const button: HTMLButtonElement = event.currentTarget;
    //     const utmParameters = [];
    //     utmParameters.push('utm_source=' + encodeURI(twitterHandle || ''));
    //     utmParameters.push('utm_medium=amplifi');
    //     const longUrl = 'https://cre8r.vip?' + utmParameters.join('&');
    //     setTweetContent(longUrl);

    //     const twitterParameters = [];
    //     if (twitterShareURL)
    //         twitterParameters.push('url=' + encodeURI(twitterShareURL));
    //     if (tweetContent)
    //         twitterParameters.push('text=' + encodeURI(tweetContent));
    //     if (twitterHandle)
    //         twitterParameters.push('via=' + encodeURI(twitterHandle));
    //     const url =
    //         'https://twitter.com/intent/tweet?'
    //         + twitterParameters.join('&')

    //     console.log(url)
    // }

    return (
        <Wrapper>
            <AutoColumn gap="0">
                <TYPE.body fontSize="16px" fontWeight="600" mb="1rem">
                    Campaigns
                </TYPE.body>
                <Break />
                {activeProtocol && activeProtocol.description && activeProtocol.campaignBudget &&  (<>
                  <TYPE.body fontSize="14px" fontWeight="600" mb="1rem" mt="1rem">
                  <span style={{ fontWeight: 'bolder' }} > Campaign Budget: </span>  <span >{activeProtocol.campaignBudget}</span> {activeProtocol.token.symbol} 
                    {/* <WrappedListLogo src={activeProtocol.logo} style={{width: 100, height: 100}}/> */}
                </TYPE.body>
                <TYPE.body fontSize="14px" fontWeight="300" mb="1rem">
                  {parse(activeProtocol.description)}
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
                {utmLinks && activeProtocol ? (
                  <Copy toCopy={"https://" + utmLinks[activeProtocol?.id]}>
                    <span style={{ marginLeft: '4px', marginBottom: '16px' }}>{utmLinks[activeProtocol?.id]}</span>
                  </Copy>
                ) : <p>Please connect to Twitter in order to generate your unique referral link.</p>}
                {activeProtocol && activeProtocol.video && <Youtube video={activeProtocol?.video}/>}
            </AutoColumn>
        </Wrapper>
    )
}
