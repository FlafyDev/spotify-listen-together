import { io, Socket } from "socket.io-client";
import LTPlayer from "./ltPlayer";

export default class Client {
  connecting = false
  connected = false
  socket: Socket | null = null

  constructor (public ltPlayer: LTPlayer) {}
  
  connectToServer(server: string) {
    this.connecting = true;
    this.ltPlayer.ui.menuItems.connectToServer?.setName("Disconnect from server")
    
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
      this.socket!.emit("login", name)
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
  
    this.socket.on("error", () => {
      this.stopClient()
      alert(`Couldn't connect to server ${server}`)
    })
  }
  
  stopClient() {
    this.socket?.disconnect()
    this.socket = null
    this.connected = false
    this.ltPlayer.isHost = false
    this.connecting = false
    this.ltPlayer.ui.menuItems.connectToServer?.setName("Connect to server")
  }
}