import { isAddress } from '../utils'

export const VERIFICATION_WORKER_URL = 'https://sybil-verifier.uniswap.workers.dev'
export const TWITTER_WORKER_URL = 'https://twitter-worker.uniswap.workers.dev'

// verify a mapping - return undefined if invalid
export async function verifyHandleForAddress(account: string, tweetID: string): Promise<string | undefined> {
  try {
    return fetch(`${VERIFICATION_WORKER_URL}/api/verify?account=${account}&id=${tweetID}`).then(async res => {
      if (res.status === 200) {
        const handle = await res.text()
        return handle
      }
      return undefined
    })
  } catch {
    return Promise.reject(new Error('Invalid response'))
  }
}

export interface ProfileDataResponse {
  data: {
    id: number
    name: string
    username: string
    profile_image_url: string
  }
}
const PROFILE_DATA_PROMISES: { [key: string]: Promise<ProfileDataResponse | null> } = {}

export function fetchProfileData(handle: string): Promise<ProfileDataResponse | null> {
  const key = `${handle}`
  const url = `${TWITTER_WORKER_URL}/user?handle=${handle}`
  return (PROFILE_DATA_PROMISES[key] =
    PROFILE_DATA_PROMISES[key] ??
    fetch(url)
      .then(async res => {
        if (res.status === 200) {
          return res.json()
        } else {
          console.debug(`No handle found`)
          return null
        }
      })
      .catch(error => {
        console.error('Failed to get claim data', error)
      }))
}

export interface LatestTweetResponse {
  data: [
    {
      id: string
      text: string
    }
  ]
}

// dont save responses as user may need to tweet multiple times
export async function fetchLatestTweet(handle: string): Promise<LatestTweetResponse | null> {
  const url = `${TWITTER_WORKER_URL}/user/latest-tweet?handle=` + handle
  return fetch(url)
    .then(async res => {
      if (res.status === 200) {
        return res.json()
      } else {
        return null
      }
    })
    .catch(error => {
      console.error('Failed to get claim data', error)
    })
}

export interface HandleResponse {
  data: [
    {
      handle: string
    }
  ]
}

export async function fetchSingleVerifiedHandle(address: string): Promise<string | undefined> {
  if (!isAddress(address)) return Promise.reject(new Error('Invalid address'))

  return fetch(`${VERIFICATION_WORKER_URL}/api/accounts?address=${address}`).then(async res => {
    if (res.status === 200) {
      return res.json().then(data => data.handle)
    }
    return Promise.reject(new Error('Invalid response'))
  })
}
