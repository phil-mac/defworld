import * as BABYLON from '@babylonjs/core';
import * as CANNON from 'cannon';
import { GridMaterial } from '@babylonjs/materials';

export async function initScene(canvas, onNodeClicked) {
  window.CANNON = CANNON;

  // Babylon boilerplate
  var sceneToRender = null;
  function startRenderLoop (engine, canvas) {
    engine.runRenderLoop(function () {
      if (sceneToRender && sceneToRender.activeCamera) {
        sceneToRender.render();
      }
    });
  }
  function createDefaultEngine () { 
    return new BABYLON.Engine(canvas, true, { 
      preserveDrawingBuffer: true, 
      stencil: true,  
      disableWebGL2Support: false
    }); 
  };
  
  const createScene = () => {
    // Scene
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(null, new BABYLON.CannonJSPlugin());
    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.4, 1, 0.4), scene);
  
    // Camera
    const camera = new BABYLON.ArcRotateCamera('arcCamera', 0, 0, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);
    camera.setPosition(new BABYLON.Vector3(50, 30, 100));
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 20; 
    camera.checkCollisions = true;
  
    // Player
    const player = BABYLON.Mesh.CreateBox('box', 1.0, scene);
    const playerHead = BABYLON.Mesh.CreateBox('legs', 1.0, scene);
    playerHead.position.y = 1;
    

    player.position.y = 3;
    player.position.x = 25;
    player.position.z = 25;
    
    playerHead.parent = player;
    
    player.checkCollisions = true;
    player.physicsImpostor = new BABYLON.PhysicsImpostor(
      player, 
      BABYLON.PhysicsImpostor.BoxImpostor, 
      { mass: 1, friction: 100, restitution: 0 }, 
      scene
    );
    const playerMaterial = new BABYLON.StandardMaterial('material', scene);
    playerMaterial.diffuseColor = new BABYLON.Color3(0, 0.58, 0.86);
    player.material = playerMaterial;

    playerHead.checkCollisions = true;
    playerHead.physicsImpostor = new BABYLON.PhysicsImpostor(
      playerHead, 
      BABYLON.PhysicsImpostor.BoxImpostor, 
      { mass: 1, friction: 100, restitution: 0 }, 
      scene
    );
    playerHead.material = playerMaterial;
  
    // Player controls
    const speed = 0.15
    const keys = {
      jump: 0,
      left: 0,
      right: 0,
      forward: 0,
      back: 0
    };
    scene.onKeyboardObservable.add((kbInfo) => {
      const isPressed = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN ? 1 : 0;
      const key = kbInfo.event.key;
      if (key === 'a' || key === 'A') keys.left = isPressed;
      if (key === 'd' || key === 'D') keys.right = isPressed;
      if (key === 'w' || key === 'W') keys.forward = isPressed;
      if (key === 's' || key === 'S') keys.back = isPressed;
      if (key === " ") keys.jump = isPressed;
    });
    player.update = function () {
      player.rotationQuaternion.x = 0;
      player.rotationQuaternion.z = 0;
      const cameraDirectionFwd = camera.getForwardRay().direction;
      const normalFwd = (new BABYLON.Vector3(cameraDirectionFwd.x, 0, cameraDirectionFwd.z)).normalize();
  
      if (keys.jump) {
        player.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 0.5, 0), player.getAbsolutePosition());
      }
      if (keys.left) {
        player.locallyTranslate(new BABYLON.Vector3(-speed, 0, 0));
      }
      if (keys.right) {
        player.locallyTranslate(new BABYLON.Vector3(speed, 0, 0));
      }
      if (keys.forward) {
        player.lookAt(player.position.add(normalFwd), 0, 0, 0);
        player.position = player.position.add(new BABYLON.Vector3(normalFwd.x * speed, 0, normalFwd.z * speed));
      }
      if (keys.back) {
        player.lookAt(player.position.add(normalFwd), 0, 0, 0);
        player.position = player.position.add(new BABYLON.Vector3(-normalFwd.x * speed, 0, -normalFwd.z * speed));
      }
    }

    // Camera follow player
    camera.setTarget(playerHead);

    // Mouse input for clicking to open nodes
    scene.onPointerObservable.add((pointerInfo) => {      		
      switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
          if(pointerInfo.pickInfo.hit) {
            const mesh = pointerInfo.pickInfo?.pickedMesh;
            if (mesh.matchesTagsQuery && mesh.matchesTagsQuery('node')) {
              const nodeId = parseInt(mesh.name.split('-')[1]);
              onNodeClicked(nodeId);
            }
          }
          break;
      }
    });
  
    // Main game loop
    engine.runRenderLoop(() => {
      if (player != null) {
        player.update();
      }
    })
  
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
    ground.material = new GridMaterial('groundMaterial', scene);
    // ground.material.lineColor = new BABYLON.Color3(0.3, 0.8, 0.3);
    ground.material.mainColor = new BABYLON.Color3(0.03, 0.03, 0.03);
    // ground.material = new BABYLON.StandardMaterial('material', scene);
    ground.position.x = 0.5;
    ground.position.z = 0.5;
    ground.position.y = -0.5;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground, 
      BABYLON.PhysicsImpostor.BoxImpostor, 
      { mass: 0, friction: 2, restitution: 0 }, 
      scene
    );
    ground.checkCollisions = true;
    
    // Skybox
    const skybox = BABYLON.Mesh.CreateBox('skyBox', 5000.0, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      '//www.babylonjs.com/assets/skybox/TropicalSunnyDay',
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    // Materials to be used by addCube function
    const nodeMaterial = new BABYLON.StandardMaterial('nodeMaterial', scene);
    nodeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);

    const blockMaterial1 = new GridMaterial('blockMaterial1', scene);
    blockMaterial1.lineColor = new BABYLON.Color3(1.0, 0.0, 0.0);
    blockMaterial1.mainColor = new BABYLON.Color3(0.03, 0.03, 0.03);
    blockMaterial1.gridOffset = new BABYLON.Vector3(0.5, 0.5, 0.5);
    blockMaterial1.minorUnitVisibility = 1;
    
    const blockMaterial2 = new GridMaterial('blockMaterial2', scene);
    blockMaterial2.lineColor = new BABYLON.Color3(0.0, 1.0, 0.0);
    blockMaterial2.mainColor = new BABYLON.Color3(0.03, 0.03, 0.03);
    blockMaterial2.gridOffset = new BABYLON.Vector3(0.5, 0.5, 0.5);
    blockMaterial2.minorUnitVisibility = 1;

    const blockMaterial = new GridMaterial('blockMaterial', scene);
    blockMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    blockMaterial.mainColor = new BABYLON.Color3(0.03, 0.03, 0.03);
    blockMaterial.gridOffset = new BABYLON.Vector3(0.5, 0.5, 0.5);
    blockMaterial.minorUnitVisibility = 1;
    
    return scene;
  };
  
  // More Babylon boilerplate
  window.initFunction = async function() {
    const asyncEngineCreation = async function() {
      try {
        return createDefaultEngine();
      } catch(e) {
        console.log("the available createEngine function failed. Creating the default engine instead");
        return createDefaultEngine();
      }
    }
    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();
  };
  

  
  // Resize
  window.addEventListener("resize", function () {
    engine.resize();
  });

  return initFunction().then(() => {
    sceneToRender = scene;
    return scene;
  });
};


export function addBlock(nodeId, isNode, {x, y, z}) {
  if (!window.scene) return;
  const material = isNode ? 'nodeMaterial' : nodeId === 1 ? 'blockMaterial1' : nodeId === 2 ? 'blockMaterial2' : 'blockMaterial';
  const blockMaterial = window.scene.getMaterialByName(material);
  const name = isNode ? `node-${nodeId}` : `block-${x}-${y}-${z}`;
  const block = BABYLON.MeshBuilder.CreateBox(name, {size: 1});
  BABYLON.Tags.AddTagsTo(block, `${isNode ? 'node' : 'block'} ofNode-${nodeId}`);
  block.material = blockMaterial;
  block.position.x = x;
  block.position.y = y;
  block.position.z = z;
  block.checkCollisions = true;
  block.physicsImpostor = new BABYLON.PhysicsImpostor(
    block, 
    BABYLON.PhysicsImpostor.BoxImpostor, 
    { mass: 0, friction: 100, restitution: 0 }, 
    window.scene
  )
};

export function clearAllBlocks() {
  if (!window.scene) return;
  var meshes = window.scene.getMeshesByTags('block');
  
  for (const mesh of meshes) {
    mesh.physicsImpostor.dispose();
    window.scene.removeMesh(mesh, true);
  }
}
