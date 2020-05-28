const { app, BrowserWindow, dialog } = require('electron');
const applescript = require('applescript');
const iohook = require('iohook');


const KEYCODE = 42; // left shift key

let appWindow;

const execAppleScript = (script) => {
  applescript.execString(script, (error) => {
    if (error) {
      dialog.showErrorBox('error', String(error));
    }
  });
};

const talk = () => {
  execAppleScript('tell application "System Events" to set volume input volume 100');
  if (appWindow) {
    appWindow.webContents.send('talk');
  }
};

const mute = () => {
  execAppleScript('tell application "System Events" to set volume input volume 0');
  if (appWindow) {
    appWindow.webContents.send('mute');
  }
};


app.on('ready', () => {
  appWindow = new BrowserWindow({
    width: 200,
    height: 200,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  appWindow.setIgnoreMouseEvents(true);

  appWindow.loadURL(`file://${__dirname}/index.html`);


  iohook.on('keydown', (msg) => {
    if (msg.keycode === KEYCODE) {
      talk();
    }
  });
  iohook.on('keyup', (msg) => {
    if (msg.keycode === KEYCODE) {
      mute();
    }
  });
  iohook.start();

  mute();
});

app.on('will-quit', () => {
  appWindow = null;
  talk();
  iohook.unload();
});
