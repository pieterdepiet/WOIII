import React from 'react'

function CityIcon() {
  return (
    <g>
      <path d='M 0 6 L 0 0 L 2 0 L 2 4 L 3 4 L 3 2 L 6 2 L 6 6 Z' fill='gray'/>
      <rect x='.5' y='.5' width='1' height='1' fill='white'/>
      <rect x='.5' y='2' width='1' height='1' fill='white'/>
      <rect x='.5' y='3.5' width='1' height='1' fill='white'/>
      <g fill='lightblue'>
        <rect x='3.5' y='2.25' width='1' height='1'/>
        <rect x='3.5' y='3.5' width='1' height='1'/>
        <rect x='4.7' y='2.25' width='1' height='1'/>
        <rect x='4.7' y='3.5' width='1' height='1'/>
      </g>
    </g>
  )
}

export default CityIcon
