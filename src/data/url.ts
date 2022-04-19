import { GovernanceInfo } from "state/governance/reducer";
import { SerializedToken } from "state/user/actions";


export async function getUrl(twitterHandle : string, governanceInfo : GovernanceInfo | undefined) : Promise<any> {
  if (!governanceInfo) {
    console.error('need governanace info')
    return;
  }
  const {token, baseUrl} = governanceInfo
  const options = {
    method: 'GET',
    headers: {Accept: 'application/json', apikey: process.env.REACT_APP_REBRANDLY || ":("}
  };

  /**
   * https://hundred.finance/?utm_source=source&utm_medium=medium&utm_campaign=name&utm_id=twitter-ugm
   */
  console.log(token)
  const campaignUrl = baseUrl || 'https://www.google.com/?'
  const utm_source = 'source'
  const medium = 'medium'
  const utm_campaign = token.symbol || 'no_protocol_found'
  const utm_id = 'utm_id'
  const utm_term = twitterHandle
  const domain = {
    id: '278c3d8b2f6d469e812bdddbf713a079',
    fullName: 'link.cre8r.vip'
  }

  const campaignUrlComponents = []
  campaignUrlComponents.push(`utm_source=${utm_source}`)
  campaignUrlComponents.push(`utm_medium=${medium}`)
  campaignUrlComponents.push(`utm_campaign=${utm_campaign}`)
  campaignUrlComponents.push(`utm_id=${utm_id}`)
  campaignUrlComponents.push(`utm_term=${utm_term}`)

  const urlComponents = []
  
  urlComponents.push(`domain[id]=${domain.id}`)
  urlComponents.push(`domain[fullName]=${domain.fullName}`)

  const response = await fetch('https://api.rebrandly.com/v1/links/new?destination=' + encodeURIComponent(campaignUrl + campaignUrlComponents.join('&')) + '&' + urlComponents.join('&'), options)
  const res = await response.json()
  return res.shortUrl
}