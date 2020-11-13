import React from 'react'
import {Redirect, Link} from 'react-router-dom'

function Auth(props) {
  let ws = props.ws
  console.log(ws);
  // function messageHandler(message) {
  //   const action = JSON.parse(message.data).action
  //   const msg = JSON.parse(message.data).message
  //   console.log(message, action, msg);
  //   if (action==='err') {
  //     console.error('WebSocket error: ' + msg);
  //   } else if (action === 'userToken') {
  //     // console.log(msg.token);
  //     // localStorage.setItem('userToken', msg.token)
  //     // localStorage.setItem('user', msg.user)
  //     // window.redirectLink.click()
  //   } else {
  //     console.log('action:', action, 'message:', msg);
  //   }
  // }
  // if (ws.message) {
  //   messageHandler(ws.message)
  // }

  function signIn(argument) {
    let username = window.username.value
    let pw = window.pw.value
    ws.send('signin', {username: username, pw: pw})
    // window.redirectLink.click()
  }
  function signUp() {
    let username = window.newUsername.value
    let pw = window.newPw.value
    ws.send('signup', {username: username, pw: pw})
  }

  return (
    <div>
      <h2>Identify before continuing</h2>
      <h4>Sign in</h4>
      <div onKeyPress={e=>e.key==='Enter'?signIn():null}>
        <input id='username' placeholder='Username'/>
        <br/>
        <input id='pw' placeholder='Password' type='password'/>
      </div>
      <h4>Sign up</h4>
      <div onKeyPress={e => {
        if (e.key==='Enter') signUp()
      }}>
        <input id='newUsername' placeholder='New username'/>
        <br/>
        <input id='newPw' placeholder='New password' type='password'/>
      </div>
      { localStorage.user?
        <Redirect to='/join'/>
        :
        <></>
      }

      <Link id='redirectLink' to='/join'/>
    </div>
  )
}

export default Auth
