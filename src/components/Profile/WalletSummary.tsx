import React, { useMemo } from 'react'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { useActiveProtocol } from '../../state/governance/hooks'
import EmptyProfile from '../../assets/images/emptyprofile.png'
import { useToggleModal } from '../../state/application/hooks'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React, useTheme } from '../../hooks'
import WalletIcon from '../../assets/images/wallet-icon.png'
import { ApplicationModal } from '../../state/application/actions'
import { WhiteCard } from '../Card'
import { RowFixed, RowBetween } from '../Row'
import { TYPE, BlankInternalLink } from '../../theme'
import { ButtonBasic } from '../Button'
import { shortenAddress } from '../../utils'
import Loader from '../Loader'
import { useAllTransactions, isTransactionRecent } from '../../state/transactions/hooks'
import { newTransactionsFirst } from '../Web3Status'
import { LoadingFlag } from '../../theme/components'
import { useVerifiedHandle, useTwitterProfileData } from '../../state/social/hooks'
import LogoText from '../governance/LogoText'

const StyledWalletIcon = styled.img`
  width: 18px;
  height: 18px;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const RoundedProfileImage = styled.div`
  height: 48px;
  width: 48px;
  background: ${({ theme }) => theme.bg4};
  border-radius: 50%;
  margin-right: 16px;

  & > img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }
`

const ButtonText = styled(TYPE.white)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
`

export default function WalletSummary() {
  const theme = useTheme()

  // account details
  const { chainId, account } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()
  const { name: ensName } = useENS(account)

  // UI views
  const toggleWalletModal = useToggleModal(ApplicationModal.WALLET)

  // show pending txns if needed
  const allTransactions = useAllTransactions()
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])
  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const hasPendingTransactions = !!pending.length

  // get any verified handles for this user + timestamps they were created at
  const verifiedHandleEntry = useVerifiedHandle(account)
  const profileData = useTwitterProfileData(verifiedHandleEntry?.handle)

  return (
    <WhiteCard padding="10px">
      <RowBetween>
        <BlankInternalLink to={`/delegates/${activeProtocol?.id}/${account}`}>
          <RowFixed>
            {account && (
              <RoundedProfileImage>
                <img src={!profileData?.profileURL ? EmptyProfile : profileData?.profileURL} />
              </RoundedProfileImage>
            )}
            {!account ? (
              <TYPE.main>Your Address</TYPE.main>
            ) : (
              chainId &&
              (verifiedHandleEntry?.handle ? (
                <AutoColumn gap="4px">
                  <LogoText type="twitter">@{verifiedHandleEntry.handle}</LogoText>
                  <TYPE.main fontSize="12px">{ensName ?? shortenAddress(account)}</TYPE.main>
                </AutoColumn>
              ) : (
                <TYPE.main mr="10px" color={theme.text1}>
                  {ensName ?? shortenAddress(account)}
                </TYPE.main>
              ))
            )}
          </RowFixed>
        </BlankInternalLink>
        {!account ? (
          <ButtonBasic width="fit-content" onClick={toggleWalletModal}>
            <ButtonText>Connect wallet</ButtonText>
          </ButtonBasic>
        ) : (
          <RowFixed>
            {hasPendingTransactions && (
              <LoadingFlag style={{ marginRight: '10px' }} onClick={toggleWalletModal}>
                {pending?.length} pending <Loader style={{ marginLeft: '4px', height: '8px' }} />
              </LoadingFlag>
            )}
            <StyledWalletIcon src={WalletIcon} onClick={toggleWalletModal} />
          </RowFixed>
        )}
      </RowBetween>
    </WhiteCard>
  )
}
