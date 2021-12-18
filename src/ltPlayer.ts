import { Socket } from "socket.io-client";
import Client from "./client";
import Patcher from "./patcher";
import SettingsManager from "./settings";
import UI from "./ui";

export default class LTPlayer {
  client = new Client(this)
  patcher = new Patcher(this)
  settingsManager = new SettingsManager()
  ui = new UI(this)
  isHost = false

  constructor() {
    this.patcher.patchAll()
    Spicetify.Player.addEventListener("songchange", this.onSongChange)
  }

  requestChangeSong(trackUri: string) {
    this.client.socket?.emit("requestChangeSong", trackUri)
  }

  requestUpdateSong(paused: boolean, milliseconds: number) {
    this.client.socket?.emit("requestUpdateSong", paused, milliseconds)
  }

  changeSong(trackUri: string) {
    this.forcePlay(trackUri)
  }

  updateSong(pause: boolean, milliseconds: number) {
    this.patcher.OGPlayerAPI.seekTo(milliseconds)
    if (Spicetify.Player.isPlaying() === pause) {
      if (pause) {
        this.patcher.OGPlayerAPI.pause()
      } else {
        this.patcher.OGPlayerAPI.resume()
      }
    }
  }

  onSongChange() {
    if (this.client.connected && Spicetify.Player.data.track?.uri.includes("spotify:track:")) {
      this.client.socket?.emit("changedSong", Spicetify.Player.data.track?.uri)
      this.patcher.OGPlayerAPI.pause()
      this.patcher.OGPlayerAPI.seekTo(0)
    }
  }

  onLogin() {
    this.forcePlay("")
  }

  private forcePlay(trackUri: string) {
    this.patcher.OGPlayerAPI.play({ uri: trackUri }, {}, {})
  }
}
