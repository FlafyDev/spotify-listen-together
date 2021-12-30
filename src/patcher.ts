import { LiteEvent } from "./liteEvent";
import LTPlayer from "./ltPlayer"

export default class Patcher {
  private lastData: any = null
  constructor (public ltPlayer: LTPlayer) {}
  
  OGPlayerAPI = {
    play: Spicetify.Platform.PlayerAPI.play.bind(Spicetify.Platform.PlayerAPI),
    pause: Spicetify.Platform.PlayerAPI.pause.bind(Spicetify.Platform.PlayerAPI),
    resume: Spicetify.Platform.PlayerAPI.resume.bind(Spicetify.Platform.PlayerAPI),
    seekTo: Spicetify.Platform.PlayerAPI.seekTo.bind(Spicetify.Platform.PlayerAPI),
    skipToNext: Spicetify.Platform.PlayerAPI.skipToNext.bind(Spicetify.Platform.PlayerAPI),
    skipToPrevious: Spicetify.Platform.PlayerAPI.skipToPrevious.bind(Spicetify.Platform.PlayerAPI),
  }

  private readonly onTrackChanged = new LiteEvent<string>();
  public get trackChanged() { return this.onTrackChanged.expose(); } 

  patchAll() {
    Spicetify.Platform.PlayerAPI._cosmos.sub("sp://player/v2/main", (data: any) => {
        if (!data) return
        
        if (this.lastData?.track?.uri !== data?.track?.uri) {
          this.onTrackChanged.trigger(data?.track?.uri || "")
        }

        this.lastData = data
      }
    )

    Spicetify.Platform.PlayerAPI.play = (uri: any, origins: any, options: any) => {
      console.log(JSON.stringify([uri, origins, options]))
      this.restrictAccess(() => this.OGPlayerAPI.play(uri, origins, options), "Only the hosts can change songs!", () => {
        this.ltPlayer.spotifyUtils.forcePlay(uri, origins, options) // TODO: Add "paused" to options
      })
    }
    
    Spicetify.Platform.PlayerAPI.pause = () => {
      this.restrictAccess(() => this.OGPlayerAPI.pause(), "Only the hosts can pause songs!", () => {
        this.ltPlayer.requestUpdateSong(true, Spicetify.Player.getProgress())
      })
    }
    
    Spicetify.Platform.PlayerAPI.resume = () => {
      this.restrictAccess(() => this.OGPlayerAPI.resume(), "Only the hosts can resume songs!", () => {
        this.ltPlayer.requestUpdateSong(false, Spicetify.Player.getProgress())
      })
    }
    
    Spicetify.Platform.PlayerAPI.seekTo = (milliseconds: number) => {
      this.restrictAccess(() => this.OGPlayerAPI.seekTo(milliseconds), "Only the hosts can seek songs!", () => {
        this.ltPlayer.requestUpdateSong(!Spicetify.Player.isPlaying(), milliseconds)
      })
    }
    
    Spicetify.Platform.PlayerAPI.skipToNext = (e: any) => {
      this.restrictAccess(() => this.OGPlayerAPI.skipToNext(e), "Only the hosts can change songs!")
    }
    
    Spicetify.Platform.PlayerAPI.skipToPrevious = (e: any) => {
      this.restrictAccess(() => this.OGPlayerAPI.skipToPrevious(e), "Only the hosts can change songs!", () => {
        if (Spicetify.Player.getProgress() <= 3000)
          this.OGPlayerAPI.skipToPrevious(e)
        else
          Spicetify.Player.seek(0)
      })
    }
  }
  
  private restrictAccess(ogFunc: Function, restrictMessage: string, hostFunc?: Function) {
    if (!this.ltPlayer.client.connected) {
      ogFunc()
    } else if (this.ltPlayer.isHost) {
      if (hostFunc)
        hostFunc()
      else
        ogFunc()
    } else {
      Spicetify.showNotification(restrictMessage)
    }
  }  
}
