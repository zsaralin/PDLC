export let appVersion = 'face'; 
document.addEventListener('DOMContentLoaded', () => {
    const appVersionSelect = document.getElementById('appVersion');
    const skeletonBrightness = document.getElementById('skeletonBrightness')
    // Set the current selection based on the appVersion variable
    appVersion = appVersionSelect.value

    // Listen for changes and update the appVersion variable
    appVersionSelect.addEventListener('change', (e) => {
        appVersion = (e.target.value);
    });
    document.addEventListener('keypress', (event) => {
        if (event.key === 'f') {
            appVersion = 'face';
            appVersionSelect.value = 'face';
        } else if (event.key === 's') {
            appVersion = 'skeleton';
            appVersionSelect.value = 'skeleton';
            skeletonBrightness.style.display = "block"
        }
    });
});