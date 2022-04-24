import styled from 'styled-components'
import { Image } from 'rebass/styled-components'
import React from 'react'

export default function FeaturedImage(props:{image:string}) {
return (
    <Image
  src={props.image}
  sx={{
    width: [ '100%', '100%' ],
    borderRadius: 8,
  }}
/>
)
}




