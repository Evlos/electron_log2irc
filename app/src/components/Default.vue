<style scoped>
  img {
    margin-top: -25px;
    width: 450px;
  }
  input {
    width: 300px;
  }
  table {
    width: 450px
  }
  .box {
    text-align: left;
  }
</style>

<template>
  <div>
    <div class="box">
      <p>
        <button v-on:click="onClickFileSelector">Select a file</button>
      </p>
      <p>
        or paste file url <input v-model="path" />
      </p>
      <p>
        set nickname <input v-model="nick" />
      </p>
      <p>
        <button v-on:click="onClickConnectToIRC">Connect to IRC</button>
        or
        <button v-on:click="onClickSaySometing">Say someting</button>
        or
        <button v-on:click="onClickStartWatch">Start watch</button>
        or
        <button v-on:click="onClickStopWatch">Stop watch</button>
      </p>
      <p>
        <table>
          <tr>
            <th>amount: {{ data.length }}</th>
          </tr>
          <tr v-for="item in _.slice(data, data.length - 3).reverse()">
            <td>{{ item }}</td>
          </tr>
        </table>
      </p>
    </div>
  </div>
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
        nick: 'chaos_dev',
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
      'data': {
        handler (val, old) {
          if (val.length > 5120) {
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
        this.ircClient = new irc.Client('chat.freenode.net', this.nick, {
          channels: ['#eternalelf'],
        })
        this.ircClient.addListener('message', function (from, to, message) {
          console.debug('IRC |', from + ' => ' + to + ': ' + message);
        });
      },
      onClickSaySometing() {
        this.ircClient.say('#eternalelf', "I'm a bot!");
      },
      onClickStartWatch() {
        this.tail = new Tail('/var/log/system.log')
        this.tail.on('line', (data) => {
          // console.debug(data)
          this.data.push(data)
          this.ircClient.say('#eternalelf', data);
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
    }
  }
</script>
