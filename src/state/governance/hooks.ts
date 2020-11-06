import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount } from '@uniswap/sdk'
import { updateActiveProtocol } from './actions'
import { AppDispatch, AppState } from './../index'
import { useDispatch, useSelector } from 'react-redux'
import { GovernanceInfo } from './reducer'
import { useState, useEffect, useCallback } from 'react'
import { governanceClient } from '../../apollo/client'
import { TOP_DELEGATES, PROPOSALS } from '../../apollo/queries'
import { useGovernanceContract, useUniContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../multicall/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useTransactionAdder } from '../transactions/hooks'
import { UNI } from '../../constants'
import { isAddress, calculateGasMargin } from '../../utils'

export interface DelegateData {
  id: string
  delegatedVotes: number
}

interface DelegateResponse {
  data: {
    delegates: DelegateData[]
  }
}

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

// @todo add typed query response
export function useTopDelegates() {
  const [delegates, setDelegates] = useState<DelegateData[] | undefined>()

  // subgraphs only store ids in lowercase, format
  useEffect(() => {
    try {
      governanceClient
        .query({
          query: TOP_DELEGATES,

          fetchPolicy: 'cache-first'
        })
        .then((res: DelegateResponse) => {
          if (res) {
            setDelegates(res.data.delegates)
          }
        })
    } catch (e) {
      console.log(e)
    }
  }, [])

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

  // subgraphs only store ids in lowercase, format
  useEffect(() => {
    async function fetchData() {
      try {
        governanceClient
          .query({
            query: PROPOSALS,
            fetchPolicy: 'cache-first'
          })
          .then((res: ProposalResponse) => {
            if (res) {
              const formatted: ProposalData[] | undefined = res.data.proposals.map(p => ({
                id: p.id,
                title: p.description?.split(/# |\n/g)[1] || 'Untitled',
                description: p.description?.split(/# /)[1] || 'No description.',
                proposer: p.proposer.id,
                status: p.status ?? 'Undetermined',
                forCount: 1000,
                againstCount: 1000,
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
              setProposals(formatted)
            }
          })
      } catch (e) {
        console.log(e)
      }
    }

    if (!proposals) {
      fetchData()
    }
  }, [proposals])

  return proposals
}

export function useProposalData(id: string): ProposalData | undefined {
  const allProposalData = useAllProposals()
  return allProposalData?.find(p => p.id === id)
}

// get the users delegatee if it exists
export function useUserDelegatee(): string {
  const { account } = useActiveWeb3React()
  const uniContract = useUniContract()
  const { result } = useSingleCallResult(uniContract, 'delegates', [account ?? undefined])
  return result?.[0] ?? undefined
}

// gets the users current votes
export function useUserVotes(): TokenAmount | undefined {
  const { account, chainId } = useActiveWeb3React()
  const uniContract = useUniContract()

  // check for available votes
  const uni = chainId ? UNI[chainId] : undefined
  const votes = useSingleCallResult(uniContract, 'getCurrentVotes', [account ?? undefined])?.result?.[0]
  return votes && uni ? new TokenAmount(uni, votes) : undefined
}

// fetch available votes as of block (usually proposal start block)
export function useUserVotesAsOfBlock(block: number | undefined): TokenAmount | undefined {
  const { account, chainId } = useActiveWeb3React()
  const uniContract = useUniContract()

  // check for available votes
  const uni = chainId ? UNI[chainId] : undefined
  const votes = useSingleCallResult(uniContract, 'getPriorVotes', [account ?? undefined, block ?? undefined])
    ?.result?.[0]
  return votes && uni ? new TokenAmount(uni, votes) : undefined
}

export function useDelegateCallback(): (delegatee: string | undefined) => undefined | Promise<string> {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  const uniContract = useUniContract()

  return useCallback(
    (delegatee: string | undefined) => {
      if (!library || !chainId || !account || !isAddress(delegatee ?? '')) return undefined
      const args = [delegatee]
      if (!uniContract) throw new Error('No UNI Contract!')
      return uniContract.estimateGas.delegate(...args, {}).then(estimatedGasLimit => {
        return uniContract
          .delegate(...args, { value: null, gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Delegated votes`
            })
            return response.hash
          })
      })
    },
    [account, addTransaction, chainId, library, uniContract]
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
