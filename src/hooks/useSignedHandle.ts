import { useState, useCallback, Dispatch, SetStateAction } from 'react'
import { useActiveWeb3React } from '.'

// sign handle based on data format from EIP-712
// based on twitter handle, return signature and message signing function
// return setter function to reset signature if needed
export function useSignedHandle(
  twitterHandle: string | undefined
): { sig: string | undefined; signMessage: () => void; setSig: Dispatch<SetStateAction<string | undefined>> } {
  // get signer and account to sign data with
  const { library, account } = useActiveWeb3React()

  // store and set signature
  const [sig, setSig] = useState<string | undefined>()

  const signMessage = useCallback(() => {
    if (!library && account) {
      return
    }
    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' }
    ]
    const domain = {
      name: 'Sybil Verifier',
      version: '1'
    }
    const Permit = [{ name: 'username', type: 'string' }]
    const message = { username: twitterHandle }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })

    /**
     * Need to use personal_sign as eth typed data is not
     * supported by most hardware wallets yet.
     */
    library
      ?.send('personal_sign', [account, data])
      .catch(error => {
        console.log(error)
      })
      .then(sig => {
        setSig(sig)
      })
  }, [account, library, twitterHandle])

  return { sig, signMessage, setSig }
}
