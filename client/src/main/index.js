const { app, BrowserWindow } = require("electron");
const axios = require('axios');
const path = require('path');

class CAFClient {
    constructor() {
        this.window = null;
        this.config = null;
        this.currentPageIndex = 0;
    }

    async initialize() {
        try {
            // Load initial config
            await this.loadConfig();
            this.createWindow();
            this.setupPageRotation();
        } catch (error) {
            console.error('Initialization failed:', error);
            app.quit();
        }
    }

    async loadConfig() {
        try {
            const response = await axios.get('http://localhost:3000/api/display-config');
            this.config = response.data;
        } catch (error) {
            console.error('Error loading config:', error);
            // Load fallback config
            this.config = require('../../config/config.json').production;
        }
    }

    createWindow() {
        this.window = new BrowserWindow({
            width: 1920,
            height: 1080,
            frame: false,
            fullscreen: this.config.settings.fullscreen,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        // Set up error handlers
        this.window.webContents.on('crashed', this.handleCrash.bind(this));
        this.window.on('unresponsive', this.handleUnresponsive.bind(this));
    }

    setupPageRotation() {
        const loadNextPage = async () => {
            if (!this.config.pages.length) return;

            const page = this.config.pages[this.currentPageIndex];
            if (!page.enabled) {
                this.currentPageIndex = (this.currentPageIndex + 1) % this.config.pages.length;
                return loadNextPage();
            }

            try {
                const url = page.url.startsWith('http') ? 
                    page.url : `http://localhost:3000${page.url}`;
                await this.window.loadURL(url);
            } catch (error) {
                console.error('Failed to load page:', error);
                await this.window.loadFile(
                    path.join(__dirname, '../renderer/webfiles/error.html')
                );
            }

            // Schedule next page
            const duration = page.duration || this.config.settings.defaultDuration;
            setTimeout(() => {
                this.currentPageIndex = (this.currentPageIndex + 1) % this.config.pages.length;
                loadNextPage();
            }, duration * 1000);
        };

        loadNextPage();
    }

    handleCrash() {
        console.error('Window crashed, restarting...');
        this.window.destroy();
        this.createWindow();
        this.setupPageRotation();
    }

    handleUnresponsive() {
        console.error('Window unresponsive, restarting...');
        this.window.destroy();
        this.createWindow();
        this.setupPageRotation();
    }
}

// Application startup
const client = new CAFClient();

app.whenReady().then(() => {
    client.initialize();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        client.initialize();
    }
}); 