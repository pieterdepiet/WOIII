if (!("path" in Event.prototype)) {
  Object.defineProperty(Event.prototype, "path", {
    get: function() {
      var path = [];
      var currentElem = this.target;
      while (currentElem) {
        path.push(currentElem);
        currentElem = currentElem.parentElement;
      }
      if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
        path.push(document);
      if (path.indexOf(window) === -1)
        path.push(window);
      return path;
    }
  });
}
function signIn() {
  var un = window.event.target.elements.un.value
  var pw = window.event.target.elements.pw.value
  fetch('/signin', {
    method: 'POST',
    body: JSON.stringify({
      un:un, pw:pw
    })
  }).then(function (stream) {
    return stream.json()
  }).then(function (json) {
    if (json.succes===true) {
      spananja.updateLocal('user',{un:un, token: json.newtoken})
      spananja.updateState({user:{un:un, token:json.newtoken}})
      spananja.open('/join')
    } else {
      spananja.deleteLocal('user')
      spananja.deleteState('user')
    }
  })
}
function signUp() {
  var un = document.getElementsByName('un')[0]
  var pw = document.getElementsByName('pw')[0]
  if (un.value.search(/[\{\}\[\]\"\'\,\\]/) !== -1) {
    return showmodal('Don\'t use one of <kbd>{}[]\"\'\\\,</kbd>')
  } else if (pw.value.search(/[\{\}\[\]\"\'\,\\]/) !== -1) {
    return showmodal('Don\'t use one of <kbd>{}[]\"\'\\\,</kbd>')
  } else if (pw.value.match(/[a-z]/g) && pw.value.length < pw.value.match(/[a-z]/g).length + 1) {
    return showmodal('Use at least two numbers, capital letters or special tokens')
  } else if (/^[A-Z]{1,}([0-9]{0,}[A-Z]{0,}){0,}(\.([A-Z0-9]){1,}){0,}@[A-Z]{1,}(\.([A-Z]{1,}[0-9]{0,}){1,}){0,}\.[A-Z]{1,}$/i.test(un.value) === false) {
    return showmodal('Please enter a valid email')
  }
  fetch('/signup', {
    method: 'POST',
    body: JSON.stringify({un:un.value, pw:pw.value})
  }).then(function (stream) {
    return stream.json()
  }).then(function (json) {
    if (json.succes === true) {
      spananja.updateLocal('user',{un:un.value, token: json.newtoken})
      spananja.updateState({user:{un:un.value, token: json.newtoken}})
      spananja.open('/join')
    } else {
      alert('User exists')
    }
  })
}
function signOut() {
  spananja.deleteLocal('user')
  spananja.deleteState('user')
}
function checkMinus(e = window.event) {
  if (e.target.value.length > 3 && e.target.value.charAt(3) !== '-') {
    e.target.value = e.target.value.substr(0,3) + '-' + e.target.value.substr(3)
  }
  if (e.target.value.length > 7 && e.target.value.charAt(7) !== '-') {
    e.target.value = e.target.value.substr(0,7) + '-' + e.target.value.substr(7)
  }
  if (e.target.value.length > 11) {
    e.target.value = e.target.value.substr(0, 11)
  }
}
function createPublicGame(e) {
  e.preventDefault()
  var gamename = e.target.elements.gamename
  var gamedescription = e.target.elements.gamedescription
  fetch('/newpublicgame', {
    method: 'POST',
    headers: {
      auth: JSON.stringify({un:spananja.state.user.un, token:spananja.state.user.token})
    },
    body: JSON.stringify({
      gamename:gamename.value,
      gamedescription:gamedescription.value
    })
  }).then(function (stream) {
    if (stream.headers.has('newtoken')) {
      spananja.updateLocal('user', {token:stream.headers.get('newtoken')})
      spananja.updateState({user:{token:stream.headers.get('newtoken')}})
    }
    return stream.text()
  }).then(function (gametoken) {
    spananja.open('/chooseplayer?game=' + gametoken)
  })
}
function showmodal(text, timeout) {
  var modal = document.getElementById('modal')
  modal.innerHTML = text
  modal.parentElement.onclick = hidemodal
  modal.parentElement.className = 'activemodalcontainer'
  if (typeof timeout === 'number') {
    setTimeout(hidemodal, timeout);
  }
}
function hidemodal() {
  var modal = document.getElementById('modal')
  modal.innerText = ' '
  modal.parentElement.className = 'modalcontainer'
}
spananja.onwindowopen = function () {
  if (spananja.locSt('user')) {
    spananja.updateState({user:'authenticating'})
    fetch('/autoauth', {
      method: 'POST',
      body: JSON.stringify({
        un:spananja.locSt('user').un,token:spananja.locSt('user').token
      })
    }).then(function (stream) {
      return stream.json()
    }).then(function (json) {
      if (json.succes) {
        spananja.updateLocal('user',{token:json.newtoken})
        spananja.updateState({user:{un:spananja.locSt('user').un,token:json.newtoken}})
      } else {
        spananja.deleteLocal('user')
        spananja.deleteState('user')
      }
    })
  } else {
    spananja.deleteLocal('user')
    spananja.deleteState('user')
  }
}
spananja.onstatechange = function (updates) {
  if (updates.hasOwnProperty('user') && updates.user.hasOwnProperty('un')) {
    var authbar = document.getElementById('auth')
    authbar.innerHTML = ' '
    var dropdowncontainer = document.createElement('DIV')
    dropdowncontainer.className = 'dropdowncontainer'
    var signoutbutton = document.createElement('BUTTON')
    signoutbutton.innerText = 'Sign out'
    signoutbutton.onclick = signOut
    var welcometext = document.createTextNode('Welcome, ' + spananja.state.user.un)
    dropdowncontainer.appendChild(welcometext)
    dropdowncontainer.appendChild(signoutbutton)
    var dropdownmenu = document.createElement('DIV')
    dropdownmenu.className = 'dropdownmenu'
    var accountbutton = document.createElement('A')
    accountbutton.href = '/account'
    accountbutton.innerText = 'My account'
    dropdownmenu.appendChild(accountbutton)
    dropdowncontainer.appendChild(dropdownmenu)
    authbar.appendChild(dropdowncontainer)
  } else if ((Array.isArray(updates)||typeof updates === 'string') && updates.indexOf('user')>=0) {
    var authorizedroutes = ['/join', '/chooseplayer']
    if (authorizedroutes.includes(spananja.url.pathname)) {
      spananja.open('/')
    }
    var authbar = document.getElementById('auth')
    authbar.innerHTML = ' '
  }
}
spananja.onroute['/'] = function () {
  document.getElementById('play').href = spananja.state&&spananja.state.user?'/join':'/auth'
}
spananja.onroute['/join'] = function () {
  spananja.tabs.route['/join'].container[0].ontab[0] = function () {
    document.getElementById('gameslist').innerHTML = ' '
    for (var game in games) {
      if (games.hasOwnProperty(game)) {
        var newgameli = document.createElement("LI")
        var newgamelink = document.createElement("A")
        newgamelink.href = '/chooseplayer?game=' + game
        newgamelink.innerText = games[game].name
        newgameli.appendChild(newgamelink)
        newgameli.appendChild(document.createElement("BR"))
        var newgamedesc = document.createElement("TEXTAREA")
        newgamedesc.rows = 4
        newgamedesc.cols = 40
        newgamedesc.disabled = true;
        newgamedesc.innerText = games[game].desc
        newgameli.appendChild(newgamedesc)
        document.getElementById('gameslist').appendChild(newgameli)
      }
    }
  }
  spananja.tabs.route['/join'].container[0].ontab[2] = function () {
    document.getElementsByName('gamename')[0].value = 'Game ' + new Date().getHours() + ':' + new Date().getMinutes()
    document.getElementsByName('gamedescription')[0].value = 'Game created by ' + spananja.state.user.un + ' at ' + ['sunday ', 'monday ', 'tuesday ', 'wednesday ', 'thursday ', 'friday ', 'saturday '][new Date().getDay()] + (new Date().getMonth() + 1) + '/' + (new Date().getDate()) + ', ' + new Date().getHours() + ':' + new Date().getMinutes()
  }
  var ws = ws?ws:new WebSocket('ws://localhost:3000')
  var types = {}
  var games;
  function send(type, data) {
    ws.send(JSON.stringify({type:type, data:data}))
  }
  ws.onopen = function () {
    if (spananja.state.user) {
      send('login', {un:spananja.state.user.un, token:spananja.state.user.token})
    }
  }
  ws.onmessage = function (e) {
    var type = JSON.parse(e.data).type
    var data = JSON.parse(e.data).data
    if (typeof types[type] === 'function') {
      types[type](data)
    }
  }
  types.newtoken = function (data) {
    spananja.updateLocal('user',{token: data})
    spananja.updateState({user:{token: data}}, false)
    send('updatingpublicgames', '')
  }
  types.waitroom = function (data) {
    games = data;
    if (document.getElementById('gameslist')) {
      spananja.tabs.route['/join'].container[0].ontab[0]()
    }
  }
  types.autherr = signOut
  spananja.tabs.route['/join'].container[0].ontab[4] = function () {
    if (!spananja.state.user) {
      spananja.open('/')
    } else if (spananja.state && spananja.state.user !== 'authenticating') {
      fetch('/mygames', {
        method: 'POST',
        body: JSON.stringify({un:spananja.state.user.un, token:spananja.state.user.token})
      }).then(function (stream) {
        if (stream.headers.has('newtoken')) {
          spananja.updateLocal('user',{token: stream.headers.get('newtoken')})
          spananja.updateState({user:{token: stream.headers.get('newtoken')}}, false)
        } else {
          signOut()
        }
        return stream.json()
      }).then(function (json) {
        if (document.getElementById('mygameslist')) {
          document.getElementById('mygameslist').innerHTML = ' '
          for (var game in json) {
            if (json.hasOwnProperty(game)) {
              var newgameli = document.createElement("LI")
              var newgamelink = document.createElement("A")
              newgamelink.href = '/chooseplayer?game=' + game
              newgamelink.innerText = json[game].name
              newgameli.appendChild(newgamelink)
              newgameli.appendChild(document.createElement("BR"))
              var newgamedesc = document.createElement("TEXTAREA")
              newgamedesc.rows = 4
              newgamedesc.cols = 40
              newgamedesc.disabled = true;
              newgamedesc.innerText = json[game].desc
              newgameli.appendChild(newgamedesc)
              document.getElementById('mygameslist').appendChild(newgameli)
            }
          }
        }
      })
    }
  }
  return {stop:function () {
    // ws.close()
  }}
}
spananja.onroute['/chooseplayer'] = function () {
  var gamekey = spananja.url.searchParams.get('game')
  if (spananja.state && spananja.state.user && spananja.url.searchParams.has('game')) {
    fetch('/join', {
      method:'POST',
      headers: {
        auth: JSON.stringify({un:spananja.state.user.un, token:spananja.state.user.token})
      },
      body: gamekey
    }).then(function (stream) {
      if (stream.headers.has('newtoken')) {
        spananja.updateLocal('user',{token: stream.headers.get('newtoken')})
        spananja.updateState({user:{token: stream.headers.get('newtoken')}}, false)
      } else {
        signOut()
      }
      return stream.json()
    }).then(function (json) {
      if (json === 'Game doesn\'t exist') {
        return spananja.open('/')
      }
      var chosenplayers = []
      if (document.getElementById('playerlist')) {
        for (var player in json.players) {
          if (data.players.hasOwnProperty(player)) {
            if (data.players[player] !== null) {
              chosenplayers.push(data.players[player])
            }
          }
        }
        document.getElementById('playerlist').innerHTML = ' '
        for (var i = 1; i < 6; i++) {
          if (chosenplayers.indexOf(i) === -1) {
            var choosebutton = document.createElement('BUTTON')
            choosebutton.innerText = ['', 'russia', 'germany', 'gb', 'russian navy', 'america', 'southern europe'][i]
            choosebutton.onclick = function (e) {
              fetch('/chooseplayer', {
                method:'POST',
                headers: {
                  auth:JSON.parse({un:spananja.state.user.un, token:spananja.state.user.token})
                },
                body: ['', 'russia', 'germany', 'gb', 'russian navy', 'america', 'southern europe'].indexOf(e.target.innerText)
              }).then(function (stream) {
                if (stream.headers.has('newtoken')) {
                  spananja.updateLocal('user',{token: stream.headers.get('newtoken')})
                  spananja.updateState({user:{token: stream.headers.get('newtoken')}}, false)
                } else {
                  signOut()
                }
                return stream.text()
              }).then(function (text) {
                console.log(text);
              })
            }
            document.getElementById('playerlist').appendChild(choosebutton)
          }
        }
      }
      var ws = new WebSocket('ws://localhost:3000')
      var types = {}
      function send(type, data) {
        ws.send(JSON.stringify({type:type, data:data}))
      }
      ws.onopen = function () {
        if (spananja.state.user) {
          send('login', {un:spananja.state.user.un, token:spananja.state.user.token})
        }
      }
      ws.onmessage = function (e) {
        var type = JSON.parse(e.data).type
        var data = JSON.parse(e.data).data
        if (typeof types[type] === 'function') {
          types[type](data)
        }
      }
      types.newtoken = function (data) {
        spananja.updateLocal('user',{token: data})
        spananja.updateState({user:{token: data}}, false)
        send('choosingplayer', gamekey)
      }
      types.autherr = signOut
      types.game = function (data) {
        var chosenplayers = []
        for (var player in data.players) {
          if (data.players.hasOwnProperty(player)) {
            if (data.players[player] !== null) {
              chosenplayers.push(data.players[player])
            }
          }
        }
        document.getElementById('playerlist').innerHTML = ' '
        for (var i = 1; i < 6; i++) {
          if (chosenplayers.indexOf(i) === -1) {
            var choosebutton = document.createElement('BUTTON')
            choosebutton.innerText = ['', 'russia', 'germany', 'gb', 'russian navy', 'america', 'southern europe'][i]
            choosebutton.onclick = function (e) {
              fetch('/chooseplayer', {
                method:'POST',
                headers: {
                  auth:JSON.parse({un:spananja.state.user.un, token:spananja.state.user.token})
                },
                body: ['', 'russia', 'germany', 'gb', 'russian navy', 'america', 'southern europe'].indexOf(e.target.innerText)
              }).then(function (stream) {
                if (stream.headers.has('newtoken')) {
                  spananja.updateLocal('user',{token: stream.headers.get('newtoken')})
                  spananja.updateState({user:{token: stream.headers.get('newtoken')}}, false)
                } else {
                  signOut()
                }
                return stream.text()
              }).then(function (text) {
                console.log(text);
              })
            }
            document.getElementById('playerlist').appendChild(choosebutton)
          }
        }
      }
    })
  } else {
    spananja.open('/')
  }
}
spananja.onroute['/auth'] = function () {
  spananja.tabs.route['/auth'].container[0].ontab[0] = function () {
    var lastun='',lastpw=''
    document.getElementsByName('un')[0].oninput = function (e) {
      if (e.target.value.search(/[\{\}\[\]\"\'\,\\]/) !== -1) {
        e.target.value = lastun
      } else {
        lastun = e.target.value
      }
    }
    document.getElementsByName('pw')[0].oninput = function (e) {
      if (e.target.value.search(/[\{\}\[\]\"\'\,\\]/) !== -1) {
        e.target.value = lastpw
      } else {
        lastpw = e.target.value
      }
    }
  }
}
