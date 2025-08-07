// Sensor inputs
let light = input()
let temperature = input()
let humidity = input()
let pressure = input()
let aqi = input()
let co2 = input()
let mouseX = input()
let mouseY = input()
let mousePressed = input()
let animationSpeed = input()
let gradientRadius = input()
let isMagic = input()
let isDevMode = input()
let exampleExternalInput = input()

// Temperature color components (calculated in JavaScript)
let temperatureColorR = input()
let temperatureColorG = input()
let temperatureColorB = input()

// Set up rendering properties with enhanced shine



setMaxReflections(5)
setMaxIterations(200)
setStepSize(0.9)


// Gyroid function for surface detail
function gyroid(scale) {
  let s = getSpace();
  s = (s*co2*50.0 + sin(time*animationSpeed*0.5)) * scale; // shift noise here?
  return scale;
}

// Get current space coordinates
let s = getSpace()

// Scale based on pressure (more pressure = larger scale = smoother)
let scale = pressure * 2 + 0.5

// Generate noise with gyroid influence
const noiseScale = 20
const gyScale = 10 + pressure * 5 // Pressure affects gyroid scale
let gy = gyroid(gyScale)
let n = vectorContourNoise(getSpace()*5 + vec3(0, 0, sin(time*animationSpeed*0.5)*2), gy, 1.2)
n = pow(sin(n*2)*.5 +.5, vec3(2))

// Create temperature color as vec3
let temperatureColor = vec3(temperatureColorR, temperatureColorG, temperatureColorB)

// Blend noise with temperature color - subtle noise impact
let blendedColor = n * 0.01 + temperatureColor * 0.99

// Enhanced shine and metal properties
shine(0.0 + light * 0.8) // Light affects shine
metal(0.4 + light * 0.3) // Light affects metal properties

// Apply the color with dramatic light control
color(blendedColor * light) // Pure light control - goes completely dark at 0

// Add reflective color for enhanced metallic effect
reflectiveColor(blendedColor * 2)

// Create sphere with noise-based displacement
sphere(0.6 + n.y * 0.002)

// Apply gyroid difference for surface detail
difference()
setSDF(gy)

// Add expansion based on humidity
let pos = vec3(sin(time*animationSpeed), cos(time*animationSpeed), sin(time*animationSpeed))
let expansionNoise = noise(getSpace() * 0.8 + pos) * 0.5
let expansionAmount = expansionNoise * (humidity + 0.35) * 1.5 // replace with noise
expand(expansionAmount)