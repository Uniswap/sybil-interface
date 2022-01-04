import { Contract } from '@ethersproject/contracts'
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { abi as UNI_ABI } from '@uniswap/governance/build/Uni.json'
import { ChainId, WETH } from '@uniswap/sdk'
import { useMemo } from 'react'
import GOVERNANCE_AAVE_ABI from '../constants/abis/aave-governance.json'
import AAVE_ABI from '../constants/abis/aave-token.json'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS,
} from '../constants/abis/argent-wallet-detector'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import WETH_ABI from '../constants/abis/weth.json'
import AUTONOMOUS_ABI from '../constants/abis/autonomous.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'
import { useActiveProtocol, useGovernanceToken } from '../state/governance/hooks'
import { AAVE_GOVERNANCE } from '../state/governance/reducer'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GÖRLI:
      case ChainId.ROPSTEN:
      case ChainId.RINKEBY:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useGovernanceContract(): Contract | null {
  const [activeProtocol] = useActiveProtocol()

  const latestAlphaGovernanceAddress =
    activeProtocol?.governanceAlphaAddresses[activeProtocol?.governanceAlphaAddresses.length - 1]

  const bravoAddress = activeProtocol?.governanceAddressBravo

  return useContract(
    activeProtocol ? bravoAddress ?? latestAlphaGovernanceAddress : undefined,
    activeProtocol?.id === AAVE_GOVERNANCE.id ? GOVERNANCE_AAVE_ABI : GOVERNANCE_ABI,
    true
  )
}

export function useAllGovernanceAlphaContracts(): Contract[] | null {
  const { library, account, chainId } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  return useMemo(() => {
    if (!library || !chainId || !activeProtocol) {
      return null
    }
    try {
      return activeProtocol.governanceAlphaAddresses
        .filter((addressMap) => Boolean(addressMap[chainId]))
        .map((addressMap) => getContract(addressMap[chainId], GOVERNANCE_ABI, library, account ? account : undefined))
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [library, chainId, activeProtocol, account])
}

export function useGovernanceContractBravo(): Contract | null {
  const [activeProtocol] = useActiveProtocol()

  return useContract(
    activeProtocol ? activeProtocol.governanceAddressBravo : undefined,
    activeProtocol?.id === AAVE_GOVERNANCE.id ? GOVERNANCE_AAVE_ABI : GOVERNANCE_ABI,
    true
  )
}

export function useIsAave(): boolean {
  const [activeProtocol] = useActiveProtocol()
  return activeProtocol?.id === AAVE_GOVERNANCE.id
}

export function useGovTokenContract(): Contract | null {
  const govToken = useGovernanceToken()
  const isAave = useIsAave()
  return useContract(govToken ? govToken.address : undefined, isAave ? AAVE_ABI : UNI_ABI, true)
}

export function useAutonomousContract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress ?? undefined, AUTONOMOUS_ABI, true)
}
