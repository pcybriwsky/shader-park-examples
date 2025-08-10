import { 
  Scene, PerspectiveCamera, WebGLRenderer, Mesh, 
  Vector2, Vector3, Vector4, Color, 
  SphereGeometry, ShaderMaterial, BackSide
} from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import generatedShader from './spCode.sp';
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

// Create status overlay
const statusOverlay = document.createElement('div');
statusOverlay.id = 'status-overlay';
statusOverlay.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 200px;
`;
document.body.appendChild(statusOverlay);

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
  
  // Update status overlay
  updateStatusOverlay(inputData);
};

function updateStatusOverlay(inputData) {
  const isMagic = inputData.isMagic > 0.5;
  const soundLevel = Math.round(inputData.sound * 100);
  const colorR = Math.round(inputData.colorR * 255);
  const colorG = Math.round(inputData.colorG * 255);
  const colorB = Math.round(inputData.colorB * 255);
  const hexColor = `#${colorR.toString(16).padStart(2, '0')}${colorG.toString(16).padStart(2, '0')}${colorB.toString(16).padStart(2, '0')}`;
  
  statusOverlay.innerHTML = `
    <div style="margin-bottom: 8px;">
      <strong>Magic Status:</strong> 
      <span style="color: ${isMagic ? '#4CAF50' : '#f44336'}">
        ${isMagic ? 'Connected' : 'Disconnected'}
      </span>
    </div>
    <div style="margin-bottom: 8px;">
      <strong>Sound Level:</strong> ${soundLevel}%
    </div>
    <div style="margin-bottom: 12px;">
      <strong>Current Color:</strong>
      <div style="
        display: inline-block;
        width: 20px;
        height: 20px;
        background: ${hexColor};
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        margin-left: 8px;
        vertical-align: middle;
      "></div>
      <span style="margin-left: 8px; font-family: monospace;">${hexColor}</span>
    </div>
    ${!isMagic ? `
      <div style="
        font-size: 11px;
        color: #FFD700;
        background: rgba(255, 215, 0, 0.1);
        padding: 8px;
        border-radius: 4px;
        border-left: 3px solid #FFD700;
      ">
        💡 Hold colored objects close (1 inch) to the light sensor to detect colors
      </div>
    ` : ''}
  `;
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Reposition status overlay if needed
  if (statusOverlay) {
    statusOverlay.style.right = '20px';
    statusOverlay.style.bottom = '20px';
  }
});

render();