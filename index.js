const http = require('http');
const url = require('url');
const fs = require('fs');
const WebSocket = require('ws');
const EventEmitter = require('events')
const emitter = new EventEmitter();
const hostname = '127.0.0.1';
const port = 5000;
function validate(email, token) {
  return new Promise(function(resolve, reject) {
    fs.readFile('../Data/users.json', function (err, data) {
      data = JSON.parse(data)
      if (data.users[data.tokens[email]] && data.users[data.tokens[email]].token === token) {
        var nextToken = newToken(60)
        data.users[data.tokens[email]].token = nextToken;
        fs.writeFile('../data/users.json', JSON.stringify(data), function (err) {
          resolve({token: nextToken, id: data.tokens[email], username:data.users[data.tokens[email]].username})
        })
      } else {
        reject()
      }
    })
  });
}

const server = http.createServer((req, res) => {
  function generateKey(length) {
    var alphabeth = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

    let key = ''
    for (var i = 0; i < length; i++) {
      var randomBetweenZeroAndTwentyFive = Math.floor(Math.random() * 26)
      key += alphabeth[randomBetweenZeroAndTwentyFive]
    }
    return key
  }
  function newGameKey() {
    return new Promise(function(resolve, reject) {
      fs.readFile('../Data/gameKeys.json', (err, existingKeys) => {
        var key = ''
        do {
          key = generateKey(10)
        } while (JSON.parse(existingKeys).includes(key));
        var updateKeys = JSON.parse(existingKeys)
        updateKeys.push(key)
        fs.writeFile('../Data/gameKeys.json', JSON.stringify(updateKeys), () => {})
        resolve(key)
      })
    });
  }
  res.writeHead(200, {'Access-Control-Allow-Origin': 'http://localhost:3000'})
  function removeDir(dir) {
    return new Promise(function(resolve, reject) {
      fs.stat(dir, (err, stats) => {
        if(stats.isDirectory()) {
          fs.readdir(dir, (err, data) => {
            for (var file in data) {
              fs.unlink(dir + '/' + data[file], () => {
                fs.rmdir(dir, (err) => {
                  if (!err) {
                    resolve()
                  }
                })
              })
            }
          })
        }
      });
    });
  }
  function newGameDir(key) {
    return new Promise(function(resolve, reject) {

      fs.mkdir('../Data/games/' + key, function () {
        fs.readdir('./initialGame', function (err, initialGame) {
          var completedFiles = 0
          for (var i = 0; i < initialGame.length; i++) {

            let j = i
            fs.readFile('./initialGame/' + initialGame[j], function (err, data) {


              fs.writeFile('../Data/games/' + key + '/' + initialGame[j], JSON.stringify(JSON.parse(data)), function () {
                completedFiles ++
                if (completedFiles === initialGame.length - 1) {
                  readGame(key).then((response) => {
                    resolve(response)
                  })
                }
              })
            })
          }
        })
      })
    });
  }
  function readGame(key) {
    return new Promise(function(resolve, reject) {
      fs.readdir('../Data/games/' + key, function (err, game) {

        var response = {}
        var completedFiles = 0;
        for (var i = 0; i < game.length; i++) {

          let j = i;
          fs.readFile('../Data/games/' + key + '/' + game[j], function (err, gameData) {

            var parsed = JSON.parse(gameData)
            response[game[j].split('.')[0]] = parsed
            completedFiles++

            if (completedFiles === game.length) {
              resolve(JSON.stringify(response))
            }

          })
        }
      })
    });
  }
  // function newUserFile(username) {
  //   fs.writeFile('../Data/users/' + username + '.json', JSON.stringify({lastGameKey:}), function (err) {
  //
  //   })
  // }

  const path = url.parse(req.url).pathname
  const query = url.parse(req.url, true).query;
  if (path === '/newGameKey') {
    res.writeHead(200, {'Access-Control-Allow-Origin': 'http://localhost:3000'})
    newGameKey().then((key) => {
      res.end(key)
    })
  } else if (path === '/deleteGame') {
    res.writeHead(200, {'Access-Control-Allow-Origin': 'http://localhost:3000'})
    fs.readFile('../Data/gameKeys.json', (err, data) => {
      keys = JSON.parse(data)

      if (query.key) {
        if (keys.includes(query.key)) {
          let newKeys = []
          for (var i = 0; i < keys.length; i++) {
            if (keys[i] !== query.key) {
              newKeys.push(keys[i])
            }
          }
          fs.writeFile('../Data/gameKeys.json', JSON.stringify(keys), () => {
            removeDir('./' + query.key)
            res.end()
          })

        } else {
          res.end('err: already deleted')
        }
      } else {
        res.end('err')
      }
    })
  } else if (path === '/clearGames') {
    res.writeHead(200, {'Access-Control-Allow-Origin': 'http://localhost:3000'})
    res.end()
    fs.readdir('../Data/games', (err, games) => {

      for (var i = 0; i < games.length; i++) {

        removeDir('../Data/games/' + games[i])
      }
    })

    fs.writeFile('../Data/gameKeys.json', JSON.stringify([]), () => {
      res.end()
    })
  } else if (path === '/getGame') {
    fs.lstat('../Data/games/' + query.key, function (err, stats) {
      if (err && err.code === 'ENOENT') {
        newGameDir(query.key).then((response) => {
          res.write(response)
          res.end()
        })
      } else {
        readGame(query.key).then((response) => {
          res.write(response)
          res.end()
        })
      }
    })
  } else if (path === '/existsKey') {
    fs.readFile('../Data/gameKeys.json', function (err, data) {
      if (data.includes(query.key)) {
        res.end('true')
      } else {
        res.end('false')
      }
    })
  } else if (path === '/newUserKey') {
    fs.readdir('../Data/users', function (err, files) {
      let key = ''
      do {
        key = generateKey(10)
      } while (files.includes(key));
      let token = generateKey(20)
      res.end(JSON.stringify({key:key, token: token}))
      fs.mkdir('../Data/users/' + key, function (err) {

      })
    })
  } else if (path === '/joinNewGame') {
    fs.readFile('../Data/waitroom.json', function (err, data) {
      let waitroom = JSON.parse(data)
      if (waitroom.empty) {
        let key = generateKey(10)
        // fs.lstat('../Data/users/' + query.userName, function (err, stats) {
        //   if (err && err.code == 'ENOENT') {
        //     newUserDir(query.userName)
        //   }
        // })
        fs.writeFile('../Data/users/' + query.userName + '.json', JSON.stringify({lastGameKey: key}), function (err) {})
        newGameDir(key).then((game) => {
          fs.readFile('../Data/games/' + key + '/info.json', (err, data) => {
            let info = JSON.parse(data)
            if (!info.players) {
              info.players = []
            }
            info.players.push({user: query.userName, player: 'choosing'})
            info.lastChanche = Date.now()
            fs.writeFile('../Data/games/' + key + '/info.json', JSON.stringify(info), function (err) {
              fs.readFile('../Data/games/' + key + '/info.json', function (err, data) {
                info = JSON.parse(data)

                let choises = [1,2,3,4,5]
                info.players.forEach((item, i) => {
                  let newChoises = []
                  for (var i = 0; i < choises.length; i++) {
                    if (choises[i] !== item) {
                      newChoises.push(choises[i])
                    }
                  }
                  choises = newChoises
                  res.end(JSON.stringify(choises))
                });

              })
            })
          })
        })

        fs.writeFile('../Data/waitroom.json', JSON.stringify({empty:false, gameKey: key}), (err) => {})
      } else {
        fs.writeFile('../Data/users/' + query.userName + '.json', JSON.stringify({lastGameKey: waitroom.gameKey}), function (err) {})
        fs.readFile('../Data/games/' + waitroom.gameKey + '/info.json', (err, data) => {
          let info = JSON.parse(data)
          if (!info.players) {
            info.players = []
          }
          info.players.push({user: query.userName, player: 'choosing'})
          info.lastChanche = Date.now()

          fs.writeFile('../Data/games/' + waitroom.gameKey + '/info.json', JSON.stringify(info), function (err) {
            fs.readFile('../Data/games/' + waitroom.gameKey + '/info.json', function (err, data) {
              info = JSON.parse(data)

              let choises = [1,2,3,4,5]
              info.players.forEach((item, i) => {
                let newChoises = []
                for (var i = 0; i < choises.length; i++) {
                  if (choises[i] !== item) {
                    newChoises.push(choises[i])
                  }
                }
                choises = newChoises
                res.end(JSON.stringify(choises))
              });

            })
          })
        })
      }
    })
  } else {
    res.writeHead(404, {'Access-Control-Allow-Origin': 'http://localhost:3000'})
    res.end('404')
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const wss = new WebSocket.Server({server:server})
wss.on('connection', (ws) => {
  var types = {}
  function newToken(length, forbidden) {
    var alphabeth = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    var newKey = ''
    do {
      for (var i = 0; i < length; i++) {
        var random = Math.floor(Math.random() * alphabeth.length)
        newKey += alphabeth[random]
      }
    } while (forbidden?newKey in forbidden:false);
    return newKey
  }
  function send(type, data) {
    if (data) {
      ws.send(JSON.stringify({type:type, data:data}))
    } else {
      ws.send(JSON.stringify(type))
    }
  }
  function newGameDir(key) {
    return new Promise(function(resolve, reject) {
      fs.mkdir('../Data/games/' + key, function () {
        fs.readdir('./initialGame', function (err, initialGame) {
          var completedFiles = 0
          for (var i = 0; i < initialGame.length; i++) {

            let j = i
            fs.readFile('./initialGame/' + initialGame[j], function (err, data) {


              fs.writeFile('../Data/games/' + key + '/' + initialGame[j], JSON.stringify(JSON.parse(data)), function () {
                completedFiles ++
                if (completedFiles === initialGame.length - 1) {
                  readGame(key).then((response) => {
                    resolve(response)
                  })
                }
              })
            })
          }
        })
      })
    });
  }
  function readGame(key) {
    return new Promise(function(resolve, reject) {
      fs.readdir('../Data/games/' + key, function (err, game) {

        var response = {}
        var completedFiles = 0;
        for (var i = 0; i < game.length; i++) {

          let j = i;
          fs.readFile('../Data/games/' + key + '/' + game[j], function (err, gameData) {

            var parsed = JSON.parse(gameData)
            response[game[j].split('.')[0]] = parsed
            completedFiles++

            if (completedFiles === game.length) {
              resolve(JSON.stringify(response))
            }

          })
        }
      })
    });
  }
  function userState(state, callback) {
    state = state;
    if (state === 'chooseplayer') {
      console.log('state chooseplayer');
      readGame('vzfferssdh').then((game) => {
        let info = JSON.parse(game).info
        info.lastChanche = Date.now()
        fs.writeFile('../Data/games/' + 'vzfferssdh' + '/info.json', JSON.stringify(info), function (err) {
          fs.readFile('../Data/games/' + 'vzfferssdh' + '/info.json', function (err, data) {
            info = JSON.parse(data)

              let choises = [1,2,3,4,5,6]
              info.players.forEach((item, i) => {
                let newChoises = []
                for (var i = 0; i < choises.length; i++) {
                  if (choises[i] !== item) {
                    newChoises.push(choises[i])
                  }
                }
                choises = newChoises

                send('choises', choises)
              });
          })
        })
      })
    }
    fs.readFile('../Data/users/' + currentUser + '.json', function (err, data) {
      if (err && err.code === 'ENOENT') {
      } else {
        let info = JSON.parse(data)
        info.state = state
        fs.writeFile('../Data/users/' + currentUser + '.json', JSON.stringify(info), function (err) {
          if (callback && typeof callback === 'function') {
            callback()
          }
        })
      }
    })
  }
  let currentUser = 'anonymous';
  function sendType(message) {
    var data = JSON.parse(message).data
    var type = JSON.parse(message).type
    if (type) {
      ws.removeAllListeners(['message'])
      ws.on('message', sendType)
      if (types && typeof types[type] === 'function') {
        types[type](data)
      }
    }
  }
  types['signin'] = function (data) {

  }
  // news.authWithToken = function (type, msg) {
  //   fs.readFile('../Data/users/' + msg.user + '.json', function (err, data) {
  //     if (err && err.code === 'ENOENT') {
  //       send('err', 'user doesn\'t exist')
  //     } else {
  //       let user = JSON.parse(data)
  //       if (user.token === msg.token) {
  //         currentUser = msg.user
  //         let token = generateKey(20)
  //         send('autoUserToken', {user: currentUser, token: token, state: user.state})
  //         user.token = token
  //         fs.writeFile('../Data/users/' + currentUser + '.json', JSON.stringify(user), function () {
  //           userState(user.state)
  //         })
  //       } else if (user.token !== msg.props.token) {
  //         send('err', 'wrong token')
  //       }
  //     }
  //   })
  // }
  ws.on('message', sendType)
  // ws.on('message', message => {
  //   let msg = JSON.parse(message)
  //   console.log(msg, 'r300');
  //   if (msg.action === 'signin') {
  //     fs.readFile('../Data/users/' + msg.props.username + '.json', function (err, data) {
  //       if (err && err.code === 'ENOENT') {
  //         send('err', 'user doesn\'t exist')
  //       } else {
  //         let user = JSON.parse(data)
  //         if (user.pw !== msg.props.pw) {
  //           send('err', 'wrong password')
  //         } else if (user.pw === msg.props.pw) {
  //           let token = generateKey(20)
  //           send('userToken', {user: msg.props.username, token: token, state:'join'})
  //           user.token = token;
  //           currentUser = msg.props.username
  //           userState('join')
  //           fs.writeFile('../Data/users/' + currentUser + '.json', JSON.stringify(user), function (err) {})
  //         }
  //       }
  //     })
  //   } else if (msg.action === 'signup') {
  //     fs.readdir('../Data/users', function (err, data) {
  //       if (data.includes(msg.props.username + '.json')) {
  //         send('err', 'username already in use')
  //       } else {
  //         let token = generateKey(20)
  //         send('userToken', {user: msg.props.username, token: token, state: 'join'})
  //         fs.writeFile('../Data/users/' + msg.props.username + '.json', JSON.stringify({
  //           pw: msg.props.pw,
  //           token: token
  //         }), function (err) {
  //           currentUser = msg.props.username
  //           userState('join')
  //         })
  //       }
  //     })
  //   } else if (msg.action === 'authWithToken') {
  //
  //   } else if (msg.action === 'logout') {
  //     currentUser = 'anonymous'
  //   } else if (msg.action === 'joinWaitRoom') {
  //     fs.readFile('../Data/waitroom.json', function (err, data) {
  //       userState('chooseplayer')
  //       let waitroom = JSON.parse(data)
  //       if (waitroom.empty === true) {
  //         // send('test', 'waitroom empty')
  //         let key = generateKey(10)
  //         newGameDir(key).then((game) => {
  //           let info = JSON.parse(game).info
  //           if (!info.players) {
  //             info.players = []
  //           }
  //           info.players.push({user: currentUser, player: 'choosing'})
  //           info.lastChanche = Date.now()
  //           fs.writeFile('../Data/games/' + key + '/info.json', JSON.stringify(info), function (err) {
  //             fs.readFile('../Data/games/' + key + '/info.json', function (err, data) {
  //               info = JSON.parse(data)
  //
  //               let choises = [1,2,3,4,5,6]
  //               info.players.forEach((item, i) => {
  //                 let newChoises = []
  //                 for (var i = 0; i < choises.length; i++) {
  //                   if (choises[i] !== item) {
  //                     newChoises.push(choises[i])
  //                   }
  //                 }
  //                 choises = newChoises
  //                 console.log(choises);
  //                 send('choises', choises)
  //                 waitroom.empty = false
  //                 waitroom.players.push(currentUser)
  //                 waitroom.gameKey = key
  //                 fs.writeFile('../Data/waitroom.json', JSON.stringify(waitroom), function () {
  //
  //                 })
  //               });
  //
  //             })
  //           })
  //
  //         })
  //         // fs.writeFile('../Data/waitroom.json', JSON.stringify({
  //         //   empty: false,
  //         // }))
  //       } else {
  //         readGame(waitroom.gameKey).then((game) => {
  //           let info = JSON.parse(game).info
  //           if (!info.players) {
  //             info.players = []
  //           }
  //           let joined = null
  //           for (var i = 0; i < info.players.length; i++) {
  //             if (info.players[i].user === currentUser) {
  //               joined = info.players[i]
  //             }
  //           }
  //           if (joined === null) {
  //             info.players.push({user: currentUser, player: 'choosing'})
  //           }
  //           info.lastChanche = Date.now()
  //           fs.writeFile('../Data/games/' + waitroom.gameKey + '/info.json', JSON.stringify(info), function (err) {
  //             fs.readFile('../Data/games/' + waitroom.gameKey + '/info.json', function (err, data) {
  //               info = JSON.parse(data)
  //               if (joined && joined.player === 'choosing') {
  //                 let choises = [1,2,3,4,5,6]
  //                 info.players.forEach((item, i) => {
  //                   let newChoises = []
  //                   for (var i = 0; i < choises.length; i++) {
  //                     if (choises[i] !== item) {
  //                       newChoises.push(choises[i])
  //                     }
  //                   }
  //                   choises = newChoises
  //                   console.log(choises);
  //                   send('choises', choises)
  //                   waitroom.empty = false
  //                   if (joined === null) {
  //                     waitroom.players.push(currentUser)
  //                   }
  //                   fs.writeFile('../Data/waitroom.json', JSON.stringify(waitroom), function () {
  //
  //                   })
  //
  //                 });
  //               } else if (joined) {
  //                 send('choises', joined.player)
  //               }
  //             })
  //           })
  //         })
  //       }
  //     })
  //   } else if (msg.action === 'chooseplayer') {
  //     userState('game')
  //     send('test', 'chosen' + msg.props)
  //     fs.readFile('../Data/users/' + currentUser + '.json', function (err, data) {
  //       let key = JSON.parse(data).key
  //       fs.readFile('../Data/games/' + key + '/info.json', function (err, data) {
  //         let info = JSON.parse(data)
  //         info.players.push({user: currentUser, player: msg.props.player})
  //         fs.writeFile('../Data/games/' + key + '/info.json', JSON.stringify(info), function () {})
  //       })
  //     })
  //   }
  // })
})
