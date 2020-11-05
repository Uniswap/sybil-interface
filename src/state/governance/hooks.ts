import { updateActiveProtocol } from './actions'
import { AppDispatch, AppState } from './../index'
import { useDispatch, useSelector } from 'react-redux'
import { GovernanceInfo } from './reducer'
import { useState, useEffect, useCallback } from 'react'
import { governanceClient } from '../../apollo/client'
import { TOP_DELEGATES, PROPOSALS } from '../../apollo/queries'
import { useGovernanceContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../multicall/hooks'

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
