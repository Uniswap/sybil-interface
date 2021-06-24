import { UNISWAP_GOVERNANCE } from './../state/governance/reducer'
import { useGovernanceContract } from 'hooks/useContract'
import { ProposalData, useActiveProtocol } from '../state/governance/hooks'
import { UNI_GOVERNANCE_ADDRESS_BRAVO } from '../state/governance/reducer'
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { useState, useMemo, useEffect } from 'react'
import { useActiveWeb3React } from '.'
import { notEmpty } from 'utils'
import { ethers, utils } from 'ethers'
import { useMultipleContractMultipleData } from '../state/multicall/hooks'
import { ProposalStatus } from 'components/governance/styled'

const GovernanceInterface = new ethers.utils.Interface(GOVERNANCE_ABI)

/**
 * Need proposal events to get description data emitted from
 * new proposal event.
 */
export function useDataFromEventLogs() {
  const { library, chainId } = useActiveWeb3React()
  const [formattedEvents, setFormattedEvents] = useState<
    { description: string; details: { target: string; functionSig: string; callData: string }[] }[]
  >()
  const bravo = useGovernanceContract()
  const govContracts = useMemo(() => {
    return [bravo].filter(notEmpty)
  }, [bravo])

  // create filter for these specific events
  const filters = useMemo(
    () =>
      govContracts
        ? govContracts.map(contract => ({
            ...contract.filters.ProposalCreated(),
            fromBlock: 10861678,
            toBlock: 'latest'
          }))
        : undefined,
    [govContracts]
  )

  useEffect(() => {
    if (!filters || !library) return

    if (!formattedEvents) {
      const filterRequests = filters.map(filter => library.getLogs(filter))
      Promise.all(filterRequests)
        .then(events => events.flat())
        .then(governanceContractsProposalEvents => {
          //   if (stale) return
          const formattedEventData = governanceContractsProposalEvents.map(event => {
            const eventParsed = GovernanceInterface.parseLog(event).args
            return {
              description: eventParsed.description,
              details: eventParsed.targets.map((target: string, i: number) => {
                const signature = eventParsed.signatures[i]
                const [name, types] = signature.substr(0, signature.length - 1).split('(')
                const calldata = eventParsed.calldatas[i]
                const decoded = utils.defaultAbiCoder.decode(types.split(','), calldata)
                return {
                  target,
                  functionSig: name,
                  callData: decoded.join(', ')
                }
              })
            }
          })
          setFormattedEvents(formattedEventData)
        })
        .catch(error => {
          console.error('Failed to fetch proposals', error)
        })
    }

    return
  }, [filters, library, formattedEvents, chainId])

  return formattedEvents
}

export const UNISWAP_GRANTS_START_BLOCK = 11473815
export const EDUCATION_FUND_1_START_BLOCK = 12620175

// get data for all past and active proposals
export function useTempProposalData(): ProposalData[] {
  const proposalIndexes = [[[1]]]

  const [activeProtocol] = useActiveProtocol()

  const addresses = [UNI_GOVERNANCE_ADDRESS_BRAVO]

  // get metadata from past events
  const formattedEvents = useDataFromEventLogs()

  // get all proposal entities
  const allProposalsCallData = useMultipleContractMultipleData(
    addresses,
    GovernanceInterface,
    'proposals',
    proposalIndexes
  ).flat()

  // get all proposal states
  const allProposalStatesCallData = useMultipleContractMultipleData(
    addresses,
    GovernanceInterface,
    'state',
    proposalIndexes
  ).flat()

  if (
    !allProposalsCallData?.every(p => Boolean(p.result)) ||
    !allProposalStatesCallData?.every(p => Boolean(p.result)) ||
    !formattedEvents?.every(p => Boolean(p))
  ) {
    return []
  }

  const omittedProposalStartBlocks = [EDUCATION_FUND_1_START_BLOCK]

  if (activeProtocol !== UNISWAP_GOVERNANCE) {
    return []
  }

  return allProposalsCallData
    .map((proposal, i) => {
      const description = formattedEvents[i]?.description ?? ''
      const startBlock = parseInt(proposal?.result?.startBlock?.toString())
      return {
        id: '6',
        title: description?.split(/# |\n/g)[1] ?? 'Untitled',
        description: description ?? 'No description.',
        proposer: proposal?.result?.proposer,
        status: allProposalStatesCallData[i]?.result?.[0] ?? ProposalStatus.Undetermined,
        forCount: parseFloat(ethers.utils.formatUnits(proposal?.result?.forVotes.toString(), 18)),
        againstCount: parseFloat(ethers.utils.formatUnits(proposal?.result?.againstVotes.toString(), 18)),
        startBlock,
        endBlock: parseInt(proposal?.result?.endBlock?.toString()),
        details: formattedEvents[i].details,
        forVotes: [],
        againstVotes: []
      }
    })
    .filter(proposal => !omittedProposalStartBlocks.includes(proposal.startBlock))
}
