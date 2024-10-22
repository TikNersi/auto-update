const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;
let updateAvailable = false; // Track if an update is available

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
    autoUpdater.checkForUpdatesAndNotify();
}

// Check for updates and handle the logic
const handleUpdates = () => {
        checkForUpdates();

    autoUpdater.on('update-available', () => {
        updateAvailable = true; // Set the flag for update availability
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Ready',
            message: "Update available. Downloading now..."
        })
        console.log('Update available. Downloading now...');
    });

    autoUpdater.on('download-progress', (progressObj) => {
        const log_message = `Download speed: ${progressObj.bytesPerSecond} - ` +
            `Downloaded ${progressObj.percent}% - ` +
            `(${progressObj.transferred}/${progressObj.total})`;
        console.log(log_message); // Log download progress
    });

    autoUpdater.on('update-downloaded', () => {
        if (mainWindow) {
            // If the window is open and an update is downloaded
            dialog.showMessageBox({
                type: 'info',
                title: 'Update Ready',
                message: 'A new version is ready. Restart now to apply the update?',
                buttons: ['Restart', 'Later'],
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        } else if (updateAvailable) {
            autoUpdater.quitAndInstall(); 
        }
    });

    autoUpdater.on('error', (error) => {
        console.error('Error during update process:', error);
    });
};

// Initial check for updates before creating the window
app.whenReady().then(() => {
    handleUpdates(); 
    
}).then(() => createWindow());

// Automatically check for updates on subsequent launches
app.on('ready', () => {
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
});

// Check for updates every minute while the app is running
setInterval(() => {
    if (mainWindow) {
        autoUpdater.checkForUpdates();
    }
}, 30 * 1000); // Adjust the interval as needed
