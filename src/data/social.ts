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
    return undefined
  }
}

//https://example.com/api?berify?account=0xCe1712Bb45C1D8CdAFFa1F242Bc0bc79F8D1352C&id=1329517739363463168

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
      return Promise.reject(new Error(error))
    })
}
