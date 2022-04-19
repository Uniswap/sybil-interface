import React from 'react'

export default function Youtube(props : {video: string}) {
  return <iframe width="560" height="315" src={props.video} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
}
