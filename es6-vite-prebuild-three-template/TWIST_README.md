# Twist Effect Page

This page demonstrates a twisting animation effect using Shader Park and Three.js.

## Features

- **Twisting Animation**: The sphere rotates and twists based on time and animation speed
- **Interactive Controls**: Use mouse/touch to rotate and zoom the view
- **Sensor Integration**: Responds to various sensor inputs (light, temperature, pressure, etc.)
- **Real-time Updates**: The effect updates in real-time with smooth animations

## How to Access

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/twist`

## Controls

- **Mouse/Touch**: Rotate the view by dragging
- **Scroll**: Zoom in/out
- **Debug UI**: Use the debug panel to adjust parameters in real-time

## Technical Details

- **Shader**: Custom twist shader (`twistShader.sp`)
- **Framework**: Three.js with Shader Park integration
- **Animation**: Time-based twisting transformation applied to 3D space
- **Effects**: Metallic surface with dynamic lighting and color changes

## Files

- `twist.html` - Main HTML page
- `twist.js` - JavaScript logic and Three.js setup
- `twistShader.sp` - Shader Park shader code for the twist effect
- `style.css` - Styling including navigation

## Navigation

The site includes a navigation bar that allows switching between:
- **Main**: Original shader effect (`/`)
- **Twist**: New twisting effect (`/twist`) 