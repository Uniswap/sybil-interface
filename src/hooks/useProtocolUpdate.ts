import { SUPPORTED_PROTOCOLS } from './../state/governance/reducer'
import { useDispatch } from 'react-redux'
import { useActiveProtocol } from '../state/governance/hooks'
import { AppDispatch } from '../state'
import { useEffect } from 'react'
/**
 * If valid id, update global state with new protocol
 * @param protocolID protocol id for supported protocol
 */
export function useProtocolUpdate(protocolID: string | undefined) {
  const dispatch = useDispatch<AppDispatch>()
  const [, setActiveProtocol] = useActiveProtocol()
  useEffect(() => {
    if (protocolID && Object.keys(SUPPORTED_PROTOCOLS).includes(protocolID)) {
      setActiveProtocol(SUPPORTED_PROTOCOLS[protocolID])
    }
  }, [dispatch, protocolID, setActiveProtocol])
}
