import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount, Token } from '@uniswap/sdk'
import { updateActiveProtocol } from './actions'
import { AppDispatch, AppState } from './../index'
import { useDispatch, useSelector } from 'react-redux'
import { GovernanceInfo, UNISWAP_GOVERNANCE, COMPOUND_GOVERNANCE } from './reducer'
import { useState, useEffect, useCallback } from 'react'
import { TOP_DELEGATES, GLOBAL_DATA } from '../../apollo/queries'
import { useGovernanceContract, useGovTokenContract } from '../../hooks/useContract'
import { useSingleCallResult, useSingleContractMultipleData } from '../multicall/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useTransactionAdder } from '../transactions/hooks'
import { isAddress, calculateGasMargin } from '../../utils'
import { uniswapClient, compoundClient } from '../../apollo/client'
import { ethers } from 'ethers'
import { abi as GOV_ABI } from '@uniswap/governance/build/GovernorAlpha.json'

export function useActiveProtocol(): [GovernanceInfo, (activeProtocol: GovernanceInfo) => void] {
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
  votes: {
    id: string
    support: boolean
    votes: number
  }[]
  EOA: boolean | undefined
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
export function useTopDelegates() {
  const { library } = useActiveWeb3React()

  const [delegates, setDelegates] = useState<DelegateData[] | undefined>()

  const client = useSubgraphClient()

  // subgraphs only store ids in lowercase, format
  useEffect(() => {
    try {
      client
        .query({
          query: TOP_DELEGATES,

          fetchPolicy: 'cache-first'
        })
        .then(async (res: DelegateResponse) => {
          if (res) {
            const typed = await Promise.all(
              res.data.delegates.map(d => {
                return library?.getCode(d.id)
              })
            )
            setDelegates(
              res.data.delegates.map((d, i) => {
                return {
                  ...d,
                  EOA: typed[i] === '0x'
                }
              })
            )
          }
        })
    } catch (e) {
      console.log(e)
    }
  }, [library, client])

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

/**
 * Need proposal events to get description data emitted from
 * new proposal event.
 */
export function useDataFromEventLogs() {
  const { library } = useActiveWeb3React()
  const [formattedEvents, setFormattedEvents] = useState<any>()
  const govContract = useGovernanceContract()

  // create filter for these specific events
  const filter = { ...govContract?.filters?.['ProposalCreated'](), fromBlock: 0, toBlock: 'latest' }
  const eventParser = new ethers.utils.Interface(GOV_ABI)

  useEffect(() => {
    async function fetchData() {
      const pastEvents = await library?.getLogs(filter)
      // reverse events to get them from newest to odlest
      const formattedEventData = pastEvents
        ?.map(event => {
          const eventParsed = eventParser.parseLog(event).args
          return {
            description: eventParsed.description,
            details: eventParsed.targets.map((target: string, i: number) => {
              const signature = eventParsed.signatures[i]
              const [name, types] = signature.substr(0, signature.length - 1).split('(')

              const calldata = eventParsed.calldatas[i]
              const decoded = ethers.utils.defaultAbiCoder.decode(types.split(','), calldata)

              return {
                target,
                functionSig: name,
                callData: decoded.join(', ')
              }
            })
          }
        })
        .reverse()
      setFormattedEvents(formattedEventData)
    }
    if (!formattedEvents) {
      fetchData()
    }
  }, [eventParser, filter, library, formattedEvents])

  return formattedEvents
}

// get data for all past and active proposals
export function useAllProposals() {
  const proposalCount = useProposalCount()
  const govContract = useGovernanceContract()

  const proposalIndexes = []
  for (let i = 1; i <= (proposalCount ?? 0); i++) {
    proposalIndexes.push([i])
  }

  // get metadata from past events
  const formattedEvents = useDataFromEventLogs()

  // get all proposal entities
  const allProposals = useSingleContractMultipleData(govContract, 'proposals', proposalIndexes)

  // get all proposal states
  const allProposalStates = useSingleContractMultipleData(govContract, 'state', proposalIndexes)

  const [activeProtocol] = useActiveProtocol()

  if (formattedEvents && allProposals && allProposalStates) {
    allProposals.reverse()
    allProposalStates.reverse()

    return allProposals
      .filter((p, i) => {
        return Boolean(p.result) && Boolean(allProposalStates[i]?.result) && Boolean(formattedEvents[i])
      })
      .map((p, i) => {
        const formattedProposal: ProposalData = {
          id: allProposals[i]?.result?.id.toString(),
          title: formattedEvents[i].description?.split(/# |\n/g)[1] || 'Untitled',
          description: formattedEvents[i].description || 'No description.',
          proposer: allProposals[i]?.result?.proposer,
          status: enumerateProposalState(allProposalStates[i]?.result?.[0]) ?? 'Undetermined',
          forCount: parseFloat(
            ethers.utils.formatUnits(allProposals[i]?.result?.forVotes.toString(), activeProtocol.token.decimals)
          ),
          againstCount: parseFloat(
            ethers.utils.formatUnits(allProposals[i]?.result?.againstVotes.toString(), activeProtocol.token.decimals)
          ),
          startBlock: parseInt(allProposals[i]?.result?.startBlock?.toString()),
          endBlock: parseInt(allProposals[i]?.result?.endBlock?.toString()),
          details: formattedEvents[i].details
        }
        return formattedProposal
      })
  } else {
    return []
  }
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

export function useGovernanceToken(): Token | undefined {
  const { chainId } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()
  return chainId
    ? new Token(
        chainId,
        activeProtocol.token.address[chainId],
        activeProtocol.token.decimals,
        activeProtocol.token.symbol,
        activeProtocol.token.name
      )
    : undefined
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
