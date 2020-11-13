import React from 'react'
import Hex from './Hexagon'

function ExpandedHex(p) {
  var props = p.p
  var owners = {
    undefined: '',
    2: 'owner: netherlands',
    3: 'owner: england,',
    5: 'owner: russia,'
  }
  var style = {
    width: 400,
    height: 400,
    backgroundColor: 'rgba(225, 225, 0, 0.9)',

  }
  console.log(props);
  return (
    <div id='expandedHex' style={style}>
      biome: {props.biome}
      <br/>
      {owners[props.player]}
      <br/>
      <svg width='100' height='90' viewBox='0 1 95 95'>
        <Hex
          player={props.player}
          x='0' y='0'
          scale='5'
          biome={props.biome}
        />
      </svg>

    </div>
  )
}

export default ExpandedHex
