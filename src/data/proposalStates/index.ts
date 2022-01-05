import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { useGovernanceContractBravo, useGovernanceContractOpenZeppelin, useIsAave } from 'hooks/useContract'
import { useActiveProtocol } from 'state/governance/hooks'
import { useState, useEffect, useMemo } from 'react'
import { useGenericAlphaProposalCounts, useGenericBravoProposalCount } from 'data/proposalCount.ts'
import { useMultipleContractMultipleData, NEVER_RELOAD, useSingleContractMultipleData } from 'state/multicall/hooks'
import { useAllProposals } from 'state/governance/hooks'
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

  // for all versions of alpha gov, grab status and concat into one array
  const combinedStatuses = statusRes.reduce((accum: number[], res) => {
    const currentStatuses = res.map((x) => {
      if (x.result) {
        return x.result?.[0]
      }
      return undefined
    })
    return accum.concat(currentStatuses)
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
  const [activeProtocol] = useActiveProtocol()
  const isAaveGov = useIsAave()

  const govContractBravo = useGovernanceContractBravo()

  const migrationProposal = activeProtocol?.migrationProposalId

  const [statuses, setStatuses] = useState<number[] | undefined>()

  // get total amount
  const proposalCount = useGenericBravoProposalCount()
  const ids = useMemo(
    () => (proposalCount ? Array.from({ length: proposalCount }, (v, k) => [isAaveGov ? k : k + 1]) : [['']]),
    [isAaveGov, proposalCount]
  )
  const cutoffProposal = migrationProposal !== undefined ? migrationProposal : proposalCount
  const bravoOnlyIds = useMemo(() => ids.slice(cutoffProposal), [cutoffProposal, ids])

  const alphaStates = useGenericAlphaProposalStates()
  const bravoStates = useSingleContractMultipleData(
    proposalCount ? govContractBravo : undefined,
    isAaveGov ? 'getProposalState' : 'state',
    bravoOnlyIds,
    NEVER_RELOAD
  )

  useEffect(() => {
    if (!statuses && proposalCount && alphaStates) {
      const formattedBravo = bravoStates?.map((res) => {
        if (!res.loading && res.valid) {
          return res.result?.[0]
        }
      })
      if (formattedBravo[0] !== undefined) {
        setStatuses(alphaStates.concat(formattedBravo))
      }
    }
  }, [statuses, proposalCount, alphaStates, bravoStates])

  return statuses
}

export function useGenericOpenZeppelinStates(): number[] | undefined {
  // const ids = [
  //   ['110464326887736665124431317636588996956479993036702271717961959788835407961802'],
  //   ['3997076801006050911366480014433799584238981404972673116103611075834769525735'],
  // ]

  const [statuses, setStatuses] = useState<number[] | undefined>()
  const govContractOpenZeppelin = useGovernanceContractOpenZeppelin()

  const proposalData = useAllProposals()

  let ids: string[][] = []
  if (proposalData) {
    ids = Array.from(Object.keys(proposalData), (k) => [k])
  }
  const proposalCount = ids.length

  const openZeppelinStates = useSingleContractMultipleData(
    proposalCount ? govContractOpenZeppelin : undefined,
    'state',
    ids,
    NEVER_RELOAD
  )

  const formattedOpenZeppelin = openZeppelinStates?.map((res) => {
    if (!res.loading && res.valid) {
      return res.result?.[0]
    } else {
      return undefined
    }
  })

  useEffect(() => {
    if (!statuses && proposalCount) {
      setStatuses(formattedOpenZeppelin)
    }
  }, [statuses, proposalCount, formattedOpenZeppelin])

  return formattedOpenZeppelin
}
