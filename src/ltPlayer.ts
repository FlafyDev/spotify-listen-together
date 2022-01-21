import Client from "./client";
import Patcher, { OGFunctions } from "./patcher";
import SettingsManager from "./settings";
import UI from "./ui/ui";
import pJson from '../package.json';
import "./spotifyUtils";
import { forcePlayTrack, getCurrentTrackUri, getTrackData, getTrackType, isListenableTrackType, isTrackPaused, pauseTrack, resumeTrack, SpotifyUtils, TrackType } from "./spotifyUtils";

export default class LTPlayer {
  client = new Client(this)
  patcher = new Patcher(this)
  spotifyUtils = new SpotifyUtils(this);
  settingsManager = new SettingsManager()
  ui = new UI(this)
  isHost = false
  version = pJson.version
  watchingAd = false;
  trackLoaded = true
  currentLoadingTrack = ""

  volumeChangeEnabled = !!OGFunctions.setVolume;
  canChangeVolume = true;
  lastVolume: number | null = null;

  constructor() {
    this.patcher.patchAll()
    this.patcher.trackChanged.on((trackUri) => {
      this.onSongChanged(trackUri!)
    });

    setInterval(() => {
      if (this.client.connected && getTrackType() === TrackType.Ad) {
        resumeTrack()
      }
    }, 2000);

    // For testing
    (<any>Spicetify).OGFunctions = OGFunctions;
  }

  requestChangeSong(trackUri: string) {
    this.client.socket?.emit("requestChangeSong", trackUri)
  }

  requestUpdateSong(paused: boolean, milliseconds: number) {
    let trackType = getTrackType()
    
    if (isListenableTrackType(trackType))
      this.client.socket?.emit("requestUpdateSong", paused, milliseconds)
    else
      this.onUpdateSong(paused, trackType === TrackType.Ad ? undefined : milliseconds)
  }

  async requestSong(trackUri: string) {
    let data = await getTrackData(trackUri)
    if (data && data.error === undefined) {
      this.client.socket?.emit("requestSong", trackUri, data.name || "UNKNOWN NAME")
    }
  }

  // Received
  onChangeSong(trackUri: string) {
    if (this.currentLoadingTrack === trackUri) {
      if (this.trackLoaded)
        this.client.socket?.emit("changedSong", this.currentLoadingTrack)
    } else {
      forcePlayTrack(trackUri)
    }
  }

  onUpdateSong(pause: boolean, milliseconds?: number) {
    if (milliseconds != undefined)
      OGFunctions.seekTo(milliseconds)

    if (pause) {
      pauseTrack()
    } else {
      resumeTrack()
    }
  }

  // Events
  onSongChanged(trackUri?: string) {
    if (trackUri === undefined) trackUri = getCurrentTrackUri()

    console.log(`Changed track to ${trackUri}`)
    this.currentLoadingTrack = trackUri;
    console.trace()

    if (this.client.connected) {
      if (isListenableTrackType(getTrackType(trackUri))) {
        this.trackLoaded = false;
        this.client.socket?.emit("loadingSong", trackUri)

        this.spotifyUtils.onTrackLoaded(trackUri!, () => {
          this.trackLoaded = true;
          pauseTrack()
          OGFunctions.seekTo(0)
          this.client.socket?.emit("changedSong", trackUri, Spicetify.Platform.PlayerAPI._state?.item?.name, Spicetify.Platform.PlayerAPI._state?.item?.images[0]['url'])
          
          // Change volume back to normal
          if (this.volumeChangeEnabled) {
            OGFunctions.setVolume(this.lastVolume);
            this.lastVolume = null
            this.canChangeVolume = true;
          }
        })
      } else {
        this.client.socket?.emit("changedSong", trackUri)
      }
    }
  }

  onLogin() {
    pauseTrack()
    if (this.volumeChangeEnabled) {
      this.canChangeVolume = true;
      this.lastVolume = Spicetify.Player.getVolume();
      this.ui.bottomMessage("Connected to the server.")
    }
  }

  muteBeforePlay() {
    // Lower volume to 0s
    if (this.volumeChangeEnabled) {
      this.canChangeVolume = false;
      if (this.lastVolume === null)
        this.lastVolume = Spicetify.Player.getVolume()
      OGFunctions.setVolume(0);
    }
  }
}
