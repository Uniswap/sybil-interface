import { HandleEntry } from './../state/social/hooks'
import { Web3Provider } from '@ethersproject/providers'
import { TOP_DELEGATES, PROPOSALS, GLOBAL_DATA } from '../apollo/queries'
import { DelegateData, ProposalData, GlobaData } from '../state/governance/hooks'
import { ethers } from 'ethers'
import { fetchProfileData } from './social'
import { isAddress } from '../utils'

interface DelegateResponse {
  data: {
    delegates: DelegateData[]
  }
}

interface GlobalResponse {
  data: {
    governances: GlobaData[]
  }
}

interface HandlesResponse {
  data: {
    attestations: {
      id: string
      account: string
      tweetID: string
      timestamp: number
    }[]
  }
}

export async function fetchGlobalData(client: any): Promise<GlobaData | null> {
  if (!client) {
    return null
  }
  return client
    .query({
      query: GLOBAL_DATA,

      fetchPolicy: 'cache-first'
    })
    .then(async (res: GlobalResponse) => {
      if (res) {
        return res.data.governances[0]
      } else {
        return Promise.reject('Error fetching global data')
      }
    })
}

export async function fetchDelegates(
  client: any,
  key: string,
  library: Web3Provider,
  allVerifiedHandles: { [key: string]: HandleEntry } | undefined
): Promise<DelegateData[] | null> {
  try {
    return client
      .query({
        query: TOP_DELEGATES,
        fetchPolicy: 'cache-first'
      })
      .then(async (res: DelegateResponse) => {
        // check if account is EOA or not
        const typed = await Promise.all(
          res.data.delegates.map(d => {
            return library?.getCode(d.id)
          })
        )

        // for each handle attestation - verify which ones are legit,
        const handles = await Promise.all(
          res.data.delegates.map(async (a: DelegateData) => {
            const checksummed = isAddress(a.id)

            const handle = checksummed ? allVerifiedHandles?.[checksummed]?.handle : undefined

            const profileData = handle ? await fetchProfileData(handle) : undefined
            return {
              account: a.id,
              handle,
              imageURL: profileData?.data?.profile_image_url
            }
          })
        )

        return res.data.delegates.map((d, i) => {
          return {
            ...d,
            EOA: typed[i] === '0x',
            handle: handles.find(h => h.account.toLowerCase() === d.id.toLowerCase())?.handle,
            imageURL: handles.find(h => h.account.toLowerCase() === d.id.toLowerCase())?.imageURL
          }
        })
      })
  } catch (e) {
    return Promise.reject(new Error('Unable to fetch delegates'))
  }
}

/**
 * @todo replace with auto generated grapql format
 */
interface ProposalResponse {
  data: {
    proposals: {
      id: string
      proposer: {
        [id: string]: string
      }
      description: string
      status: string | undefined
      targets: string[]
      values: string[]
      signatures: string[]
      calldatas: string[]
      startBlock: string
      endBlock: string
      forVotes: {
        support: boolean
        votes: string
        voter: {
          id: string
        }
      }[]
      againstVotes: {
        support: boolean
        votes: string
        voter: {
          id: string
        }
      }[]
    }[]
  }
}

export const enumerateProposalState = (state: number) => {
  const proposalStates = ['pending', 'active', 'canceled', 'defeated', 'succeeded', 'queued', 'expired', 'executed']
  return proposalStates[state]
}

// @todo add typed query response
const PROPOSAL_PROMISES: { [key: string]: Promise<ProposalData[] | null> } = {}

export function fetchProposals(client: any, key: string): Promise<ProposalData[] | null> {
  return (PROPOSAL_PROMISES[key] =
    PROPOSAL_PROMISES[key] ??
    client
      .query({
        query: PROPOSALS,
        fetchPolicy: 'cache-first'
      })
      .then(async (res: ProposalResponse) => {
        if (res) {
          return res.data.proposals.map(p => ({
            id: p.id,
            title: p.description?.split(/# |\n/g)[1] || 'Untitled',
            description: p.description?.split(/# /)[1] || 'No description.',
            proposer: p.proposer.id,
            status: undefined, // initialize as 0
            forCount: 0, // initialize as 0
            againstCount: 0, // initialize as 0
            startBlock: parseInt(p.startBlock),
            endBlock: parseInt(p.endBlock),
            forVotes: p.forVotes,
            againstVotes: p.againstVotes,
            details: p.targets.map((t, i) => {
              const signature = p.signatures[i]
              const [name, types] = signature.substr(0, signature.length - 1).split('(')

              const calldata = p.calldatas[i]
              const decoded = ethers.utils.defaultAbiCoder.decode(types.split(','), calldata)

              return {
                target: p.targets[i],
                functionSig: name,
                callData: decoded.toString()
              }
            })
          }))
        }
        return null
      }))
}
