import React, { useEffect, useRef, useState } from 'react';
import * as Babylon from './babylon';

export const gridSideLen = 32;
  
export default ({blocks, openNodeId, setOpenNodeId, worldId}) => {
  const canvasRef = useRef();
  const [scene, setScene] = useState();

  const onNodeClicked = (nodeId) => {
    setOpenNodeId(nodeId);
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    initScene();
  }, [canvasRef]);

  async function initScene() {
    const babylonScene = await Babylon.initScene(canvasRef.current, onNodeClicked);
    setScene(babylonScene);
  }

  useEffect(() => {
    if (!scene) return;

    // TODO: instead of clearing all blocks, just clear ones that've chagned, or just have server send ones that have changed instead of sending all
    Babylon.clearAllBlocks()
    
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i][1] !== 0){
        const x = i % gridSideLen;
        const z = Math.floor((i % (gridSideLen*gridSideLen))/gridSideLen);
        const y = Math.floor(i/gridSideLen/gridSideLen);
        const isNode = blocks[i][1] === 50;
        const nodeId = blocks[i][0]
        Babylon.addBlock(nodeId, isNode, {x, y, z});
        }
    }
  }, [blocks, scene])
  
  return <canvas ref={canvasRef} className='w-full '/> ;
}