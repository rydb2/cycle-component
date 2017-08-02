import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import * as url from 'url'
import installExtension, { CYCLEJS_DEVTOOL } from 'electron-devtools-installer'

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

    installExtension(CYCLEJS_DEVTOOL)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));

    win.on('closed', () => {
        win = null
    })
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
