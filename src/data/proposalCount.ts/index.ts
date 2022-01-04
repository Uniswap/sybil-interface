import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { useIsAave, useGovernanceContractBravo } from 'hooks/useContract'
import { useMultipleContractSingleData, useSingleCallResult } from 'state/multicall/hooks'
import { useActiveProtocol } from 'state/governance/hooks'
import { Interface } from '@ethersproject/abi'
import { notEmpty } from 'utils'
import GOVERNANCE_AAVE_ABI from '../../constants/abis/aave-governance.json'
/**
 * Various versions of proposal count fetching.
 * Compound Alpha and forks like Uniswap can sum proposal counts on
 * versions of Alpha.
 *
 * Other protocols with Bravo need custom counting - aka Compound Bravo
 *
 */

// get count of all proposals made - need to check different versions of alpha
export function useGenericAlphaProposalCounts(): number[] | undefined {
  const [activeProtocol] = useActiveProtocol()

  // custom method name on Aave
  const methodName = useIsAave() ? 'getProposalsCount' : 'proposalCount'

  // for each alpha, get proposal count
  const alphaCountRes = useMultipleContractSingleData(
    activeProtocol ? activeProtocol?.governanceAlphaAddresses : [],
    new Interface(useIsAave() ? GOVERNANCE_AAVE_ABI : GOVERNANCE_ABI),
    methodName
  )

  // sum up responses
  const parsedAlphaCounts = alphaCountRes.map((res) => {
    if (res.result && !res.loading && !res.error) {
      return parseFloat(res.result[0])
    }
    return undefined
  })

  const allLoaded = !parsedAlphaCounts.some((x) => x === undefined)

  if (!allLoaded) {
    return undefined
  }

  return parsedAlphaCounts.filter(notEmpty)
}

// get count of all proposals made
export function useGenericBravoProposalCount(): number | undefined {
  const bravo = useGovernanceContractBravo()
  const res = useSingleCallResult(bravo, useIsAave() ? 'getProposalsCount' : 'proposalCount')

  if (res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return undefined
}
