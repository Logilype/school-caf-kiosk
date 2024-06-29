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
  win.focus();
}

app.whenReady().then(() => {
  createWindow();
  changewindow();

  globalShortcut.register('Ctrl+H', toggleCursor);

  setInterval(changewindow, 180000);
});

function changewindow() {
  pageindex = (pageindex + 1) % 4;

  switch (pageindex) {
    case 0:
      win.loadURL(hostname + '/news');
      break;
    case 1:
      win.loadURL(hostname + '/getmenu');
      break;
    case 2:
      win.loadURL("https://mese.webuntis.com/WebUntis/monitor?school=kopernikus-rs&monitorType=subst&format=Schüler");
      break;
    case 3:
      win.loadFile(__dirname + '/webfiles/splash.html');
      break;
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
