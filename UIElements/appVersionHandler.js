
export let appVersion = document.getElementById('appVersion')
document.addEventListener('DOMContentLoaded', () => {
    const appVersionSelect = document.getElementById('appVersion');
    const brightness = document.getElementById('brightness');
    const pixelSmoothing = document.getElementById('pixelSmooth');
    const bgCol = document.getElementById('bg');
    const gaussianBlur = document.getElementById('gaussianBlur');
    const roi = document.getElementById('roi');
    
    let beforeSkel, beforePixel, beforeBgVal, beforeBlur, beforeROI;

    function updateUIForFace() {
        bgCol.updateValue(beforeBgVal ?? 0)
        brightness.updateValue(beforeSkel ?? 25)
        pixelSmoothing.updateValue(beforePixel ?? .1)
        gaussianBlur.updateValue(beforeBlur ?? 0)
        roi.updateValue(beforeROI ?? 3)
    }

    function updateUIForSkeleton() {
        beforeSkel = brightness.value;
        brightness.updateValue(-50)
        // skeletonBrightness.value = -50;

        beforeBgVal = bgCol.value;
        bgCol.updateValue(-1)

        beforePixel = pixelSmoothing.value;
        pixelSmoothing.updateValue(1)

        beforeBlur = gaussianBlur.value;
        gaussianBlur.updateValue(11)

        beforeROI = roi.value;
        roi.updateValue(1.6)
        // skeletonBrightness.style.display = "block";
    }

    appVersionSelect.addEventListener('change', (e) => {
        if (e.target.value === 'face') {
            updateUIForFace();
        } else {
            updateUIForSkeleton();
        }
    });

    document.addEventListener('keypress', (event) => {
        if (event.key === 'f') {
            appVersionSelect.value = 'face';
            updateUIForFace();
        } else if (event.key === 's') {
            appVersionSelect.value = 'skeleton';
            updateUIForSkeleton();
        }
    });
});