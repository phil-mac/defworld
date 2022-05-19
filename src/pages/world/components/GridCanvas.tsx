import { gql, useMutation } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';

const squareSize = 15;
const gridSideLength = 50;

const createNodeMutation = gql`
  mutation CreateNode ($worldId: ID!, $pos: [Int!]!) {
    createNode(worldId: $worldId, pos: $pos) {
      id
    }
  }
`;

export default ({chunk, openNodeId, setOpenNodeId, worldId, ...rest}: any) => {

  const canvasRef = useRef();

  const [focus, setFocus ] = useState(null);

  const [createNode] = useMutation(createNodeMutation, {
    refetchQueries: ['QueryWorld']
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!chunk) return;

    const c0 = '#111111';
    const c1 = '#00FF00';
    const c2 = '#0000FF';
    const cNode = '#FFFFFF';
    chunk.forEach((block, i) => {
      ctx.fillStyle = '#777777';
      if (block[0] === 0) ctx.fillStyle = c0;
      if (block[0] === 1) ctx.fillStyle = c1;
      if (block[0] === 2) ctx.fillStyle = c2;
      if (block[1] === 50) ctx.fillStyle = cNode;
      // const on = block[1];
      // if (on)
      let x = i % gridSideLength;
      let y = Math.floor(i / gridSideLength);
      ctx.fillRect((squareSize+1)*x, (squareSize+1)*y, squareSize, squareSize);

      if (block[1] === 50 && openNodeId == block[0]) {
        ctx.fillStyle = '#111111';
        ctx.fillRect((squareSize+1)*x + 3, (squareSize+1)*y, squareSize - 6, squareSize - 3); 
      }
    })
    
  }, [chunk])
  
  return (
    <div>
      <canvas 
        ref={canvasRef} 
        width='800' 
        height='800' 
        onClick={e => {
          // get position clicked
          const rect = e.target.getBoundingClientRect();
          let pos = {x: e.clientX - rect.left, y: e.clientY - rect.top}
          const gridify = val => Math.floor(val/(squareSize+1));
          let gridPos = {x: gridify(pos.x), y: gridify(pos.y)};

          // check if you clicked on a block, break if you did
          for (let i = 0; i < chunk.length; i++) {
            const b = chunk[i];
            if (b[0] >= 1) {
              console.log("block: ", b);
              let bx = i % gridSideLength;
              let by = Math.floor(i / gridSideLength);
              if (gridPos.x === bx && gridPos.y === by){
                console.log("Clicked block: ", b);
                if (b[1] === 50) {
                  // clicked a node
                  const ctx = e.target.getContext('2d');
                  
                  // if it's open already, close it
                  if (!!focus && focus[0] === gridPos.x && focus[1] === gridPos.y) {
                    setOpenNodeId(null);

                    // copy pasted from below, could reuse
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect((squareSize+1)*focus[0], (squareSize+1)*focus[1], squareSize, squareSize);
                    setFocus(null);
                    return;
                  }
                  
                  // if not, open it
                  setOpenNodeId(b[0].toString());

                  // add an open-visual square there
                  ctx.fillStyle = '#111111';
                  ctx.fillRect((squareSize+1)*gridPos.x + 3, (squareSize+1)*gridPos.y, squareSize - 6, squareSize - 3);

                  // close prior focus
                  if (!!focus){
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect((squareSize+1)*focus[0], (squareSize+1)*focus[1], squareSize, squareSize);
                  }
                  setFocus([gridPos.x, gridPos.y]);
                }
                return;
              }
            }
          }



          // add this as a node via graqlQL
          createNode({variables: {worldId, pos:[gridPos.x, gridPos.y] }});
          
        }}
        {...rest}/>
    </div>
    )
}