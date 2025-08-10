// Sensor inputs
let light = input()
let temperature = input()
let humidity = input()
let pressure = input()
let aqi = input()
let co2 = input()
let sound = input()
let mouseX = input()
let mouseY = input()
let mousePressed = input()
let animationSpeed = input()
let gradientRadius = input()
let isMagic = input()
let isDevMode = input()
let exampleExternalInput = input()

// Detected color components (from color sensor or cycling)
let colorR = input()
let colorG = input()
let colorB = input()

// Set up rendering properties with enhanced shine




setMaxReflections(1)
setMaxIterations(50)
setStepSize(0.9)


// Gyroid function for surface detail

// Get current space coordinates
let s = getSpace()

// Scale based on pressure (more pressure = larger scale = smoother)
let scale = pressure * 2 + 0.5


// Generate noise with gyroid influence
const noiseScale = 20
const gyScale = 10 + pressure * 1 // Pressure affects gyroid scale
let n = vectorContourNoise(getSpace()*1 + vec3(0, 0, sin(time*animationSpeed*0.5)*2), 1, 1.2)
// n = pow(sin(n*2)*.5 +.5, vec3(2))

// Create detected color as vec3 - pure color without boosting


// Enhanced shine and metal properties
shine(0.0 + 1 * 0.8) // Light affects shine
metal(0.4 + 1 * 0.3) // Light affects metal properties

// Apply the color directly without light influence

color(0.0, 0.0, 0.0) // Pure color application
let detectedColor = vec3(colorR, colorG, colorB)
color(detectedColor) // Pure color application

// Add reflective color for enhanced metallic effect
reflectiveColor(detectedColor) // Pure reflective color

// Create sphere with noise-based displacement
sphere(0.6 + n.y * 0.002)

// Apply gyroid difference for surface detail
// difference()
// setSDF(gy)

// Add expansion based on humidity
let pos = vec3(sin(time*animationSpeed), cos(time*animationSpeed), sin(time*animationSpeed))
let expansionNoise = noise(getSpace() * 0.8 + pos) * 0.5
let expansionAmount = expansionNoise * (sound + 0.35) * 1.5 // replace with noise
expand(expansionAmount)
