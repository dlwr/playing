var menubar = require('menubar')

var ipc = require('electron').ipcMain
var run = require('./index.js')

var mb = menubar({ preloadWindow: true })

mb.on('ready', function ready () {
  ipc.on('data', function (event, data) {
    console.log(data)
    update(data)
  })

  ipc.once('data', run)
})

ipc.on('terminate', function terminate () {
  mb.app.terminate()
})

function update (state) {
  process.env.SLACK_WEBHOOK_URL = state.slackWebhookUrl
  process.env.LISTENER_NAME = state.listenerName
}
