<style lang="sass" scoped>
*
  font-family: Lato, "Helvetica Neue", Arial, Helvetica, sans-serif
img
  margin-top: -25px
  width: 450px
input
  width: 300px
table
  width: 450px
span.status
  margin-left: 12px
  font-size: 12px
.marginRight
  margin-right: 5px
.textarea
  border: 2px solid #E0E1E2
  width: 520px
  height: 48px
  padding: 10px
  font-size: 10px
.button
  background: #E0E1E2
  border: none
  padding: 11px 21px
  display: inline-block
  font-size: 14px
  font-weight: bold
  color: rgba(0, 0, 0, 0.6)
  border-radius: 4px
  box-sizing: border-box
  height: 38px
.button.green
  background: rgb(26, 177, 62)
  color: white
.buttonGroup
  font-size: 14px
  > div
    display: inline-block
  > :last-child
    position: relative
    left: -20px
  div:last-child
    background: #E0E1E2
    padding: 10px 21px
    border-radius: 4px
    box-sizing: border-box
    height: 38px
    input
      height: 21px
      margin-left: 10px
      border: none
      padding: 0 10px
  .middle
    background: white
    border-radius: 50%
    width: 25px
    height: 25px
    text-align: center
    color: rgba(0, 0, 0, .4)
    font-weight: bold
    z-index: 10
    position: relative
    left: -10px
    top: -5px
    span
      vertical-align: middle
.input, .inputGroup
  height: 38px
  box-sizing: border-box
  padding: 11px 21px
  font-size: 14px
.inputGroup
  background: #E0E1E2
  border-radius: 4px
  position: relative
  display: inline-block
  padding-right: 251px
  .input
    position: absolute
    top: 1px
    height: 36px
    margin-left: 10px
    width: 240px
    border-radius: 0px 4px 4px 0px
    border: 1px solid #E0E1E2
.box
  text-align: left
  > p, > div
    margin-bottom: 10px
</style>

<template lang="pug">
.box
  .buttonGroup
    button.button(v-on:click='onClickFileSelector') Select a file
    .middle
      span or
    .last
      span paste file url
      input.input(v-model='path')
  p
    .inputGroup
      span IRC Nickname
      input.input.group(v-model='nick')
  p
    .inputGroup
      span IRC Channel
      input.input.group(v-model='channel')
  p
    button.button.green.marginRight(v-on:click='onClickConnectToIRC') Connect to IRC
    button.button(v-on:click='onClickSaySometing') Say "I'm a bot!"
    span.status {{ ircStatus }}.
  .buttonGroup
    button.button.green(v-on:click='onClickStartWatch') Start watch
    .middle
      span or
    button.button(v-on:click='onClickStopWatch') Stop watch
  p
    textarea.textarea(v-bind:value="_.slice(data, data.length - 3).reverse().join('\n')")
</template>

<script>
  import CurrentPage from './Default/CurrentPage'
  import Versions from './Default/Versions'
  var ipc = require('electron').ipcRenderer
  var Tail = require('tail').Tail
  var irc = require('irc')

  export default {
    components: {
      CurrentPage,
      Versions
    },
    name: 'default',
    data () {
      return {
        ircClient: null,
        ircStatus: 'disconnected',
        nick: 'bot___',
        channel: '#test',
        path: '/var/log/system.log',
        tail: null,
        data: [],
      }
    },
    watch: {
      'nick': {
        handler (val, old) {
          localStorage.setItem('nick', val)
        },
      },
      'path': {
        handler (val, old) {
          localStorage.setItem('path', val)
        },
      },
      'channel': {
        handler (val, old) {
          localStorage.setItem('channel', val)
        },
      },
      'data': {
        handler (val, old) {
          if (val.length > 100) {
            this.data = []
          }
        },
      },
    },
    methods: {
      onClickFileSelector() {
        ipc.send('open-file-dialog')
      },
      onClickConnectToIRC() {
        this.ircStatus = 'connecting ..'
        this.ircClient = new irc.Client('chat.freenode.net', this.nick, {
          showErrors: true,
          autoRejoin: true,
          channels: [this.channel],
          retryCount: 3,
          retryDelay: 3000,
        })
        this.ircClient.addListener('message', (from, to, message) => {
          console.debug('IRC |', from + ' => ' + to + ': ' + message);
        });
        this.ircClient.addListener('names', (from, to, message) => {
          this.ircStatus = 'connected'
        });
      },
      onClickSaySometing() {
        this.ircClient.say(this.channel, "I'm a bot!");
      },
      onClickStartWatch() {
        this.tail = new Tail('/var/log/system.log')
        this.tail.on('line', (data) => {
          // console.debug(data)
          this.data.push(data)
          if (this.ircClient) {
            this.ircClient.say(this.channel, data);
          }
        })
        this.tail.on('error', (error) => {
          console.log('error:', error)
        })
      },
      onClickStopWatch() {
        this.tail.unwatch()
      },
    },
    created() {
      ipc.on('selected-directory', (event, path) => {
        this.path = path
      })
      let nick = localStorage.getItem('nick')
      if (nick) {
        this.nick = nick
      }
      let path = localStorage.getItem('path')
      if (path) {
        this.path = path
      }
      let channel = localStorage.getItem('channel')
      if (channel) {
        this.channel = channel
      }
    }
  }
</script>
