/// <reference path="./globals.d.ts" />

import { io, Socket } from 'socket.io-client' //ts
//mjs import './node_modules/socket.io-client/dist/socket.io.min.js'

(function ListenTogetherMain() {
  if (!Spicetify.CosmosAsync || !Spicetify.Platform) {
    setTimeout(ListenTogetherMain, 1000);
    return;
  }
  
  const OGPlayerAPI = {
    play: Spicetify.Platform.PlayerAPI.play.bind(Spicetify.Platform.PlayerAPI),
    pause: Spicetify.Platform.PlayerAPI.pause.bind(Spicetify.Platform.PlayerAPI),
    resume: Spicetify.Platform.PlayerAPI.resume.bind(Spicetify.Platform.PlayerAPI),
    seekTo: Spicetify.Platform.PlayerAPI.seekTo.bind(Spicetify.Platform.PlayerAPI),
    skipToNext: Spicetify.Platform.PlayerAPI.skipToNext.bind(Spicetify.Platform.PlayerAPI),
    skipToPrevious: Spicetify.Platform.PlayerAPI.skipToPrevious.bind(Spicetify.Platform.PlayerAPI),
  }

  //#region Settings
  class Settings {
    version = "1"
    server = "http://localhost:8080/"
    name = "Flafy"
  }

  let settings: Settings;

  function updateSettings(newSettings: Settings) {
    localStorage.setItem("listenTogether", JSON.stringify(newSettings))
  }

  (function getSettings() {
    let settingsString = null // localStorage.getItem("listenTogether")
    let newSettings = new Settings()
    if (settingsString !== null) {
      settings = JSON.parse(settingsString)
      if (settings.version !== newSettings.version) {
        settings = newSettings
        updateSettings(settings)
      }
    }
    else {
      settings = newSettings
      updateSettings(settings)
    }
  })()
  //#endregion

  let attempting = false
  let on = false
  let isHost = false
  let socket: Socket

  let menuItems = {
    connectToServer: new Spicetify.Menu.Item("Connect to server", false, () => {
      if (on) {
        stopClient()
      } else if (attempting) {
        alert("Attempting to connect to a server... Try again later.")
      } else {
        

        let newServer = prompt("Enter the server's address:", settings.server)?.replace(" ", "");
        if (!!newServer) {
          settings.server = newServer
          updateSettings(settings)
          runClient()
        }
      }
    }),
    requestHost: new Spicetify.Menu.Item("Request host", false, () => {
      if (on) {
        let password = window.prompt("Password to access host:")
        if (!!password) {
          socket.emit("requestHost", password, (permitted: boolean) => {
            if (permitted) {
              alert("You're now the host.")
              isHost = true
            } else {
              alert("Host request denied.")
            }
          })
        }
      } else {
        alert("Please connect to a server.")
      }
  
    })
  }
  new Spicetify.Menu.SubMenu("Listen Together", Object.values(menuItems)).register();

  Spicetify.Platform.PlayerAPI.play = (uri: {uri: string, metadata: any}, origins: any, options: any) => {
    restrictAccess(() => OGPlayerAPI.play(uri, origins, options), isHost || !!options.fromHost, "Only the host can change songs!")
  }

  Spicetify.Platform.PlayerAPI.pause = (fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.pause(), isHost || !!fromHost, "Only the host can pause songs!", () => {
      OGPlayerAPI.pause()
      if (!fromHost) socket.emit("stopSong", Spicetify.Player.data.track?.uri)
    })
  }
  
  Spicetify.Platform.PlayerAPI.resume = (fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.resume(), isHost || !!fromHost, "Only the host can resume songs!", () => {
      if (fromHost) {
        OGPlayerAPI.resume()
      } else {
        socket.emit("continueSong", Spicetify.Player.data.track?.uri, Spicetify.Player.getProgress())
      }
    })
  }

  Spicetify.Platform.PlayerAPI.seekTo = (milliseconds: number, fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.seekTo(milliseconds), isHost || !!fromHost, "Only the host can seek songs!", () => {
      if (fromHost) {
        OGPlayerAPI.seekTo(milliseconds)
      } else {
        socket.emit("continueSong", Spicetify.Player.data.track?.uri, milliseconds)
      }
    })
  }

  Spicetify.Platform.PlayerAPI.skipToNext = (e: any, fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.skipToNext(e), isHost || !!fromHost, "Only the host can change songs!")
  }

  Spicetify.Platform.PlayerAPI.skipToPrevious = (e: any, fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.skipToPrevious(e), isHost || !!fromHost, "Only the host can change songs!")
  }

  function restrictAccess(ogFunc: Function, condition: boolean, restrictMessage: string, hostFunc?: Function) {
    if (on) {
      if (condition) {
        if (hostFunc === undefined)
          ogFunc()
        else
          hostFunc()
      } else {
        Spicetify.showNotification(restrictMessage)
      }
    } else {
      ogFunc()
    }
  }

  Spicetify.Player.addEventListener("songchange", () => {
    if (on && Spicetify.Player.data.track?.uri.includes("spotify:track")) {
      resetSong()
      if (isHost) {
        socket.emit("playSong", Spicetify.Player.data.track?.uri)
      }
    }
  })

  function resetSong() {
    Spicetify.Platform.PlayerAPI.pause(true)
    Spicetify.Platform.PlayerAPI.seekTo(0, true)
  }

  function stopClient() {
    socket?.disconnect()
    on = false
    attempting = false
    menuItems.connectToServer.setName("Connect to server")
  }

  function runClient() {
    attempting = true;
  
    socket = io(settings.server)

    socket.on("connect", () => {
      attempting = false
      on = true
      menuItems.connectToServer.setName("Disconnect from server")
      socket.emit("login", prompt("Enter your name:", settings.name))
    })

    socket.on("playSongFromHost", (trackUri: string, playDate: number) => {
      if (Spicetify.Player.data.track?.uri !== trackUri) {
        Spicetify.Platform.PlayerAPI.play({uri: trackUri}, {}, {fromHost: true})
      }
      resetSong()
      setTimeout(() => Spicetify.Platform.PlayerAPI.resume(true), playDate-Date.now())
    })

    socket.on("stopSongFromHost", (trackUri: string) => {
      if (Spicetify.Player.data.track?.uri !== trackUri) {
        Spicetify.Platform.PlayerAPI.play({uri: trackUri}, {}, {fromHost: true})
      }
      else {
        Spicetify.Platform.PlayerAPI.pause(true)
      }
    })

    socket.on("continueSongFromHost", (trackUri: string, position: number, playDate: number) => {
      if (Spicetify.Player.data.track?.uri !== trackUri) {
        Spicetify.Platform.PlayerAPI.play({uri: trackUri}, {}, {fromHost: true})
      }
      resetSong()
      setTimeout(() => {
        Spicetify.Platform.PlayerAPI.seekTo(position, true)
        Spicetify.Platform.PlayerAPI.resume(true)
      }, playDate-Date.now())
    })
  
    socket.on("error", () => { 
      stopClient()
      alert(`Couldn't connect to server ${settings.server}`)
    })
  }
})()