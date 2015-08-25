require('es6-promise').polyfill()

var itunes = require('playback')
var Hipchat = require('hipchatter')

var findMusic = require('./lib/find-music.js')
var detectCountry = require('./lib/detect-country.js')

var fetch = require('isomorphic-fetch')

if (!(process.env.SLACK_TOKEN || process.env.HIPCHAT_TOKEN)) {
  console.error('`SLACK_TOKEN` or `HIPCHAT_TOKEN` is required.\n')
  console.error('Usage:\n  HIPCHAT_TOKEN=token HIPCHAT_ROOM=room_id npm start\n  SLACK_TOKEN=token npm start')

  process.exit(1)
}

var hipchat = new Hipchat(process.env.HIPCHAT_TOKEN)

var prevTrack = {}
itunes.on('playing', function (track) {
  if (isEqualTrack(track, prevTrack)) return

  detectCountry().then(function (country) {
    findMusic([ track.name, track.artist, track.album ], {
      country: country
    }).then(function (music) {
      notify(track, music)
    }).catch(function (err) {
      console.error(err.stack)
    })
  })

  prevTrack = track
})

function isEqualTrack (a, b) {
  if (!(typeof a === 'object' && typeof b === 'object')) return

  return a.name === b.name && a.artist === b.artist
}

function trackToString (track) {
  return track.name + ' - ' + track.artist
}

function messageForSlack (track, music) {
  function link (text, url) {
    return '<' + url + '|' + text + '>'
  }

  var trackStr = trackToString(track)

  var url = music && music.trackViewUrl
  var message = url ? link(trackStr, url) : trackStr

  return '🎵  ' + message
}

function messageForHipchat (track, music) {
  function link (text, url) {
    return '<a href="' + url + '">' + text + '</a>'
  }

  var trackStr = trackToString(track)
  var url = music && music.trackViewUrl

  var message = url ? link(trackStr, url) : trackStr
  return '🎵  ' + message
}

function notify (track, music) {
  console.log('🎵  ' + trackToString(track))

  if (process.env.HIPCHAT_TOKEN) {
    postToHipchat(messageForHipchat(track, music))
  }

  if (process.env.SLACK_TOKEN) {
    postToSlack(messageForSlack(track, music))
  }
}

function postToSlack (message) {
  var token = process.env.SLACK_TOKEN

  return fetch('https://slack.com/api/chat.postMessage?token=' + token + '&channel=%23random&text=' + encodeURIComponent(message) + '&as_user=true&unfurl_links=false&unfurl_media=false&pretty=1', {
    method: 'post'
  })
}

function postToHipchat (message) {
  hipchat.notify(process.env.HIPCHAT_ROOM, {
    message: message,
    notify: true
  }, function (err) { if (err) console.error(err) })
}
