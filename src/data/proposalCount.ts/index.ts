import { Interface } from '@ethersproject/abi'
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { useGovernanceContractBravo, useIsAave, useIsUniswap } from 'hooks/useContract'
import { useActiveProtocol } from 'state/governance/hooks'
import { useMultipleContractSingleData, useSingleCallResult } from 'state/multicall/hooks'
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
  const isAave = useIsAave()
  const isUniswap = useIsUniswap()

  // for each alpha, get proposal count
  const alphaCountRes = useMultipleContractSingleData(
    activeProtocol ? activeProtocol?.governanceAlphaAddresses : [],
    new Interface(isAave ? GOVERNANCE_AAVE_ABI : GOVERNANCE_ABI),
    isAave ? 'getProposalsCount' : 'proposalCount'
  )

  // this early return fixes a particularly nasty bug. despite not being active, old governor addresses
  // remain in existence. on 3/15/2022, a transaction to an old uniswap governor address
  // (https://etherscan.io/tx/0xc8f2aed77efe5b8aed18432d1cbd52119aa82d16dcae927a49b2bcd5575c2105)
  // created a proposal that could never execute. however, because the proposal counts here
  // are later transformed into a linear array assumed to map 1:1 with "valid" proposals,
  // the additional proposal count was leading to incorrect status tags.
  // so, we hard-code to fix this. a more sustainable solution is to not rely on the (extremely)
  // fragile linear status assumption to identify proposal status, but this is a quick fix for now.
  if (isUniswap) return [5, 3]

  // sum up responses
  const parsedAlphaCounts = alphaCountRes.map((res) => {
    if (res.result && !res.loading && !res.error) {
      return parseInt(res.result[0].toString())
    }
    return undefined
  })

  const allLoaded = !parsedAlphaCounts.some((x) => x === undefined)
  if (!allLoaded) return undefined

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
