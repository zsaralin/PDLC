const UVCControl = require('uvc-control');
var camera = new UVCControl(0x0BDA, 0x3035, {
    processingUnitId: 0x02
});
// UVCControl.controls.forEach(name => console.log(name))

function setCameraControl(controlName, value, callback) {
    camera.set(controlName, value, function(err) {
        if (err) {
            console.error(`Error setting ${controlName}:`, err);
        } else {
        }
        if(callback) callback(err);
    });
}
function logControlRange(controlName) {
    camera.range(controlName, (err, range) => {
        if (err) {
            console.error(`Error getting range for ${controlName}:`, err);
        } else {
            console.log(`${controlName} range:`, range);
        }
    });
}
function getControlValue(controlName) {
    return new Promise((resolve, reject) => {
        camera.get(controlName, (err, value) => {
            if (err) {
                reject(`Error getting value for ${controlName}: ${err}`);
            } else {
                resolve({[controlName]: value});
            }
        });
    });
}

async function getAllControlValues() {
    const controls = [
        'autoExposureMode', 
        'autoExposurePriority', 
        'absoluteExposureTime', 
        'brightness', 
        'contrast', 
        'saturation', 
        'sharpness', 
        'backlightCompensation', 
        'gain',
        'autoWhiteBalance',
        'whiteBalanceTemperature',
    ];

    try {
        const controlValuesPromises = controls.map(controlName => getControlValue(controlName));
        const controlValues = await Promise.all(controlValuesPromises);
        const controlValuesDict = controlValues.reduce((acc, curr) => ({...acc, ...curr}), {});
        return controlValuesDict;
    } catch (error) {
        console.error('Error getting control values:', error);
        return null;
    }
}
module.exports = { getAllControlValues, setCameraControl };

// autoExposurePriority [0,1]
// autoExposureTime [50,10000]
// brightness [-64,64]
// contrast [0,100]
// saturation [0,100]
// sharpness [0,100]
// backlightCompensation [0,2]
// gain [1,128]
// whiteBalanceTemperature [2800, 6500]

