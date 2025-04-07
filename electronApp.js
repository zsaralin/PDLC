const { app, BrowserWindow, screen } = require('electron');

let mainWindow; // Store globally

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width / 1.5,
        height: height,
        webPreferences: {
            nodeIntegration: true
        },
        alwaysOnTop: false, // Ensure it doesn't force itself to the front
        focusable: true // Allow it to be behind other windows
    });

    mainWindow.loadFile('./index.html');

    mainWindow.on('closed', () => {
        mainWindow = null; // Ensure it's properly cleaned up
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
        app.quit();
    // }
});

app.on('activate', () => {
    if (!mainWindow) {
        createWindow();
    }
});
