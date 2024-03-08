# \<PDLC\>

### Description

Detects face via MediaPipe, applies filters, background segmentation, and adjusts camera exposure, converts to pixelated version (30x28), sends brightness values as DMX channels\

### Version Notes
#### 1, March, 8, 2024
Added sobel edge detection, renamed previous edge detection to sharpness filter

### Contents
```
├── <uiElements>.................play/pause button, fps display, sidePanel
└── <backend>...............................controlling camera exposure, sending DMX values
└── <cameraFilters>...............................auto and manual camera exposure, camera filters (e.g., brightness, sharpness,...)
└── <dmx>...............................creating and updating dmx preview, preparing brightness values to send to backend, test dmx values (stripes, smiley face)
└── <drawing>...............................drawing ROI, bounding box, background segmentation on video
└── <faceapi>...............................setup face detector
└── <model>...............................models for faceapi 
└── <filters>...............................ROI filters
```
### Dependencies
**Backend Dependencies**
- artnet v1.4.0 
- cors v2.8.5 
- csv-parse v5.5.5 
- node v16.16.0 
- uvc-control v1.0.2

**Frontend Dependencies**
- @mediapipe/tasks-vision v0.10.10 
- @techstark/opencv-js v4.9.0-release.2 
- artnet v1.4.0 
- cors v2.8.5 
- csv-parse v5.5.5 
- express v4.18.3 
- image-js v0.35.5 
- serialport v12.0.0 
- webpack v5.90.1 (dev dependency)
- webpack-cli v5.1.4 (dev dependency)

### Target Environment
Recommended to run on macOS platforms.
- mac branch works on Mac, main branch works on Windows (for adjusting camera settings)

Camera with UVC control

### How to Install and Run
Make sure USB camera is connected before starting server.

**First**, start server:
- **cd backend**
- **npm install**
- **node server.js**

**Run as electron app:**
- In the terminal: electron .

**Run in browser:**
- Windows: Right click **index.html**, click **Run**, should open in your default browser. Copy and paste the URL to your preferred browser.
- Mac: Need to download **Live Server extension**. Then do the same steps as for Windows.
  On Chrome, navigate to **chrome://settings/content/camera** to change the default camera.

- If exposure control isn't working, may need to update **vid** and **pid** in **backend/uvc.control**

**Automatically start server on startup:**
- cd backend
- npm install -g pm2
- pm2 start server.js
- pm2 startup
- Run the generated command
- pm2 save

**Create electron app**
- npm exec electron-builder
- app will be in dist folder