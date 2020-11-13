import React from 'react';

function AirportIcon() {

  return (
    <g>
      <circle r='3' cx='3' cy='3' fill='white' stroke='#00a1ff' strokeWidth='.4'/>
      <path d={
        // Start
          'M 2.8 .2'
        // Front
        + 'Q 3 0 3.2 .2'
        // FrontRightWall
        + 'L 3.4 2.5'
        // FrontRightWing
        + 'L 5.5 3'
        // EndRightWing
        + 'Q 6 3.1 5.5 3.2'
        // BackRightWing
        + 'L 3.4 3.1'
        // BackRightWall
        + 'L 3.3 5'
        // FrontRightBackWing
        + 'L 4 5.3'
        // EndRightBackWing
        + 'Q 4.2 5.6 4.1 5.5'
        // BackRightBackWing
        + 'L 3.2 5.5'
        // Back
        + 'Q 3 6.2 2.8 5.5'
        // BackLeftBackWing
        + 'L 1.9 5.5'
        // EndLeftBackWing
        + 'Q 1.8 5.6 2 5.3'
        // FrontLeftBackWing
        + 'L 2.7 5'
        // BackLeftWall
        + 'L 2.6 3.1'
        // BackLeftWing
        + 'L .5 3.2'
        // EndLeftWing
        + 'Q 0 3.1 .5 3'
        // FrontLeftWing
        + 'L 2.6 2.5'
        // ClosePath
        + 'Z'

      }
      fill='black'/>
    </g>
  )
}

export default AirportIcon
