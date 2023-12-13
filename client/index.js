const { app, BrowserWindow, globalShortcut } = require("electron");

const hostname = "http://localhost:3000";
let win;
let pageindex = 0;
let isCursorHidden = false;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 800,
    frame: false,
    fullscreen: true,
    resizable: false,
    title: "Cafeteria monitor",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  win.loadFile(__dirname + '/webfiles/news.html');
}

function toggleCursor() {
  isCursorHidden = !isCursorHidden;
  const cursorStyle = isCursorHidden ? 'none' : 'auto';
  win.webContents.executeJavaScript(`document.documentElement.style.cursor = "${cursorStyle}";`);
  win.focus(); // Set focus to the window after changing cursor style
}

app.whenReady().then(() => {
  createWindow();
  changewindow();

  // Register a global shortcut to toggle the mouse pointer visibility
  globalShortcut.register('Ctrl+H', toggleCursor);

  // setInterval(changewindow, 225000)
  setInterval(changewindow, 180000);
});

function changewindow() {
  pageindex = pageindex + 1;
  if (pageindex == 4) {
    pageindex = 0;
  }

  if (pageindex == 0) {
    win.loadURL(hostname + '/news');
  } else if (pageindex == 1) {
    win.loadURL(hostname + '/getmenu');
  } else if (pageindex == 2) {
    win.loadURL("https://mese.webuntis.com/WebUntis/monitor?school=kopernikus-rs&monitorType=subst&format=Schüler");
  } else if (pageindex == 3) {
    win.loadFile(__dirname + '/webfiles/splash.html');
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

// Note: No need to unregister the global shortcut in the 'closed' event, as it will be automatically unregistered when the app quits.
