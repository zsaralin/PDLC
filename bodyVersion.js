export let appVersion = 'face'; 
document.addEventListener('DOMContentLoaded', () => {
    const appVersionSelect = document.getElementById('appVersion');

    // Set the current selection based on the appVersion variable
    appVersion = appVersionSelect.value

    // Listen for changes and update the appVersion variable
    appVersionSelect.addEventListener('change', (e) => {
        appVersion = (e.target.value);
    });
});