import { HandleEntry } from './../state/social/hooks'

// Endpoints
export const VERIFICATION_WORKER_URL = 'https://sybil-verifier.uniswap.workers.dev'
const VERIFIED_GIST_URL = 'https://api.github.com/gists/8f49a55280deaef631d360891a71e9c0'
export const TWITTER_WORKER_URL = 'https://twitter-worker.uniswap.workers.dev'

interface GithubData {
  files: {
    ['sybil-attestations.json']: {
      content: string
    }
  }
}

export async function fetchAllVerifiedHandles(): Promise<{ [address: string]: HandleEntry } | undefined> {
  try {
    return fetch(VERIFIED_GIST_URL).then(async res => {
      if (!res || res.status !== 200) {
        return Promise.reject(new Error('Unable to fetch verified handles'))
      } else {
        return res.json().then((data: GithubData) => {
          return JSON.parse(data.files['sybil-attestations.json'].content)
        })
      }
    })
  } catch (e) {
    return Promise.reject(new Error(e))
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
          Promise.reject('No handle found')
          return null
        }
      })
      .catch(error => {
        return Promise.reject(error)
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
  const url = `${TWITTER_WORKER_URL}/latest-tweet?handle=` + handle
  try {
    return fetch(url).then(async res => {
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
