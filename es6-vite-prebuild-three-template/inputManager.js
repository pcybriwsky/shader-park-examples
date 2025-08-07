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
  
  // Add temperature color calculation
  getTemperatureColor(temperature) {
    // Temperature-based color mapping: white → blue → yellow → orange → red
    let baseColor;
    
    if (temperature < 0.2) {
      // Cold: Deep Blue to Light Blue (0.0 - 0.2)
      const t = temperature / 0.2;
      baseColor = {
        x: 0.0 * (1.0 - t) + 0.5 * t,
        y: 0.0 * (1.0 - t) + 0.7 * t,
        z: 0.8 * (1.0 - t) + 1.0 * t
      };
    } else if (temperature < 0.4) {
      // Cool: Light Blue to Cyan (0.2 - 0.4)
      const t = (temperature - 0.2) / 0.2;
      baseColor = {
        x: 0.5 * (1.0 - t) + 0.0 * t,
        y: 0.7 * (1.0 - t) + 0.8 * t,
        z: 1.0 * (1.0 - t) + 0.8 * t
      };
    } else if (temperature < 0.6) {
      // Neutral: Cyan to Green (0.4 - 0.6)
      const t = (temperature - 0.4) / 0.2;
      baseColor = {
        x: 0.0 * (1.0 - t) + 0.0 * t,
        y: 0.8 * (1.0 - t) + 0.8 * t,
        z: 0.8 * (1.0 - t) + 0.0 * t
      };
    } else if (temperature < 0.8) {
      // Warm: Green to Yellow (0.6 - 0.8)
      const t = (temperature - 0.6) / 0.2;
      baseColor = {
        x: 0.0 * (1.0 - t) + 1.0 * t,
        y: 0.8 * (1.0 - t) + 1.0 * t,
        z: 0.0 * (1.0 - t) + 0.0 * t
      };
    } else {
      // Hot: Yellow to Red (0.8 - 1.0)
      const t = (temperature - 0.8) / 0.2;
      baseColor = {
        x: 1.0 * (1.0 - t) + 1.0 * t,
        y: 1.0 * (1.0 - t) + 0.0 * t,
        z: 0.0 * (1.0 - t) + 0.0 * t
      };
    }
    
    return baseColor;
  }
  
  getInputData() {
    const temperatureColor = this.getTemperatureColor(this.sensorData.temperature);
    
    return {
      // Magic sensor data
      light: this.sensorData.light,
      temperature: this.sensorData.temperature,
      humidity: this.sensorData.humidity,
      pressure: this.sensorData.pressure,
      aqi: this.sensorData.aqi,
      co2: this.sensorData.co2,
      
      // Temperature color components (separate inputs)
      temperatureColorR: temperatureColor.x,
      temperatureColorG: temperatureColor.y,
      temperatureColorB: temperatureColor.z,
      
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