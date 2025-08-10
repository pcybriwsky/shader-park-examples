let myShader;
let colorSliders = [];
let paramSliders = [];
let uiOverlay; // Separate graphics buffer for UI
let connectButton; // Debug UI button
let statusLabel;   // Debug UI status

// State for direct manipulation
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragCurrent = { x: 0, y: 0 };
let twistAmount = 0;
let pinchAmount = 0;
let overrideInteractionFlag = false; // when true, mouse handlers won't change state

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL, 360, 100, 100, 1);

  // Expose minimal control surface for DebugUITwist
  if (typeof window !== 'undefined') {
    window.twistSketch = {
      overrideInteraction: (on) => { overrideInteractionFlag = !!on; },
      setTwist: ({ twistAmount: t, pinchAmount: p } = {}) => {
        if (typeof t === 'number') twistAmount = t;
        if (typeof p === 'number') pinchAmount = p;
      },
      setDrag: ({ start, current } = {}) => {
        if (start && typeof start.x === 'number' && typeof start.y === 'number') {
          dragStart.x = start.x; dragStart.y = start.y;
        }
        if (current && typeof current.x === 'number' && typeof current.y === 'number') {
          dragCurrent.x = current.x; dragCurrent.y = current.y;
        }
      },
      getState: () => ({
        twistAmount, pinchAmount,
        dragStart: { x: dragStart.x, y: dragStart.y },
        dragCurrent: { x: dragCurrent.x, y: dragCurrent.y }
      })
    };
  }
}

function draw() {
  // Update Magic sensor data if available
  if (window && window.twistManager && window.twistManager.updateSensorData) {
    window.twistManager.updateSensorData();
  }

  background(0, 0, 8);

  // Compute transform from interaction
  const dx = (dragCurrent.x - dragStart.x) || 0;
  const dy = (dragCurrent.y - dragStart.y) || 0;
  const s = max(0.2, 1 + pinchAmount); // prevent inversion

  push();
  translate(width / 2 + dx, height / 2 + dy);
  rotate(twistAmount);
  scale(s, s);
  translate(-width / 2, -height / 2);

  // Draw a vertical gradient to visualize warping
  noStroke();
  const bands = 200;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const y0 = t * height;
    const y1 = (i + 1) / (bands - 1) * height;
    const hue = lerp(200, 320, t); // blue → magenta
    const sat = lerp(60, 80, t);
    const lum = lerp(35, 65, t);
    fill(hue, sat, lum);
    rect(0, y0, width, max(1, y1 - y0 + 1));
  }
  pop();

  // Show drag handles
  if (isDragging || overrideInteractionFlag) {
    stroke(50, 100, 60);
    strokeWeight(2);
    noFill();
    circle(dragStart.x, dragStart.y, 10);
    stroke(140, 100, 60);
    circle(dragCurrent.x, dragCurrent.y, 10);
    stroke(0, 0, 100, 0.3);
    line(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Mouse event handlers for direct manipulation
function mousePressed() {
  isDragging = true;
  dragStart.x = mouseX;
  dragStart.y = mouseY;
  dragCurrent.x = mouseX;
  dragCurrent.y = mouseY;
}

function mouseDragged() {
  if (isDragging && !overrideInteractionFlag) {
    dragCurrent.x = mouseX;
    dragCurrent.y = mouseY;
    
    // Calculate twist based on circular motion
    let dx = dragCurrent.x - dragStart.x;
    let dy = dragCurrent.y - dragStart.y;
    let angle = atan2(dy, dx);
    twistAmount = angle;
    
    // Calculate pinch based on distance change
    let startDist = dist(dragStart.x, dragStart.y, width/2, height/2);
    let currentDist = dist(dragCurrent.x, dragCurrent.y, width/2, height/2);
    pinchAmount = (currentDist - startDist) / 100.0;
  }
}

function mouseReleased() {
  if (!overrideInteractionFlag) {
    isDragging = false;
  }
}