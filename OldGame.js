import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import Hex from '../gameComponents/Hexagon'
import '../styles/game.css'
// import {map} from '../jsonFiles/europe.js'
import ExpandedHex from '../gameComponents/ExpandedHex'

function OldGame() {
  const [ hexes, setHexes ] = useState('')
  const [ expandedMenu, setExpandedMenu ] = useState({menu: null})
  document.title = 'Game'
  const url = require('url');





  function requestMap(key) {
    return new Promise(function(resolve, reject) {
      let request = new XMLHttpRequest()
      request.onreadystatechange = function () {

        if (this.readyState === 4 && this.status === 200) {

          resolve(JSON.parse(this.response))



        }
      }



      request.open('GET', 'http://localhost:5000/getGame?key=' + key)

      request.send()
    });
  }

  // function createMap() {
  //
  //   return new Promise(function(resolve, reject) {
  //     let map = []
  //     for (var x = 0; x < Number(storage.width); x++) {
  //       map[x] = []
  //       for (var y = 0; y < Number(storage.height); y++) {
  //         map[x][y] = {biome:'grass', airport:true}
  //       }
  //     }
  //     gSet('map', map)
  //     resolve()
  //   });
  // }







  function renderMap(map) {


    let hexes = []

    var scale;
    if (window.innerWidth / map.length / 15 > window.innerHeight / map[0].length / 15) {
      scale = window.innerWidth / map.length / 15
    } else {
      scale = window.innerHeight / map[0].length / 17
    }



    for (var x = 0; x < map.length; x++) {
      for (var y = 0; y < map[x].length; y++) {
        let hex = map[x][y]

        var xPos, yPos;
        if (x / 2 === Math.floor(x / 2)) {
          yPos = (y * 17.1 - .5) * scale
        } else {
          yPos = (y * 17.1 - 9) * scale
        }
        xPos = (x * 15.1 - 3) * scale
        hexes.push(<Hex biome={hex.biome}
          player={hex.player}
          key={xPos + '.' + yPos}
          x={xPos}
          y={yPos}
          scale={scale}
          airport={hex.airport}
          seaport={hex.seaport}
          seaportPos={hex.seaportPos}
          expandHex={(props) => {

            setExpandedMenu({menu: 'hex', props: props})
          }
        }/>)
      }

      // gGet('map')[i]
    }
    for (var i = 0; i < document.getElementsByClassName('map').length; i++) {
      document.getElementsByClassName('map')[i].style.width = (map.length * 15.1 * scale - 4) + 'px'
      document.getElementsByClassName('map')[i].style.height = (map[0].length * 17.1 * scale - 22) + 'px'
    }


    setHexes(hexes)
  }
  useEffect(() => {
    if (hexes === '') {
      if (url.parse(window.location.href,true).query.newGame === 'true') {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            localStorage.setItem('gameKey', this.response)
            requestMap(this.response).then((data) => {
              renderMap(data.europe)
            })
          }
        }
        request.open('GET', 'http://localhost:5000/newGameKey')
        request.send()


      } else {

        requestMap(localStorage.getItem('gameKey')).then((data) => {
          renderMap(data.europe)
        })
      }
    }
  })
  window.onkeydown = (e) => {

    var i;
    if (e.key === 'a') {
      for (i = 0; i < document.getElementsByClassName('svgContainer').length; i++) {
        document.getElementsByClassName('svgContainer')[i].className = document.getElementsByClassName('svgContainer')[i].className.replace(' activeMap', ' inactiveMap')
      }
      document.getElementsByClassName('svgContainer')[0].className = document.getElementsByClassName('svgContainer')[0].className.replace(' inactiveMap', ' activeMap')
    } else if (e.key === 'd') {
      for (i = 0; i < document.getElementsByClassName('svgContainer').length; i++) {
        document.getElementsByClassName('svgContainer')[i].className = document.getElementsByClassName('svgContainer')[i].className.replace(' activeMap', ' inactiveMap')
      }
      document.getElementsByClassName('svgContainer')[1].className = document.getElementsByClassName('svgContainer')[0].className.replace(' inactiveMap', ' activeMap')
    } else if (e.keyCode === 27) {
      setExpandedMenu({menu: null})
    }
  }







  return (
    <div className='Game'>


      <div className='absolute'>
        <div style={{position: 'relative', whiteSpace: 'nowrap'}}>
          <div className='svgContainer inactiveMap'>
              <svg className='map'>

              </svg>
          </div>
          <div className='svgContainer activeMap'>
            <div>
              <svg className='map'>
                {
                  hexes
                }
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div id='expandedMenu' style={{position: 'absolute', top:window.innerHeight / 3, left: window.innerWidth / 3}}>
        { expandedMenu.menu === 'hex'?
          <ExpandedHex p={expandedMenu.props}/>
          :
          <></>
        }
      </div>
      <div className='backButton' style={{position:'absolute', top:0, left:0}}>
        <Link to='/'>
          <svg width='45' height='45'>
            <g transform='translate(2.5 2.5)'>
              <circle cx='20' cy='20' r='20' fill='blue' opacity='.5'/>
              <g transform='translate(5 10)'>
                <path d='M 15 0 L 0 10 L 15 20 M 0 10 L 30 10' strokeLinecap='round' strokeWidth='6px' stroke='white' fill='none'/>
              </g>
              <circle cx='20' cy='20' r='20' fill='none' stroke='black' strokeWidth='4px'/>
            </g>
          </svg>
        </Link>
      </div>
      <div >

      </div>
    </div>
  )
}

export default OldGame
