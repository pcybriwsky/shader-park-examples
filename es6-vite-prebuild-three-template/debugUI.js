import * as magic from "@indistinguishable-from-magic/magic-js";

export class InputManager {
  constructor() {
    // Magic connection state
    this.isMagic = false;
    this.isDevMode = true;
    
    // Magic sensor data
    this.sensorData = {
      light: 0.5,
      temperature: 0.5,
      humidity: 0.5,
      pressure: 0.5,
      aqi: 0.5,
      co2: 0.5
    };
    
    // Mouse/touch data
    this.mouseData = {
      x: 0,
      y: 0,
      pressed: false
    };
    
    // Animation controls
    this.animationSpeed = 0.5;
    this.gradientRadius = 0.5;
    
    // Manual controls for dev mode
    this.manualControls = {
      light: 0.5,
      temperature: 0.5,
      humidity: 0.5,
      pressure: 0.5,
      aqi: 0.5,
      co2: 0.5
    };
    
    this.setupEventListeners();
  }
  
  async connectMagic() {
    try {
      await magic.connect({ mesh: false, auto: true });
      this.isMagic = true;
      this.isDevMode = false;
      console.log('Magic connected:', magic.modules);
      return true;
    } catch (error) {
      console.error('Failed to connect to Magic:', error);
      this.isDevMode = true;
      return false;
    }
  }
  
  setupEventListeners() {
    // Mouse events
    document.addEventListener('mousemove', (event) => {
      this.mouseData.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouseData.y = (event.clientY / window.innerHeight) * 2 - 1;
    });
    
    document.addEventListener('mousedown', () => {
      this.mouseData.pressed = true;
    });
    
    document.addEventListener('mouseup', () => {
      this.mouseData.pressed = false;
    });
    
    // Touch events for mobile
    document.addEventListener('touchmove', (event) => {
      event.preventDefault();
      const touch = event.touches[0];
      this.mouseData.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouseData.y = (touch.clientY / window.innerHeight) * 2 - 1;
    });
    
    document.addEventListener('touchstart', () => {
      this.mouseData.pressed = true;
    });
    
    document.addEventListener('touchend', () => {
      this.mouseData.pressed = false;
    });
  }
  
  updateSensorData() {
    if (this.isMagic && magic.modules) {
      // Update sensor data from Magic modules
      if (magic.modules.light) {
        this.sensorData.light = 1 - (magic.modules.light.brightness / 4095);
      }
      if (magic.modules.temperature) {
        this.sensorData.temperature = magic.modules.temperature.temperature / 100; // Normalize
      }
      if (magic.modules.humidity) {
        this.sensorData.humidity = magic.modules.humidity.humidity / 100; // Normalize
      }
      if (magic.modules.pressure) {
        this.sensorData.pressure = magic.modules.pressure.pressure / 2000; // Normalize
      }
      if (magic.modules.aqi) {
        this.sensorData.aqi = magic.modules.aqi.aqi / 500; // Normalize
      }
      if (magic.modules.co2) {
        this.sensorData.co2 = magic.modules.co2.co2 / 2000; // Normalize
      }
    } else {
      // Use manual controls in dev mode
      console.log(this.sensorData);
      this.sensorData = { ...this.manualControls };
    }
  }
  
  // Method to update manual controls from UI
  updateManualControl(key, value) {
    if (this.manualControls.hasOwnProperty(key)) {
      this.manualControls[key] = value;
    }
  }
  
  // Method to update animation controls
  updateAnimationControl(key, value) {
    if (key === 'animationSpeed') {
      this.animationSpeed = value;
    } else if (key === 'gradientRadius') {
      this.gradientRadius = value;
    }
  }
  
  getInputData() {
    console.log(this.sensorData);
    return {
    // Magic sensor data
    // 
    // 
    // 
    // 
    // 
    // 
    // 
      light: this.sensorData.light,
      temperature: this.sensorData.temperature,
      humidity: this.sensorData.humidity,
      pressure: this.sensorData.pressure,
      aqi: this.sensorData.aqi,
      co2: this.sensorData.co2,
      
      // Mouse data
      mouseX: this.mouseData.x,
      mouseY: this.mouseData.y,
      mousePressed: this.mouseData.pressed ? 1.0 : 0.0,
      
      // Animation controls
      animationSpeed: this.animationSpeed,
      gradientRadius: this.gradientRadius,
      
      // System state
      isMagic: this.isMagic ? 1.0 : 0.0,
      isDevMode: this.isDevMode ? 1.0 : 0.0
    };
  }
  
  getDebugInfo() {
    console.log(this.sensorData);
    return {
      isMagic: this.isMagic,
      isDevMode: this.isDevMode,
      sensorData: this.sensorData,
      mouseData: this.mouseData,
      manualControls: this.manualControls,
      animationSpeed: this.animationSpeed,
      gradientRadius: this.gradientRadius
    };
  }
  
  async toggleMagicConnection() {
    if (this.isMagic) {
      this.isMagic = false;
      this.isDevMode = true;
      console.log('Switched to dev mode');
    } else {
      await this.connectMagic();
    }
  }
}

export class DebugUI {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.isVisible = true;
    this.createUI();
  }
  
  createUI() {
    // Remove existing debug UI if it exists
    const existingUI = document.getElementById('debug-ui');
    if (existingUI) {
      existingUI.remove();
    }
    
    // Create main container
    const container = document.createElement('div');
    container.id = 'debug-ui';
    container.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 12px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      z-index: 1000;
      max-width: 300px;
      max-height: 80vh;
      overflow-y: auto;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'ShaderPark Debug';
    title.style.margin = '0';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '−';
    toggleBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    
    toggleBtn.onclick = () => this.toggleVisibility();
    
    header.appendChild(title);
    header.appendChild(toggleBtn);
    container.appendChild(header);
    
    // Create sections
    this.createConnectionSection(container);
    this.createSensorSection(container);
    this.createAnimationSection(container);
    this.createMouseSection(container);
    
    document.body.appendChild(container);
  }
  
  createConnectionSection(container) {
    const section = this.createSection('Connection', container);
    
    // Magic connection status
    const statusDiv = document.createElement('div');
    statusDiv.style.marginBottom = '10px';
    
    const statusLabel = document.createElement('span');
    statusLabel.textContent = 'Magic Status: ';
    statusLabel.style.fontWeight = 'bold';
    
    const statusValue = document.createElement('span');
    statusValue.id = 'magic-status';
    statusValue.textContent = this.inputManager.isMagic ? 'Connected' : 'Disconnected';
    statusValue.style.color = this.inputManager.isMagic ? '#4CAF50' : '#f44336';
    
    statusDiv.appendChild(statusLabel);
    statusDiv.appendChild(statusValue);
    section.appendChild(statusDiv);
    
    // Magic toggle button
    const magicBtn = document.createElement('button');
    magicBtn.textContent = this.inputManager.isMagic ? 'Disconnect Magic' : 'Connect Magic';
    magicBtn.style.cssText = `
      background: ${this.inputManager.isMagic ? '#f44336' : '#4CAF50'};
      border: none;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      width: 100%;
      margin-bottom: 10px;
    `;
    
    magicBtn.onclick = async () => {
      await this.inputManager.toggleMagicConnection();
      this.updateUI();
    };
    
    section.appendChild(magicBtn);
  }
  
  createSensorSection(container) {
    const section = this.createSection('Sensor Controls', container);
    
    const sensors = [
      { key: 'light', label: 'Light', min: 0, max: 1, step: 0.01 },
      { key: 'temperature', label: 'Temperature', min: 0, max: 1, step: 0.01 },
      { key: 'humidity', label: 'Humidity', min: 0, max: 1, step: 0.01 },
      { key: 'pressure', label: 'Pressure', min: 0, max: 1, step: 0.01 },
      { key: 'aqi', label: 'AQI', min: 0, max: 1, step: 0.01 },
      { key: 'co2', label: 'CO2', min: 0, max: 1, step: 0.01 }
    ];
    
    sensors.forEach(sensor => {
      const sliderContainer = this.createSlider(
        sensor.key,
        sensor.label,
        sensor.min,
        sensor.max,
        sensor.step,
        this.inputManager.manualControls[sensor.key],
        (value) => this.inputManager.updateManualControl(sensor.key, value)
      );
      section.appendChild(sliderContainer);
    });
  }
  
  createAnimationSection(container) {
    const section = this.createSection('Animation Controls', container);
    
    const animations = [
      { key: 'animationSpeed', label: 'Animation Speed', min: 0, max: 1, step: 0.001, value: this.inputManager.animationSpeed },
      { key: 'gradientRadius', label: 'Gradient Radius', min: 0, max: 1, step: 0.01, value: this.inputManager.gradientRadius }
    ];
    
    animations.forEach(anim => {
      const sliderContainer = this.createSlider(
        anim.key,
        anim.label,
        anim.min,
        anim.max,
        anim.step,
        anim.value,
        (value) => this.inputManager.updateAnimationControl(anim.key, value)
      );
      section.appendChild(sliderContainer);
    });
  }
  
  createMouseSection(container) {
    const section = this.createSection('Mouse Data', container);
    
    const mouseData = document.createElement('div');
    mouseData.id = 'mouse-data';
    mouseData.style.cssText = `
      font-family: monospace;
      font-size: 11px;
      line-height: 1.4;
    `;
    
    section.appendChild(mouseData);
  }
  
  createSection(title, parent) {
    const section = document.createElement('div');
    section.style.cssText = `
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = title;
    sectionTitle.style.cssText = `
      margin: 0 0 10px 0;
      font-size: 13px;
      color: #4CAF50;
    `;
    
    section.appendChild(sectionTitle);
    parent.appendChild(section);
    
    return section;
  }
  
  createSlider(key, label, min, max, step, initialValue, onChange) {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-bottom: 8px;
    `;
    
    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    `;
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    labelSpan.style.fontSize = '11px';
    
    const valueSpan = document.createElement('span');
    valueSpan.id = `value-${key}`;
    valueSpan.textContent = initialValue.toFixed(3);
    valueSpan.style.cssText = `
      font-family: monospace;
      font-size: 10px;
      color: #4CAF50;
    `;
    
    labelDiv.appendChild(labelSpan);
    labelDiv.appendChild(valueSpan);
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = initialValue;
    slider.style.cssText = `
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.1);
      outline: none;
      cursor: pointer;
    `;
    
    slider.oninput = (e) => {
      const value = parseFloat(e.target.value);
      valueSpan.textContent = value.toFixed(3);
      onChange(value);
    };
    
    container.appendChild(labelDiv);
    container.appendChild(slider);
    
    return container;
  }
  
  updateUI() {
    const statusElement = document.getElementById('magic-status');
    if (statusElement) {
      statusElement.textContent = this.inputManager.isMagic ? 'Connected' : 'Disconnected';
      statusElement.style.color = this.inputManager.isMagic ? '#4CAF50' : '#f44336';
    }
    
    const mouseData = document.getElementById('mouse-data');
    if (mouseData) {
      const inputData = this.inputManager.getInputData();
      mouseData.innerHTML = `
        <div>X: ${inputData.mouseX.toFixed(3)}</div>
        <div>Y: ${inputData.mouseY.toFixed(3)}</div>
        <div>Pressed: ${inputData.mousePressed > 0.5 ? 'Yes' : 'No'}</div>
      `;
    }
  }
  
  toggleVisibility() {
    const container = document.getElementById('debug-ui');
    if (container) {
      this.isVisible = !this.isVisible;
      container.style.display = this.isVisible ? 'block' : 'none';
    }
  }
} 