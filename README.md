
.-------.  ______       .---.        _______    
\  _(`)_ \|    _ `''.   | ,_|       /   __  \   
| (_ o._)|| _ | ) _  \,-./  )      | ,_/  \__)  
|  (_,_) /|( ''_'  ) |\  '_ '`)  ,-./  )        
|   '-.-' | . (_) `. | > (_)  )  \  '_ '`)      
|   |     |(_    ._) '(  .  .-'   > (_)  )  __  
|   |     |  (_.\.' /  `-'`-'|___(  .  .-'_/  )
/   )     |       .'    |        \`-'`-'     /  
`---'     '-----'`      `--------`  `._____.'

### Description

Detects face via MediaPipe, applies filters, background segmentation, and adjusts camera exposure, converts to pixelated version (30x28), sends brightness values as DMX channels.

### Version Notes
#### 1, March 8, 2024
- Added sobel edge detection, renamed previous edge detection to sharpness filter.

### Contents

```
├── <uiElements>.................play/pause button, fps display, sidePanel
└── <backend>...............................controlling camera exposure, sending DMX values
└── <cameraFilters>...............................auto and manual camera exposure, camera filters (e.g., brightness, sharpness,...)
└── <dmx>...............................creating and updating DMX preview, preparing brightness values to send to backend, test DMX values (stripes, smiley face)
└── <drawing>...............................drawing ROI, bounding box, background segmentation on video
└── <faceapi>...............................setup face detector
└── <model>...............................models for faceapi 
└── <filters>...............................ROI filters
```

### Dependencies

**Backend Dependencies**
- `artnet` v1.4.0
- `cors` v2.8.5
- `csv-parse` v5.5.5
- `express` v4.19.2
- `node` v16.16.0
- `uvc-control` v1.0.2

**Frontend Dependencies**
- `@mediapipe/tasks-vision` v0.10.10
- `@techstark/opencv-js` v4.9.0-release.2
- `artnet` v1.4.0
- `cors` v2.8.5
- `csv-parse` v5.5.5
- `express` v4.18.3
- `image-js` v0.35.5
- `serialport` v12.0.0
- `webpack` v5.90.1 (dev dependency)
- `webpack-cli` v5.1.4 (dev dependency)

### Target Environment

Recommended to run on macOS platforms (for UVC control)
- Requires a camera with UVC control.

### How to Install and Run
- Update the **PID/VID** values in `backend/uvcControl.js` to match your camera.

  **Finding VID/PID on Windows:**
  - Open **Device Manager**, find your camera under **Imaging Devices**, right-click, and choose **Properties**.
  - The VID/PID should be listed under the **Details** tab.

  **Finding VID/PID on macOS:**
  - Open **System Information** (you can find it by searching "System Information" in Spotlight).
  - In the sidebar, go to **USB**, then find your camera under the **USB Device Tree**.
  - Look for the **Vendor ID (VID)** and **Product ID (PID)**.

- Update **deviceId** values in `cameraSetup.js` under the `cameraMapping` section to match the connected cameras.

Make sure the USB camera is connected before starting the server.

**First**, start the server:
- **cd backend**
- **npm install**
- **node server.js**

**Run as electron app:**
- In the terminal: `electron .`

**Run in browser:**
- Windows: Right-click **index.html**, click **Run**, should open in your default browser. Copy and paste the URL to your preferred browser.
- Mac: Download **Live Server extension**. Then do the same steps as for Windows.
  On Chrome, navigate to **chrome://settings/content/camera** to change the default camera.

