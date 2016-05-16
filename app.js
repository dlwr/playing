'use strict'

const React = require('react')
const ReactDOM = require('react-dom')
const {ipcRenderer, shell} = require('electron')
const url = require('url')

const App = React.createClass({
  getInitialState () {
    return {
      slackWebhookUrl: window.localStorage.getItem('slackWebhookUrl'),
      listenerName: window.localStorage.getItem('listenerName')
    }
  },

  componentDidMount () {
    ipcRenderer.send('data', this.state)
  },

  componentDidUpdate () {
    ipcRenderer.send('data', this.state)
  },

  inputIsValid () {
    return url.parse(this.state.slackWebhookUrl || '').host === 'hooks.slack.com'
  },

  render () {
    const self = this

    return (
      React.DOM.main({
        className: 'container'
      }, [
        React.DOM.div({}, [
          React.DOM.h2({}, 'playing'),
          React.DOM.p({ className: 'description' }, [
            React.DOM.a({
              href: 'https://slack.com/services/new/incoming-webhook',
              onClick: function (e) {
                e.preventDefault()
                shell.openExternal(e.target.href)
              }
            }, 'Add a new Incoming Webhook in Slack'),
            '\nand paste the webhook URL to this form.'
          ]),

          React.DOM.label({}, 'Slack Webhook URL'),
          React.DOM.input({
            className: 'form-control',
            type: 'text',
            placeholder: 'https://hooks.slack.com/...',
            value: this.state.slackWebhookUrl,
            onChange: function (e) {
              self.setState({ slackWebhookUrl: e.target.value })
              window.localStorage.setItem('slackWebhookUrl', e.target.value)
            }
          }),
          React.DOM.label({}, 'Your name'),
          React.DOM.input({
            className: 'form-control',
            type: 'text',
            placeholder: 'your name',
            value: this.state.listenerName,
            onChange: function (e) {
              self.setState({ listenerName: e.target.value })
              window.localStorage.setItem('listenerName', e.target.value)
            }
          }),
          this.inputIsValid() && React.DOM.div({ className: 'alert alert-success' }, '✔ Play music on iTunes!')
        ]),

        React.DOM.button({
          className: 'btn btn-default btn-quit',
          onClick: function () {
            ipcRenderer.send('terminate')
          }
        }, 'Quit')
      ])
    )
  }
})

ReactDOM.render(React.createElement(App, null), document.body)

var remote = require('remote')
var Menu = remote.require('menu')
var MenuItem = remote.require('menu-item')

var menu = new Menu()
menu.append(new MenuItem({
  label: 'Copy',
  selector: 'copy:'
}))
menu.append(new MenuItem({
  label: 'Paste',
  selector: 'paste:'
}))

window.addEventListener('contextmenu', function (e) {
  e.preventDefault()
  menu.popup(remote.getCurrentWindow())
}, false)
