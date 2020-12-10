import React from 'react'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'
import styled from 'styled-components'
import { RowFixed } from '../Row'

const Logo = styled.img`
  height: 24px;
  width: 24px;
  margin-left: 4px;
`

export default function LogoText({ children, type }: { children?: React.ReactNode; type: string | undefined }) {
  if (!type) return <RowFixed>{children}</RowFixed>

  switch (type) {
    case 'twitter':
      return (
        <RowFixed>
          {children} <Logo src={TwitterIcon} />
        </RowFixed>
      )
    default:
      return <RowFixed>{children}</RowFixed>
  }
}
