const { app, Tray, ipcMain } = require('electron')

const path = require('path')
const fs = require('fs')
const wallpaper = require('wallpaper')

const Bing = require('./bing')
const AppTray = require('./app_tray')
const pjson = require('./package.json')
const config = require('./config')

let bing = new Bing()

app.on('ready', () => {
    let tray = new AppTray(app)
    tray.init()

    bing.fetchBingWallpaper()

    bing.on('fetch-end', (data) => {
        bing.downloadBingWallpaper(data.url)
    })

    bing.on('download-end', (filename) => {
        wallpaper.set(filename)
    })

    bing.on('error', (e) => {
        console.error(e)
        setTimeout(() => {
            bing.fetchBingWallpaper()
        }, 60000)
    })

    setInterval(() => {
        let wp = bing.getRandomChangeWallpaper()
        wallpaper.set(wp)
    }, config.interval)

    // set auto launch
    const AppLauncher = require('./app_launcher')
    let launcher = new AppLauncher(pjson.name)
    launcher.autoLaunch()
})

ipcMain.on('change-wallpaper', (event, arg) => {
    let wp = bing.getRandomChangeWallpaper()
    wallpaper.set(wp)
})

