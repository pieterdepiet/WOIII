import React from 'react'

function Developer() {
  function set() {
    let key = window.developer.childNodes[0].value
    let value = window.developer.childNodes[1].value
    localStorage.setItem(key, value)
    console.log(localStorage);
  }
  return (
    <div id='developer' onKeyPress={(e) => { if (e.key === 'Enter') { set();} }}>
      <input type='text'/><input type='text'/><button onClick={(e) => {
        set()
      }}>save</button>
    </div>
  )
}

export default Developer
