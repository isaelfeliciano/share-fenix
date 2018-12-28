<template>
  <div id="landing-page">
    <button class="pure-button" @click="closeWindow"> CLOSE <i class="fa fa-times"></i></button>
    <img src="@/assets/images/fenix-logo.png">
    <h1>Fenix Share Link</h1>
    <h2>{{ fullPath }}</h2>
    <h3>Link: {{ shareLink }}</h3>
  </div>
</template>

<script>
const {Registry} = require('rage-edit')
const log = require('simple-node-logger').createSimpleLogger('share-fenix.log')
log.setLevel('debug')
const upath = require('upath')
var win = nw.Window.get()
var gui = require('nw.gui')
var clipboard = gui.Clipboard.get()
export default {
  name: 'landing-page',
  data () {
    return {
      shareLink: 'Loading...'
    }
  },
  methods: {
    setListenToOpen: function () {
      let self = this
      gui.App.on('open', (argv) => {
        let argvArray = argv.split('"')
        self.firstTimeOpen(argvArray[(argvArray.length -2)])
        /*log.debug(argv)
        log.debug('---------')
        log.debug(argv.toString())
        log.debug('---------')
        log.debug(argv.split('"'))*/
      });
    },
    firstTimeOpen: function () {
      let self = this
      if (arguments.length === 0) {
        var appArgv = gui.App.argv[0]
        if (!appArgv) var appArgv = 'C:\\Lines.txt'
      } else {
        var appArgv = arguments[0]
      }
      log.debug('appArgv = ' + appArgv)
      let driveLetter = appArgv.toString().substring(0, 1)
      log.debug('Drive letter: ' + driveLetter.toLowerCase())
      let filePath = appArgv.toString().substring(2, appArgv.toString().length)
      var searchReg = Registry.get('HKCU\\Network', true)
      searchReg.then((drivesData) => {
        // log.debug(drivesData)
        if (!drivesData[driveLetter.toLowerCase()]) {
          log.debug('Invalid file')
          self.$message({
            message: 'Invalid file',
            type: 'error',
            duration: 5000
          })
          return
        }
        let sharePath = drivesData[driveLetter.toLowerCase()].$values.remotepath
        let nasName = upath.parse(sharePath.substring(0, 8)).name
        self.fullPath = upath.normalize(sharePath.substring(8) + filePath)
        // log.debug('Full path ' + self.fullPath)
        self.getShareLink(nasName)
      })
    },
    getShareLink: function (nasName) {
      let self = this
      this.shareLink = 'Getting link'
      this.$http.get(`http://${nasName}.fenix-mfg.com:5000/webapi/auth.cgi`,
        {
          params: {
            api: 'SYNO.API.Auth',
            version: '3',
            method: 'login',
            account: 'api',
            passwd: 'H1IkYdRLE7nVS5mGPZBQ',
            session: 'FileStation',
            format: 'sid'
          },
          headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        })
      .then((data, status, request) => {
        if (!status === 200) return log.error(status + ' ' + data)
        log.debug(data.data.data.sid)
        let sid = data.data.data.sid
        self.$http.get(`http://${nasName}.fenix-mfg.com:5000/webapi/entry.cgi`,
        {
          params: {
            api: 'SYNO.FileStation.Sharing',
            version: '3',
            method: 'create',
            path: self.fullPath,
            _sid: sid
          }
        }).then((data, status, request) => {
          // log.debug(data)
          if(!data.data.success) {
            log.error('Error getting the link')
            self.$message({
              message: 'Error getting the link',
              type: 'error',
              duration: 5000
            })
            return
          }
          log.debug(data.data.data.links['0'].url)
          self.shareLink = data.data.data.links['0'].url
          clipboard.set(self.shareLink, 'text')
          self.$message({
            message: 'Link copied to clipboard, use Ctrl + V to paste it',
            type: 'success',
            duration: 5000
          })
          self.$http.get(`https://${nasName}.fenix-mfg.com:5001/webapi/auth.cgi?api=SYNO.API.Auth&version=3&method=logout`)
          .then((data, status, request) => {
            if (!data.data.success) return log.error('Error login out')
            log.debug('Logout successful')
          })
        })
      })
    },
    notification: function (text) {
      var clipboardOptions = {
        body: text
      }        
      var notification = new Notification("Share Fenix Link", clipboardOptions);
      notification.onclick = function () {
        // console.log('Notification clicked')
      }
        
      notification.onshow = function () {
        setTimeout(function() {notification.close();}, 3000);
      }
    },
    closeWindow: function () {
      win.close()
    }
  },
  created () {
    this.setListenToOpen()
    this.firstTimeOpen()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
button:hover {
  background-color: #ef4949;
  color: #FFF;
}
img {
  max-width: 80px;
}
</style>
