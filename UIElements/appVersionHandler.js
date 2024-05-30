export let appVersion = 'face'; 
let beforeBgVal; 
let beforePixel;
let beforeSkel;

document.addEventListener('DOMContentLoaded', () => {
    const appVersionSelect = document.getElementById('appVersion');
    const skeletonBrightness = document.getElementById('skeletonBrightness')
    const pixelSmoothing = document.getElementById('pixelSmooth')
    const bgCol = document.getElementById('bg')

    // Set the current selection based on the appVersion variable
    appVersion = appVersionSelect.value

    // Listen for changes and update the appVersion variable
    appVersionSelect.addEventListener('change', (e) => {
        appVersion = (e.target.value);
        if(appVersion === 'face'){
            bgCol.value = beforeBgVal ?? 0 ; 
            // skeletonBrightness.style.display = "none";
            skeletonBrightness.value = beforeSkel ?? 25; 
            pixelSmoothing.value = beforePixel ?? .1; 

        } else { 

            // skeletonBrightness.style.display = "block";
            beforeSkel = skeletonBrightness.value;
            skeletonBrightness.value = -50;

            beforeBgVal = bgCol.value;
            bgCol.value = '-1'
            beforePixel = pixelSmoothing.value;
            pixelSmoothing.value = 1;
        }
    });
    document.addEventListener('keypress', (event) => {
        if (event.key === 'f') {
            appVersion = 'face';
            appVersionSelect.value = 'face';
            bgCol.value = beforeBgVal ?? 0 ; 
            skeletonBrightness.value = beforeSkel ?? 25; 
            // skeletonBrightness.style.display = "none";
            pixelSmoothing.value = beforePixel ?? .1; 
        } else if (event.key === 's') {
            beforeSkel = skeletonBrightness.value;
            skeletonBrightness.value = -50;

            appVersion = 'skeleton';
            appVersionSelect.value = 'skeleton';
            // skeletonBrightness.style.display = "block";
            beforeBgVal = bgCol.value;
            bgCol.value = '-1'
            beforePixel = pixelSmoothing.value;
            pixelSmoothing.value = 1;
        }
    });
});