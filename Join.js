import React from 'react'

function Join(props) {
  let ws = props.ws

  function joinNewGame() {
    ws.send('joinWaitRoom')
    // window.choisesLink.click()
  }
  function joinOldGame() {

  }
  function joinPrivateGame() {

  }
  function newPrivateGame() {

  }
  return (
    <div className='join'>
      <h1>Join game as {localStorage.user}</h1>

      <button onClick={joinNewGame}>
        <h3>
          <img alt='' src='/logo.svg' width='auto' height='30px'/>
          Join new game
          <img alt='' src='/logo.svg' width='auto' height='30px'/>
        </h3>
      </button>
      { localStorage.gameKey?
        <>
          <br/>
          <button onClick={joinOldGame}>
            <h3>
              <img alt='' src='/logo.svg' width='auto' height='30px'/>
              Join last played game
              <img alt='' src='/logo.svg' width='auto' height='30px'/>
            </h3>
          </button>
        </>
        :
        <></>
      }
      <div className='dropdown'>
        <p><input id='joinkey' placeholder='paste key'/></p>
        <br/>
        <button onClick={joinPrivateGame}>
          <h3>
            <img alt='' src='/logo.svg' width='auto' height='30px'/>
            Join with private key
            <img alt='' src='/logo.svg' width='auto' height='30px'/>
          </h3>
        </button>
      </div>

      <button onClick={newPrivateGame}>
        <h3>
          <img alt='' src='/logo.svg' width='auto' height='30px'/>
          Create game with private key
          <img alt='' src='/logo.svg' width='auto' height='30px'/>
        </h3>
      </button>
    </div>
  )
}

export default Join
