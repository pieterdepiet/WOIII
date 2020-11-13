import React, {} from 'react';
import {Link} from 'react-router-dom'
// import Hex from '../gameComponents/Hexagon'
import FieldIcon from '../gameComponents/FieldIcon'


function Welcome(props) {
  document.title = 'Welcome!'
  return (
    <div className='welcome'>
      <h1>Welcome to <span style={{fontFamily:'serif'}}>WO III</span>, a game by mr. V D</h1>
      <Link to='/auth'>
        <img alt='' src='/logo.svg' width='auto' height='20px'/>
        <button>
          <h3 style={{margin:0}}>

            Play

          </h3>
        </button>
        <img alt='' src='/logo.svg' width='auto' height='20px'/>
      </Link>
      <div style={{height:'40px'}}></div>
      <Link to='/developer'>devSide</Link>
      <br/>
      <svg width='100' height='100' viewBox='0 0 6 6'><FieldIcon/></svg>

    </div>
  );
}

// <Link to='/game?newGame=true'><button><h3><img alt='' src='/logo.svg' width='auto' height='30px'/>Start new game<img alt='' src='/logo.svg' width='auto' height='30px'/></h3></button></Link>

export default Welcome
