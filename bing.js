const http = require('http')
const https = require('https')
const fs = require('fs')
const url = require('url')
const path = require('path')
const EventEmitter = require('events')
const debug = require('debug')('bwp.bing')

const pjson = require('./package.json')

const BING_HOST = 'https://cn.bing.com'
const WALLPAPER_URL = 'http://cn.bing.com/HPImageArchive.aspx?format=js&idx={idx}&n=1&pid=hp'

class Bing extends EventEmitter {

    /**
     * 获取Bing壁纸信息
     * @param {Number} idx 
     *   The index of images, default 0
     * 
     * @return {Object} 
     *   Image json data 
     */
    fetchBingWallpaper(idx, callback) {
        idx = Number(idx) || 0
        let fetchUrl = WALLPAPER_URL.replace('{idx}', idx)
        debug('fetch url: %s', fetchUrl)

        // EVENT: begin fetch
        this.emit('fetch-begin', idx)

        http.get(fetchUrl, (res) => {
            const { statusCode } = res
            debug('status code: %d', statusCode)

            let error
            if (statusCode !== 200) {
                error = new Error(`Request Failed.\n` +
                    `Status Code: ${statusCode}`)
            }
            if (error) {
                this.emit('error', error)
                console.error(error)
                res.resume()
                return
            }

            res.setEncoding('utf8')
            let rawData = ''
            res.on('data', (chunk) => { rawData += chunk })
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData)
                    const imageData = parsedData.images[0]

                    // EVENT: fetch end
                    this.emit('fetch-end', imageData)

                    if (callback) {
                        callback(null, imageData)
                    }
                } catch (e) {
                    console.error(e)
                    this.emit('error', e)

                    if (callback) {
                        callback(e)
                    }
                }
            })
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`)
            this.emit('error', e)

            if (callback) {
                callback(e)
            }
        })
    }

    /**
     * 下载Bing壁纸
     * @param {string} imagePath The path of image url
     */
    downloadBingWallpaper(imagePath) {
        let imageUrl = BING_HOST + imagePath
        let fn = path.basename(url.parse(imageUrl).pathname)
        let wpDir = this.getWallpaperDir()
        debug('wallpaper dir: %s', wpDir)

        try {
            if (!fs.existsSync(wpDir)) {
                fs.mkdirSync(wpDir)
            }
        }
        catch (e) {
            console.error(e.message)
            this.emit('error', e)
        }

        let destFilename = path.join(wpDir, fn)
        debug('dest filename: %s', destFilename)

        let file = fs.createWriteStream(destFilename)
        https.get(imageUrl, (res) => {
            res.pipe(file)

            res.on('end', () => {
                this.emit('download-end', destFilename)
            })

            res.on('error', (e) => {
                console.error(e)
                this.emit('error', e)
            })
        })
    }

    getRandomChangeWallpaper() {
        let wpDir = this.getWallpaperDir()
        let files = fs.readdirSync(wpDir)
        let idx = Math.floor((Math.random() * files.length));
        return `${wpDir}/${files[idx]}`
    }

    getWallpaperDir() {
        let dir = path.join(process.env.APPDATA, pjson.name)
        return dir
    }
}

module.exports = Bing