import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount, Token, Percent } from '@uniswap/sdk'
import { updateActiveProtocol } from './actions'
import { AppDispatch, AppState } from './../index'
import { useDispatch, useSelector } from 'react-redux'
import { GovernanceInfo, UNISWAP_GOVERNANCE, COMPOUND_GOVERNANCE } from './reducer'
import { useState, useEffect, useCallback } from 'react'
import { TOP_DELEGATES, GLOBAL_DATA, PROPOSALS } from '../../apollo/queries'
import { useGovernanceContract, useGovTokenContract } from '../../hooks/useContract'
import { useSingleCallResult, useSingleContractMultipleData, NEVER_RELOAD } from '../multicall/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useTransactionAdder } from '../transactions/hooks'
import { isAddress, calculateGasMargin } from '../../utils'
import { uniswapClient, compoundClient } from '../../apollo/client'
import { Web3Provider } from '@ethersproject/providers'
import { fetchSingleVerifiedHandle } from '../social/hooks'

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

export function useSubgraphClient() {
  const [activeProtocol] = useActiveProtocol()

  const [client, setClient] = useState(uniswapClient)

  useEffect(() => {
    switch (activeProtocol) {
      case UNISWAP_GOVERNANCE:
        setClient(uniswapClient)
        // code block
        break
      case COMPOUND_GOVERNANCE:
        setClient(compoundClient)
        // code block
        break
    }
  }, [activeProtocol])

  return client
}

export interface GlobaData {
  id: string
  totalTokenHolders: number
  totalDelegates: number
  delegatedVotes: number
  delegatedVotesRaw: number
}

interface GlobalResponse {
  data: {
    governances: GlobaData[]
  }
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
}

interface DelegateResponse {
  data: {
    delegates: DelegateData[]
  }
}

// @todo add typed query response
export function useGlobalData(): GlobaData | undefined {
  const { library } = useActiveWeb3React()
  const client = useSubgraphClient()
  const [globalData, setGlobalData] = useState<GlobaData | undefined>()

  // subgraphs only store ids in lowercase, format
  useEffect(() => {
    try {
      client
        .query({
          query: GLOBAL_DATA,

          fetchPolicy: 'cache-first'
        })
        .then(async (res: GlobalResponse) => {
          if (res) {
            setGlobalData(res.data.governances[0])
          }
        })
    } catch (e) {
      console.log(e)
    }
  }, [library, client])

  return globalData
}

// @todo add typed query response
const DELEGATE_PROMISES: { [key: string]: Promise<DelegateData[] | null> } = {}

function fetchDelegates(client: any, key: string, library: Web3Provider): Promise<DelegateData[] | null> {
  return (DELEGATE_PROMISES[key] =
    DELEGATE_PROMISES[key] ??
    client
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
        return res.data.delegates.map((d, i) => {
          return {
            ...d,
            EOA: typed[i] === '0x'
          }
        })
      }))
}

export function useTopDelegates() {
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
              // check if account is EOA or not
              const typed = await Promise.all(
                delegateData.map(d => {
                  return library?.getCode(d.id)
                })
              )
              // get handles for any delegates that have it
              // @todo update with bulk call to worker
              const handles = await Promise.all(
                delegateData.map(d => {
                  return fetchSingleVerifiedHandle(d.id)
                })
              )
              setDelegates(
                delegateData.map((d, i) => {
                  return {
                    ...d,
                    EOA: typed[i] === '0x',
                    handle: handles[i]
                  }
                })
              )
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
      status: string
      targets: string[]
      values: string[]
      signatures: string[]
      calldatas: string[]
      startBlock: string
      endBlock: string
    }[]
  }
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

const enumerateProposalState = (state: number) => {
  const proposalStates = ['pending', 'active', 'canceled', 'defeated', 'succeeded', 'queued', 'expired', 'executed']
  return proposalStates[state]
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

// @todo add typed query response
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
        govClient
          .query({
            query: PROPOSALS,
            fetchPolicy: 'cache-first'
          })
          .then((res: ProposalResponse) => {
            if (res) {
              const formattedProposals: ProposalData[] | undefined = res.data.proposals.map(p => ({
                id: p.id,
                title: p.description?.split(/# |\n/g)[1] || 'Untitled',
                description: p.description?.split(/# /)[1] || 'No description.',
                proposer: p.proposer.id,
                status: enumerateProposalState(0), // initialize as 0
                forCount: 0, // initialize as 0
                againstCount: 0, // initialize as 0
                startBlock: parseInt(p.startBlock),
                endBlock: parseInt(p.endBlock),
                details: p.targets.map((t, i) => {
                  return {
                    target: p.targets[i],
                    functionSig: p.signatures[i],
                    callData: p.calldatas[i]
                  }
                })
              }))
              setProposals(formattedProposals)
            }
          })
      } catch (e) {
        console.log(e)
      }
    }
    if (!proposals) {
      fetchData()
    }
  }, [govClient, proposals, states])

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
