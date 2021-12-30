import LTPlayer from "./ltPlayer"

export default class SpotifyUtils {
  constructor (public ltPlayer: LTPlayer) {}

  getCurrentTrackUri(): string {
    return (Spicetify.Platform.PlayerAPI._state.item?.uri) || ""
  }

  isValidTrack(trackUri: string): boolean {
    return trackUri.includes("spotify:track:") || trackUri.includes("spotify:episode:")
  }
  
  forcePlayTrack(trackUri: string): void {
    this.ltPlayer.patcher.OGPlayerAPI.play({ uri: trackUri }, {}, {})
  }

  forcePlay(uri: any, origins: any, options: any): void {
    this.ltPlayer.patcher.OGPlayerAPI.play(uri, origins, options)
  }

  isPaused() {
    return !Spicetify.Player.isPlaying()
  }

  getProgress() {
    return Spicetify.Player.getProgress()
  }

  isOnValidTrack() {
    let track = this.getCurrentTrackUri()
    return !!track || this.isValidTrack(track)
  }
  
  loadedInterval: NodeJS.Timer | null = null
  
  onTrackInfoLoaded(trackUri: string, callback: () => void) {
    if (this.loadedInterval) clearInterval(this.loadedInterval);

    this.loadedInterval = setInterval(() => {
      if (this.getCurrentTrackUri() === trackUri && Spicetify.Platform.PlayerAPI._state?.item?.name) {
        callback()
        if (this.loadedInterval) clearInterval(this.loadedInterval)
      }
    }, 100)

    return this.loadedInterval;
  }

  isAd(trackUri: string): boolean {
    return !!trackUri.startsWith("spotify:ad:")
  }
}