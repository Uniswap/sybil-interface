import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { useGovernanceContract, useGovernanceContractBravo, useIsAave } from 'hooks/useContract'
import { useActiveProtocol } from 'state/governance/hooks'
import { useState, useEffect } from 'react'
import { useGenericAlphaProposalCounts, useGenericBravoProposalCount } from 'data/proposalCount.ts'
import { useMultipleContractMultipleData, NEVER_RELOAD, useSingleContractMultipleData } from 'state/multicall/hooks'
import { Interface } from '@ethersproject/abi'
import GOVERNANCE_AAVE_ABI from '../../constants/abis/aave-governance.json'

/**
 * @TODO can this be used to speed up the loading?
 */
export function useGenericAlphaProposalStates(): number[] | undefined {
  const [activeProtocol] = useActiveProtocol()
  const isAaveGov = useIsAave()

  const [statuses, setStatuses] = useState<number[] | undefined>()

  // get total amount
  const alphaCounts: number[] | undefined = useGenericAlphaProposalCounts()

  const ids = alphaCounts
    ? alphaCounts.map((total) => {
        return Array.from({ length: total }, (v, k) => [isAaveGov ? k : k + 1])
      })
    : undefined

  const statusRes = useMultipleContractMultipleData(
    activeProtocol ? activeProtocol?.governanceAlphaAddresses : [undefined],
    new Interface(useIsAave() ? GOVERNANCE_AAVE_ABI : GOVERNANCE_ABI),
    isAaveGov ? 'getProposalState' : 'state',
    ids
  )

  const combinedStatuses = statusRes.reduce((accum: number[], res) => {
    const currentStatuses = res.map((x) => {
      if (x.result) {
        return x.result?.[0]
      } else {
      }
      return undefined
    })
    const newArray = accum.concat(currentStatuses)
    return newArray
  }, [])

  const loadingOrError =
    statusRes &&
    alphaCounts &&
    statusRes?.length !== alphaCounts?.length &&
    combinedStatuses.some((x) => x === undefined)

  useEffect(() => {
    if (!statuses && !loadingOrError) {
      if (combinedStatuses?.[0]) {
        setStatuses(combinedStatuses)
      }
    }
  }, [statuses, statusRes, combinedStatuses, loadingOrError])

  return statuses
}

export function useGenericBravoProposalStates(): number[] | undefined {
  const govContract = useGovernanceContract()
  const [activeProtocol] = useActiveProtocol()
  const migrationProposal = activeProtocol?.migrationProposalId
  const govContractBravo = useGovernanceContractBravo()

  const [statuses, setStatuses] = useState<number[] | undefined>()
  const isAaveGov = useIsAave()

  // get total amount
  const proposalCount = useGenericBravoProposalCount()
  const ids = proposalCount ? Array.from({ length: proposalCount }, (v, k) => [isAaveGov ? k : k + 1]) : [['']]

  const cutoffProposal = migrationProposal !== undefined ? migrationProposal : proposalCount

  let statusRes = useSingleContractMultipleData(
    proposalCount ? govContract : undefined,
    isAaveGov ? 'getProposalState' : 'state',
    ids.slice(0, cutoffProposal),
    NEVER_RELOAD
  )

  statusRes = statusRes.concat(
    useSingleContractMultipleData(
      proposalCount ? govContractBravo : undefined,
      isAaveGov ? 'getProposalState' : 'state',
      ids.slice(cutoffProposal),
      NEVER_RELOAD
    )
  )

  useEffect(() => {
    if (!statuses && proposalCount) {
      const formattedRes = statusRes?.map((res) => {
        if (!res.loading && res.valid) {
          return res.result?.[0]
        }
      })
      if (formattedRes[0] !== undefined) {
        setStatuses(formattedRes)
      }
    }
  }, [statuses, statusRes, proposalCount])

  return statuses
}
