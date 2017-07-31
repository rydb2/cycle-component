const { app, BrowserWindow } = require('electron');

const path = require('path')
const url = require('url')

let win: any = null;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600
    })

    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV == 'development') {
        win.loadURL('http://localhost:8888/index.html');
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))
    }

    win.webContents.openDevTools()

    // win.on('closed', () => {
    //     win = null
    // })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})
