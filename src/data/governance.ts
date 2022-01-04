import { Identities } from './../state/social/reducer'
import { Web3Provider } from '@ethersproject/providers'
import { TOP_DELEGATES, PROPOSALS, GLOBAL_DATA, DELEGATES_FROM_LIST, TOP_DELEGATES_OFFSET } from '../apollo/queries'
import { DelegateData, ProposalData } from '../state/governance/hooks'
import { ethers } from 'ethers'
import { fetchProfileData } from './social'
import { isAddress } from '../utils'
import { DocumentNode } from 'graphql'
import { PRELOADED_PROPOSALS } from '../constants'
import { GlobaData } from '../state/governance/reducer'
import { AUTONOMOUS_PROPOSAL_BYTECODE } from '../constants/proposals'

interface DelegateResponse {
  data: {
    delegates: DelegateData[]
  }
}

interface GlobalResponse {
  data: {
    governances: {
      id: string
      delegatedVotes: string
      delegatedVotesRaw: string
      totalTokenHolders: string
      totalDelegates: string
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
      fetchPolicy: 'cache-first',
    })
    .then(async (res: GlobalResponse) => {
      if (res) {
        return {
          id: res.data.governances[0].id,
          delegatedVotes: parseInt(res.data.governances[0].delegatedVotes),
          delegatedVotesRaw: parseInt(res.data.governances[0].delegatedVotesRaw),
          totalTokenHolders: parseInt(res.data.governances[0].totalTokenHolders),
          totalDelegates: parseInt(res.data.governances[0].totalDelegates),
        }
      } else {
        return Promise.reject('Error fetching global data')
      }
    })
    .catch(() => {
      return Promise.reject('Error fetching from subgraph')
    })
}

interface DelegateQuery {
  query: DocumentNode
  variables?: { list?: false | string[] | undefined; skip?: number | undefined }
  fetchPolicy: string
}

async function fetchDelegatesFromClient(
  client: any,
  library: Web3Provider,
  allIdentities: Identities,
  query: DelegateQuery
): Promise<DelegateData[] | null> {
  try {
    return client
      .query(query)
      .then(async (res: DelegateResponse) => {
        // check if account is EOA or not
        const typed = await Promise.all(
          res.data.delegates.map((d) => {
            return library?.getCode(d.id)
          })
        )
        // for each handle - get twitter profile data ,
        const handles = await Promise.all(
          res.data.delegates.map(async (a: DelegateData) => {
            const checksummed = isAddress(a.id)
            const handle = checksummed ? allIdentities?.[checksummed]?.twitter?.handle : undefined

            let profileData
            try {
              if (handle) {
                const res = await fetchProfileData(handle)
                if (res) {
                  profileData = res
                }
              }
            } catch (e) {
              profileData = undefined
            }

            return {
              account: a.id,
              handle,
              imageURL: profileData?.data?.profile_image_url,
            }
          })
        )

        return res.data.delegates.map((d, i) => {
          const checksummed = isAddress(d.id)
          if (checksummed) {
            d.id = checksummed
          }

          return {
            ...d,
            EOA: typed[i] === '0x',
            autonomous: typed[i] === AUTONOMOUS_PROPOSAL_BYTECODE,
            handle: handles.find((h) => h.account.toLowerCase() === d.id.toLowerCase())?.handle,
            imageURL: handles.find((h) => h.account.toLowerCase() === d.id.toLowerCase())?.imageURL,
          }
        })
      })
      .catch((e: any) => {
        return Promise.reject(`Error fetching delegates from subgraph: ${e.message}`)
      })
  } catch (e) {
    return Promise.reject('Unable to fetch delegates')
  }
}

export async function fetchTopDelegates(
  client: any,
  library: Web3Provider,
  allIdentities: Identities
): Promise<DelegateData[] | null> {
  return fetchDelegatesFromClient(client, library, allIdentities, {
    query: TOP_DELEGATES,
    fetchPolicy: 'cache-first',
  })
}

export async function fetchTopDelegatesOffset(
  client: any,
  library: Web3Provider,
  allIdentities: Identities,
  maxFetched: number
): Promise<DelegateData[] | null> {
  return fetchDelegatesFromClient(client, library, allIdentities, {
    query: TOP_DELEGATES_OFFSET,
    variables: {
      skip: maxFetched,
    },
    fetchPolicy: 'cache-first',
  })
}

/**
 * Used for filtering on verified entries only
 */
export async function fetchVerifiedDelegates(
  client: any,
  library: Web3Provider,
  allIdentities: Identities
): Promise<DelegateData[] | null> {
  return fetchDelegatesFromClient(client, library, allIdentities, {
    query: DELEGATES_FROM_LIST,
    variables: {
      // filter on address - graph needs lowercase
      list: allIdentities && Object.keys(allIdentities)?.map((a) => a.toLocaleLowerCase()),
    },
    fetchPolicy: 'cache-first',
  })
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

export async function fetchProposals(client: any, key: string, govId: string): Promise<ProposalData[] | null> {
  return (PROPOSAL_PROMISES[key] =
    PROPOSAL_PROMISES[key] ??
    client
      .query({
        query: PROPOSALS,
        fetchPolicy: 'cache-first',
      })
      .then(async (res: ProposalResponse) => {
        if (res) {
          return res.data.proposals.map((p, i) => {
            let description = PRELOADED_PROPOSALS[govId]?.[res.data.proposals.length - i - 1] || p.description
            console.log(p.startBlock)
            if (p.startBlock === '13551293') {
              description = description.replace(/  /g, '\n').replace(/\d\. /g, '\n$&')
            }

            return {
              id: p.id,
              title: description?.split(/# |\n/g)[1] || 'Untitled',
              description: description || 'No description.',
              proposer: p.proposer.id,
              status: undefined, // initialize as 0
              forCount: undefined, // initialize as 0
              againstCount: undefined, // initialize as 0
              startBlock: parseInt(p.startBlock),
              endBlock: parseInt(p.endBlock),
              forVotes: p.forVotes,
              againstVotes: p.againstVotes,
              details: p.targets.map((t, i) => {
                let name = '',
                  types = '',
                  callData = ''
                const signature = p.signatures[i]
                if (signature) {
                  const sigSplit = signature.substr(0, signature.length - 1).split('(')
                  name = sigSplit[0]
                  types = sigSplit[1]
                }

                const calldata = p.calldatas[i]
                if (calldata && types) {
                  const decoded = ethers.utils.defaultAbiCoder.decode(types.split(','), calldata)
                  callData = decoded.toString()
                }

                return {
                  target: p.targets[i],
                  functionSig: name,
                  callData,
                }
              }),
            }
          })
        }
        return null
      })).catch(() => {
    return Promise.reject('Error fetching proposals from subgraph')
  })
}
