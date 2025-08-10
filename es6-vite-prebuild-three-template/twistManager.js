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
      co2: 0.5,
      sound: 0.5,
      colorR: 0.5,
      colorG: 0.5,
      colorB: 0.5
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
    
    // Color cycling
    this.colorCycleTime = 0;
    this.lastColorChange = Date.now();
    this.cyclingColors = [
      { r: 1.0, g: 0.0, b: 0.0 }, // Red
      { r: 0.0, g: 1.0, b: 0.0 }, // Green
      { r: 0.0, g: 0.0, b: 1.0 }, // Blue
      { r: 1.0, g: 1.0, b: 0.0 }, // Yellow
      { r: 1.0, g: 0.0, b: 1.0 }, // Magenta
      { r: 0.0, g: 1.0, b: 1.0 }, // Cyan
      { r: 1.0, g: 0.5, b: 0.0 }, // Orange
      { r: 0.5, g: 0.0, b: 1.0 }  // Purple
    ];
    this.currentColorIndex = 0;
    this.targetColor = { r: 0.5, g: 0.5, b: 0.5 };
    this.currentColor = { r: 0.5, g: 0.5, b: 0.5 };
    
    // Manual controls for dev mode
    this.manualControls = {
      light: 0.5,
      temperature: 0.5,
      humidity: 0.5,
      pressure: 0.5,
      aqi: 0.5,
      co2: 0.5,
      sound: 0.5,
      colorR: 0.5,
      colorG: 0.5,
      colorB: 0.5
    };
    
    this.setupEventListeners();
  }
  
  async connectMagic() {
    // If already connected, just log modules and return
    if (this.isMagic && magic && magic.modules) {
      console.log('Magic already connected:', magic.modules);
      return true;
    }

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
      console.log(magic.modules);
      if (magic.modules.light) {
      this.sensorData.light = 0.99 * this.sensorData.light + 0.01 * (magic.modules.light.brightness / 4095);
    }
    
    // Temperature: NYC range -10°C to 40°C (winter to summer extremes)
    if (magic.modules.environment && magic.modules.environment.temperature !== undefined) {
      // Map -10°C to 40°C to 0-1 range
      this.sensorData.temperature = 0.90   * this.sensorData.temperature + 0.1 * (magic.modules.environment.temperature + 10) / 50;
    }
    
    // Humidity: NYC range 30% to 90% (dry winter to humid summer)
    if (magic.modules.environment && magic.modules.environment.humidity !== undefined) {
      // Map 30% to 90% to 0-1 range
      this.sensorData.humidity = 0.90 * this.sensorData.humidity + 0.1 * (magic.modules.environment.humidity - 30) / 60;
    }
    
    // Pressure: NYC range 980 hPa to 1040 hPa (stormy to clear weather)
    if (magic.modules.environment && magic.modules.environment.pressure !== undefined) {
      // Map 980 hPa to 1040 hPa to 0-1 range
      this.sensorData.pressure = 0.90 * this.sensorData.pressure + 0.1 * (magic.modules.environment.pressure - 980) / 60;
    }
    
    // AQI: NYC range 0 to 200 (good to unhealthy)
    if (magic.modules.environment && magic.modules.environment.aqi !== undefined) {
      // Map 0 to 200 to 0-1 range
      this.sensorData.aqi = 0.90 * this.sensorData.aqi + 0.1 * (magic.modules.environment.aqi / 200);
    }
    
    // CO2: NYC range 400 ppm to 1000 ppm (outdoor to indoor levels)
    if (magic.modules.environment && magic.modules.environment.co2 !== undefined) {
      // Map 400 ppm to 1000 ppm to 0-1 range
      this.sensorData.co2 = 0.90 * this.sensorData.co2 + 0.1 * (magic.modules.environment.co2 - 400) / 600;
    }

    if (magic.modules.sound && magic.modules.sound.raw.volume !== undefined) {
      this.sensorData.sound = 0.90 * this.sensorData.sound + 0.1 * (magic.modules.sound.raw.volume / 4095);
    }
    
    // Process color sensor data
    if (magic.modules.color && magic.modules.color.raw) {
      this.processColorSensor(magic.modules.color.raw);
    } else {
      this.updateColorCycling();
    }
    } else {
      // Use manual controls in dev mode
      this.sensorData = { ...this.manualControls };
      
      // In dev mode, use manual color controls instead of cycling
      this.sensorData.colorR = this.manualControls.colorR || 0.5;
      this.sensorData.colorG = this.manualControls.colorG || 0.5;
      this.sensorData.colorB = this.manualControls.colorB || 0.5;
    }
    
    // Apply color easing (only when not in dev mode)
    if (this.isMagic) {
      this.applyColorEasing();
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
  
  // Process color sensor data
  processColorSensor(rawColor) {
    // Calibration value (might need adjustment)
    const calibration = 1000;
    
    // Process raw values using alpha calibration
    const alpha = rawColor.alpha - calibration;
    if (alpha <= 0) {
      this.updateColorCycling();
      return;
    }
    
    // Convert to RGB (0-255 range)
    const total = rawColor.red + rawColor.green + rawColor.blue;
    const red = Math.round((rawColor.red / alpha) * 255);
    const green = Math.round((rawColor.green / alpha) * 255);
    const blue = Math.round((rawColor.blue / alpha) * 255);
    
    // Check if color is meaningful (not just noise)
    const totalColor = red + green + blue;
    const isValidColor = totalColor > 50 && totalColor < 700 && 
                        red >= 0 && red <= 255 &&
                        green >= 0 && green <= 255 &&
                        blue >= 0 && blue <= 255;
    
    if (isValidColor) {
      // Use detected color
      this.targetColor = {
        r: red / 255,
        g: green / 255,
        b: blue / 255
      };
    } else {
      // Use cycling colors
      this.updateColorCycling();
    }
  }
  
  // Update color cycling
  updateColorCycling() {
    const now = Date.now();
    const timeSinceLastChange = now - this.lastColorChange;
    
    // Change color every minute (60000ms)
    if (timeSinceLastChange > 60000) {
      this.currentColorIndex = (this.currentColorIndex + 1) % this.cyclingColors.length;
      this.targetColor = this.cyclingColors[this.currentColorIndex];
      this.lastColorChange = now;
    }
  }
  
  // Apply color easing
  applyColorEasing() {
    const easing = 0.1; // Smooth transition speed
    
    this.currentColor.r += (this.targetColor.r - this.currentColor.r) * easing;
    this.currentColor.g += (this.targetColor.g - this.currentColor.g) * easing;
    this.currentColor.b += (this.targetColor.b - this.currentColor.b) * easing;
    
    // Update sensor data with current color
    this.sensorData.colorR = this.currentColor.r;
    this.sensorData.colorG = this.currentColor.g;
    this.sensorData.colorB = this.currentColor.b;
  }
  
  // Add temperature color calculation
  getTemperatureColor(temperature) {
    // Temperature-based color mapping: white → blue → yellow → orange → red
    let baseColor;
    
    if (temperature < 0.15) {
      // Very Cold: White to Light Blue (0.0 - 0.15)
      const t = temperature / 0.15;
      baseColor = {
        x: 1.0 * (1.0 - t) + 0.7 * t,
        y: 1.0 * (1.0 - t) + 0.8 * t,
        z: 1.0 * (1.0 - t) + 1.0 * t
      };
    } else if (temperature < 0.35) {
      // Cold: Light Blue to Deep Blue (0.15 - 0.35)
      const t = (temperature - 0.15) / 0.2;
      baseColor = {
        x: 0.7 * (1.0 - t) + 0.2 * t,
        y: 0.8 * (1.0 - t) + 0.3 * t,
        z: 1.0 * (1.0 - t) + 0.8 * t
      };
    } else if (temperature < 0.55) {
      // Cool: Deep Blue to Cyan (0.35 - 0.55)
      const t = (temperature - 0.35) / 0.2;
      baseColor = {
        x: 0.2 * (1.0 - t) + 0.0 * t,
        y: 0.3 * (1.0 - t) + 0.8 * t,
        z: 0.8 * (1.0 - t) + 0.8 * t
      };
    } else if (temperature < 0.75) {
      // Neutral: Cyan to Green (0.55 - 0.75)
      const t = (temperature - 0.55) / 0.2;
      baseColor = {
        x: 0.0 * (1.0 - t) + 0.0 * t,
        y: 0.8 * (1.0 - t) + 0.8 * t,
        z: 0.8 * (1.0 - t) + 0.0 * t
      };
    } else if (temperature < 0.85) {
      // Warm: Green to Yellow (0.75 - 0.85)
      const t = (temperature - 0.75) / 0.1;
      baseColor = {
        x: 0.0 * (1.0 - t) + 1.0 * t,
        y: 0.8 * (1.0 - t) + 1.0 * t,
        z: 0.0 * (1.0 - t) + 0.0 * t
      };
    } else {
      // Hot: Yellow to Red (0.85 - 1.0)
      const t = (temperature - 0.85) / 0.15;
      baseColor = {
        x: 1.0 * (1.0 - t) + 1.0 * t,
        y: 1.0 * (1.0 - t) + 0.0 * t,
        z: 0.0 * (1.0 - t) + 0.0 * t
      };
    }
    
    return baseColor;
  }
  
  getInputData() {
    // Debug color values
    console.log('Color values:', {
      colorR: this.sensorData.colorR,
      colorG: this.sensorData.colorG,
      colorB: this.sensorData.colorB,
      currentColor: this.currentColor,
      targetColor: this.targetColor
    });
    
    return {
      // Magic sensor data
      light: this.sensorData.light,
      temperature: this.sensorData.temperature,
      humidity: this.sensorData.humidity,
      pressure: this.sensorData.pressure,
      aqi: this.sensorData.aqi,
      co2: this.sensorData.co2,
      sound: this.sensorData.sound,
      
      // Detected color components (from color sensor or cycling)
      colorR: this.sensorData.colorR,
      colorG: this.sensorData.colorG,
      colorB: this.sensorData.colorB,
      
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

// Expose a global manager instance for non-module consumers (e.g., p5 sketch)
if (typeof window !== 'undefined') {
  // Avoid overwriting if already present
  if (!window.twistManager) {
    window.twistManager = new InputManager();
  }
}