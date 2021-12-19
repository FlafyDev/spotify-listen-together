import { io, Socket } from "socket.io-client";
import LTPlayer from "./ltPlayer";

export default class Client {
  connecting = false
  connected = false
  socket: Socket | null = null

  constructor (public ltPlayer: LTPlayer) {}
  
  connect(server: string) {
    this.connecting = true;
    this.ltPlayer.ui.menuItems.joinServer?.setName("Leave the server")
    
    this.socket = io(server, {
      'reconnectionDelay': 1000,
      'secure':true,
      'reconnectionAttempts': 2,
      'reconnection':true
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
    
    this.socket.on("updateSong", (pause: boolean, milliseconds: number) => {
      this.ltPlayer.updateSong(pause, milliseconds)
    })
  
    this.socket.on("changeSong", (trackUri: string) => {
      this.ltPlayer.changeSong(trackUri)
    })
  
    this.socket.on("disconnect", this.disconnect.bind(this))

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
  }
}