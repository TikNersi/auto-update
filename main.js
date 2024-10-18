const { app, BrowserWindow, autoUpdater, dialog } = require('electron');
const path = require('path');
const log = require('electron-log');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
  checkForUpdates();
});

function checkForUpdates() {
  const server = 'https://update.electronjs.org';
  const feedURL = `${server}/TikNersi/electron-auto-update/${process.platform}-${process.arch}/${app.getVersion()}`;

  autoUpdater.setFeedURL({ url: feedURL });

  autoUpdater.on('update-available', () => {
    log.info('Update available');
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new update is available. Downloading now...'
    });
  });

  autoUpdater.on('update-downloaded', () => {
    log.info('Update downloaded');
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new update is ready. Restart the application to apply the updates?',
        buttons: ['Restart', 'Later']
      })
      .then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
      });
  });

  autoUpdater.on('error', (error) => {
    log.error(`Update error: ${error.message}`);
  });

  autoUpdater.checkForUpdates();
}
