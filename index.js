const http = require('http');
const fs = require('fs');
const path = require('path');
const WsServer = require('ws').Server;
var emitter = require('events').EventEmitter;
emitter = new emitter()
function validate(un, auth, withpw) {
  return new Promise(function(resolve, reject) {
    fs.readFile('../data/users.json', function (err, data) {
      data = JSON.parse(data)
      if (data.users[data.ids[un]]) {
        var newtoken = token(50)
        if (data.users[data.ids[un]][withpw?'pw':'token'] === auth) {
          data.users[data.ids[un]].token = newtoken
          fs.writeFile('../data/users.json', JSON.stringify(data), function () {
            resolve([newtoken,data.ids[un]])
          })
        } else {
          fs.writeFile('../data/users.json', JSON.stringify(data), function () {
            reject('wrongpw')
          })
        }
      } else {
        reject('usernotexists')
      }
    })
  });
}
function token(length, forbidden) {
  var key = ''
  do {
    for (var i = 0; i < length; i++) {
      var alphabeth = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
      key += alphabeth[Math.floor(Math.random()*26)]
    }
  } while (Array.isArray(forbidden)?forbidden.includes(key):false);
  return key;
}
var server = http.createServer(function (req, res) {
  var url = require('url').parse(req.url)
  if (req.method === 'GET') {
    switch (url.pathname) {
      case '/favicon.ico':
        res.end()
        break;
      case '/clearallgames':
        fs.writeFile('../data/waitroom.json', '{"notfilled":{"public":{}},"filled":{"public":{}}}', function () {
          fs.readFile('../data/users.json', function (err, data) {
            data = JSON.parse(data)
            for (var user in data.users) {
              if (data.users.hasOwnProperty(user)) {
                data.users[user].games = {}
              }
            }
            fs.writeFile('../data/users.json', JSON.stringify(data), function () {
              res.end()
            })
          })
        })
        break;
      default:
      if (url.pathname.search('static') === 1 || url.pathname.search('app') === 1) {
        fs.readFile('.' + url.pathname, function (err, data) {
          if (err) {
            if (err.code === 'ENOENT') {
              res.writeHead(404)
              return res.end('Sorry, could not find that file')
            } else {
              res.writeHead(400)
              return res.end('Unknown error')
            }
          }
          res.writeHead(200, {'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json', '.svg':'image/svg+xml'}[path.extname(url.pathname)]||'text/plain'})
          setTimeout(function () {
            res.end(data)
          }, 100);
        })
      } else {
        fs.readFile('./index.html', function (err, data) {
          res.writeHead(200, {'Content-Type':'text/html'})
          res.end(data)
        })
      }
    }
  } else {
    switch (url.pathname) {
      case '/signin':
        var user = ''
        req.on('data', function (chunk) {
          user += chunk
        })
        req.on('end', function () {
          user = JSON.parse(user)
          validate(user.un, user.pw, true).then(function ([newtoken, id]) {
            res.writeHead(200)
            res.end(JSON.stringify({succes:true, newtoken:newtoken}))
          }).catch(function (err) {
            res.writeHead(200)
            res.end('{"succes":false}')
          })
        })
        break;
      case '/signup':
        var user = ''
        req.on('data', function (chunk) {
          user += chunk
        })
        req.on('end', function () {
          user = JSON.parse(user)
          fs.readFile('../data/users.json', function (err, data) {
            data = JSON.parse(data)
            var userid = token(15, Object.keys(data.users))
            if (data.ids[user.un]) {
              res.end(JSON.stringify({succes:false, err:'userexists'}))
              return
            }
            var usertoken = token(50)
            data.users[userid] = {
              un: user.un,
              pw: user.pw,
              token: usertoken,
              games: []
            }
            data.ids[user.un] = userid
            fs.writeFile('../data/users.json', JSON.stringify(data), function () {
              res.end(JSON.stringify({succes:true,newtoken:usertoken}))
            })
          })
        })
        break;
      case '/autoauth':
        var user = ''
        req.on('data', function (chunk) {
          user += chunk
        })
        req.on('end', function () {
          user = JSON.parse(user)
          validate(user.un, user.token, false).then(function ([newtoken]) {
            res.writeHead(200)
            res.end(JSON.stringify({succes:true, newtoken:newtoken}))
          }).catch(function (err) {
            res.writeHead(200)
            res.end('{"succes":false}')
          })
        })
        break;
      case '/newpublicgame':
        var data = ''
        req.on('data', function (chunk) {
          data += chunk
        })
        req.on('end', function () {
          validate(JSON.parse(req.headers.auth).un, JSON.parse(req.headers.auth).token).then(function ([newtoken, id]) {
            res.writeHead(200, {newtoken:newtoken})
            fs.readFile('../data/waitroom.json', function (err, games) {
              data = JSON.parse(data)
              games = JSON.parse(games)
              var gametoken = token(20, Object.keys(games.notfilled.public))
              var newgame = {
                name: data.gamename,
                desc: data.gamedescription,
                players: {}
              }
              games.notfilled.public[gametoken] = newgame
              fs.writeFile('../data/waitroom.json', JSON.stringify(games),function () {
                emitter.emit('waitroomchange', games.notfilled.public)
                res.end(gametoken)
              })
            })
          }).catch(function (err) {
            res.end('{"autherr":"' + err + '"}')
          })
        })
        break;
      case '/chooseplayer':
        var data = ''
        req.on('data', function (chunk) {
          data += chunk
        })
        req.on('end', function () {
          validate(JSON.parse(req.headers.auth).un, JSON.parse(req.headers.auth).token).then(function ([newtoken]) {
            res.writeHead(200, {newtoken:newtoken})
            fs.readFile(function () {

            })
          }).catch(function () {
            res.end()
          })
        })
        break;
      case '/join':
        var gamekey = ''
        req.on('data', function (chunk) {
          gamekey += chunk
        })
        req.on('end', function () {
          validate(JSON.parse(req.headers.auth).un, JSON.parse(req.headers.auth).token).then(function ([newtoken, id]) {
            fs.readFile('../data/waitroom.json', function (err, data) {
              data = JSON.parse(data)
              var filled = data.notfilled.public[gamekey]?'notfilled':'filled'
              if (data[filled].public[gamekey]) {
                if (!data[filled].public[gamekey].players[id]) {
                  data[filled].public[gamekey].players[id] = null
                }
                if (filled==='notfilled'&&Object.keys(data[filled].public[gamekey].players).length > 4) {
                  var writegame = data[filled].public[gamekey]
                  delete data[filled].public[gamekey]
                  data.filled.public[gamekey] = writegame
                }
                fs.writeFile('../data/waitroom.json', JSON.stringify(data),function (err) {
                  emitter.emit('waitroomchange', data[filled].public)
                  res.writeHead(200, {newtoken:newtoken})
                  fs.fstat(usersfd, function (err, stats) {
                    var user = Buffer.alloc(stats.size)
                    fs.readFile(usersfd, 0, user.length, 0, function (err) {
                      user = JSON.parse(user + '')
                      user.users[id].games[gamekey] = writegame||data[filled].public[gamekey]
                      fs.writeFile('../data/users.json', JSON.stringify(user), function () {
                        if (writegame) {
                          fs.writeFile('../data/games/' + gamekey + '.json', JSON.stringify(writegame), function () {
                            res.end(JSON.stringify(writegame.players))
                          })
                        } else {
                          res.end(JSON.stringify(data[filled].public[gamekey].players))
                        }
                      })
                    })
                  })
                })
              } else {
                res.writeHead(200)
                res.end('"Game doesn\'t exist"')
              }
            })
          }).catch(function (err) {
            res.writeHead(200)
            res.end(JSON.stringify(err))
          })
        })
        break;
      case '/mygames':
        var user = ''
        req.on('data', function (chunk) {
          user += chunk
        })
        req.on('end', function () {
          user = JSON.parse(user)
          validate(user.un, user.token).then(function ([newtoken, id]) {
            fs.readFile('../data/users.json', function (err, data) {
              data = JSON.parse(data)
              res.writeHead(200, {newtoken:newtoken})
              res.end(JSON.stringify(data.users[id].games))
            })
          }).catch(function (err) {
            res.writeHead(200)
            res.end(JSON.stringify(err))
          })
        })
        break;
      default:
      res.writeHead(400)
      res.end()
    }
  }
}).listen(3000, '127.0.0.1')

var wss = new WsServer({server:server})

wss.on('connection', function (ws) {
  var types = {}, currentUser = null, listeners = []
  function handler(e) {
    var type = JSON.parse(e).type
    var data = JSON.parse(e).data
    while (listeners.length > 0) {
      emitter.removeListener(listeners[0][0], listeners[0][1])
      listeners.shift()
    }
    if (typeof types[type] === 'function') {
      types[type](data)
    }
  }
  function send(type, data) {
    ws.send(JSON.stringify({type:type, data:data}))
  }
  ws.on('message', handler)
  ws.on('close', function () {
    while (listeners.length > 0) {
      emitter.removeListener(listeners[0][0], listeners[0][1])
      listeners.shift()
    }
  })
  types.login = function (data) {
    validate(data.un, data.token).then(function ([newtoken, id]) {
      currentUser = id
      send('newtoken', newtoken)
    }).catch(function (err) {
      send('autherr', err)
    })
  }
  function updateWaitroom(waitroom) {
    fs.readFile('../data/users.json', function (err, users) {
      users = JSON.parse(users)
      for (var game in waitroom) {
        if (waitroom.hasOwnProperty(game)) {
          if (game in users.users[currentUser].games) {
            delete waitroom[game]
          }
        }
      }
      send('waitroom', waitroom)
    })
  }
  types.updatingpublicgames = function () {
    fs.readFile('../data/waitroom.json', function (err, data) {
      data = JSON.parse(data)
      fs.readFile('../data/users.json', function (err, users) {
        users = JSON.parse(users)
        for (var game in data.notfilled.public) {
          if (data.notfilled.public.hasOwnProperty(game)) {
            if (game in users.users[currentUser].games) {
              delete data.notfilled.public[game]
            }
          }
        }
        send('waitroom', data.notfilled.public)
      })
    })
    listeners.push(['waitroomchange', updateWaitroom])
    emitter.on('waitroomchange', updateWaitroom)
  }
  types.choosingplayer = function (gamekey) {
    fs.readFile('../data/waitroom.json', function (err, data) {
      data = JSON.parse(data)
      if (data.notfilled.public[gamekey]) {
        send('game', data.notfilled.public[gamekey])
      } else if (data.filled.public[gamekey]) {
        send('game', data.filled.public[gamekey])
      }
    })
    function updateChoosablePlayers(changedgame) {
      send('game', changedgame)
    }
    listeners.push(['choosableplayerschange' + gamekey, updateChoosablePlayers])
    emitter.on('choosableplayerschange' + gamekey, updateChoosablePlayers)
  }
})
