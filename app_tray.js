const { Tray, Menu, ipcMain } = require('electron')
const path = require('path')
const pjson = require('./package.json')

class AppTray {
    constructor(app) {
        let icon = path.join(__dirname, './icon.png')
        this.app = app
        this.tray = new Tray(icon)
    }

    init() {
        const contextMenu = Menu.buildFromTemplate([
            { label: `${pjson.name} v${pjson.version}`, type: 'normal' },
            { type: 'separator' },
            {
                label: '退出', type: 'normal', click: () => {
                    this.app.quit()
                }
            }
        ])
        this.tray.setToolTip('Hello, ^ ^')
        this.tray.setContextMenu(contextMenu)
        this.tray.displayBalloon({
            icon: '',
            title: 'Hola!',
            content: 'Wish you beautiful mood :)'
        })

        this.tray.on('click', () => {
            ipcMain.emit('change-wallpaper')
        })
    }
}

module.exports = AppTray