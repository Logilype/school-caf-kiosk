const { app, BrowserWindow } = require("electron");
const axios = require('axios'); // Use axios for HTTP requests

let win; // Main application window

// Create the main application window
function createMainWindow(settings) {
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

    const pageUrls = [
        '/getoffers', // Page 1
        "https://mese.webuntis.com/WebUntis/monitor?school=kopernikus-rs&monitorType=subst&format=Schüler", // Page 2
    ];

    let currentPageIndex = 0; // Start with the first page
    loadPage(currentPageIndex);

    // Set up page switching based on pageSwitchInterval
    const interval = parseInt(settings.pageSwitchInterval, 10) * 1000; // Convert to milliseconds
    setInterval(() => {
        currentPageIndex = (currentPageIndex + 1) % pageUrls.length; // Cycle through pages
        loadPage(currentPageIndex);
    }, interval);
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
    // Fetch settings from the server
    axios.get('http://localhost:3000/api/settings')
        .then(response => {
            const settings = response.data;
            createMainWindow(settings); // Pass settings to createMainWindow
        })
        .catch(error => {
            console.error('Error fetching settings:', error);
            createMainWindow({ pageSwitchInterval: 0 }); // Fallback if settings can't be loaded
        });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow({ pageSwitchInterval: 0 });
        }
    });
});

// Clean up when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
