import Client from "./client";
import Patcher from "./patcher";
import SettingsManager from "./settings";
import UI from "./ui";
import pjson from '../package.json';
import SpotifyUtils from "./spotifyUtils";

export default class LTPlayer {
  client = new Client(this)
  patcher = new Patcher(this)
  spotifyUtils = new SpotifyUtils(this);
  settingsManager = new SettingsManager()
  ui = new UI(this)
  isHost = false
  version = pjson.version

  constructor() {
    this.patcher.patchAll()
    Spicetify.Player.addEventListener("songchange", this.onSongChange.bind(this));
    (<any>Spicetify).OGPlayerAPI = this.patcher.OGPlayerAPI
  }

  requestChangeSong(trackUri: string) {
    this.client.socket?.emit("requestChangeSong", trackUri)
  }

  requestUpdateSong(paused: boolean, milliseconds: number) {
    if (this.spotifyUtils.isValidTrack(this.spotifyUtils.getCurrentTrackUri()))
      this.client.socket?.emit("requestUpdateSong", paused, milliseconds)
    else
      this.updateSong(paused, milliseconds)
  }

  changeSong(trackUri: string) {
    if (Spicetify.Player.data.track?.uri === trackUri) {
      this.client.socket?.emit("changedSong", Spicetify.Player.data.track?.uri)
    } else {
      this.spotifyUtils.forcePlayTrack(trackUri)
    }
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
    if (this.client.connected && this.spotifyUtils.isValidTrack(Spicetify.Player.data.track?.uri)) {
      if (this.isHost) {
        let interval = setInterval(() => {
          if (Spicetify.Platform.PlayerAPI._state?.item?.name) {
            this.client.socket?.emit("changedSong", Spicetify.Player.data.track?.uri, Spicetify.Platform.PlayerAPI._state?.item?.name, Spicetify.Platform.PlayerAPI._state?.item?.images[0]['url'])
            clearInterval(interval)
          }
        }, 100)
      } else {
        this.client.socket?.emit("changedSong", Spicetify.Player.data.track?.uri)
      }
      
      if (Spicetify.Player.isPlaying())
        this.patcher.OGPlayerAPI.pause()
      this.patcher.OGPlayerAPI.seekTo(0)
    }
  }

  onLogin() {
    if (Spicetify.Player.isPlaying())
      this.patcher.OGPlayerAPI.pause()
  }
}
