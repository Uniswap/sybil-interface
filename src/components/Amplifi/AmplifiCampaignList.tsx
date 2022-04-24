import Copy from 'components/AccountDetails/Copy'
import { AutoColumn } from 'components/Column'
import Youtube from 'components/Youtube'
import React from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'
import parse from 'html-react-parser';
import { useActiveProtocol, useUtm } from '../../state/governance/hooks'
import FeaturedImage from 'components/FeaturedImage/FeaturedImage'


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
    const utmLinks = useUtm();
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
                Campaigns are still in testing phase and are subject to change. Please check back soon.
                </TYPE.body>
                <Break />
                { activeProtocol && activeProtocol.featuredImage &&  (<>
                  <FeaturedImage image={activeProtocol.featuredImage} />
                  </>)
                 }
                 { activeProtocol && activeProtocol.description && activeProtocol.campaignBudget && (<>
                  <TYPE.body fontSize="14px" fontWeight="600" mb="1rem" mt="1rem">
                  <span style={{ fontWeight: 'bolder' }} > Campaign Budget: </span>  <span >{activeProtocol.campaignBudget}</span> {activeProtocol.token.symbol} 
                    {/* <WrappedListLogo src={activeProtocol.logo} style={{width: 100, height: 100}}/> */}
                </TYPE.body>
                <TYPE.body fontSize="14px" fontWeight="300" mb="1rem">
                  {console.log(activeProtocol)}
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
                  <><span style={{ fontWeight: 'lighter', padding: '10px' }} > Copy your unique link &amp; start earning: </span>
                    <Copy toCopy={"https://" + utmLinks[activeProtocol?.id]}>
                     <span style={{ fontSize: '18px', marginLeft: '4px', marginBottom: '16px' }}>{utmLinks[activeProtocol?.id]}</span>
                    </Copy> 
                  </>
                ) : <p>Please connect to Twitter in order to generate your unique referral link.</p>}
                {activeProtocol && activeProtocol.video && <Youtube video={activeProtocol?.video}/>}
            </AutoColumn>
        </Wrapper>
    )
}
