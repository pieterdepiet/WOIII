import React from 'react'

import AirportIcon from './AirportIcon'
import CityIcon from './CityIcon'
import MountainIcon from './MountainIcon'
import SeaportIcon from './SeaportIcon'
import FieldIcon from './FieldIcon'


function Hex(props) {
  function calculateD() {
    var d = 'M 1 0'

    d += ' L '
    d += Math.cos(rad(120)) + 1
    d += ' '
    d += Math.sin(rad(120))
    d += ' L '
    d += Math.cos(rad(120)) + 1
    d += ' '
    d += Math.sin(rad(120)) + 1
    d += ' L '
    d += '1 '
    d += 1 + Math.sin(rad(120)) * 2
    d += ' L '
    d += 1 + Math.cos(rad(240))
    d += ' '
    d += 1 + Math.sin(rad(240))
    d += ' L '
    d += 1 + Math.cos(rad(240))
    d += ' '
    d += Math.sin(rad(240))
    d += ' Z'
    return d
  }
  function rad(number) {
    return (number - 90) * Math.PI / 180
  }
  var transform = ''
  var scale = 1
  var fills = {
    2: '#00fc00',
    3: 'lightblue',
    5: '#f4745a'
  }
  var fill;
  if (props.biome === 's') {
    fill = 'blue'
  } else {
    fill = fills[props.player]
  }
  if (props.scale) {

    transform = 'scale(' + props.scale + ')'
    scale = props.scale
  }

  var style = 'translate(' + props.x + ' ' + props.y + ')'

  var portPos = null;

  if (props.biome === 's' && props.seaport) {

    switch (props.seaportPos) {
      case 'ne':
        portPos = 'translate(13.5 4.5)'
        break;
      case 'e':
        portPos = 'translate(16 10)'
        break;
      case 'se':
        portPos = 'translate(13.5 15.5)'
        break;
      case 'sw':
        portPos = 'translate(6.5 15.5)'
        break;
      case 'w':
        portPos = 'translate(4 10)'
        break;
      case 'nw':
        portPos = 'translate(6.5 4.5)'
        break;
      default:

    }
  }



  return (
    <g width={scale * 20} height={scale * 20} transform={style} onClick={(e) => {
      props.expandHex(props);
    }}>

        <g transform={transform}>
          <g transform='rotate(90 10 10),scale(10)'>
            <path d={calculateD()} fill={fill} stroke='black' strokeWidth='.02' strokeLinecap='round'/>
          </g>
          <g transform='translate(12 1), scale(.5)'>
            { props.biome === 'c'?
              <CityIcon/>
              :
              <>
                { props.biome === 'm'?
                  <MountainIcon/>
                  :
                  <>
                    { props.biome === 'f'?
                      <FieldIcon/>
                      :
                      <></>
                    }
                  </>
                }
              </>
            }
          </g>
          <g transform='translate(3 1)'>
            { props.airport?
              <AirportIcon/>
              :
              <></>
            }
          </g>
          { portPos?
            <g transform={portPos}>
              <SeaportIcon/>
            </g>
            :
            <></>
          }
        </g>

    </g>
  )
}

export default Hex
