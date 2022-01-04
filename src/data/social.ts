import { Identities } from './../state/social/reducer'
// Endpoints
export const VERIFICATION_WORKER_URL = 'https://sybil-verifier.uniswap.workers.dev'
const VERIFIED_JSON = 'https://api.github.com/repos/uniswap/sybil-list/contents/verified.json'
export const TWITTER_WORKER_URL = 'https://twitter-worker.uniswap.workers.dev'

export async function fetchAllIdentities(): Promise<Identities | undefined> {
  try {
    return fetch(VERIFIED_JSON)
      .then(async (res) => {
        if (!res || res.status !== 200) {
          return Promise.reject('Unable to fetch verified handles')
        } else {
          return res
            .json()
            .then((data) => {
              const content = data.content
              const decodedContent = atob(content)
              const parsed = JSON.parse(decodedContent)
              return parsed
            })
            .catch(() => {
              return Promise.reject('Error fetch verified handle data')
            })
        }
      })
      .catch(() => {
        return undefined
      })
  } catch (e) {
    return Promise.reject('Error fetch verified handle data')
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
  try {
    return (PROFILE_DATA_PROMISES[key] =
      PROFILE_DATA_PROMISES[key] ??
      fetch(url)
        .then(async (res) => {
          if (res.status === 200) {
            return res.json()
          } else {
            Promise.reject('No handle found')
            return null
          }
        })
        .catch((error) => {
          return Promise.reject(error)
        }))
  } catch {
    return Promise.reject('Error: fetching profile data')
  }
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
  const url = `${TWITTER_WORKER_URL}/latest-tweet?handle=` + handle
  try {
    return fetch(url).then(async (res) => {
      if (res.status === 200) {
        return res.json()
      } else {
        return Promise.reject('Error fetching latest tweet')
      }
    })
  } catch (error) {
    return Promise.reject('Error fetching latest tweet')
  }
}
