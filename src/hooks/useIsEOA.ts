import { useState, useEffect } from 'react'
import { useActiveWeb3React } from '.'

// check if address is EOA or smart contract
export function useIsEOA(address: string | undefined): null | boolean {
  const [isEOA, setIsEOA] = useState<boolean | null>(null)

  const { library } = useActiveWeb3React()

  useEffect(() => {
    if (address) {
      library?.getCode(address).then((code) => {
        if (code) {
          setIsEOA(code === '0x')
        }
      })
    }
  }, [address, library])

  return isEOA
}
