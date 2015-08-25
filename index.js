require('es6-promise').polyfill()

var itunes = require('playback')
var Hipchat = require('hipchatter')

var findMusic = require('./lib/find-music.js')
var detectCountry = require('./lib/detect-country.js')

var fetch = require('isomorphic-fetch')

if (!(process.env.HIPCHAT_TOKEN && process.env.HIPCHAT_ROOM)) {
  console.error('`HIPCHAT_TOKEN` and `HIPCHAT_ROOM` are required.')
  console.error('Usage: HIPCHAT_TOKEN=token HIPCHAT_ROOM=room_id npm start')

  process.exit(1)
}

var hipchat = new Hipchat(process.env.HIPCHAT_TOKEN)

itunes.on('playing', function (data) {
  detectCountry().then(function (country) {
    findMusic([ data.name, data.artist, data.album ], {
      country: country
    }).then(function (music) {
      console.log('🎵  ' + trackToString(data))

      if (!music) {
        notify('🎵  ' + trackToString(data))
        postToSlack('🎵  ' + trackToString(data))
        return
      }

      notify(
        '🎵  ' +
        '<a href="' + music.trackViewUrl + '">' + trackToString(data) + '</a>'
      )
      postToSlack('🎵  ' + '<' + music.trackViewUrl + '|' + trackToString(data) + '>')
    }).catch(function (err) {
      console.error(err.stack)
    })
  })
})

function trackToString (track) {
  return track.name + ' - ' + track.artist
}

function notify (message) {
  hipchat.notify(process.env.HIPCHAT_ROOM, {
    message: message,
    notify: true
  }, function (err) { if (err) console.error(err) })
}

function postToSlack (message) {
  var token = process.env.SLACK_TOKEN

  return fetch('https://slack.com/api/chat.postMessage?token=' + token + '&channel=%23random&text=' + encodeURIComponent(message) + '&as_user=true&unfurl_links=false&unfurl_media=false&pretty=1', {
    method: 'post'
  })
}
