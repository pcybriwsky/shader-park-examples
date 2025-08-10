import { 
  Scene, PerspectiveCamera, WebGLRenderer, Mesh, 
  Vector2, Vector3, Vector4, Color, 
  SphereGeometry, ShaderMaterial, BackSide
} from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import generatedShader from './twistShader.sp';
import { InputManager } from './inputManager.js';
import { DebugUI } from './debugUI.js';

let scene = new Scene();
let camera = new PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.1, 100 );
camera.position.z = 2;

let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );

renderer.setClearColor( new Color(1, 1, 1), 1 );
document.body.appendChild( renderer.domElement );

// Initialize input manager and debug UI
const inputManager = new InputManager();
const debugUI = new DebugUI(inputManager);

function uniformDescriptionToThreeJSFormat(rawUniforms) {
  const vectorConstructors = {
    float: v => v,
    vec2: v => new Vector2(v.x, v.y),
    vec3: v => new Vector3(v.x, v.y, v.z),
    vec4: v => new Vector4(v.x, v.y, v.z, v.w)
  };

  return rawUniforms.reduce((acc, {name, type, value}) => {
    acc[name] = { value: vectorConstructors[type](value) };
    return acc;
  }, {});
}

const material = new ShaderMaterial({
  uniforms: uniformDescriptionToThreeJSFormat(generatedShader.uniforms),
  vertexShader: generatedShader.vert,
  fragmentShader: generatedShader.frag,
  transparent: true,
  side: BackSide,
});

const mesh = new Mesh(new SphereGeometry(2, 32, 16), material);
scene.add(mesh);

let controls = new OrbitControls( camera, renderer.domElement, {
  enableDamping : true,
  dampingFactor : 0.25,
  zoomSpeed : 0.5,
  rotateSpeed : 0.5
} );

let render = () => {
  requestAnimationFrame( render );
  
  // Update input manager
  inputManager.updateSensorData();
  
  // Update time
  material.uniforms.time.value += 0.015;
  
  // Get all input data
  const inputData = inputManager.getInputData();
  
  // Update all shader uniforms
  Object.keys(inputData).forEach(key => {
    if (material.uniforms[key]) {
      material.uniforms[key].value = inputData[key];
    }
  });
  
  // Legacy input for compatibility
  material.uniforms.exampleExternalInput.value = Math.sin(material.uniforms.time.value);
  
  controls.update();
  renderer.render( scene, camera );
  
  // Update debug UI
  debugUI.updateUI();
};

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

render(); 