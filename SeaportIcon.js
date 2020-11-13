import React from 'react'

function SeaportIcon() {
  return (
    <g transform='scale(1.5)'>
      <circle r='2' cx='0' cy='0' fill='white' stroke='red' strokeWidth='.4'/>
      <g transform='translate(0 0)'>
        <path d='M -.9 .5 A .9 .7 0 0 0 .9 .5 A .9 .7 0 0 1 0 1.2 L 0 -.2 L .8 -.2 L -.8 -.2 L 0 -.2 L 0 -1' fill='none' stroke='black' strokeWidth='.3' strokeLinecap='round'/>
      </g>
    </g>
  )
}

export default SeaportIcon
