import React, {useState, useEffect} from 'react';
import {BrowserRouter, Route, Link, Redirect} from 'react-router-dom'
import './styles/App.css';
import Welcome from './routes/Welcome'
import Auth from './routes/Auth'
import Join from './routes/Join'
import ChoosePlayer from './routes/ChoosePlayer'
import OldGame from './routes/OldGame'
import Developer from './routes/Developer'

let webSocket;

function App() {
  const [ws, setWs] = useState(null)
  function send(type, msg) {
    console.log('send', type, msg);
    webSocket.send(JSON.stringify({type: type, data: msg}))
  }
  if (!webSocket) {
    webSocket = new WebSocket('ws://127.0.0.1:5000')
  }
  // webSocket.onopen = function () {
  //   console.log('ws open');
  //   if (localStorage.user && localStorage.userToken) {
  //     webSocket.send(JSON.stringify({action: 'authWithToken', props:{user: localStorage.user, token: localStorage.userToken}}))
  //     webSocket.onmessage = function (message) {
  //       let msg = JSON.parse(message.data)
  //       if (msg.action === 'err') {
  //         console.log('err authWithToken');
  //         localStorage.removeItem('user')
  //         localStorage.removeItem('userToken')
  //         setWs({user: 'anonymous', send: send})
  //       } else if (msg.action === 'autoUserToken') {
  //         console.log('autoUserToken');
  //         localStorage.setItem('user', msg.message.user)
  //         localStorage.setItem('userToken', msg.message.token)
  //         setWs({user: msg.message.user, send: send, userState: msg.message.state})
  //       }
  //     }
  //   } else {
  //     setWs({user: 'anonymous', send: send})
  //     window.homeLink.click()
  //   }
  // }
  webSocket.onopen = function () {
    setWs({
      send: send,
      msg: {}
    })
  }
  webSocket.onclose = webSocket.onerror = function () {
    setWs({
      disconnected:true,
      timeout:2
    })
    var openfunction = webSocket.onopen
    var timeArray = [2,5,]
    function nextTry(count) {
      setTimeout(function () {
        let webSocket = new WebSocket('ws://localhost:5000/')
        webSocket.onopen = function () {
          setWs({
            send:send,
            msg:{}
          })
          openfunction()
        }
        webSocket.onclose = webSocket.onerror = function () {
          setWs({
            disconnected:true,
            timeout:timeArray[count + 1]
          })
        }
        if (count < timeArray.length) {
          nextTry(count + 1)
        } else {
          window.location.reload(true)
        }
      }, timeArray[count]*1000);
    }
    nextTry(0)
  }
  webSocket.onmessage = function (e) {
    setWs({
      send: send,
      msg: JSON.parse(e.data).type?{
        type: JSON.parse(e.data).type,
        data: JSON.parse(e.data).data
      }:{
        type: 'plain',
        data: JSON.parse(e.data)
      }
    })
  }
  return (
    <div className="App">
      <BrowserRouter>
        {ws && ws.user !== 'anonymous'?
          <button onClick={() => {
            localStorage.removeItem('user')
            localStorage.removeItem('userToken')
            ws.send('logout')
            window.homeLink.click()
            setWs({user: 'anonymous', send: send})
          }} style={{position:'fixed', top:0, right: 0}}>Log out {ws.user}</button>
          :
          <></>
        }
        <Route path='/' exact><Welcome ws={ws}/></Route>
        <Route path='/auth'><Auth ws={ws}/></Route>
        <Route path='/join'><Join ws={ws}/></Route>
        <Route path='/chooseplayer'><ChoosePlayer ws={ws}/></Route>
        <Route path='/game'>Game</Route>
        <Route path='/oldgame'><OldGame/></Route>
        <Route path='/developer'><Developer/></Route>
        <Link to='/' id='homeLink'/>
        <Link to='/chooseplayer' id='choisesLink'/>
      </BrowserRouter>
      {ws===null||ws.disconnected===true?
        <div className="foreground">
          <div className="loadcircle"/>
          { ws && ws.disconnected===true?
            <h1 style={{color:'white'}}>Not connected<br/>Trying again in {ws.timeout} seconds...</h1>
            :
            <></>
          }
        </div>
        :
        <></>
      }
    </div>
  );
}

// {ws.userState?
//   <Redirect to={'/' + ws.userState}/>
//   :
//   <></>
// }

export default App;
