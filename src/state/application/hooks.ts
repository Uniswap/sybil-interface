import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import { AppDispatch, AppState } from '../index'
import { addPopup, ApplicationModal, PopupContent, removePopup, setOpenModal, setModalDelegatee } from './actions'
import { useActiveProtocol } from '../governance/hooks'
import {
  UNISWAP_GOVERNANCE,
  COMPOUND_GOVERNANCE,
  AAVE_GOVERNANCE,
  POOL_TOGETHER_GOVERNANCE,
  RADICLE_GOVERNANCE,
  NOUNS_GOVERNANCE,
  ENS_GOVERNANCE,
  CANDLE_GOVERNANCE,
} from '../governance/reducer'
import {
  uniswapClient,
  compoundClient,
  aaveClient,
  poolClient,
  radicleClient,
  nounsClient,
  ensClient,
  candleClient,
} from '../../apollo/client'

export function useBlockNumber(): number | undefined {
  const { chainId } = useActiveWeb3React()

  return useSelector((state: AppState) => state.application.blockNumber[chainId ?? -1])
}

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useSelector((state: AppState) => state.application.openModal)
  return openModal === modal
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(open ? null : modal)), [dispatch, modal, open])
}

export function useModalDelegatee(): [string | null | undefined, (delegatee: string | null | undefined) => void] {
  const delegatee = useSelector((state: AppState) => state.application.modalDelegatee)
  const dispatch = useDispatch<AppDispatch>()
  return [
    delegatee,
    useCallback((delegatee: string | null | undefined) => dispatch(setModalDelegatee({ delegatee })), [dispatch]),
  ]
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(modal)), [dispatch, modal])
}

export function useCloseModals(): () => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(setOpenModal(null)), [dispatch])
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

// returns a function that allows adding a popup
export function useAddPopup(): (content: PopupContent, key?: string) => void {
  const dispatch = useDispatch()

  return useCallback(
    (content: PopupContent, key?: string) => {
      dispatch(addPopup({ content, key }))
    },
    [dispatch]
  )
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useDispatch()
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }))
    },
    [dispatch]
  )
}

// get the list of active popups
export function useActivePopups(): AppState['application']['popupList'] {
  const list = useSelector((state: AppState) => state.application.popupList)
  return useMemo(() => list.filter((item) => item.show), [list])
}

export function useSubgraphClient() {
  const [activeProtocol] = useActiveProtocol()

  if (activeProtocol?.id === UNISWAP_GOVERNANCE.id) {
    return uniswapClient
  }

  if (activeProtocol?.id === COMPOUND_GOVERNANCE.id) {
    return compoundClient
  }

  if (activeProtocol?.id === AAVE_GOVERNANCE.id) {
    return aaveClient
  }

  if (activeProtocol?.id === POOL_TOGETHER_GOVERNANCE.id) {
    return poolClient
  }

  if (activeProtocol?.id === RADICLE_GOVERNANCE.id) {
    return radicleClient
  }

  if (activeProtocol?.id === NOUNS_GOVERNANCE.id) {
    return nounsClient
  }

  if (activeProtocol?.id === ENS_GOVERNANCE.id) {
    return ensClient
  }

  if (activeProtocol?.id === CANDLE_GOVERNANCE.id) {
    return candleClient
  }

  return undefined
}
