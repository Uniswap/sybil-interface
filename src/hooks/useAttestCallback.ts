import { addTransaction } from './../state/transactions/actions'
import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '.'
import { useSybilContract } from './useContract'
import { calculateGasMargin } from '../utils'

export function useAttestCallback(
  tweetId: string | undefined,
  handle: string | null | undefined
): {
  attestCallback: () => Promise<string>
} {
  const { library, chainId } = useActiveWeb3React()

  // get sybil contract
  const sybilContract = useSybilContract()

  const attestCallback = async function() {
    if (!library || !chainId || !sybilContract) return

    const args = [handle, tweetId]

    return sybilContract.estimateGas['announceHandle'](...args).then(estimatedGasLimit => {
      return sybilContract
        .announceHandle(...args, { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction(response)
          return response.hash
        })
    })
  }

  return { attestCallback }
}
