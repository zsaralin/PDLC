const UVCControl = require("uvc-control");
var camera = new UVCControl(0x0BDA, 0x3035, {
    // processingUnitId: 0x02
});
UVCControl.controls.forEach(name => console.log(name))
// console.log(camera.supportedControls)
// First, set the camera to manual exposure mode
// The value for manual mode varies; 1 is commonly used for manual mode but check your camera’s documentation
const manualExposureMode = "1"; // Assuming 1 is manual mode
camera.set("autoExposure", manualExposureMode, function(err) {
    if (err) {
        console.error("Error setting exposure mode:", err);
    } else {
        console.log("Exposure mode set to manual");
        // After setting to manual, adjust the exposure compensation
        // This value range can vary; this example sets a mid-range value
        const exposureCompensation = 50; // Adjust this value as needed for your camera
        camera.set("autoExposureTime", exposureCompensation, function(err) {
            if (err) {
                console.error("Error setting exposure compensation:", err);
            } else {
                console.log("Exposure compensation set to", exposureCompensation);
            }
            // Optionally, get the current exposure compensation to verify
            camera.get("absoluteExposureTime", function(err, value) {
                if (err) {
                    console.error("Error getting exposure compensation:", err);
                } else {
                    console.log("Current exposure compensation:", value);
                }
                // Close the device (important to release the device properly)
                camera.close(function(err) {
                    if (err) {
                        console.error("Error closing device:", err);
                    } else {
                        console.log("Device closed");
                    }
                });
            });
        });
    }
});