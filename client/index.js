const { app, BrowserWindow, ipcMain, screen} = require("electron")
var XMLHttpRequest = require('xhr2');

const hostname = "http://localhost:3000"

var pageindex = 0;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 800,
        frame: false,
        fullscreen: true,
        
        
        resizable: false,
        title: "Cafeteria Monitor",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
        
        
        
})

win.loadFile(__dirname + '/webfiles/news.html')

}

app.whenReady().then(() => {
    
    createWindow()
    changewindow()
    
    
    // setInterval(changewindow, 225000)
    setInterval(changewindow, 225000)
    


});

function changewindow() {
    pageindex = pageindex + 1;
    if (pageindex == 3) {
        pageindex = 0;
    }

    if (pageindex == 0) {
        win.loadURL(hostname + '/news')
        
        
        
    } else if (pageindex == 1) {
        win.loadURL(hostname + '/getmenu')
        
    }
    else if (pageindex == 2) {
        win.loadURL("https://mese.webuntis.com/WebUntis/monitor?school=kopernikus-rs&monitorType=subst&format=Schüler")
        
    }
}