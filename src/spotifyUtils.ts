import LTPlayer from "./ltPlayer"

export default class SpotifyUtils {
  constructor (public ltPlayer: LTPlayer) {}

  getCurrentTrackUri() {
    return Spicetify.Player.data.track?.uri
  }

  isValidTrack(trackUri: string | undefined): boolean {
    return !!(trackUri?.includes("spotify:track:")) || !!(trackUri?.includes("spotify:episode:"))
  }
  
  forcePlayTrack(trackUri: string): void {
    this.ltPlayer.patcher.OGPlayerAPI.play({ uri: trackUri }, {}, {})
  }

  forcePlay(uri: any, origins: any, options: any): void {
    this.ltPlayer.patcher.OGPlayerAPI.play(uri, origins, options)
  }
}