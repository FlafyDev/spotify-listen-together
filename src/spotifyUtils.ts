import LTPlayer from "./ltPlayer"
import { OGFunctions } from "./patcher"

export enum TrackType {
  Ad,
  Episode,
  Track,
  NoTrack,
  Unknown,
}

export async function getTrackData(trackUri: string) {
  if (isTrack(trackUri))
    trackUri = trackUri.split(":")[2]

  let token = await Spicetify.CosmosAsync.get("sp://auth/v2/token");
  return await fetch(`https://api.spotify.com/v1/tracks/${trackUri}`, {
    "headers": { "authorization": "Bearer " + token.accessToken }
  }).then(a => a.json())
}

export function getCurrentTrackUri(): string {
  return (Spicetify.Platform.PlayerAPI._state.item?.uri) || ""
}

export function isListenableTrackType(trackType?: TrackType) {
  if (trackType === undefined)
    trackType = getTrackType()

  return trackType === TrackType.Episode || trackType === TrackType.Track
}

export function getTrackType(trackUri?: string): TrackType {
  if (trackUri === undefined)
    trackUri = getCurrentTrackUri()

  switch ((trackUri.split(":")[1] || "").toLowerCase()) {
    case "": {
      return TrackType.NoTrack
    }
    case "ad": {
      return TrackType.Ad
    }
    case "track": {
      return TrackType.Track
    }
    case "episode": {
      return TrackType.Episode
    }
    default: {
      return TrackType.Unknown
    }
  }
}

export function isTrack(trackUri: string): boolean {
  return (trackUri.match(/:/g) || []).length == 2;
}

export function pauseTrack() {
  if (Spicetify.Player.isPlaying()) OGFunctions.pause()
}

export function resumeTrack() {
  if (!Spicetify.Player.isPlaying()) OGFunctions.resume()
}

export function isTrackPaused() {
  return !Spicetify.Player.isPlaying()
}

export function getTrackProgress() {
  return Spicetify.Player.getProgress()
}

export function forcePlayTrack(trackUri: string): void {
  OGFunctions.play({ uri: trackUri }, {}, {ltForced: true})
}

export function forcePlay(uri: any, origins: any, options: any): void {
  OGFunctions.play(uri, origins, {...options, ltForced: true})
}
  
export class SpotifyUtils {
  constructor (public ltPlayer: LTPlayer) {}

  loadedInterval: NodeJS.Timer | null = null
  
  onTrackLoaded(trackUri: string, callback: () => void) {
    if (this.loadedInterval) clearInterval(this.loadedInterval);

    this.loadedInterval = setInterval(() => {
      if (getCurrentTrackUri() === trackUri && Spicetify.Platform.PlayerAPI._state?.item?.name && !Spicetify.Platform.PlayerAPI._state.isBuffering) {
        setTimeout(() => callback(), 1000)
        if (this.loadedInterval) clearInterval(this.loadedInterval)
      }
    }, 100)

    return this.loadedInterval;
  }
}