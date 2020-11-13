import React, {useState} from 'react'
import {Redirect} from 'react-router-dom'

function ChoosePlayer(props) {
  let ws = props.ws
  function jsxChoises(choises) {
    let players = ['', 'russia', 'germany', 'gb', 'russian navy', 'america', 'southern europe']
    let choisesJsx = []
    for (var i = 0; i < choises.length; i++) {
      let j = i
      choisesJsx.push(<li key={j}><button onClick={() => {
        choose(choises[j])
      }}>{players[choises[j]]}</button></li>)
    }
    return choisesJsx
  }
  // eslint-disable-next-line
  const [choises, setChoises] = useState(null)

  function choose(player) {
    ws.send('chooseplayer', player)
  }
  if (ws.msgAction === 'choises' && choises === null) {
    setChoises(jsxChoises(ws.msgData))
  }
  console.log(ws);
  return (
    <>
      <h2>Choose player</h2>
      <ul>
        { ws.msgAction === 'choises' && ws.msgData.length === 1?
          <Redirect to='/game'/>
          :
          <></>
        }
        {
          choises
        }
      </ul>
    </>
  )
}

export default ChoosePlayer
