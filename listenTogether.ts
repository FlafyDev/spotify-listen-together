/// <reference path="./globals.d.ts" />

import { io, Socket } from 'socket.io-client' //ts
//mjs import './node_modules/socket.io-client/dist/socket.io.min.js'

(function ListenTogetherMain() {
  if (!Spicetify.CosmosAsync || !Spicetify.Platform || !Spicetify.LocalStorage) {
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

  function OGPlay(trackUri: string) {
    OGPlayerAPI.play({uri: trackUri}, {}, {}) 
  }

  //#region Settings
  class Settings {
    settingsVersion? = "1"
    server = ""
    name = "Unnamed"
  }

  let settings: Settings;

  function updateSettings(newSettings: Settings) {
    Spicetify.LocalStorage.set("listenTogether", JSON.stringify(newSettings))
  }

  (function getSettings() {
    let settingsString = Spicetify.LocalStorage.get("listenTogether")
    let newSettings = new Settings()
    if (settingsString !== null) {
      settings = JSON.parse(settingsString)
      if (settings.settingsVersion !== newSettings.settingsVersion) {
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

  Spicetify.Platform.PlayerAPI.play = (uri: any, origins: any, options: any) => {
    restrictAccess(() => OGPlayerAPI.play(uri, origins, options), !!options.fromHost, "Only the host can change songs!", () => {
      let track: string | undefined = uri.uri
      if (!track?.includes("spotify:track:")) {
        track = options.skipTo.uri
      }
      socket.emit("requestChangeSong", track)
    })
  }

  Spicetify.Platform.PlayerAPI.pause = (fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.pause(), !!fromHost, "Only the host can pause songs!", () => {
      socket.emit("requestUpdateSong", true, Spicetify.Player.getProgress())
    })
  }
  
  Spicetify.Platform.PlayerAPI.resume = (fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.resume(), !!fromHost, "Only the host can resume songs!", () => {
      socket.emit("requestUpdateSong", false, Spicetify.Player.getProgress())
    })
  }

  Spicetify.Platform.PlayerAPI.seekTo = (milliseconds: number, fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.seekTo(milliseconds), !!fromHost, "Only the host can seek songs!", () => {
      socket.emit("requestUpdateSong", !Spicetify.Player.isPlaying(), milliseconds)
    })
  }

  Spicetify.Platform.PlayerAPI.skipToNext = (e: any, fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.skipToNext(e), !!fromHost, "Only the host can change songs!", () => {})
  }

  Spicetify.Platform.PlayerAPI.skipToPrevious = (e: any, fromHost?: boolean) => {
    restrictAccess(() => OGPlayerAPI.skipToPrevious(e), !!fromHost, "Only the host can change songs!", () => {})
  }

  function restrictAccess(ogFunc: Function, fromServer: boolean, restrictMessage: string, hostFunc: Function) {
    if (fromServer || !on) {
      ogFunc()
    } else if (isHost) {
      hostFunc()
    } else {
      Spicetify.showNotification(restrictMessage)
    }
  }

  Spicetify.Player.addEventListener("songchange", () => {
    if (on && Spicetify.Player.data.track?.uri.includes("spotify:track:")) {
      socket.emit("changedSong", Spicetify.Player.data.track?.uri)
      Spicetify.Platform.PlayerAPI.pause(true)
      Spicetify.Platform.PlayerAPI.seekTo(0, true)
    }
  })

  function runClient() {
    attempting = true;
  
    socket = io(settings.server, {
      'reconnectionDelay': 1000,
      'secure':true,
      'reconnectionAttempts': 2,
      'reconnection':true       
    })

    socket.on("connect", () => {
      attempting = false
      on = true
      isHost = false
      menuItems.connectToServer.setName("Disconnect from server")
      OGPlay("")
      let name = prompt("Enter your name:", settings.name)
      if (name === null || name.length === 0) {
        name = "Unnamed"
      }
      socket.emit("login", name)
      settings.name = name
      updateSettings(settings)
    })
    
    socket.on("updateSong", (pause: boolean, milliseconds: number) => {
      OGPlayerAPI.seekTo(milliseconds)
      if (pause) {
        if (Spicetify.Player.isPlaying()) OGPlayerAPI.pause()
      } else {
        if (!Spicetify.Player.isPlaying()) OGPlayerAPI.resume()
      }
    })

    socket.on("changeSong", (trackUri: string) => {
      OGPlay(trackUri)
    })
  
    socket.on("error", () => {
      stopClient()
      alert(`Couldn't connect to server ${settings.server}`)
    })
  }

  function stopClient() {
    socket?.disconnect()
    on = false
    isHost = false
    attempting = false
    menuItems.connectToServer.setName("Connect to server")
  }
})()