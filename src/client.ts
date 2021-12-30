import { io, Socket } from "socket.io-client";
import LTPlayer from "./ltPlayer";

export default class Client {
  connecting = false
  connected = false
  socket: Socket | null = null

  constructor (public ltPlayer: LTPlayer) {
  }
  
  connect(server: string) {
    // DEV
    (<any>Spicetify).test1 = () => {
      this.socket?.emit("watchingAD", true)
    }
    (<any>Spicetify).test2 = () => {
      this.socket?.emit("watchingAD", false)
    }

    this.connecting = true;
    this.ltPlayer.ui.menuItems.joinServer?.setName("Leave the server")
    
    this.socket = io(server, {
      'secure':true,
    })
  
    this.socket.on("connect", () => {
      this.connecting = false
      this.connected = true
      this.ltPlayer.isHost = false
      let name = prompt("Enter your name:", this.ltPlayer.settingsManager.settings.name)
      if (name === null || name.length === 0) {
        name = "Unnamed"
      }
      this.socket!.emit("login", name, this.ltPlayer.version, (versionRequirements: string) => {
        this.socket?.disconnect()
        setTimeout(() => alert(`Your Spotify Listen Together's version isn't compatible with the server's version. Consider switching to a version that meets these requirements: "${versionRequirements}".`), 1)
      })
      this.ltPlayer.onLogin()
      this.ltPlayer.settingsManager.settings.name = name
      this.ltPlayer.settingsManager.saveSettings()
    })

    this.socket.onAny((ev: string, ...args: any) => {
      console.log(`Receiving ${ev}: ${args}`)
    })

    this.socket.on("changeSong", (trackUri: string) => this.ltPlayer.onChangeSong(trackUri))

    this.socket.on("updateSong", (pause: boolean, milliseconds: number) => this.ltPlayer.onUpdateSong(pause, milliseconds))

    this.socket.on("syncSong", (trackUri: string, paused: boolean, milliseconds: number) => this.ltPlayer.onSyncSong(trackUri, paused, milliseconds))

    this.socket.on("showMessage", (message: string, info: boolean) => {
      if (info) {
        Spicetify.showNotification(message)
      } else {
        alert(message)
      }
    })

    this.socket.on("isHost", (isHost: boolean) => {
      if (isHost != this.ltPlayer.isHost) {
        this.ltPlayer.isHost = isHost
        if (isHost) {
          this.ltPlayer.ui.menuItems.requestHost?.setName("Cancel hosting");
          alert("You are now a host.")
          this.ltPlayer.onSongChanged()
        } else {
          this.ltPlayer.ui.menuItems.requestHost?.setName("Request host");
          alert("You are no longer a host.")
        }
      }
    })
  
    this.socket.on("disconnect", () => this.disconnect())

    this.socket.on("error", () => {
      this.disconnect()
      alert(`Couldn't connect to "${server}".`)
    })
  }
  
  disconnect() {
    this.socket?.disconnect()
    this.socket = null
    this.connected = false
    this.ltPlayer.isHost = false
    this.connecting = false
    this.ltPlayer.ui.menuItems.joinServer?.setName("Join a server")
    this.ltPlayer.ui.menuItems.requestHost?.setName("Request host");
  }
}