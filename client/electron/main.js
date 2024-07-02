const { app, BrowserWindow } = require('electron');
const path = require('path');

let win;
let currentIndex = 0;
const urls = [
    'http://localhost:3000/menu',
    'http://localhost:3000/advertisement',
    'http://localhost:3000/news'
];
const intervalTime = 15000; // 15 seconds

function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load the initial URL
    win.loadURL(urls[currentIndex]);

    // Set an interval to cycle through the URLs
    setInterval(() => {
        currentIndex = (currentIndex + 1) % urls.length;
        win.loadURL(urls[currentIndex]);
    }, intervalTime);
}

app.whenReady().then(createWindow);

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
