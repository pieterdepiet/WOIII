var spananja = {
  start: function () {
    var routes = {}, sources = {}, activePage, activePageCln, main = document.getElementById('main') || document.body.appendChild(document.createElement("DIV")), components = {}, runningFunction, ontab = [];
    while (document.getElementsByTagName('spananja-route').length > 0) {
      routes[document.getElementsByTagName('spananja-route')[0].getAttribute('route')] = document.getElementsByTagName('spananja-route')[0].cloneNode(true)
      document.getElementsByTagName('spananja-route')[0].remove()
    }
    Object.defineProperty(HTMLElement.prototype, 'path', {
      value: function(stopat){
        var a=[],e=this;
        while(!!e.parentElement&&e!==stopat){a.push(e.parentElement);e=e.parentElement}
        return a;
      }
    })
    document.body.addEventListener('click', function (e) {
      for (var element of e.path) {
        if (element.nodeName === 'A') {
          e.preventDefault()
          spananja.open(element.href.substr(21))
        }
      }
    }, false)
    while (document.getElementsByTagName('spananja-defaultPage').length > 0) {
      spananja.defaultPage = document.getElementsByTagName('spananja-defaultPage')[0].cloneNode(true);
      document.getElementsByTagName('spananja-defaultPage')[0].remove()
    }
    function styles() {
      for (var styletag of document.getElementsByTagName('style')) {
        styletag.setAttribute('media', 'max-width: 1px')
        if (styletag.getAttribute('route') === spananja.url.pathname || !styletag.hasAttribute('route')) {
          styletag.removeAttribute('media')
        }
      }
      for (var stylesheet of document.getElementsByTagName('link')) {
        if (stylesheet.getAttribute('rel') === 'stylesheet') {
          stylesheet.disabled = !(stylesheet.getAttribute('route') === spananja.url.pathname || !stylesheet.hasAttribute('route'))
        }
      }
    }
    function route() {
      activePage = routes[new URL(window.location.href).pathname]
      main.innerHTML = ''
      if (activePage) {
        var activePageCln = activePage.cloneNode(true)
        main.appendChild(activePageCln)
      } else if (spananja.defaultPage) {
        main.appendChild(spananja.defaultPage)
      } else {
        main.innerHTML = 'Not found <a href="/">Back</a>'
      }
    }
    function title(_url) {
      var url = new URL('http://d.e' + _url).pathname || spananja.url.pathname
      if (routes[url] && routes[url].getAttribute('title')) {
        document.title = routes[url].getAttribute('title');
      }
    }
    function defs() {
      for (var defs of document.getElementsByTagName('spananja-defs')) {
        for (var def of defs.getElementsByTagName('*')) {
          if (components[def.localName]) {
            console.error('[SPA] can\'t define something double');
          } else {
            components[def.localName.split('spananja-def-')[1]] = def.innerHTML
          }
        }
        defs.remove()
      }
    }
    function replacesources(elem) {
      return new Promise(function(resolve, reject) {
        var sourcetags = elem.getElementsByTagName('spananja-source')
        for (var i = 0; i < sourcetags.length;) {
          var url = sourcetags[i].getAttribute('url').replace(/(?<!\.html)$/, '.html')
          if (url in sources) {
            var toreplace;
            if (sourcetags[i].hasAttribute('default')) {
              toreplace = sources[url].getElementsByTagName('spananja-exportdefault')[0].cloneNode(true)
            } else {
              for (var j = 0; j < sources[url].getElementsByTagName('spananja-export').length && sources[url].getElementsByTagName('spananja-export')[j].getAttribute('exportid') !== sourcetags[i].getAttribute('importid'); j++) {}
              toreplace = j<sources[url].getElementsByTagName('spananja-export').length?
                sources[url].getElementsByTagName('spananja-export')[j].cloneNode(true)
                :
                document.createTextNode('No export with exportid ' + sourcetags[i].getAttribute('importid'))
            }
            sourcetags[i].parentElement.replaceChild(toreplace, sourcetags[i])
            render(elem)
            replacesources(toreplace)
          } else {
            i++
          }
        }
        function next() {
          var url = sourcetags[0].getAttribute('url').replace(/(?<!\.html)$/, '.html')
          fetch(url).then(function (stream) {
            return stream.text()
          }).then(function (text) {
            sources[url] = document.createElement('spananja-temp')
            sources[url].innerHTML = text.trim()
            var i = 0
            function _next() {
              var url = sourcetags[i]?sourcetags[i].getAttribute('url').replace(/(?<!\.html)$/, '.html'):undefined
              if (url in sources) {
                var toreplace;
                if (sourcetags[i].hasAttribute('default')) {
                  toreplace = sources[url].getElementsByTagName('spananja-exportdefault')[0].cloneNode(true)
                } else {
                  for (var j = 0; j < sources[url].getElementsByTagName('spananja-export').length && sources[url].getElementsByTagName('spananja-export')[j].getAttribute('exportid') !== sourcetags[i].getAttribute('importid'); j++) {}
                  toreplace = j<sources[url].getElementsByTagName('spananja-export').length?sources[url].getElementsByTagName('spananja-export')[j].cloneNode(true):document.createTextNode('No export with exportid ' + sourcetags[i].getAttribute('importid'))
                }
                sourcetags[i].parentElement.replaceChild(toreplace, sourcetags[i])
                render(elem)
                replacesources(toreplace)
                if (i < sourcetags.length) {
                  _next()
                } else {
                  if (sourcetags.length > 0) {
                    next()
                  } else {
                    return resolve()
                  }
                }
              } else {
                if (i < sourcetags.length) {
                  i++
                  _next()
                } else {
                  if (sourcetags.length > 0) {
                    next()
                  } else {
                    render(elem)
                    return resolve()
                  }
                }
              }
            }
            _next()
          })
        }
        if (sourcetags.length > 0) {
          next()
        } else {
          return resolve()
        }
      });
    }
    function render(element) {
      for (var component in components) {
        if (components.hasOwnProperty(component)) {
          for (var defined of element.getElementsByTagName(component)) {
            defined.outerHTML = components[defined.localName]
          }
        }
      }
      for (var i = 0; i < document.getElementsByTagName('spananja-tabs-container').length; i++) {
        if (!spananja.tabs.route[spananja.url.pathname].container[i]) {
          spananja.tabs.route[spananja.url.pathname].container[i] = {}
        }
        if (!spananja.tabs.route[spananja.url.pathname].container[i].ontab) {
          spananja.tabs.route[spananja.url.pathname].container[i].ontab = []
        }
        if (!document.getElementsByTagName('spananja-tabs-container')[i].hasheader) {
          let tabs = []
          var activeIndex = 0
          while (document.getElementsByTagName('spananja-tabs-container')[i].getElementsByTagName('spananja-tabs-tab').length > 0) {
            tabs.push(document.getElementsByTagName('spananja-tabs-container')[i].getElementsByTagName('spananja-tabs-tab')[0])
            document.getElementsByTagName('spananja-tabs-container')[i].getElementsByTagName('spananja-tabs-tab')[0].remove()
          }
          var nav = document.createElement('SPANANJA-TABS-HEADER')
          for (var j = 0; j < tabs.length; j++) {
            if (tabs[j].hasAttribute('active')) {
              activeIndex = j
            }
            var button = document.createElement('BUTTON')
            button.innerText = tabs[j].getAttribute('tabname')
            button.index = j
            button.container = i
            button.onclick = function (e) {
              if (document.getElementsByTagName('spananja-tabs-container')[e.target.container].hasAttribute('usehash')) {
                var newurl = new URL('http://d.e' + (window.location.hash.length>0?window.location.hash:'/'))
                newurl.searchParams.set('spananja-tabs-container-' + e.target.container, 'spananja-tabs-tab-' + e.target.index)
                window.history.replaceState(spananja.state, '', spananja.url.pathname + '#' + newurl.search)
              }
              document.getElementsByTagName('spananja-tabs-container')[e.target.container].innerHTML = ''
              document.getElementsByTagName('spananja-tabs-container')[e.target.container].appendChild(tabs[e.target.index])
              replacesources(document.getElementsByTagName('spananja-tabs-container')[e.target.container]).then(function () {
                if (spananja.tabs && spananja.tabs.route && spananja.tabs.route[spananja.url.pathname] && spananja.tabs.route[spananja.url.pathname].container && spananja.tabs.route[spananja.url.pathname].container[e.target.container] && spananja.tabs.route[spananja.url.pathname].container[e.target.container].ontab && typeof spananja.tabs.route[spananja.url.pathname].container[e.target.container].ontab[e.target.index] === 'function') {
                  spananja.tabs.route[spananja.url.pathname].container[e.target.container].ontab[e.target.index]()
                }
              })
            }
            nav.appendChild(button)
          }
          var url = new URL('http://d.e' + (window.location.hash.length>0?window.location.hash.substr(1):'/'))
          if (document.getElementsByTagName('spananja-tabs-container')[i].hasAttribute('usehash')&&url.searchParams.has('spananja-tabs-container-' + i)) {
            activeIndex = url.searchParams.get('spananja-tabs-container-' + i).split(/^spananja\-tabs\-tab\-/)[1]
          }
          document.getElementsByTagName('spananja-tabs-container')[i].parentElement.insertBefore(nav, document.getElementsByTagName('spananja-tabs-container')[i])
          document.getElementsByTagName('spananja-tabs-container')[i].appendChild(tabs[activeIndex])
          document.getElementsByTagName('spananja-tabs-container')[i].hasheader = true
          if (document.getElementsByTagName('spananja-tabs-container')[i].hasAttribute('usehash')) {
            var newurl = new URL('http://d.e' + (window.location.hash.length>0?window.location.hash:'/'))
            newurl.searchParams.set('spananja-tabs-container-' + i, 'spananja-tabs-tab-' + activeIndex)
            window.history.replaceState(spananja.state, '', spananja.url.pathname + '#' + newurl.search)
          }
          ontab.push([spananja.url.pathname, i, activeIndex])
        }
      }
      replacesources(main)
    }
    function startFun() {
      if (self === window) {
        if (typeof spananja.onroute[spananja.url.pathname] === 'function') {
          runningFunction = spananja.onroute[spananja.url.pathname]()
        }
        for (var [u, c, t] of ontab) {
          if (u === spananja.url.pathname && typeof spananja.tabs.route[u].container[c].ontab[t] === 'function') {
            spananja.tabs.route[u].container[c].ontab[t]()
          }
        }
      }
    }
    function stopFun() {
      if (runningFunction) {
        if (typeof runningFunction.stop === 'function') {
          runningFunction.stop()
        }
      }
    }
    spananja.open = function (url, state) {
      title(url);
      if (state) {
        var newState = window.history.state || {};
        function update(toUpdate, _updates) {
          for (var _update in _updates) {
            if (_updates.hasOwnProperty(_update)) {
              if (typeof _updates[_update] !== 'object') {
                toUpdate[_update] = _updates[_update];
              } else {
                if (!toUpdate[_update]) {
                  toUpdate[_update] = {}
                }
                update(toUpdate[_update], _updates[_update])
              }
            }
          }
        }
        update(newState, state)
        window.history.pushState(newState, '', url)
      } else {
        window.history.pushState(spananja.state, '', url)
      }
      toggleActive()
    }
    spananja.updateState = function (updates, push) {
      var newState = window.history.state || {};
      function update(toUpdate, _updates) {
        for (var _update in _updates) {
          if (_updates.hasOwnProperty(_update)) {
            if (typeof _updates[_update] !== 'object') {
              toUpdate[_update] = _updates[_update];
            } else {
              if (!toUpdate[_update]) {
                toUpdate[_update] = {}
              }
              update(toUpdate[_update], _updates[_update])
            }
          }
        }
      }
      update(newState, updates)
      window.history.replaceState(newState, '')
      push===false?null:(function(){
        stopFun();
        render(document.body);
        startFun()
      })();
      spananja.onstatechange(updates);
    }
    spananja.deleteState = function (path, push) {
      var newState = window.history.state
      if (Array.isArray(path) && newState) {
        function next(thing, i) {
          if (i + 1 < path.length) {
            next(thing[path[i]], i + 1)
          } else {
            delete thing[path[i]]
          }
        }
        next(newState, 0)
      } else if (newState) {
        delete newState[path]
      }
      title(spananja.url.pathname)
      window.history.replaceState(newState, '')
      push===false?null:(function(){stopFun();render(document.body);startFun()})();spananja.onstatechange(path);
    }
    spananja.search = function (search) {
      if (search === '') {
        return []
      }
      var obj = {title: {}, content: {}};
      var list = []
      for (var page in routes) {
        if (routes.hasOwnProperty(page) && !routes[page].hasAttribute('nosearch')) {
          // var text = routes[page].innerHTML.replace(/(\<(\/div|br|\/h\d)\>)/g, '\n')
          // var searchText = routes[page].innerHTML.replace(/\<[A-Z0-9\"\=\(\)\/ \'\.\{\}\,\:\[\]]{0,}\>/ig, '')
          var searchText = routes[page].innerHTML
          searchText = searchText.replace(/\<spananja-search-exclude\>[\w\W]{0,}(?=\<\/spananja-search-exclude\>)\<\/spananja-search-exclude\>/gm,'')
          var newSearchText = searchText;
          for (var match of searchText.matchAll(/\<[A-Z0-9\=\"\(\)\/\s\'\.\{\}\,\:\[\]]{0,}\>/ig)) {
            var spaces = ''
            for (var i = 0; i < match[0].length; i++) {
              spaces += ' '
            }
            newSearchText = newSearchText.substr(0,match.index) + spaces + newSearchText.substr(match.index + spaces.length, searchText.length)
          }
          searchText = newSearchText
          var text = routes[page].innerHTML
          var index = routes[page].getAttribute('title')? routes[page].getAttribute('title').toLowerCase().indexOf(search.toLowerCase()) : -1
          if (index >= 0) {
            if (!Array.isArray(obj.title[index])) {
              obj.title[index] = []
            }
            obj.title[index].push({url:page, title:routes[page].getAttribute('title'), text:text/*.replace(/\n/g, '<br>')*/})
          } else {
            index = searchText.toLowerCase().indexOf(search.toLowerCase())
            if (index >= 0) {
              if (!Array.isArray(obj.content[index])) {
                obj.content[index] = []
              }
              text = text.substr(0,index) + '<spananja-found-text>' + text.substr(index, search.length) + '</spananja-found-text>' + text.substr(index+search.length, text.length)
              obj.content[index].push({url:page, title:routes[page].getAttribute('title'), text:text/*.replace(/\n/g, '<br>')*/})
            }
          }
        }
      }
      for (var titleIndex in obj.title) {
        if (obj.title.hasOwnProperty(titleIndex)) {
          for (var result of obj.title[titleIndex]) {
            list.push(result)
          }
        }
      }
      for (var contentIndex in obj.content) {
        if (obj.content.hasOwnProperty(contentIndex)) {
          for (var result of obj.content[contentIndex]) {
            list.push(result)
          }
        }
      }
      return list;
    }
    spananja.getTitle = function (url) {
      return routes[url].getAttribute('title')
    }
    spananja.tabs = {route:{}};
    for (var _route in routes) {
      if (routes.hasOwnProperty(_route)) {
        spananja.tabs.route[_route] = {container:[]}
      }
    }
    title(spananja.url.pathname);styles();route();render(document.body);
    replacesources(main).then(function(){
      defs();typeof spananja.onwindowopen === 'function'?spananja.onwindowopen():null;render(document.body);startFun();window.history.pushState({}, '', window.location.href)
    })
    function toggleActive(e) {
      e?e.preventDefault():null
      stopFun();
      styles();
      route();
      ontab=[]
      render(document.body);
      replacesources(main).then(function () {
        startFun()
      })
    }
    window.onpopstate = toggleActive
  },
  get state() {
    return window.history.state
  },
  updateState: function (updates) {
    var newState = window.history.state;
    function update(toUpdate, _updates) {
      for (var _update in _updates) {
        if (_updates.hasOwnProperty(_update)) {
          if (typeof updates[_update] !== 'object') {
            toUpdate[_update] = _updates[_update];
          } else {
            if (typeof toUpdate[_update] !== 'object') {
              toUpdate[_update] = {}
            }
            update(toUpdate[_update], _updates[_update])
          }
        }
      }
    }
    update(newState, updates)
    window.history.replaceState(newState, '')
  },
  deleteState: function (path) {
    var newState = window.history.state
    if (Array.isArray(path)) {
      function next(thing, i) {
        if (i + 1 < path.length) {
          next(thing[path[i]], i + 1)
        } else {
          delete thing[path[i]]
        }
      }
      next(newState, 0)
    } else {
      delete newState[path]
    }
    window.history.replaceState(newState, '')
  },
  updateLocal: function (name, updates) {
    var newStorage = localStorage[name]&&typeof JSON.parse(localStorage[name])==='object'?JSON.parse(localStorage[name]):{};
    function update(toUpdate, _updates) {
      for (var _update in _updates) {
        if (_updates.hasOwnProperty(_update)) {
          if (typeof updates[_update] !== 'object') {
            toUpdate[_update] = _updates[_update];
          } else {
            if (typeof toUpdate[_update] !== 'object') {
              toUpdate[_update] = {}
            }
            update(toUpdate[_update], _updates[_update])
          }
        }
      }
    }
    update(newStorage, updates)
    localStorage.setItem(name, JSON.stringify(newStorage))
  },
  deleteLocal: function (name) {
    localStorage.removeItem(name)
  },
  onroute: {},
  get url() {
    return new URL(window.location.href)
  },
  locSt: function (name) {
    return localStorage[name]?JSON.parse(localStorage[name])||localStorage[name]:localStorage[name]
  }
}
