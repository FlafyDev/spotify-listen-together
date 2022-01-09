import { io, Socket } from "socket.io-client";
import LTPlayer from "./ltPlayer";
import React from 'react';
import BottomInfo from './ui/bottomInfo';
import { forcePlayTrack, getCurrentTrackUri, getTrackType, isListenableTrackType } from "./spotifyUtils";

export default class Client {
  connecting = false
  connected = false
  socket: Socket | null = null
  server = ""

  constructor (public ltPlayer: LTPlayer) {
    setInterval(async () => {
      if (this.connected) {
        try {
          await fetch(this.server)
        } catch {}
      }
    }, 5*60_000);
  }
  
  connect(server?: string) {
    if (!server)
      server = this.ltPlayer.settingsManager.settings.server

    if (getCurrentTrackUri() != "") {
      forcePlayTrack("")
      setTimeout(() => this.connect(server), 100)
      return;
    }

    this.server = server;

    this.connecting = true;
    this.ltPlayer.ui.renderBottomInfo(<BottomInfo server={server} loading={true} />)
    // this.ltPlayer.ui.menuItems.joinServer?.setName("Leave the server")
    
    this.socket = io(server, {
      'secure':true,
    })

    this.socket.on("connect", () => {
      this.ltPlayer.ui.renderBottomInfo(<BottomInfo server={server!} />)
      this.connecting = false
      this.connected = true
      this.ltPlayer.isHost = false
      this.socket!.emit("login", this.ltPlayer.settingsManager.settings.name, this.ltPlayer.version, (versionRequirements: string) => {
        this.socket?.disconnect()
        setTimeout(() => this.ltPlayer.ui.windowMessage(`Your Spotify Listen Together's version isn't compatible with the server's version. Consider switching to a version that meets these requirements: "${versionRequirements}".`), 1)
      })
      this.ltPlayer.onLogin()
    })

    this.socket.onAny((ev: string, ...args: any) => {
      console.log(`Receiving ${ev}: ${args}`)
    })

    this.socket.on("changeSong", (trackUri: string) => {
      if (isListenableTrackType(getTrackType(trackUri)))
        this.ltPlayer.onChangeSong(trackUri)
    })

    this.socket.on("updateSong", (pause: boolean, milliseconds: number) => {
      if (isListenableTrackType())
        this.ltPlayer.onUpdateSong(pause, milliseconds)
    })

    this.socket.on("bottomMessage", (message: string) => {
      this.ltPlayer.ui.bottomMessage(message)
    })

    this.socket.on("windowMessage", (message: string) => {
      this.ltPlayer.ui.windowMessage(message)
    })

    this.socket.on("listeners", (clients: any) => {
      this.ltPlayer.ui.renderBottomInfo(<BottomInfo server={server!} listeners={clients} />)
    })

    this.socket.on("isHost", (isHost: boolean) => {
      if (isHost != this.ltPlayer.isHost) {
        this.ltPlayer.isHost = isHost
        if (isHost) {
          // this.ltPlayer.ui.menuItems.requestHost?.setName("Cancel hosting");
          this.ltPlayer.ui.bottomMessage("You are now a host.")
        } else {
          // this.ltPlayer.ui.menuItems.requestHost?.setName("Request host");
          this.ltPlayer.ui.bottomMessage("You are no longer a host.")
        }
      }
    })

    this.socket.on("songRequested", (trackUri: string, trackName: string, fromListener: string) => {
      this.ltPlayer.ui.songRequestPopup(trackName, fromListener, () => {
        forcePlayTrack(trackUri)
      })
    })
  
    this.socket.on("disconnect", () => this.disconnect())

    this.socket.on("error", () => {
      this.disconnect()
      this.ltPlayer.ui.windowMessage(`Couldn't connect to "${server}".`)
    })
  }
  
  disconnect() {
    this.socket?.disconnect()
    this.socket = null
    this.connected = false
    this.ltPlayer.isHost = false
    this.connecting = false
    // this.ltPlayer.ui.menuItems.joinServer?.setName("Join a server")
    // this.ltPlayer.ui.menuItems.requestHost?.setName("Request host");
    this.ltPlayer.ui.renderBottomInfo(<BottomInfo server={""}/>)
    this.ltPlayer.ui.disconnectedPopup()
  }
}