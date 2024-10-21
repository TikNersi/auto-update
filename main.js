const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;
let updateInterval;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadURL(
        'data:text/html,<h1>Auto Update App</h1><p>Version: ' + app.getVersion() + '</p>'
    );

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function checkForUpdates() {
    autoUpdater.checkForUpdates();
}

app.whenReady().then(() => {
    autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
    // During initial startup, if an update is found, download and install it automatically
    if (!mainWindow) {
        autoUpdater.on('update-downloaded', () => {
            autoUpdater.quitAndInstall();
        });
    } else {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Available',
            message: 'A new version is available. Downloading now...',
        });
    }
});

autoUpdater.on('update-downloaded', () => {
    if (mainWindow) {
        // During runtime, if an update is downloaded, prompt the user to restart or install later
        dialog
            .showMessageBox({
                type: 'info',
                title: 'Update Ready',
                message: 'A new version is ready. Restart now to apply the update?',
                buttons: ['Restart', 'Later'],
            })
            .then((result) => {
                if (result.response === 0) autoUpdater.quitAndInstall();
            });
    } else {
        // If no window exists (initial startup), install the update automatically
        autoUpdater.quitAndInstall();
    }
});

autoUpdater.on('error', (error) => {
    console.error('Error during update process:', error);
    if (!mainWindow) {
        createWindow();
    }
});

app.whenReady().then(() => {
    autoUpdater.checkForUpdatesAndNotify();
    createWindow();

    // Check for updates every minute while the app is running
    updateInterval = setInterval(checkForUpdates, 30 * 1000);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
