const { app, BrowserWindow } = require("electron");

let win; // Main application window

// Create the main application window
function createMainWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        fullscreen: true, // Start in full-screen mode
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    loadPage(0); // Load the initial page
}

// Load a specific page based on the index
function loadPage(index) {
    const pageUrls = [
        '/getoffers', // Page 1
        "https://mese.webuntis.com/WebUntis/monitor?school=kopernikus-rs&monitorType=subst&format=Schüler", // Page 2
    ];

    if (index >= 0 && index < pageUrls.length) {
        const urlToLoad = pageUrls[index].startsWith('http') ? pageUrls[index] : `http://localhost:3000${pageUrls[index]}`;
        console.log(`Loading page: ${urlToLoad}`); // Log the URL being loaded
        win.loadURL(urlToLoad);
    } else {
        console.error("Invalid page index:", index);
    }
}

// Initialize the application
app.whenReady().then(() => {
    createMainWindow(); // Directly create the main application window

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// Clean up when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
