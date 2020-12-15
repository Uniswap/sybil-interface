import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount, Token, Percent } from '@uniswap/sdk'
import { updateActiveProtocol, updateFilterActive, updateTopDelegates, updateVerifiedDelegates } from './actions'
import { AppDispatch, AppState } from './../index'
import { useDispatch, useSelector } from 'react-redux'
import { GovernanceInfo } from './reducer'
import { useState, useEffect, useCallback } from 'react'
import { useGovernanceContract, useGovTokenContract } from '../../hooks/useContract'
import { useSingleCallResult, useSingleContractMultipleData, NEVER_RELOAD } from '../multicall/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useTransactionAdder } from '../transactions/hooks'
import { isAddress, calculateGasMargin } from '../../utils'
import { useSubgraphClient } from '../application/hooks'
import { fetchProposals, fetchGlobalData, enumerateProposalState } from '../../data/governance'
import { ALL_VOTERS, DELEGATE_INFO } from '../../apollo/queries'
import { deserializeToken } from '../user/hooks'
import { useIsEOA } from '../../hooks/useIsEOA'

export interface GlobaData {
  id: string
  totalTokenHolders: number
  totalDelegates: number
  delegatedVotes: number
  delegatedVotesRaw: number
}

export interface DelegateData {
  id: string
  delegatedVotes: number
  delegatedVotesRaw: number
  votePercent: Percent
  votes: {
    id: string
    support: boolean
    votes: number
  }[]
  EOA: boolean | undefined //
  handle: string | undefined // twitter handle
  imageURL?: string | undefined
}

export function useActiveProtocol(): [GovernanceInfo | undefined, (activeProtocol: GovernanceInfo) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const activeProtocol = useSelector<AppState, AppState['governance']['activeProtocol']>(state => {
    return state.governance.activeProtocol
  })

  const setActiveProtocol = useCallback(
    (activeProtocol: GovernanceInfo) => {
      dispatch(updateActiveProtocol({ activeProtocol }))
    },
    [dispatch]
  )
  return [activeProtocol, setActiveProtocol]
}

export function useFilterActive(): [boolean, (filterActive: boolean) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const filterActive = useSelector<AppState, AppState['governance']['filterActive']>(state => {
    return state.governance.filterActive
  })

  const setFilterActive = useCallback(
    (filterActive: boolean) => {
      dispatch(updateFilterActive({ filterActive }))
    },
    [dispatch]
  )
  return [filterActive, setFilterActive]
}

export function useGovernanceToken(): Token | undefined {
  const { chainId } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()
  return chainId && activeProtocol ? deserializeToken(activeProtocol.token) : undefined
}

// @todo add typed query response
export function useGlobalData(): GlobaData | undefined {
  const { library } = useActiveWeb3React()
  const client = useSubgraphClient()
  const [globalData, setGlobalData] = useState<GlobaData | undefined>()

  useEffect(() => {
    fetchGlobalData(client).then((data: GlobaData | null) => {
      if (data) {
        setGlobalData(data)
      }
    })
  }, [library, client])

  return globalData
}

export function useTopDelegates(): [DelegateData[] | undefined, (topDelegates: DelegateData[] | undefined) => void] {
  const [activeProtocol] = useActiveProtocol()

  const dispatch = useDispatch<AppDispatch>()
  const delegates = useSelector<AppState, AppState['governance']['topDelegates']>(state => {
    return state.governance.topDelegates
  })
  const setTopDelegates = useCallback(
    (topDelegates: DelegateData[] | undefined) => {
      activeProtocol && dispatch(updateTopDelegates({ protocolID: activeProtocol?.id, topDelegates }))
    },
    [activeProtocol, dispatch]
  )
  return [activeProtocol ? delegates?.[activeProtocol.id] : undefined, setTopDelegates]
}

export function useVerifiedDelegates(): [
  DelegateData[] | undefined,
  (verifiedDelegates: DelegateData[] | undefined) => void
] {
  const [activeProtocol] = useActiveProtocol()

  const dispatch = useDispatch<AppDispatch>()
  const delegates = useSelector<AppState, AppState['governance']['verifiedDelegates']>(state => {
    return state.governance.verifiedDelegates
  })
  const setVerifiedDelegates = useCallback(
    (verifiedDelegates: DelegateData[] | undefined) => {
      activeProtocol && dispatch(updateVerifiedDelegates({ protocolID: activeProtocol?.id, verifiedDelegates }))
    },
    [activeProtocol, dispatch]
  )
  return [activeProtocol ? delegates?.[activeProtocol.id] : undefined, setVerifiedDelegates]
}

interface ProposalDetail {
  target: string
  functionSig: string
  callData: string
}

export interface ProposalData {
  id: string
  title: string
  description: string
  proposer: string
  status: string
  forCount: number | undefined
  againstCount: number | undefined
  startBlock: number
  endBlock: number
  details: ProposalDetail[]
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
}

// get count of all proposals made
export function useProposalCount(): number | undefined {
  const gov = useGovernanceContract()
  const res = useSingleCallResult(gov, 'proposalCount')
  if (res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return undefined
}

/**
 * @TODO can this be used to speed up the loading?
 */
export function useAllProposalStates(): number[] | undefined {
  const govContract = useGovernanceContract()

  const [statuses, setStatuses] = useState<number[] | undefined>()

  // get total amount
  const proposalCount = useProposalCount()
  const ids = proposalCount ? Array.from({ length: proposalCount }, (v, k) => [k + 1]) : [['']]

  const statusRes = useSingleContractMultipleData(proposalCount ? govContract : undefined, 'state', ids, NEVER_RELOAD)

  useEffect(() => {
    if (!statuses) {
      const formattedRes = statusRes?.map(res => {
        if (!res.loading && res.valid) {
          return res.result?.[0]
        }
      })
      if (formattedRes[0]) {
        setStatuses(formattedRes)
      }
    }
  }, [statuses, statusRes])

  return statuses
}

export function useProposalStatus(id: string): string | undefined {
  const allStatuses = useAllProposalStates()
  return allStatuses ? enumerateProposalState(allStatuses[parseInt(id) - 1]) : undefined
}

export function useAllProposals() {
  const [proposals, setProposals] = useState<ProposalData[] | undefined>()

  // get subgraph client for active protocol
  const govClient = useSubgraphClient()

  const govToken = useGovernanceToken()

  // reset proposals on protocol change
  const [activeProtocol] = useActiveProtocol()
  useEffect(() => {
    setProposals(undefined)
  }, [activeProtocol])

  // get number of proposals
  const amount = useProposalCount()

  // need to manually fetch counts and states as not in subgraph
  const govContract = useGovernanceContract()
  const ids = amount ? Array.from({ length: amount }, (v, k) => [k + 1]) : [['']]
  const counts = useSingleContractMultipleData(
    amount ? govContract : undefined,
    'proposals',
    ids,
    NEVER_RELOAD
  ).reverse()
  const states = useAllProposalStates()

  // subgraphs only store ids in lowercase, format
  useEffect(() => {
    async function fetchData() {
      try {
        if (govToken) {
          fetchProposals(govClient, govToken.address).then((res: ProposalData[] | null) => {
            if (res) {
              setProposals(res)
            }
          })
        }
      } catch (e) {
        console.log(e)
      }
    }
    if (!proposals && govToken) {
      fetchData()
    }
  }, [govClient, govToken, proposals, states])

  useEffect(() => {
    if (counts && proposals && govToken) {
      proposals.map((p, i) => {
        p.forCount = counts?.[i]?.result?.forVotes
          ? parseFloat(new TokenAmount(govToken, counts?.[i]?.result?.forVotes).toExact())
          : undefined
        p.againstCount = counts?.[i]?.result?.againstVotes
          ? parseFloat(new TokenAmount(govToken, counts?.[i]?.result?.againstVotes).toExact())
          : undefined
        return true
      })
    }
  }, [counts, govToken, proposals])

  return proposals
}

export function useProposalData(id: string): ProposalData | undefined {
  const allProposalData = useAllProposals()
  return allProposalData?.find(p => p.id === id)
}

// get the users delegatee if it exists
export function useUserDelegatee(): string {
  const { account } = useActiveWeb3React()
  const uniContract = useGovTokenContract()
  const { result } = useSingleCallResult(uniContract, 'delegates', [account ?? undefined])
  return result?.[0] ?? undefined
}

// gets the users current votes
export function useUserVotes(): TokenAmount | undefined {
  const { account } = useActiveWeb3React()
  const govTokenContract = useGovTokenContract()

  const govToken = useGovernanceToken()

  // check for available votes
  const votes = useSingleCallResult(govTokenContract, 'getCurrentVotes', [account ?? undefined])?.result?.[0]
  return votes && govToken ? new TokenAmount(govToken, votes) : undefined
}

// fetch available votes as of block (usually proposal start block)
export function useUserVotesAsOfBlock(block: number | undefined): TokenAmount | undefined {
  const { account } = useActiveWeb3React()
  const govTokenContract = useGovTokenContract()

  const govToken = useGovernanceToken()

  // check for available votes
  const votes = useSingleCallResult(govTokenContract, 'getPriorVotes', [account ?? undefined, block ?? undefined])
    ?.result?.[0]
  return votes && govToken ? new TokenAmount(govToken, votes) : undefined
}

export function useDelegateCallback(): (delegatee: string | undefined) => undefined | Promise<string> {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  const govTokenContract = useGovTokenContract()

  return useCallback(
    (delegatee: string | undefined) => {
      if (!library || !chainId || !account || !isAddress(delegatee ?? '')) return undefined
      const args = [delegatee]
      if (!govTokenContract) throw new Error('No UNI Contract!')
      return govTokenContract.estimateGas.delegate(...args, {}).then(estimatedGasLimit => {
        return govTokenContract
          .delegate(...args, { value: null, gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Delegated votes`
            })
            return response.hash
          })
      })
    },
    [account, addTransaction, chainId, library, govTokenContract]
  )
}

export function useVoteCallback(): {
  voteCallback: (proposalId: string | undefined, support: boolean) => undefined | Promise<string>
} {
  const { account } = useActiveWeb3React()

  const govContract = useGovernanceContract()
  const addTransaction = useTransactionAdder()

  const voteCallback = useCallback(
    (proposalId: string | undefined, support: boolean) => {
      if (!account || !govContract || !proposalId) return
      const args = [proposalId, support]
      return govContract.estimateGas.castVote(...args, {}).then(estimatedGasLimit => {
        return govContract
          .castVote(...args, { value: null, gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Voted ${support ? 'for ' : 'against'} proposal ${proposalId}`
            })
            return response.hash
          })
      })
    },
    [account, addTransaction, govContract]
  )
  return { voteCallback }
}

export function useAllVotersForProposal(
  proposalID: string,
  support: boolean
):
  | {
      votes: string
      voter: {
        id: string
      }
    }[]
  | undefined {
  const subgraphClient = useSubgraphClient()

  const [voters, setVoters] = useState<
    | {
        votes: string
        voter: {
          id: string
        }
      }[]
    | undefined
  >()

  useEffect(() => {
    setVoters(undefined)
  }, [proposalID, subgraphClient])

  useEffect(() => {
    async function fetchData() {
      subgraphClient
        ?.query({
          query: ALL_VOTERS,
          variables: {
            proposalID,
            support
          }
        })
        .then(
          (res: {
            data: {
              votes: {
                votes: string
                voter: {
                  id: string
                }
              }[]
            }
          }) => {
            setVoters(res.data.votes)
          }
        )
    }
    if (!voters) {
      fetchData()
    }
  })

  return voters
}

export interface DelegateInfo {
  // amount of votes delegated to them
  delegatedVotes: number

  // amount of delegates they represent
  tokenHoldersRepresentedAmount: number

  // proposals theyve voted on
  votes: {
    proposal: number
    votes: number
    support: boolean
  }[]

  EOA: boolean | null // null means loading
}

interface DelegateInfoRes {
  data:
    | {
        delegates: {
          delegatedVotes: string
          tokenHoldersRepresentedAmount: number
          votes: {
            proposal: {
              id: string
            }
            support: boolean
            votes: string
          }[]
        }[]
      }
    | undefined
}

export function useDelegateInfo(address: string | undefined): DelegateInfo | undefined {
  const client = useSubgraphClient()

  const [data, setData] = useState<DelegateInfo | undefined>()

  const isEOA = useIsEOA(address)

  useEffect(() => {
    async function fetchData() {
      client
        ?.query({
          query: DELEGATE_INFO,
          variables: {
            address
          }
        })
        .then((res: DelegateInfoRes) => {
          if (res?.data) {
            const resData = res.data.delegates[0]
            const votes = resData
              ? resData.votes
                  // sort in order created
                  .sort((a, b) => (parseInt(a.proposal.id) > parseInt(b.proposal.id) ? 1 : -1))
                  .map((v: { proposal: { id: string }; support: boolean; votes: string }) => ({
                    proposal: parseInt(v.proposal.id),
                    votes: parseFloat(v.votes),
                    support: v.support
                  }))
              : []
            setData({
              delegatedVotes: parseFloat(resData?.delegatedVotes ?? '0'),
              tokenHoldersRepresentedAmount: resData?.tokenHoldersRepresentedAmount ?? 0,
              votes,
              EOA: isEOA
            })
          }
        })
        .catch(e => {
          console.log(e)
        })
    }
    if (!data && address) {
      fetchData()
    }
  }, [address, client, data, isEOA])

  return data
}
