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

// Temperature color components (calculated in JavaScript)
let temperatureColorR = input()
let temperatureColorG = input()
let temperatureColorB = input()

// Set up rendering properties
setMaxReflections(5)
setMaxIterations(200)
setStepSize(0.9)

// Get current space coordinates
let s = getSpace()

// Create twisting effect
let twistAngle = time * animationSpeed * 0.5
let twistStrength = pressure * 2.0 + 0.5

// Apply twist transformation
let twistedSpace = s
twistedSpace.x = s.x * cos(twistAngle * s.y) - s.z * sin(twistAngle * s.y)
twistedSpace.z = s.x * sin(twistAngle * s.y) + s.z * cos(twistAngle * s.y)

// Generate noise with twist influence
const noiseScale = 15
let n = vectorContourNoise(twistedSpace * 3 + vec3(0, 0, sin(time*animationSpeed*0.3)*2), 1.0, 1.2)
n = pow(sin(n*2)*.5 +.5, vec3(2))

// Create temperature color as vec3
let temperatureColor = vec3(temperatureColorR, temperatureColorG, temperatureColorB)

// Blend noise with temperature color
let blendedColor = n * 0.3 + temperatureColor * 0.7

// Enhanced shine and metal properties
shine(0.2 + light * 0.6)
metal(0.6 + light * 0.2)

// Apply the color with light control
color(blendedColor * light)

// Add reflective color for enhanced metallic effect
reflectiveColor(blendedColor * 1.5)

// Create sphere with twist-based displacement
let baseSphere = 0.7 + n.y * 0.1
let twistDisplacement = sin(twistAngle * 3) * 0.1
sphere(baseSphere + twistDisplacement)

// Add expansion based on humidity and sound
let pos = vec3(sin(time*animationSpeed), cos(time*animationSpeed), sin(time*animationSpeed))
let expansionNoise = noise(twistedSpace * 0.5 + pos) * 0.3
let expansionAmount = expansionNoise * (sound + 0.5) * 1.0
expand(expansionAmount) 