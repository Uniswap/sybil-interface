import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount, Token, Percent } from '@uniswap/sdk'
import { updateActiveProtocol } from './actions'
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
import { fetchDelegates, fetchProposals, enumerateProposalState, fetchGlobalData } from '../../data/governance'

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

export function useGovernanceToken(): Token | undefined {
  const { chainId } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()
  return chainId && activeProtocol
    ? new Token(
        chainId,
        activeProtocol.token.address[chainId],
        activeProtocol.token.decimals,
        activeProtocol.token.symbol,
        activeProtocol.token.name
      )
    : undefined
}

// @todo add typed query response
export function useGlobalData(): GlobaData | undefined {
  const { library } = useActiveWeb3React()
  const client = useSubgraphClient()
  const [globalData, setGlobalData] = useState<GlobaData | undefined>()

  // subgraphs only store ids in lowercase, format
  useEffect(() => {
    fetchGlobalData(client).then((data: GlobaData | null) => {
      if (data) {
        setGlobalData(data)
      }
    })
  }, [library, client])

  return globalData
}

export function useTopDelegates(): DelegateData[] | undefined {
  const { library } = useActiveWeb3React()

  const [delegates, setDelegates] = useState<DelegateData[] | undefined>()

  // get graphql client for active protocol
  const client = useSubgraphClient()

  // reset list on active protocol change
  const [activeProtocol] = useActiveProtocol()
  useEffect(() => {
    setDelegates(undefined)
  }, [activeProtocol])

  const key = activeProtocol?.id ?? ''

  useEffect(() => {
    async function fetchTopDelegates() {
      try {
        library &&
          fetchDelegates(client, key, library).then(async delegateData => {
            if (delegateData) {
              setDelegates(delegateData)
            }
          })
      } catch (e) {
        console.log(e)
      }
    }
    if (!delegates) {
      fetchTopDelegates()
    }
  }, [library, client, key, delegates])

  return delegates
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
  forCount: number
  againstCount: number
  startBlock: number
  endBlock: number
  details: ProposalDetail[]
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
  const counts = useSingleContractMultipleData(amount ? govContract : undefined, 'proposals', ids, NEVER_RELOAD)
  const states = useSingleContractMultipleData(amount ? govContract : undefined, 'state', ids, NEVER_RELOAD).reverse()

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
          : 0
        p.againstCount = counts?.[i]?.result?.againstVotes
          ? parseFloat(new TokenAmount(govToken, counts?.[i]?.result?.againstVotes).toExact())
          : 0
        return true
      })
    }
  }, [counts, govToken, proposals])

  useEffect(() => {
    if (states && proposals && govToken) {
      proposals.map((p, i) => {
        return (p.status = enumerateProposalState(states?.[i]?.result?.[0] ?? 0))
      })
    }
  }, [counts, govToken, proposals, states])

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
